import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddDoctorModal from '../components/organisms/AddDoctorModal/AddDoctorModal';
import client from '../api/client'; // or use a dedicated prescriberApi

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchDoctors = () => {
    setLoading(true);
    client.get('/prescribers')
      .then(res => {
        setDoctors(res.data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load doctors.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDoctorAdded = () => {
    fetchDoctors(); // refresh list after adding
  };

  if (loading) return <div className="p-6">Loading doctors...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Doctor Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          + Add New Doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No doctors found. Add your first doctor!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Phone</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Specialty</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">PMDC</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Education</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.prescriber_id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{doc.prescriber_id}</td>
                  <td className="px-4 py-2 text-sm font-medium">{doc.name}</td>
                  <td className="px-4 py-2 text-sm">{doc.email}</td>
                  <td className="px-4 py-2 text-sm">{doc.phone_number || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm">{doc.specialty || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm">{doc.pmdc_number || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm">{doc.education || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddDoctorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDoctorAdded={handleDoctorAdded}
      />
    </div>
  );
}