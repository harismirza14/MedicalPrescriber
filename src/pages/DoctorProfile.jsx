import React, { useEffect, useState } from "react";
import { fetchPrescriber } from "../api/prescriberApi";

export default function DoctorProfile({ prescriberId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!prescriberId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchPrescriber(prescriberId)
      .then(setProfile)
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setError("Could not load profile.");
      })
      .finally(() => setLoading(false));
  }, [prescriberId]);

  if (!prescriberId) {
    return <div className="p-6">No profile available.</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading profile...</p>
      ) : error ? (
        <p className="text-red-600 text-center py-8">{error}</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Name</p>
            <p className="text-gray-600">{profile.name}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Email</p>
            <p className="text-gray-600">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Phone</p>
            <p className="text-gray-600">{profile.phone_number || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Specialty</p>
            <p className="text-gray-600">{profile.specialty || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">PMDC Number</p>
            <p className="text-gray-600">{profile.pmdc_number || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Education</p>
            <p className="text-gray-600">{profile.education || "N/A"}</p>
          </div>
        </div>
      )}
    </div>
  );
}