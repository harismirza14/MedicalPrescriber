import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedData } from "@/hooks/usePaginationData";
import { Table } from "@/components/molecules/Table";
import AddPatientModal from "@/components/organisms/AddPatientModal/AddPatientModal";
import { fetchDoctorPatients } from "@/api/patientApi";
import { Plus } from "lucide-react";

const LIMIT = 5;

// Helper function
const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function PatientSelector({ doctorId }) {
  const navigate = useNavigate();
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  // ─── Memoize the fetch function ──────────────────────────────────
  // fetchDoctorPatients accepts (prescriberId, { search, gender, page, limit })
  const fetchFn = useCallback(
    (params) =>
      fetchDoctorPatients(doctorId, {
        search: params.search,
        gender: params.filter, // map generic 'filter' to 'gender'
        page: params.page,
        limit: params.limit,
      }),
    [doctorId], // recreate if doctorId changes
  );

  // ─── Use the reusable pagination hook ──────────────────────────────
  const {
    data: patients,
    loading,
    search,
    setSearch,
    filter: genderFilter,
    setFilter: setGenderFilter,
    page,
    setPage,
    totalPages,
    refetch,
  } = usePaginatedData({
    fetchFn,
    initialFilter: "",
    limit: LIMIT,
  });

  // ─── Table columns ──────────────────────────────────────────────────
  const columns = [
    { key: "name", label: "Name" },
    { key: "dob", label: "Age", render: (value) => calculateAge(value) },
    { key: "phone_number", label: "Contact" },
    { key: "gender", label: "Gender" },
    { key: "insurance", label: "Insurance" },
  ];

  const filters = [
    {
      key: "gender",
      label: "All Genders",
      value: genderFilter,
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
      onChange: (e) => setGenderFilter(e.target.value),
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Select a Patient
        </h1>
        <button
          onClick={() => setIsAddPatientModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add New Patient
        </button>
      </div>

      <Table
        data={patients}
        columns={columns}
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        searchPlaceholder="Search by name, contact or insurance..."
        filters={filters}
        loading={loading}
        onRowClick={(patient) =>
          navigate(
            `/patient-dashboard?patientId=${patient.patient_id}&tab=profile`,
          )
        }
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        doctorId={doctorId}
        onPatientAdded={refetch}
      />
    </div>
  );
}
