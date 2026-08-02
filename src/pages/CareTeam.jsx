import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchCareTeam } from "../api/careTeamApi";
import client from "../api/client"; // Axios instance
import Avatar from "../components/atoms/Avatar/Avatar";
import { Stethoscope, Phone, Mail, Users, Plus, Trash2 } from "lucide-react";

function RoleBadge({ role }) {
  const isPrimary = role?.toLowerCase() === "primary physician";
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isPrimary
          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
      }`}
    >
      {role || "Member"}
    </span>
  );
}

export default function CareTeam({ patientId, onCareTeamUpdated }) {
  const { user, role, roleSpecificId } = useSelector((state) => state.auth);

  const [careTeam, setCareTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedPrescriberId, setSelectedPrescriberId] = useState("");
  const [memberRole, setMemberRole] = useState("Consultant");
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const loadCareTeam = () => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchCareTeam(patientId)
      .then((data) => {
        setCareTeam(data);
        if (onCareTeamUpdated) onCareTeamUpdated(data);
      })
      .catch((err) => {
        console.error("Failed to fetch care team:", err);
        setError("Could not load care team.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCareTeam();
  }, [patientId]);

  // Determine if current user can add/remove members
  const canManage = (() => {
    if (!user || !careTeam) return false;
    if (role === "admin") return true;
    if (role === "doctor" && roleSpecificId) {
      return careTeam.members.some(
        (member) => member.prescriber_id === roleSpecificId
      );
    }
    return false;
  })();

  // Open modal and fetch available prescribers
  const handleOpenAddModal = async () => {
    setModalError(null);
    setSelectedPrescriberId("");
    setMemberRole("Consultant");
    setIsAddModalOpen(true);

    try {
      const res = await client.get("/prescribers");
      // Filter out prescribers already on the team
      const existingPrescriberIds = (careTeam?.members || []).map(
        (m) => m.prescriber_id
      );
      const doctors = (res.data || []).filter(
        (doc) => !existingPrescriberIds.includes(doc.prescriber_id)
      );
      setAvailableDoctors(doctors);
    } catch (err) {
      console.error("Failed to fetch doctors list:", err);
      setModalError("Could not load prescribers list.");
    }
  };

  // Submit Add Member
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPrescriberId) {
      setModalError("Please select a doctor.");
      return;
    }

    setActionLoading(true);
    setModalError(null);

    try {
      await client.post(`/care-team/${patientId}/members`, {
        prescriber_id: selectedPrescriberId,
        role: memberRole,
      });

      setIsAddModalOpen(false);
      loadCareTeam(); // Reload team & trigger auto-sync callback
    } catch (err) {
      setModalError(
        err.response?.data?.error || "Failed to add member to care team."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this care team?`)) {
      return;
    }

    try {
      await client.delete(`/care-team/${patientId}/members/${memberId}`);
      loadCareTeam(); // Reload team & trigger auto-sync callback
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove member.");
    }
  };

  if (!patientId) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No patient selected.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Care Team
          </h1>
        </div>
        {canManage && !loading && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Loading care team...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      ) : !careTeam || careTeam.members.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-12 text-center">
          <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No care team members yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Your healthcare provider will add team members here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {careTeam.members.map((member) => (
            <div
              key={member.member_id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex items-center justify-between"
            >
              <div className="flex items-start gap-4">
                <Avatar name={member.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {member.name}
                    </h3>
                    <RoleBadge role={member.role} />
                  </div>
                  <div className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                    {member.specialty && (
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span>{member.specialty}</span>
                      </div>
                    )}
                    {member.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span>{member.phone_number}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {canManage && (
                <button
                  onClick={() =>
                    handleRemoveMember(member.member_id, member.name)
                  }
                  title="Remove from Care Team"
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── ADD MEMBER MODAL ────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add Doctor to Care Team
            </h2>

            {modalError && (
              <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Doctor *
                </label>
                <select
                  value={selectedPrescriberId}
                  onChange={(e) => setSelectedPrescriberId(e.target.value)}
                  required
                  className="w-full border rounded-lg p-2.5 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="">-- Choose a Doctor --</option>
                  {availableDoctors.map((doc) => (
                    <option key={doc.prescriber_id} value={doc.prescriber_id}>
                      {doc.User?.name || doc.name || `Dr. (ID: ${doc.prescriber_id})`} - {doc.specialty || "General"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role *
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="Consultant">Consultant</option>
                  <option value="Primary Physician">Primary Physician</option>
                  <option value="Specialist">Specialist</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? "Adding..." : "Add to Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}