import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations, createDirectConversation } from "../../../store/chatSlice";
import Avatar from "../../atoms/Avatar/Avatar";
import ContactModal from "../ContactModal/ContactModal";
import { chatClient } from "../../../api/client";

export default function ChatList({ onSelect, activeId }) {
  const dispatch = useDispatch();
  const { conversations } = useSelector((state) => state.chat);
  const [showModal, setShowModal] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const sortedConversations = useMemo(() => {
    return [...(conversations || [])].sort((a, b) => {
      const timeA = new Date(
        a.updatedAt || a.lastMessageAt || a.updated_at || a.createdAt || 0,
      ).getTime();
      const timeB = new Date(
        b.updatedAt || b.lastMessageAt || b.updated_at || b.createdAt || 0,
      ).getTime();

      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return (b.id || 0) - (a.id || 0);
    });
  }, [conversations]);

  const getCurrentUser = () => {
    try {
      const stored = localStorage.getItem("auth");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.user || parsed;
    } catch {
      return null;
    }
  };

  const getCurrentUserId = () => {
    const user = getCurrentUser();
    return user?.user_id || user?.id || null;
  };

  const currentUserId = getCurrentUserId();
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role;

  const canStartNewChat = () => {
    return userRole === "admin" || userRole === "doctor";
  };

  const isPatient = userRole === "patient";

  const getDisplayName = (conversation) => {
    if (conversation.type === "group") {
      const patientName =
        conversation.patient?.User?.name ||
        conversation.patient?.user?.name ||
        conversation.patientName;
      if (patientName) {
        return `${patientName}'s Care Team`;
      }
      return "Care Team";
    }

    if (conversation.memberships && currentUserId) {
      const other = conversation.memberships.find(
        (m) => (m.user?.user_id || m.userId) !== currentUserId,
      );
      if (other?.user?.name) {
        return other.user.name;
      }
    }
    return "Direct Message";
  };

  const getAvatarName = (conversation) => {
    if (conversation.type === "group") {
      const patientName =
        conversation.patient?.User?.name || conversation.patient?.user?.name;
      return patientName || "CT";
    }
    if (conversation.memberships && currentUserId) {
      const other = conversation.memberships.find(
        (m) => (m.user?.user_id || m.userId) !== currentUserId,
      );
      return other?.user?.name || "DM";
    }
    return "DM";
  };

  const getAvatarImage = (conversation) => {
    if (conversation.type === "group") {
      const patientUser =
        conversation.patient?.User || conversation.patient?.user;
      return patientUser?.profile_picture || null;
    }
    if (conversation.memberships && currentUserId) {
      const other = conversation.memberships.find(
        (m) => (m.user?.user_id || m.userId) !== currentUserId,
      );
      return other?.user?.profile_picture || null;
    }
    return null;
  };

  const handleConversationCreated = (newConversation) => {
    if (onSelect) {
      onSelect(newConversation);
    }
  };

  const handleChatWithAdmin = async () => {
    setLoadingAdmin(true);
    try {
      const res = await chatClient.get("/chat/admin");
      const adminId = res.data.adminId;
      if (!adminId) {
        alert("No admin found. Please contact support.");
        return;
      }
      const result = await dispatch(createDirectConversation(adminId)).unwrap();
      if (onSelect) {
        onSelect(result);
      }
    } catch (err) {
      console.error("Failed to start chat with admin:", err);
      alert("Could not start chat with admin. Please try again.");
    } finally {
      setLoadingAdmin(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Chats
        </h2>
        <div className="flex items-center gap-2">
          {canStartNewChat() && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 hover:shadow-md active:scale-95"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Chat
            </button>
          )}
          {isPatient && (
            <button
              onClick={handleChatWithAdmin}
              disabled={loadingAdmin}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Chat with Admin
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
            <svg
              className="w-10 h-10 mb-2 opacity-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm">No conversations yet</span>
          </div>
        ) : (
          sortedConversations.map((c) => {
            const isActive = activeId === c.id;
            const displayName = getDisplayName(c);
            const avatarName = getAvatarName(c);
            const avatarSrc = getAvatarImage(c);
            const unread = c.unreadCount || 0;

            return (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                }`}
              >
                <Avatar name={avatarName} size="sm" src={avatarSrc} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {c.type === "group" ? "Group" : "Direct"}
                  </p>
                </div>

                {unread > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {showModal && (
        <ContactModal
          onClose={() => setShowModal(false)}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}