import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, roomExists } from "../api/rooms";
import { clearUser, getStoredUser } from "../utils/auth";

/**
 * Lobby: create a random Room ID or join an existing one, then go to the call page.
 */
export default function LobbyPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    setBusy(true);
    setError("");
    try {
      const room = await createRoom();
      navigate(`/room/${room.roomId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onJoin(event) {
    event.preventDefault();
    const id = roomId.trim().toUpperCase();
    if (!id) {
      setError("Enter a Room ID to join.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await roomExists(id);
      if (!result.exists) {
        setError("That Room ID does not exist yet. Create a room first.");
        return;
      }
      navigate(`/room/${result.roomId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card lobby-card">
        <div className="row space">
          <div>
            <p className="eyebrow">Signed in as</p>
            <h1>{user?.name}</h1>
            <p className="muted">{user?.email}</p>
          </div>
          <button
            className="btn ghost"
            onClick={() => {
              clearUser();
              navigate("/");
            }}
          >
            Switch user
          </button>
        </div>

        <div className="split">
          <div>
            <h2>Create a room</h2>
            <p className="muted">Generates a 6-character Room ID you can share.</p>
            <button className="btn primary" disabled={busy} onClick={onCreate}>
              {busy ? "Working…" : "Create room"}
            </button>
          </div>
          <form onSubmit={onJoin}>
            <h2>Join a room</h2>
            <p className="muted">Ask a participant for their Room ID.</p>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={8}
            />
            <button className="btn" disabled={busy} type="submit">
              Join
            </button>
          </form>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </div>
    </div>
  );
}
