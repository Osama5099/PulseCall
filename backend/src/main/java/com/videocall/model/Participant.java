package com.videocall.model;

/**
 * A user currently inside a room. sessionId ties them to their WebSocket connection
 * so we can drop them from the room on disconnect.
 */
public class Participant {

    private String userId;
    private String name;
    private String email;
    private String sessionId;

    public Participant() {
    }

    public Participant(String userId, String name, String email, String sessionId) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.sessionId = sessionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
