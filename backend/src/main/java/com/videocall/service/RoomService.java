package com.videocall.service;

import com.videocall.model.Participant;
import com.videocall.model.Room;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store of rooms (ConcurrentHashMap). No database.
 * Also maps WebSocket session ids back to a room so disconnects clean up the roster.
 */
@Service
public class RoomService {

    private static final String ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int ROOM_ID_LENGTH = 6;

    private final ConcurrentHashMap<String, Room> rooms = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, SessionBinding> sessions = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public Room createRoom() {
        String id = generateRoomId();
        Room room = new Room(id);
        rooms.put(id, room);
        return room;
    }

    public Room getRoomOrThrow(String roomId) {
        Room room = rooms.get(normalize(roomId));
        if (room == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found");
        }
        return room;
    }

    public boolean exists(String roomId) {
        return rooms.containsKey(normalize(roomId));
    }

    public Room join(String roomId, Participant participant) {
        Room room = getRoomOrThrow(roomId);
        synchronized (room) {
            Participant existing = room.getParticipant(participant.getUserId());
            if (existing == null && room.isFull()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Room is full (max 5 participants)");
            }
            room.addParticipant(participant);
        }
        if (participant.getSessionId() != null) {
            sessions.put(participant.getSessionId(), new SessionBinding(room.getId(), participant.getUserId()));
        }
        return room;
    }

    public void bindSession(String roomId, String userId, String sessionId) {
        Room room = rooms.get(normalize(roomId));
        if (room == null) {
            return;
        }
        Participant participant = room.getParticipant(userId);
        if (participant != null) {
            participant.setSessionId(sessionId);
            sessions.put(sessionId, new SessionBinding(room.getId(), userId));
        }
    }

    public LeaveResult leave(String roomId, String userId) {
        Room room = rooms.get(normalize(roomId));
        if (room == null) {
            return null;
        }
        Participant removed;
        synchronized (room) {
            removed = room.removeParticipant(userId);
            if (room.isEmpty()) {
                rooms.remove(room.getId());
            }
        }
        if (removed != null && removed.getSessionId() != null) {
            sessions.remove(removed.getSessionId());
        }
        return new LeaveResult(room.getId(), removed, snapshot(room));
    }

    public LeaveResult leaveBySession(String sessionId) {
        SessionBinding binding = sessions.remove(sessionId);
        if (binding == null) {
            return null;
        }
        return leave(binding.roomId(), binding.userId());
    }

    public List<Participant> snapshot(Room room) {
        return new ArrayList<>(room.getParticipants());
    }

    private String generateRoomId() {
        String id;
        do {
            StringBuilder sb = new StringBuilder(ROOM_ID_LENGTH);
            for (int i = 0; i < ROOM_ID_LENGTH; i++) {
                sb.append(ROOM_ALPHABET.charAt(random.nextInt(ROOM_ALPHABET.length())));
            }
            id = sb.toString();
        } while (rooms.containsKey(id));
        return id;
    }

    private String normalize(String roomId) {
        return roomId == null ? "" : roomId.trim().toUpperCase();
    }

    public Map<String, Room> getRooms() {
        return rooms;
    }

    public record SessionBinding(String roomId, String userId) {
    }

    public record LeaveResult(String roomId, Participant left, List<Participant> remaining) {
    }
}
