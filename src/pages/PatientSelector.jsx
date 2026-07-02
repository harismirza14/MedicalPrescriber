import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDoctorPatients from "../hooks/useDoctorPatients";
import AddPatientModal from "../components/organisms/AddPatientModal/AddPatientModal";
import { Table } from "../components/molecules/Table";
import { Plus } from "lucide-react";

const LIMIT = 5;

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
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genderFilter]);

  const { patients, loading, refetch, totalPages } = useDoctorPatients(doctorId, {
    search: debouncedSearch,
    gender: genderFilter,
    page,
    limit: LIMIT,
  });

  const handlePatientSelect = (patient) => {
    navigate(`/patient-dashboard?patientId=${patient.patient_id}`);
  };

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Select a Patient</h1>
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
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        searchPlaceholder="Search by name, contact or insurance..."
        filters={filters}
        loading={loading}
        onRowClick={handlePatientSelect}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={totalPages > 1 ? setPage : undefined}
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