import { useCallback, useEffect, useRef, useState } from "react";
import { connectSignaling, publish } from "../signaling/stompClient";
import {
  addIce,
  createPeerConnection,
  handleAnswer,
  handleOffer,
  makeOffer,
} from "../webrtc/peer";

/**
 * Owns local camera/mic, STOMP connection, mesh peer map, chat, and mute toggles.
 */
export function useRoomSession({ roomId, user, initialParticipants }) {
  const [participants, setParticipants] = useState(initialParticipants ?? []);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [messages, setMessages] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const clientRef = useRef(null);
  const peersRef = useRef(new Map());
  const startedPeersRef = useRef(new Set());
  const userRef = useRef(user);

  userRef.current = user;

  const sendSignal = useCallback(
    (partial) => {
      publish(clientRef.current, "/app/signal", {
        roomId,
        fromUserId: userRef.current.userId,
        fromName: userRef.current.name,
        ...partial,
      });
    },
    [roomId]
  );

  const attachRemoteStream = useCallback((peerId, stream) => {
    setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
  }, []);

  const ensurePeer = useCallback(
    (peerId) => {
      const existing = peersRef.current.get(peerId);
      if (existing) {
        return existing;
      }
      const pc = createPeerConnection({
        peerId,
        localStream: localStreamRef.current,
        onRemoteStream: attachRemoteStream,
        onIceCandidate: (toUserId, candidate) => {
          sendSignal({
            type: "ICE",
            toUserId,
            payload: candidate,
          });
        },
      });
      peersRef.current.set(peerId, pc);
      return pc;
    },
    [attachRemoteStream, sendSignal]
  );

  const closePeer = useCallback((peerId) => {
    const pc = peersRef.current.get(peerId);
    if (pc) {
      pc.close();
      peersRef.current.delete(peerId);
    }
    startedPeersRef.current.delete(peerId);
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
  }, []);

  const connectToPeer = useCallback(
    async (peerId) => {
      if (peerId === userRef.current.userId) {
        return;
      }
      const shouldOffer = userRef.current.userId < peerId;
      const pc = ensurePeer(peerId);
      if (!shouldOffer || startedPeersRef.current.has(peerId)) {
        return;
      }
      startedPeersRef.current.add(peerId);
      const offer = await makeOffer(pc);
      sendSignal({
        type: "OFFER",
        toUserId: peerId,
        payload: offer,
      });
    },
    [ensurePeer, sendSignal]
  );

  const handleSignal = useCallback(
    async (message) => {
      const me = userRef.current.userId;
      if (!message || message.fromUserId === me) {
        return;
      }

      if (message.type === "JOIN") {
        await connectToPeer(message.fromUserId);
        return;
      }

      if (message.type === "LEAVE") {
        closePeer(message.fromUserId);
        return;
      }

      if (message.toUserId && message.toUserId !== me) {
        return;
      }

      const pc = ensurePeer(message.fromUserId);

      if (message.type === "OFFER" && message.payload) {
        const answer = await handleOffer(pc, message.payload);
        sendSignal({
          type: "ANSWER",
          toUserId: message.fromUserId,
          payload: answer,
        });
      } else if (message.type === "ANSWER" && message.payload) {
        await handleAnswer(pc, message.payload);
      } else if (message.type === "ICE" && message.payload) {
        await addIce(pc, message.payload);
      }
    },
    [closePeer, connectToPeer, ensurePeer, sendSignal]
  );

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const client = connectSignaling({
          roomId,
          onSignal: (msg) => {
            handleSignal(msg).catch((err) => console.warn(err));
          },
          onChat: (msg) => {
            setMessages((prev) => [...prev, msg]);
          },
          onParticipants: (list) => {
            setParticipants(Array.isArray(list) ? list : []);
          },
          onConnected: (stomp) => {
            setConnected(true);
            publish(stomp, "/app/join", {
              type: "JOIN",
              roomId,
              fromUserId: user.userId,
              fromName: user.name,
            });
            (initialParticipants ?? [])
              .filter((p) => p.userId !== user.userId)
              .forEach((p) => {
                connectToPeer(p.userId).catch((err) => console.warn(err));
              });
          },
        });
        clientRef.current = client;
      } catch (err) {
        console.error(err);
        setError("Camera or microphone permission is required for the call.");
      }
    }

    start();

    return () => {
      cancelled = true;
      const client = clientRef.current;
      if (client?.connected) {
        publish(client, "/app/leave", {
          type: "LEAVE",
          roomId,
          fromUserId: user.userId,
          fromName: user.name,
        });
      }
      client?.deactivate();
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // Intentionally run once per room visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user.userId]);

  const sendChat = useCallback(
    (content) => {
      const text = content.trim();
      if (!text) {
        return;
      }
      publish(clientRef.current, "/app/chat", {
        roomId,
        senderId: user.userId,
        senderName: user.name,
        content: text,
        timestamp: Date.now(),
      });
    },
    [roomId, user]
  );

  const toggleAudio = useCallback(() => {
    const next = !audioEnabled;
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = next;
    });
    setAudioEnabled(next);
  }, [audioEnabled]);

  const toggleVideo = useCallback(() => {
    const next = !videoEnabled;
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = next;
    });
    setVideoEnabled(next);
  }, [videoEnabled]);

  return {
    localVideoRef,
    participants,
    remoteStreams,
    messages,
    audioEnabled,
    videoEnabled,
    error,
    connected,
    sendChat,
    toggleAudio,
    toggleVideo,
  };
}
