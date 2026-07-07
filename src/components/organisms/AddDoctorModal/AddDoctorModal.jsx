import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import client from "../../../api/client";
import { updatePrescriber } from "../../../api/prescriberApi";
import { useTheme } from "@/context/Theme";

const inputCls =
  "w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const SPECIALTY_OPTIONS = [
  "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Dermatology",
  "Gastroenterology", "Endocrinology", "Pulmonology", "Nephrology", "Oncology",
  "Psychiatry", "Rheumatology", "Urology", "Ophthalmology", "Otolaryngology",
  "Gynecology", "General Surgery", "Anesthesiology", "Radiology", "Emergency Medicine",
  "Internal Medicine", "Family Medicine",
].map((s) => ({ value: s, label: s }));

// react-select renders via inline JS styles, not Tailwind classes, so dark mode
// has to be applied explicitly here rather than through dark: utility classes.
function getSelectStyles(theme) {
  const isDark = theme === "dark";
  return {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? "#1f2937" : "#ffffff", // gray-800 / white
      borderColor: state.isFocused
        ? "#3b82f6"
        : isDark ? "#4b5563" : "#d1d5db", // gray-600 / gray-300
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      minHeight: "40px",
      "&:hover": { borderColor: isDark ? "#4b5563" : "#d1d5db" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      zIndex: 20,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
        ? isDark ? "#374151" : "#f3f4f6"
        : "transparent",
      color: state.isSelected ? "#ffffff" : isDark ? "#f3f4f6" : "#111827",
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? "#1e3a8a" : "#dbeafe", // blue-900 / blue-100
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? "#bfdbfe" : "#1e40af", // blue-200 / blue-800
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? "#bfdbfe" : "#1e40af",
      "&:hover": { backgroundColor: isDark ? "#1e40af" : "#bfdbfe", color: isDark ? "#fff" : "#1e40af" },
    }),
    input: (base) => ({ ...base, color: isDark ? "#f3f4f6" : "#111827" }),
    placeholder: (base) => ({ ...base, color: isDark ? "#6b7280" : "#9ca3af" }),
    singleValue: (base) => ({ ...base, color: isDark ? "#f3f4f6" : "#111827" }),
  };
}

// "Cardiology, Neurology" -> [{value: 'Cardiology', label: 'Cardiology'}, ...]
// Also tolerates commas without a following space, and drops empty/unknown fragments.
function specialtyStringToOptions(str) {
  if (!str) return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ value: s, label: s }));
}

export default function AddDoctorModal({ isOpen, onClose, onDoctorAdded, initialData = null }) {
  const isEditMode = !!initialData;
  const { theme } = useTheme();

  const emptyForm = {
    name: "", email: "", phone_number: "", dob: "", gender: "",
    address: "", specialty: [], pmdc_number: "", education: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData
          ? {
              name: initialData.name || "",
              email: initialData.email || "",
              phone_number: initialData.phone_number || "",
              dob: initialData.dob || "",
              gender: initialData.gender || "",
              address: initialData.address || "",
              specialty: specialtyStringToOptions(initialData.specialty),
              pmdc_number: initialData.pmdc_number || "",
              education: initialData.education || "",
            }
          : emptyForm
      );
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecialtyChange = (selectedOptions) => {
    setFormData((prev) => ({ ...prev, specialty: selectedOptions || [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      specialty: formData.specialty.map((opt) => opt.value).join(", "),
    };

    try {
      if (isEditMode) {
        await updatePrescriber(initialData.prescriber_id, payload);
        onDoctorAdded?.();
        onClose();
      } else {
        await client.post("/prescribers", payload);
        setSuccess(true);
        onDoctorAdded?.();
        setFormData(emptyForm);
        // Brief delay so the success banner is actually visible before the modal disappears,
        // rather than closing instantly and flashing the message for a split second.
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? "update" : "add"} doctor.`);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{isEditMode ? "Edit Doctor" : "Add New Doctor"}</h2>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4">{error}</div>}
          {success && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded mb-4">
              Doctor added successfully. A temporary password has been emailed to them.
            </div>
          )}
          <form id="add-doctor-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputCls} disabled={success} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputCls} disabled={success} />
            </div>
            <div>
              <label className={labelCls}>Phone Number *</label>
              <input type="text" name="phone_number" required value={formData.phone_number} onChange={handleChange} className={inputCls} disabled={success} />
            </div>
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputCls} disabled={success} />
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={inputCls} disabled={success}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className={inputCls} rows="2" disabled={success} />
            </div>
            <div>
              <label className={labelCls}>Specialty</label>
              <Select
                isMulti
                options={SPECIALTY_OPTIONS}
                value={formData.specialty}
                onChange={handleSpecialtyChange}
                placeholder="Select one or more specialties..."
                styles={getSelectStyles(theme)}
                classNamePrefix="specialty-select"
                isDisabled={success}
              />
            </div>
            <div>
              <label className={labelCls}>PMDC Number</label>
              <input type="text" name="pmdc_number" value={formData.pmdc_number} onChange={handleChange} className={inputCls} disabled={success} />
            </div>
            <div>
              <label className={labelCls}>Education</label>
              <textarea name="education" value={formData.education} onChange={handleChange} className={inputCls} rows="2" disabled={success} />
            </div>
          </form>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
            {isEditMode ? "Cancel" : "Close"}
          </button>
          <button type="submit" form="add-doctor-form" disabled={loading || success} className="px-4 py-2 text-sm rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Saving..." : success ? "Saved" : isEditMode ? "Save Changes" : "Add Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
}