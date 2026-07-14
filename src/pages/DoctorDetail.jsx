import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchPrescriber } from "../api/prescriberApi";
import { deletePrescriber } from "../api/prescriberApi";
import useDoctorPatients from "../hooks/useDoctorPatients";
import Avatar from "../components/atoms/Avatar/Avatar";
import ProfileField from "../components/molecules/ProfileField/ProfileField";
import { Table } from "../components/molecules/Table";
import AddDoctorModal from "../components/organisms/AddDoctorModal/AddDoctorModal";
import ConfirmationModal from "../components/molecules/ConfirmationModal/ConfirmationModal";
import { Pencil, Trash2 } from "lucide-react";

const LIMIT = 5;

const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

export default function DoctorDetail({ prescriberId }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);

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
        console.error("Failed to fetch doctor profile:", err);
        setError("Could not load doctor profile.");
      })
      .finally(() => setLoading(false));
  }, [prescriberId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const { patients, loading: patientsLoading, totalPages } = useDoctorPatients(prescriberId, {
    page,
    limit: LIMIT,
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deletePrescriber(prescriberId);
      navigate("/admin");
    } catch (err) {
      setDeleteError(err.response?.data?.error || "Failed to delete doctor.");
      setDeleteLoading(false);
    }
  };

  if (!prescriberId) {
    return <div className="text-gray-700 dark:text-gray-300">No doctor selected.</div>;
  }

  const patientColumns = [
    { key: "name", label: "Name" },
    { key: "dob", label: "Age", render: (value) => calculateAge(value) },
    { key: "phone_number", label: "Contact" },
    { key: "gender", label: "Gender" },
    { key: "insurance", label: "Insurance" },
  ];

  // ─── Handle patient row click ──────────────────────────────────────
  const handlePatientClick = (patient) => {
    navigate(`/patient-dashboard?patientId=${patient.patient_id}&tab=profile`);
  };

  return (
    <div className="w-full max-w-4xl">
      {/* ─── Tab content ────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-4">
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

          {profile && (
            <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Danger Zone</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete this doctor's account.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="px-4 py-2 text-sm font-medium border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Doctor
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "patients" && (
        <Table
          data={patients}
          columns={patientColumns}
          loading={patientsLoading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={totalPages > 1 ? setPage : undefined}
          onRowClick={handlePatientClick}   // 👈 Click patient → navigate to dashboard
        />
      )}

      <AddDoctorModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={profile ? { ...profile, prescriber_id: prescriberId } : null}
        onDoctorAdded={loadProfile}
      />

      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Delete doctor?"
        message={`This will permanently remove ${profile?.name || "this doctor"}'s account. This cannot be undone.`}
        error={deleteError}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteError(null);
        }}
      />
    </div>
  );
}