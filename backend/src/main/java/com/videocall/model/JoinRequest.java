package com.videocall.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * REST body when a user creates or joins a room.
 */
public class JoinRequest {

    @NotBlank
    private String userId;

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

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
}
