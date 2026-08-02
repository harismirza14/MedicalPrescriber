import React, { useState, useEffect } from "react";
import ChatList from "../components/organisms/ChatList/ChatList";
import ChatWindow from "../components/organisms/ChatWindow/ChatWindow";

export default function Chat() {
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      const user = auth?.user || auth;
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const isPatient = currentUser?.role === "patient";
  const userName = currentUser?.name || "User";

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
              Messages
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isPatient ? "Care Team & Support" : "Team Communication"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <ChatList
            onSelect={(convo) => setSelectedConvo(convo)}
            activeId={selectedConvo?.id}
          />
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-900">
          {selectedConvo ? (
            <ChatWindow conversation={selectedConvo} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
              <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10"
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
              <p className="text-sm">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
