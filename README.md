# PulseCall — Mini group video calling

Resume-style web app: **Java Spring Boot** signaling + **React** + **WebRTC mesh** (up to 5 peers) + **STOMP/SockJS** chat. No database.

## Run locally

Use two terminals.

### 1. Backend

```bash
cd backend
mvn spring-boot:run
```

API: `http://localhost:8080`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173`

Open the app in **two browser windows** (or one normal + one incognito). Log in with different names, create a room in one window, join with the Room ID in the other. Allow camera and microphone.

If `mvn` fails with a PKIX / certificate error, Java is not trusting your network TLS inspection. Use a JDK that trusts your corporate CA, or run Maven on a network without SSL interception. If `npm install` fails the same way, run `npm install --strict-ssl=false` (dev machine only).

Localhost WebRTC usually works without extra TURN servers. Different networks may need a TURN server.

## Project structure

```
backend/   Spring Boot REST + WebSocket signaling (in-memory rooms)
frontend/  React (Vite) login, lobby, mesh call, chat
```

### Backend files

| File | Purpose |
|------|---------|
| `VideoCallApplication.java` | Spring Boot entry point |
| `config/WebSocketConfig.java` | STOMP broker, SockJS endpoint `/ws` |
| `config/CorsConfig.java` | CORS for the React dev server |
| `controller/RoomController.java` | Create / exists / join / leave rooms |
| `controller/SignalingController.java` | Relays SDP, ICE, chat, join/leave |
| `service/RoomService.java` | ConcurrentHashMap of rooms and sessions |
| `model/*` | Participant, Room, SignalMessage, ChatMessage |

### Frontend files

| File | Purpose |
|------|---------|
| `pages/LoginPage.jsx` | Name + email, saved to `localStorage` |
| `pages/LobbyPage.jsx` | Create room or join by ID |
| `pages/RoomPage.jsx` | Call layout: videos, controls, roster, chat |
| `hooks/useRoomSession.js` | Camera, STOMP, mesh peer connections |
| `webrtc/peer.js` | `RTCPeerConnection` helpers |
| `signaling/stompClient.js` | `@stomp/stompjs` + `sockjs-client` |
| `api/rooms.js` | REST client for `/api/rooms` |

## Signaling flow

1. Client joins via `POST /api/rooms/{id}/join`.
2. Client connects to `/ws` (SockJS) and subscribes to:
   - `/topic/room.{id}.signal`
   - `/topic/room.{id}.chat`
   - `/topic/room.{id}.participants`
3. Client sends `/app/join`. Everyone else learns the new peer.
4. Each pair of users opens an `RTCPeerConnection`. The peer with the lexicographically smaller `userId` creates the SDP offer (avoids glare).
5. Offers, answers, and ICE candidates go through `/app/signal`.
6. Chat is `/app/chat` → `/topic/room.{id}.chat`.
