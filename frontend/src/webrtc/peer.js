/**
 * Mesh WebRTC: one RTCPeerConnection to every other participant.
 * SDP offers/answers and ICE candidates travel over STOMP signaling.
 */

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function createPeerConnection({
  peerId,
  localStream,
  onRemoteStream,
  onIceCandidate,
}) {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  if (localStream) {
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(peerId, event.candidate);
    }
  };

  pc.ontrack = (event) => {
    const [stream] = event.streams;
    if (stream) {
      onRemoteStream(peerId, stream);
    }
  };

  return pc;
}

export async function makeOffer(pc) {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}

export async function handleOffer(pc, offer) {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

export async function handleAnswer(pc, answer) {
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

export async function addIce(pc, candidate) {
  if (!candidate) {
    return;
  }
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.warn("Failed to add ICE candidate", err);
  }
}
