package com.videocall.controller;

import com.videocall.dto.RoomResponse;
import com.videocall.model.JoinRequest;
import com.videocall.model.Participant;
import com.videocall.model.Room;
import com.videocall.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API to create rooms, check they exist, and join (validates capacity, no DB).
 */
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public RoomResponse create() {
        Room room = roomService.createRoom();
        return new RoomResponse(room.getId(), roomService.snapshot(room));
    }

    @GetMapping("/{roomId}")
    public RoomResponse get(@PathVariable String roomId) {
        Room room = roomService.getRoomOrThrow(roomId);
        return new RoomResponse(room.getId(), roomService.snapshot(room));
    }

    @GetMapping("/{roomId}/exists")
    public Map<String, Object> exists(@PathVariable String roomId) {
        boolean exists = roomService.exists(roomId);
        return Map.of("roomId", roomId.toUpperCase(), "exists", exists);
    }

    @PostMapping("/{roomId}/join")
    public RoomResponse join(@PathVariable String roomId, @Valid @RequestBody JoinRequest request) {
        Participant participant = new Participant(request.getUserId(), request.getName(), request.getEmail(), null);
        Room room = roomService.join(roomId, participant);
        return new RoomResponse(room.getId(), roomService.snapshot(room));
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leave(@PathVariable String roomId, @RequestParam String userId) {
        roomService.leave(roomId, userId);
        return ResponseEntity.noContent().build();
    }
}
