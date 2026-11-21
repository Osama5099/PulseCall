package com.videocall.controller;

import com.videocall.model.ChatMessage;
import com.videocall.model.SignalMessage;
import com.videocall.service.RoomService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * Relays WebRTC SDP/ICE, chat, and join/leave events on per-room STOMP topics.
 */
@Controller
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService roomService;

    public SignalingController(SimpMessagingTemplate messagingTemplate, RoomService roomService) {
        this.messagingTemplate = messagingTemplate;
        this.roomService = roomService;
    }

    @MessageMapping("/signal")
    public void signal(@Payload SignalMessage message) {
        messagingTemplate.convertAndSend(signalTopic(message.getRoomId()), message);
    }

    @MessageMapping("/chat")
    public void chat(@Payload ChatMessage message) {
        if (message.getTimestamp() == 0) {
            message.setTimestamp(System.currentTimeMillis());
        }
        messagingTemplate.convertAndSend(chatTopic(message.getRoomId()), message);
    }

    @MessageMapping("/join")
    public void join(@Payload SignalMessage message, SimpMessageHeaderAccessor accessor) {
        String sessionId = accessor.getSessionId();
        roomService.bindSession(message.getRoomId(), message.getFromUserId(), sessionId);
        messagingTemplate.convertAndSend(signalTopic(message.getRoomId()), message);

        var room = roomService.getRoomOrThrow(message.getRoomId());
        messagingTemplate.convertAndSend(
                participantsTopic(message.getRoomId()),
                roomService.snapshot(room)
        );
    }

    @MessageMapping("/leave")
    public void leave(@Payload SignalMessage message) {
        RoomService.LeaveResult result = roomService.leave(message.getRoomId(), message.getFromUserId());
        broadcastLeave(message.getRoomId(), message, result);
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        RoomService.LeaveResult result = roomService.leaveBySession(event.getSessionId());
        if (result == null || result.left() == null) {
            return;
        }
        SignalMessage leave = new SignalMessage();
        leave.setType("LEAVE");
        leave.setRoomId(result.roomId());
        leave.setFromUserId(result.left().getUserId());
        leave.setFromName(result.left().getName());
        broadcastLeave(result.roomId(), leave, result);
    }

    private void broadcastLeave(String roomId, SignalMessage leave, RoomService.LeaveResult result) {
        messagingTemplate.convertAndSend(signalTopic(roomId), leave);
        if (result != null) {
            messagingTemplate.convertAndSend(participantsTopic(roomId), result.remaining());
        }
    }

    private String signalTopic(String roomId) {
        return "/topic/room." + roomId + ".signal";
    }

    private String chatTopic(String roomId) {
        return "/topic/room." + roomId + ".chat";
    }

    private String participantsTopic(String roomId) {
        return "/topic/room." + roomId + ".participants";
    }
}
