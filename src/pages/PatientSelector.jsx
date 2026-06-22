import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useDoctorPatients from "../hooks/useDoctorPatients";

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
  const { patients, loading, refetch } = useDoctorPatients(doctorId);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const navigate = useNavigate();

  const filteredPatients = useMemo(() => {
    let result = patients;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.patient_id?.toLowerCase().includes(term) ||
          p.patient
      );
    }
    if (genderFilter !== "all") {
      result = result.filter(
        (p) => p.gender?.toLowerCase() === genderFilter.toLowerCase()
      );
    }
    return result;
  }, [patients, searchTerm, genderFilter]);

  const handlePatientSelect = (patient) => {
    setSelectedPatientId(patient.patient_id);
    navigate(`/medications?patientId=${patient.patient_id}`);
  };

  const handleAddPatient = () => {
    navigate(`/add-patient?doctorId=${doctorId}`);
  };

  if (loading) return <div className="p-6">Loading patients...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Select a Patient</h1>
        <button
         onClick={() => navigate(`/add-patient?doctorId=${doctorId}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Add New Patient
        </button>
      </div>

      {/* Filters */}
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

      {filteredPatients.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No patients match the current filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Patient ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Age
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Contact
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Gender
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Insurance
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.patient_id}
                  className={`border-t border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedPatientId === patient.patient_id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <td className="px-4 py-2 text-sm">{patient.patient_id}</td>
                  <td className="px-4 py-2 text-sm font-medium">
                    {patient.name}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {calculateAge(patient.dob)}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {patient.phone_number || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {patient.gender || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {patient.insurance || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}