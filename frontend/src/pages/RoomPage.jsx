import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { joinRoom } from "../api/rooms";
import ChatPanel from "../components/ChatPanel.jsx";
import Controls from "../components/Controls.jsx";
import ParticipantList from "../components/ParticipantList.jsx";
import VideoGrid from "../components/VideoGrid.jsx";
import { useRoomSession } from "../hooks/useRoomSession.js";
import { getStoredUser } from "../utils/auth.js";

/**
 * Call page: joins via REST, then starts WebRTC mesh + STOMP chat.
 */
export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const [joined, setJoined] = useState(null);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    let active = true;
    joinRoom(roomId, user)
      .then((room) => {
        if (active) {
          setJoined(room);
        }
      })
      .catch((err) => {
        if (active) {
          setJoinError(err.message);
        }
      });
    return () => {
      active = false;
    };
    // Re-join only if the room or identity changes, not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.userId]);

  if (joinError) {
    return (
      <div className="page-center">
        <div className="card">
          <h1>Could not join</h1>
          <p className="error">{joinError}</p>
          <button className="btn primary" onClick={() => navigate("/room")}>
            Back to lobby
          </button>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="page-center">
        <p className="muted">Joining room {roomId}…</p>
      </div>
    );
  }

  return <CallLayout room={joined} user={user} />;
}

function CallLayout({ room, user }) {
  const navigate = useNavigate();
  const session = useRoomSession({
    roomId: room.roomId,
    user,
    initialParticipants: room.participants,
  });

  return (
    <div className="call-shell">
      <header className="call-header">
        <div>
          <p className="eyebrow">Room</p>
          <h1>{room.roomId}</h1>
        </div>
        <div className="row">
          <span className={`pill ${session.connected ? "ok" : ""}`}>
            {session.connected ? "Signaling connected" : "Connecting…"}
          </span>
          <button className="btn ghost" onClick={() => navigate("/room")}>
            Leave
          </button>
        </div>
      </header>

      <div className="call-body">
        <main className="call-main">
          {session.error ? <p className="error banner">{session.error}</p> : null}
          <VideoGrid
            localVideoRef={session.localVideoRef}
            localName={user.name}
            participants={session.participants}
            remoteStreams={session.remoteStreams}
            selfId={user.userId}
          />
          <Controls
            audioEnabled={session.audioEnabled}
            videoEnabled={session.videoEnabled}
            onToggleAudio={session.toggleAudio}
            onToggleVideo={session.toggleVideo}
            onLeave={() => navigate("/room")}
          />
        </main>
        <aside className="call-side">
          <ParticipantList participants={session.participants} selfId={user.userId} />
          <ChatPanel
            messages={session.messages}
            selfId={user.userId}
            onSend={session.sendChat}
          />
        </aside>
      </div>
    </div>
  );
}
