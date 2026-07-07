import React, { useEffect, useState } from "react";
import { fetchCareTeam } from "../api/careTeamApi";
import Avatar from "../components/atoms/Avatar/Avatar";
import { Stethoscope, Phone, Mail, Users } from "lucide-react";

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

export default function CareTeam({ patientId }) {
  const [careTeam, setCareTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchCareTeam(patientId)
      .then(setCareTeam)
      .catch((err) => {
        console.error("Failed to fetch care team:", err);
        setError("Could not load care team.");
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  if (!patientId) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No patient selected.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Care Team</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading care team...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      ) : !careTeam || careTeam.members.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-12 text-center">
          <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No care team members yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Your healthcare provider will add team members here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {careTeam.members.map((member) => (
            <div
              key={member.member_id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}