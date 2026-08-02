import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  conversationRead,
  setActiveConversation,
} from "../../../store/chatSlice";
import useChatWebSocket from "../../../hooks/useChatWebSocket";
import { Check, CheckCheck, Send, Users, X } from "lucide-react";
import { chatClient } from "../../../api/client";

export default function ChatWindow({ conversation }) {
  const dispatch = useDispatch();
  const { sendMessage, markRead } = useChatWebSocket();
  const messagesEndRef = useRef(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);

  const currentUserId = (() => {
    try {
      const authData = JSON.parse(localStorage.getItem("auth") || "{}");
      return (
        authData?.user?.id ??
        authData?.user?.user_id ??
        authData?.id ??
        authData?.user_id ??
        null
      );
    } catch {
      return null;
    }
  })();

  const messages = useSelector(
    (state) => state.chat.messagesByConversation[conversation?.id] || [],
  );

  const [text, setText] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    if (!conversation?.id) return;
    dispatch(fetchMessages(conversation.id));
    dispatch(setActiveConversation(conversation.id));
    if (markRead) markRead(conversation.id);
    dispatch(conversationRead(conversation.id));
  }, [conversation?.id, dispatch, markRead]);

  useEffect(() => {
    scrollToBottom();
    if (conversation?.id && messages.length > 0) {
      if (markRead) markRead(conversation.id);
      dispatch(conversationRead(conversation.id));
    }
  }, [messages, conversation?.id, dispatch, markRead]);

  // Fetch online status for direct conversations
  useEffect(() => {
    if (!conversation?.id || conversation.type !== "direct") {
      setOtherUserOnline(false);
      return;
    }

    const otherMember = conversation.memberships?.find(
      (m) => (m.userId || m.user?.user_id) !== currentUserId,
    );
    const otherUserId = otherMember?.userId || otherMember?.user?.user_id;
    if (!otherUserId) return;

    const fetchStatus = async () => {
      try {
        const res = await chatClient.get(`/chat/users/${otherUserId}/status`);
        setOtherUserOnline(res.data.online);
      } catch (err) {
        console.error("Failed to fetch user status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [conversation?.id, currentUserId]);

  if (!conversation) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
            <svg
              className="h-10 w-10 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
            No conversation selected
          </h3>
          <p className="text-sm text-slate-400">
            Choose a chat from the sidebar
          </p>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(conversation.id, text.trim());
    setText("");
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getSenderName = (msg) => {
    if (msg.sender?.name) return msg.sender.name;
    if (msg.User?.name) return msg.User.name;

    const member = conversation.memberships?.find(
      (m) => (m.userId || m.user?.user_id) === msg.senderId,
    );
    return member?.user?.name || member?.User?.name || `User ${msg.senderId}`;
  };

  const getSenderRole = (msg) => {
    if (msg.sender?.role) return msg.sender.role;
    if (msg.User?.role) return msg.User.role;
    const member = conversation.memberships?.find(
      (m) => (m.userId || m.user?.user_id) === msg.senderId,
    );
    return member?.user?.role || member?.User?.role || null;
  };

  const members = conversation.memberships || [];
  const otherMember = members.find(
    (m) => (m.userId || m.user?.user_id) !== currentUserId,
  );
  const displayName =
    conversation.type === "group"
      ? `Care Team – ${conversation.patient?.User?.name || conversation.patient?.user?.name || "Patient"}`
      : otherMember?.user?.name || "Direct Message";

  const getConversationAvatar = () => {
    if (conversation.type === "group") {
      const patientUser =
        conversation.patient?.User || conversation.patient?.user;
      return patientUser?.profile_picture || null;
    }
    const other = conversation.memberships?.find(
      (m) => (m.userId || m.user?.user_id) !== currentUserId,
    );
    return other?.user?.profile_picture || null;
  };

  const conversationAvatar = getConversationAvatar();

  return (
    <div className="flex h-full flex-1 flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            {conversationAvatar ? (
              <img
                src={conversationAvatar}
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-md">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {conversation.type === "group" ? (
              <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-600 ring-2 ring-white dark:ring-slate-800">
                <Users className="h-2.5 w-2.5 text-white" />
              </div>
            ) : (
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-800 ${
                  otherUserOnline ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
              {displayName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {conversation.type === "group"
                ? `${members.length} members`
                : otherUserOnline
                  ? "Online"
                  : "Offline"}
            </p>
          </div>
        </div>

        {conversation.type === "group" && (
          <button
            onClick={() => setShowMembersModal(!showMembersModal)}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            <Users className="h-3.5 w-3.5" />
            Members
          </button>
        )}
      </div>

      {/* Group Members Popover */}
      {showMembersModal && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-end p-4"
          onClick={() => setShowMembersModal(false)}
        >
          <div
            className="w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Members
              </span>
              <button
                onClick={() => setShowMembersModal(false)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-48 space-y-1.5 overflow-y-auto custom-scrollbar">
              {members.map((m, idx) => {
                const name =
                  m.user?.name ||
                  m.User?.name ||
                  `User ${m.userId || m.user?.user_id}`;
                const avatarSrc =
                  m.user?.profile_picture || m.User?.profile_picture || null;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={name}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                        {name[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m) => {
          const isSystem =
            m.isSystem ||
            m.type === "system" ||
            m.senderId === null ||
            m.senderId === undefined;
          const isMe = String(m.senderId) === String(currentUserId);
          const senderName = getSenderName(m);
          const senderRole = getSenderRole(m);
          const timeString = formatTime(m.createdAt || m.created_at);

          const reads = m.reads || m.seenBy || m.readBy || [];
          const isSeen = Boolean(
            m.readAt ||
            m.isRead === true ||
            m.seen === true ||
            (Array.isArray(reads) && reads.length > 0),
          );
          const isDelivered = Boolean(m.deliveredAt || isSeen);

          if (isSystem) {
            return (
              <div
                key={m.id || m.createdAt}
                className="flex justify-center my-2"
              >
                <div className="rounded-full bg-slate-200/80 px-4 py-1.5 text-xs text-slate-600 backdrop-blur dark:bg-slate-700/80 dark:text-slate-300">
                  {m.body}
                </div>
              </div>
            );
          }

          return (
            <div
              key={m.id || m.createdAt}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              {!isMe && (
                <div className="mb-1 flex flex-col items-start">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {senderName}
                  </span>
                  {senderRole === "admin" && (
                    <span className="text-[10px] font-medium text-purple-400 dark:text-purple-400">
                      Admin
                    </span>
                  )}
                  {senderRole === "doctor" && (
                    <span className="text-[10px] font-medium text-blue-400 dark:text-blue-400">
                      Doctor
                    </span>
                  )}
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  m.isUrgent
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white"
                    : isMe
                      ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-blue-500/20"
                      : "bg-white text-slate-800 shadow-slate-200/50 dark:bg-slate-800 dark:text-slate-100 dark:shadow-slate-700/30"
                }`}
              >
                {m.body}
              </div>

              <div className="mt-1 flex items-center gap-1.5 px-1 text-[10px] text-slate-400 dark:text-slate-500">
                <span>{timeString}</span>

                {isMe && (
                  <span className="group relative flex cursor-pointer items-center gap-0.5 font-medium">
                    {isSeen ? (
                      <span className="flex items-center gap-0.5 text-blue-400">
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>Seen</span>
                      </span>
                    ) : isDelivered ? (
                      <span className="flex items-center gap-0.5 text-slate-400">
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>Delivered</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <Check className="h-3.5 w-3.5" />
                        <span>Sent</span>
                      </span>
                    )}

                    {isSeen && (
                      <div className="absolute bottom-full right-0 mb-1 hidden w-48 rounded-lg border border-slate-200 bg-white p-2 text-[10px] shadow-lg group-hover:block dark:border-slate-700 dark:bg-slate-800">
                        <div className="mb-1 border-b border-slate-200 pb-1 font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300">
                          Seen details
                        </div>
                        {m.readAt ? (
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Read at</span>
                            <span>{formatTime(m.readAt)}</span>
                          </div>
                        ) : reads.length > 0 ? (
                          reads.map((r, i) => (
                            <div key={i} className="flex justify-between">
                              <span>
                                {r.user?.name ||
                                  r.User?.name ||
                                  `User ${r.userId}`}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {formatTime(
                                  r.readAt || r.updatedAt || r.createdAt,
                                )}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 dark:text-slate-400">
                            Seen by recipient(s)
                          </div>
                        )}
                      </div>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 hover:shadow-md disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}