import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDoctorPatients from "../hooks/useDoctorPatients";
import AddPatientModal from "../components/organisms/AddPatientModal/AddPatientModal";
import { Plus } from "lucide-react";

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
  const [genderFilter, setGenderFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { patients, loading } = useDoctorPatients(doctorId, {
    search: debouncedSearch,
    gender: genderFilter,
  });

  const handlePatientSelect = (patient) => {
    navigate(`/medications?patientId=${patient.patient_id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Select a Patient</h1>
        <button
          onClick={() => setIsAddPatientModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add New Patient
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading patients...</p>
      ) : patients.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No patients match.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Patient ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Age</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Contact</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Gender</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Insurance</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr
                  key={patient.patient_id}
                  className="border-t border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <td className="px-4 py-2 text-sm">{patient.patient_id}</td>
                  <td className="px-4 py-2 text-sm font-medium">{patient.name}</td>
                  <td className="px-4 py-2 text-sm">{calculateAge(patient.dob)}</td>
                  <td className="px-4 py-2 text-sm">{patient.phone_number || "N/A"}</td>
                  <td className="px-4 py-2 text-sm">{patient.gender || "N/A"}</td>
                  <td className="px-4 py-2 text-sm">{patient.insurance || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        doctorId={doctorId}
      />
    </div>
  );
}