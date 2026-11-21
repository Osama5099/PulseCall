package com.videocall.dto;

import com.videocall.model.Participant;

import java.util.List;

/**
 * JSON returned by room REST endpoints (id + who is already inside).
 */
public class RoomResponse {

    private String roomId;
    private List<Participant> participants;

    public RoomResponse(String roomId, List<Participant> participants) {
        this.roomId = roomId;
        this.participants = participants;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public List<Participant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<Participant> participants) {
        this.participants = participants;
    }
}
