import React, { useState, useEffect, useRef } from "react";
import { fetchPrescribers } from "../../../api/prescriberApi";
import { addCareTeamMember } from "../../../api/careTeamApi";
import Button from "../../atoms/Button/Button";

const ROLE_OPTIONS = ["Primary Physician", "Consultant", "Specialist", "Nurse"];
const LIMIT = 2;

const inputCls =
  "w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500";

export default function AddCareTeamMemberModal({ isOpen, onClose, patientId, onMemberAdded }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPrescriber, setSelectedPrescriber] = useState(null);
  const [role, setRole] = useState(ROLE_OPTIONS[1]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const isSubmittingRef = useRef(false);

  const hasMore = results.length < totalCount;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset pagination on new search
  useEffect(() => {
    if (debouncedSearch.trim()) {
      setPage(1);
      setResults([]);
      setTotalCount(0);
    }
  }, [debouncedSearch]);

  // Fetch results
  useEffect(() => {
    if (!isOpen || !debouncedSearch.trim()) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    setSearching(true);
    fetchPrescribers({ search: debouncedSearch, limit: LIMIT, page })
      .then((res) => {
        const data = res.data || [];
        const total = res.total ?? res.totalCount ?? res.totalItems ?? 0;
        setResults((prev) => (page === 1 ? data : [...prev, ...data]));
        setTotalCount(total);
      })
      .catch(() => {
        setResults([]);
        setTotalCount(0);
      })
      .finally(() => setSearching(false));
  }, [debouncedSearch, isOpen, page]);

  // Reset modal on open
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setDebouncedSearch("");
      setResults([]);
      setSelectedPrescriber(null);
      setRole(ROLE_OPTIONS[1]);
      setError(null);
      setPage(1);
      setTotalCount(0);
    }
  }, [isOpen]);

  const handleLoadMore = () => {
    if (hasMore && !searching) {
      setPage((prev) => prev + 1);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Prevent page refresh
    if (isSubmittingRef.current || !selectedPrescriber) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      await addCareTeamMember(patientId, {
        prescriber_id: selectedPrescriber.prescriber_id,
        role,
      });
      onMemberAdded?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add care team member.");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Care Team Member</h2>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* ✅ FORM with buttons inside */}
          <form id="add-care-team-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Search Doctor *
              </label>
              {selectedPrescriber ? (
                <div className="flex items-center justify-between border rounded px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedPrescriber.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedPrescriber.specialty || "N/A"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPrescriber(null)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={inputCls}
                  />
                  {searching && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Searching...</p>
                  )}
                  {!searching && results.length > 0 && (
                    <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {results.map((p) => (
                        <li
                          key={p.prescriber_id}
                          onClick={() => setSelectedPrescriber(p)}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 list-none"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {p.specialty || "N/A"} · {p.email}
                          </p>
                        </li>
                      ))}

                      {hasMore && (
                        <li className="px-3 py-2 list-none">
                          <Button
                            variant="ghost"
                            className="w-full text-xs font-medium"
                            onClick={handleLoadMore}
                            disabled={searching}
                          >
                            {searching ? "Loading..." : "Load More"}
                          </Button>
                        </li>
                      )}

                      {!hasMore && results.length > 0 && (
                        <li className="px-3 py-2 text-center text-xs text-gray-400 dark:text-gray-500 list-none">
                          {results.length} of {totalCount}{" "}
                          {totalCount === 1 ? "doctor" : "doctors"} loaded
                        </li>
                      )}
                    </div>
                  )}
                  {!searching && debouncedSearch.trim() && results.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No doctors found.</p>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputCls}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ BUTTONS INSIDE THE FORM */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="solid"
                disabled={loading || !selectedPrescriber}
                type="submit"
              >
                {loading ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}