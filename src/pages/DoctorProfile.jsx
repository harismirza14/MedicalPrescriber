import React, { useEffect, useState, useCallback } from "react";
import { fetchPrescriber } from "../api/prescriberApi";
import Avatar from "../components/atoms/Avatar/Avatar";
import ProfileField from "../components/molecules/ProfileField/ProfileField";
import AddDoctorModal from "../components/organisms/AddDoctorModal/AddDoctorModal";
import { Pencil } from "lucide-react";

export default function DoctorProfile({ prescriberId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadProfile = useCallback(() => {
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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (!prescriberId) {
    return <div className="p-6 text-gray-700 dark:text-gray-300">No profile available.</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Profile</h1>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading profile...</p>
        ) : error ? (
          <p className="text-red-600 dark:text-red-400 text-center py-8">{error}</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <Avatar name={profile.name} size="lg" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{profile.specialty || "Prescriber"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-shrink-0 flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>

            <div className="px-6 py-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <ProfileField label="Name" value={profile.name} />
              <ProfileField label="Email" value={profile.email} />
              <ProfileField label="Phone" value={profile.phone_number} />
              <ProfileField label="Specialty" value={profile.specialty} />
              <ProfileField label="PMDC Number" value={profile.pmdc_number} />
              <ProfileField label="Education" value={profile.education} />
            </div>
          </>
        )}
      </div>

      <AddDoctorModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={profile ? { ...profile, prescriber_id: prescriberId } : null}
        onDoctorAdded={loadProfile}
      />
    </div>
  );
}