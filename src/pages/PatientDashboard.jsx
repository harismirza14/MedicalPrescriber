import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import usePatient from "../hooks/usePatient";
import useCareTeam from "../hooks/useCareTeam";
import { Table } from "../components/molecules/Table";
import Avatar from "../components/atoms/Avatar/Avatar";
import ProfileField from "../components/molecules/ProfileField/ProfileField";
import AddPatientModal from "../components/organisms/AddPatientModal/AddPatientModal";
import AddCareTeamMemberModal from "../components/organisms/AddCareTeamMemberModal/AddCareTeamMemberModal";
import ConfirmationModal from "../components/molecules/ConfirmationModal/ConfirmationModal";
import { deletePatient } from "../api/patientApi";
import { removeCareTeamMember } from "../api/careTeamApi";
import { Pencil, Trash2 } from "lucide-react";
import Medications from "./Medications";

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

export default function PatientDashboard({ patientId, role, userId }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeSection = searchParams.get("tab") || "profile";

  const { patient, loading: patientLoading, error: patientError, refetch: refetchPatient } = usePatient(patientId);
  const { careTeam, loading: careTeamLoading, error: careTeamError, refetch: refetchCareTeam } = useCareTeam(patientId);

  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);
  const [isDeletePatientOpen, setIsDeletePatientOpen] = useState(false);
  const [deletePatientError, setDeletePatientError] = useState(null);
  const [deletePatientLoading, setDeletePatientLoading] = useState(false);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [removeMemberError, setRemoveMemberError] = useState(null);
  const [removeMemberLoading, setRemoveMemberLoading] = useState(false);

  if (!patientId) {
    return <div className="p-6 text-gray-700 dark:text-gray-300">No patient selected.</div>;
  }

  const handleDeletePatient = async () => {
    setDeletePatientLoading(true);
    setDeletePatientError(null);
    try {
      await deletePatient(patientId);
      navigate("/select-patient");
    } catch (err) {
      setDeletePatientError(err.response?.data?.error || "Failed to delete patient.");
      setDeletePatientLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    setRemoveMemberLoading(true);
    setRemoveMemberError(null);
    try {
      await removeCareTeamMember(patientId, removingMember.member_id);
      setRemovingMember(null);
      refetchCareTeam();
    } catch (err) {
      setRemoveMemberError(err.response?.data?.error || "Failed to remove member.");
    } finally {
      setRemoveMemberLoading(false);
    }
  };

  const careTeamColumns = [
    { key: "name", label: "Name" },
    {
      key: "role",
      label: "Role",
      render: (value) => <RoleBadge role={value} />,
    },
    { key: "specialty", label: "Specialty" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <button
          type="button"
          onClick={() => {
            setRemoveMemberError(null);
            setRemovingMember(row);
          }}
          className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400"
          title="Remove from care team"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
              {patientLoading ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading profile...</p>
              ) : patientError ? (
                <p className="text-red-600 dark:text-red-400 text-center py-8">{patientError}</p>
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
                      onClick={() => setIsEditPatientOpen(true)}
                      className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-shrink-0 flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Profile
                    </button>
                  </div>

                  <div className="px-6 py-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <ProfileField label="Full Name" value={patient.name} />
                    <ProfileField label="Date of Birth" value={patient.dob} />
                    <ProfileField label="Gender" value={patient.gender} />
                    <ProfileField label="Phone" value={patient.phone_number} />
                    <ProfileField label="Email" value={patient.email} />
                    <ProfileField label="Insurance" value={patient.insurance} />
                    <ProfileField label="Zip Code" value={patient.zipcode} />
                    <ProfileField label="Address" value={patient.address} />
                  </div>
                </>
              )}
            </div>

            {patient && (
              <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Danger Zone</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete this patient's account.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeletePatientOpen(true)}
                  className="px-4 py-2 text-sm font-medium border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Patient
                </button>
              </div>
            )}
          </div>
        );

      case "medications":
        return <Medications role={role} userId={userId} patientId={patientId} />;

      case "careTeam":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Care Team</h2>
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(true)}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Member
              </button>
            </div>

            {careTeamError ? (
              <p className="text-red-600 dark:text-red-400 text-center py-8">{careTeamError}</p>
            ) : !careTeamLoading && (!careTeam || careTeam.members.length === 0) ? (
              <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 font-medium">No care team members yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Add a doctor or nurse to start building this patient's care team.
                </p>
              </div>
            ) : (
              <Table
                data={careTeam?.members || []}
                columns={careTeamColumns}
                loading={careTeamLoading}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <main className="min-w-0">{renderContent()}</main>

      <AddPatientModal
        isOpen={isEditPatientOpen}
        onClose={() => setIsEditPatientOpen(false)}
        initialData={patient}
        onPatientAdded={refetchPatient}
      />

      <ConfirmationModal
        isOpen={isDeletePatientOpen}
        title="Delete patient?"
        message={`This will permanently remove ${patient?.name || "this patient"}'s account and care team records. This cannot be undone.`}
        error={deletePatientError}
        loading={deletePatientLoading}
        onConfirm={handleDeletePatient}
        onCancel={() => {
          setIsDeletePatientOpen(false);
          setDeletePatientError(null);
        }}
      />

      <AddCareTeamMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        patientId={patientId}
        onMemberAdded={refetchCareTeam}
      />

      <ConfirmationModal
        isOpen={!!removingMember}
        title="Remove care team member?"
        message={`Remove ${removingMember?.name || "this member"} from the care team?`}
        error={removeMemberError}
        loading={removeMemberLoading}
        onConfirm={handleRemoveMember}
        onCancel={() => {
          setRemovingMember(null);
          setRemoveMemberError(null);
        }}
      />
    </div>
  );
}