package com.videocall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the video-call signaling API.
 * Rooms and participants live in memory for this mini project (no database).
 */
@SpringBootApplication
public class VideoCallApplication {

    public static void main(String[] args) {
        SpringApplication.run(VideoCallApplication.class, args);
    }
}
