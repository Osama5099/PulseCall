/**
 * REST helpers for creating, looking up, and joining in-memory rooms.
 */
const jsonHeaders = { "Content-Type": "application/json" };

export async function createRoom() {
  const res = await fetch("/api/rooms", { method: "POST" });
  if (!res.ok) {
    throw new Error("Could not create a room");
  }
  return res.json();
}

export async function getRoom(roomId) {
  const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Could not load room");
  }
  return res.json();
}

export async function roomExists(roomId) {
  const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/exists`);
  if (!res.ok) {
    throw new Error("Could not check room");
  }
  return res.json();
}

export async function joinRoom(roomId, user) {
  const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/join`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      userId: user.userId,
      name: user.name,
      email: user.email,
    }),
  });
  if (res.status === 404) {
    throw new Error("Room not found. Check the Room ID.");
  }
  if (res.status === 409) {
    throw new Error("This room is full (max 5 people).");
  }
  if (!res.ok) {
    throw new Error("Could not join room");
  }
  return res.json();
}

export async function leaveRoom(roomId, userId) {
  await fetch(
    `/api/rooms/${encodeURIComponent(roomId)}/leave?userId=${encodeURIComponent(userId)}`,
    { method: "POST" }
  );
}
