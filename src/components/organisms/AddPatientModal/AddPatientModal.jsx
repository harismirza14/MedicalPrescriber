import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../../api/client";
import { updatePatient } from "../../../api/patientApi";

const inputCls =
  "w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function AddPatientModal({ isOpen, onClose, doctorId, initialData = null, onPatientAdded }) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  const emptyForm = {
    name: "", dob: "", gender: "", phone_number: "", email: "",
    insurance: "", address: "", zipcode: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData
          ? {
              name: initialData.name || "",
              dob: initialData.dob || "",
              gender: initialData.gender || "",
              phone_number: initialData.phone_number || "",
              email: initialData.email || "",
              insurance: initialData.insurance || "",
              address: initialData.address || "",
              zipcode: initialData.zipcode || "",
            }
          : emptyForm
      );
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

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
      if (isEditMode) {
        await updatePatient(initialData.patient_id, formData);
        onPatientAdded?.();
        onClose();
      } else {
        const response = await client.post("/patients", formData);
        onPatientAdded?.();
        onClose();
        navigate(`/medications?patientId=${response.data.patient_id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? "update" : "add"} patient.`);
      isSubmittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{isEditMode ? "Edit Patient" : "Add New Patient"}</h2>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4">{error}</div>}
          <form id="add-patient-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date of Birth *</label>
              <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={inputCls}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Zip Code</label>
              <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Insurance</label>
              <input type="text" name="insurance" value={formData.insurance} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className={inputCls} rows="2" />
            </div>
          </form>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button type="submit" form="add-patient-form" disabled={loading} className="px-4 py-2 text-sm rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Saving..." : isEditMode ? "Save Changes" : "Add Patient"}
          </button>
        </div>
      </div>
    </div>
  );
}