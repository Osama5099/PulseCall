package com.videocall.model;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * WebRTC signaling payload relayed between peers in the same room.
 * type is OFFER, ANSWER, ICE, JOIN, or LEAVE.
 * payload holds SDP or an ICE candidate as JSON.
 */
public class SignalMessage {

    private String type;
    private String roomId;
    private String fromUserId;
    private String fromName;
    private String toUserId;
    private JsonNode payload;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getFromUserId() {
        return fromUserId;
    }

    public void setFromUserId(String fromUserId) {
        this.fromUserId = fromUserId;
    }

    public String getFromName() {
        return fromName;
    }

    public void setFromName(String fromName) {
        this.fromName = fromName;
    }

    public String getToUserId() {
        return toUserId;
    }

    public void setToUserId(String toUserId) {
        this.toUserId = toUserId;
    }

    public JsonNode getPayload() {
        return payload;
    }

    public void setPayload(JsonNode payload) {
        this.payload = payload;
    }
}
