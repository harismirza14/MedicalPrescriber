import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  messageReceived,
  conversationRead,
  messageDelivered,
  messagesMarkedAsRead,
  fetchConversations,
} from "../store/chatSlice";

export default function useChatWebSocket() {
  const dispatch = useDispatch();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const shouldReconnect = useRef(true); 

  const connect = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem("auth") || "null");
    if (!stored?.token) {
      console.warn("No auth token found, WebSocket connection skipped.");
      return;
    }

    const wsUrl = `${
      import.meta.env.VITE_WS_BASE || "ws://localhost:3001"
    }?token=${stored.token}`;

    console.log("🔌 Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      reconnectAttempts.current = 0;
      shouldReconnect.current = true;
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { event: eventName, data } = payload;

        if (eventName === "message_created" || eventName === "new_message") {
          dispatch(messageReceived(data));
          if (eventName === "new_message" && data.id) {
            ws.send(
              JSON.stringify({
                event: "message_delivered",
                data: { messageId: data.id },
              }),
            );
          }
        } else if (eventName === "message_delivered") {
          dispatch(messageDelivered(data.messageId));
        } else if (
          eventName === "marked_read" ||
          eventName === "conversation_read"
        ) {
          const convoId = data?.conversationId || data?.id;
          if (convoId) dispatch(conversationRead(convoId));
        } else if (
          eventName === "messages_read" ||
          eventName === "message_read" ||
          eventName === "messages_marked_read"
        ) {
          const convoId = data?.conversationId || data?.id;
          let messageIds = data?.messageIds;
          if (!messageIds && data?.messageId) messageIds = [data.messageId];
          if (convoId && messageIds && messageIds.length) {
            dispatch(
              messagesMarkedAsRead({
                conversationId: convoId,
                messageIds,
                readBy: data?.readBy || data?.userId,
                readAt: data?.readAt,
              }),
            );
            dispatch(conversationRead(convoId));
          }
        } else if (
          eventName === "care_team_updated" ||
          eventName === "conversation_updated"
        ) {
          dispatch(fetchConversations());
        } else if (eventName === "connected") {
          console.log("🟢 Server acknowledged connection:", data);
        } else if (eventName === "error") {
          console.error("❌ Server error:", data);
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket disconnected");
      if (event.code === 1008) {
        console.warn(
          "Server rejected connection (invalid token). Stopping reconnection.",
        );
        shouldReconnect.current = false;
        return;
      }
      if (!shouldReconnect.current) return;

      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttempts.current),
        30000,
      );
      console.log(`⏳ Reconnecting in ${delay}ms...`);
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        connect();
      }, delay);
    };

    ws.onerror = (err) => {
      console.warn("⚠️ WebSocket connection error (will retry):", err);
      ws.close(); 
    };
  }, [dispatch]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((conversationId, body,) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "send_message",
          data: { conversationId, body,},
        }),
      );
      return true;
    } else {
      console.warn("WebSocket not connected, message not sent.");
      return false;
    }
  }, []);

  const markRead = useCallback((conversationId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "mark_read",
          data: { conversationId },
        }),
      );
      return true;
    } else {
      console.warn("WebSocket not connected, read receipt not sent.");
      return false;
    }
  }, []);

  return { sendMessage, markRead };
}
