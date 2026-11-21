import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * Opens a STOMP-over-SockJS connection to Spring Boot and subscribes
 * to signaling, chat, and participant topics for one room.
 */
export function connectSignaling({
  roomId,
  onSignal,
  onChat,
  onParticipants,
  onConnected,
}) {
  const client = new Client({
    webSocketFactory: () => new SockJS("/ws"),
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      client.subscribe(`/topic/room.${roomId}.signal`, (frame) => {
        onSignal(JSON.parse(frame.body));
      });
      client.subscribe(`/topic/room.${roomId}.chat`, (frame) => {
        onChat(JSON.parse(frame.body));
      });
      client.subscribe(`/topic/room.${roomId}.participants`, (frame) => {
        onParticipants(JSON.parse(frame.body));
      });
      onConnected?.(client);
    },
  });

  client.activate();
  return client;
}

export function publish(client, destination, body) {
  if (!client?.connected) {
    return;
  }
  client.publish({
    destination,
    body: JSON.stringify(body),
  });
}
