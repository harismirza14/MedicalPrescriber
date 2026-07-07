import React, { useState } from "react";
import usePatient from "../hooks/usePatient";
import Avatar from "../components/atoms/Avatar/Avatar";
import ProfileField from "../components/molecules/ProfileField/ProfileField";
import AddPatientModal from "../components/organisms/AddPatientModal/AddPatientModal";
import { Pencil } from "lucide-react";

export default function PatientProfile({ patientId }) {
  const { patient, loading, error, refetch } = usePatient(patientId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!patientId) {
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
        ) : !patient ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No profile data.</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <Avatar name={patient.name} size="lg" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{patient.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{patient.gender || "N/A"}</p>
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
              <ProfileField label="Name" value={patient.name} />
              <ProfileField label="Date of Birth" value={patient.dob} />
              <ProfileField label="Gender" value={patient.gender} />
              <ProfileField label="Email" value={patient.email} />
              <ProfileField label="Phone" value={patient.phone_number} />
              <ProfileField label="Address" value={patient.address} />
              <ProfileField label="Zip Code" value={patient.zipcode} />
              <ProfileField label="Insurance" value={patient.insurance} />
            </div>
          </>
        )}
      </div>

      <AddPatientModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={patient ? { ...patient, patient_id: patientId } : null}
        onPatientAdded={refetch}
      />
    </div>
  );
}