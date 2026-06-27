import React, { useEffect, useState } from "react";
import { fetchCareTeam } from "../api/careTeamApi";

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
    return <div className="p-6">No patient selected.</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">Care Team</h1>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading care team...</p>
      ) : error ? (
        <p className="text-red-600 text-center py-8">{error}</p>
      ) : !careTeam || careTeam.members.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No care team members found.</p>
      ) : (
        <div className="space-y-3">
          {careTeam.members.map((member) => (
            <div
              key={member.member_id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <p className="font-semibold text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
              {member.specialty && (
                <p className="text-sm text-gray-600 mt-1">{member.specialty}</p>
              )}
              {member.phone_number && (
                <p className="text-sm text-gray-600">{member.phone_number}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}