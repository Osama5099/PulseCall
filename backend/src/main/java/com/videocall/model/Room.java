package com.videocall.model;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory room: an id plus the map of participants currently joined.
 */
public class Room {

    public static final int MAX_PARTICIPANTS = 5;

    private final String id;
    private final ConcurrentHashMap<String, Participant> participants = new ConcurrentHashMap<>();

    public Room(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public Collection<Participant> getParticipants() {
        return participants.values();
    }

    public Participant getParticipant(String userId) {
        return participants.get(userId);
    }

    public void addParticipant(Participant participant) {
        participants.put(participant.getUserId(), participant);
    }

    public Participant removeParticipant(String userId) {
        return participants.remove(userId);
    }

    public boolean isFull() {
        return participants.size() >= MAX_PARTICIPANTS;
    }

    public boolean isEmpty() {
        return participants.isEmpty();
    }
}
