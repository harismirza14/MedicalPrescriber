import React, { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";

export default function AddPatientPage() {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    phone_number: "",
    email: "",
    insurance: "",
    address: "",
    zipcode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isSubmittingRef = useRef(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const response = await client.post("/patients", formData);
      navigate(`/medications?patientId=${response.data.patient_id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add patient.");
      isSubmittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Patient</h1>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Date of Birth *</label>
          <input
            type="date"
            name="dob"
            required
            value={formData.dob}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Zip Code</label>
          <input
            type="text"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Insurance</label>
          <input
            type="text"
            name="insurance"
            value={formData.insurance}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows="2"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Patient"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/select-patient?doctorId=${doctorId}`)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}