import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { createDirectConversation } from "../../../store/chatSlice";
import { chatClient } from "../../../api/client";

export default function ContactModal({ onClose, onConversationCreated }) {
  const dispatch = useDispatch();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const debounceTimer = useRef(null);
  const currentUser = (() => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      return auth?.user || auth;
    } catch {
      return null;
    }
  })();

  const userRole = currentUser?.role;

  const isAdmin = userRole === "admin";
  const isDoctor = userRole === "doctor";

  const modalTitle = isAdmin ? "Select to Chat" : "Select a Doctor to Chat";
  const modalSubtitle = isAdmin
    ? "Contact patients and doctors"
    : "Contact other prescribers";
  const filterOptions = isAdmin ? ["", "patient", "doctor"] : [];
  const filterLabels = {
    "": "All",
    patient: "Patient",
    doctor: "Doctor",
  };

  const fetchContacts = useCallback(async () => {
    setFetching(true);
    try {
      const res = await chatClient.get("/chat/contacts", {
        params: { search, role, page, limit },
      });
      setContacts(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setFetching(false);
    }
  }, [search, role, page, limit]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchContacts(), 300);
    return () => clearTimeout(debounceTimer.current);
  }, [fetchContacts]);

  const handleStartChat = async (userId) => {
    setLoading(true);
    try {
      const result = await dispatch(createDirectConversation(userId)).unwrap();
      onConversationCreated?.(result);
      onClose();
    } catch (err) {
      console.error("Failed to start chat:", err);
      alert("Could not start conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleFilter = (filterRole) => {
    setRole(filterRole);
    setPage(1);
  };

  const handlePreviousPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  const roleColors = {
    patient: "bg-emerald-500/20 text-emerald-400",
    doctor: "bg-blue-500/20 text-blue-400",
    prescriber: "bg-purple-500/20 text-purple-400",
  };

  const searchPlaceholder = isAdmin
    ? "Search by name..."
    : "Search prescribers...";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-slate-700/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
          <div>
            <h2 className="text-white text-xl font-semibold flex items-center gap-2">
              <span className="text-2xl">💬</span>
              {modalTitle}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">{modalSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full p-1.5 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-4 border-b border-slate-700/60 space-y-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-slate-700/60 text-white text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/60 placeholder:text-slate-400 transition"
            />
          </div>
          {isAdmin && filterOptions.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {filterOptions.map((filter) => {
                const label = filterLabels[filter] || "All";
                return (
                  <button
                    key={filter || "all"}
                    onClick={() => handleRoleFilter(filter)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                      role === filter
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : "bg-slate-700/60 text-slate-300 hover:bg-slate-600/80 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 custom-scrollbar">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm mt-3">Loading contacts…</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <svg
                className="w-12 h-12 mb-3 opacity-40"
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
              <p className="text-sm">No contacts found</p>
            </div>
          ) : (
            contacts.map((user) => (
              <div
                key={user.user_id}
                className="group flex items-center justify-between p-2.5 hover:bg-slate-700/60 rounded-xl transition cursor-default"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-white text-sm font-medium truncate">
                      {user.name || "Unknown"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          roleColors[user.role] ||
                          "bg-slate-600/50 text-slate-300"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartChat(user.user_id)}
                  disabled={loading}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition shadow-sm hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Chat
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/60 bg-slate-800/30">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1 || fetching}
              className="px-4 py-1.5 bg-slate-700/60 hover:bg-slate-600/80 text-white text-sm rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-slate-300 text-sm font-medium">
              Page <span className="text-white">{page}</span> of{" "}
              <span className="text-white">{totalPages}</span>{" "}
              <span className="text-slate-400 text-xs">({total} total)</span>
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages || fetching}
              className="px-4 py-1.5 bg-slate-700/60 hover:bg-slate-600/80 text-white text-sm rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
