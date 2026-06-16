import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDoctorPatients from "../hooks/useDoctorPatients";

export default function PatientSelectorPage({ doctorId }) {
  const { patients, loading } = useDoctorPatients(doctorId);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const navigate = useNavigate();

  // Auto-select the first patient once the list loads.
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].patient_id);
    }
  }, [patients, selectedPatientId]);

  const handleView = () => {
    if (selectedPatientId) {
      navigate(`/medications?patientId=${selectedPatientId}`);
    }
  };

  if (loading) return <div className="p-6">Loading patients...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Select a Patient</h1>
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Select
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Patient ID
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    DOB
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Insurance
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient.patient_id}
                    className={`border-t border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      selectedPatientId === patient.patient_id
                        ? "bg-blue-50"
                        : ""
                    }`}
                    onClick={() => setSelectedPatientId(patient.patient_id)}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="radio"
                        name="selectedPatient"
                        checked={selectedPatientId === patient.patient_id}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">{patient.patient_id}</td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {patient.name}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {patient.dob || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {patient.insurance || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleView}
              disabled={!selectedPatientId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              OK
            </button>
          </div>
        </>
      )}
    </div>
  );
}
