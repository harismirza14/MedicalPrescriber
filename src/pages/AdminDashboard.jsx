import React, { useState, useEffect, useCallback } from "react";
import AddDoctorModal from "../components/organisms/AddDoctorModal/AddDoctorModal";
import ConfirmationModal from "../components/molecules/ConfirmationModal/ConfirmationModal";
import { Table } from "../components/molecules/Table";
import { fetchPrescribers, deletePrescriber } from "../api/prescriberApi";
import { Plus, Pencil, Trash2 } from "lucide-react";

const LIMIT = 10;

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deletingDoctor, setDeletingDoctor] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genderFilter]);

  const fetchDoctors = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPrescribers({ search: debouncedSearch, gender: genderFilter, page, limit: LIMIT })
      .then((res) => {
        setDoctors(res.data || []);
        setTotalPages(res.totalPages || 1);
      })
      .catch((err) => {
        console.error("Failed to load doctors:", err);
        setError("Failed to load doctors.");
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, genderFilter, page]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDelete = async () => {
    if (!deletingDoctor) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deletePrescriber(deletingDoctor.prescriber_id);
      setDeletingDoctor(null);
      fetchDoctors();
    } catch (err) {
      setDeleteError(err.response?.data?.error || "Failed to delete doctor.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: "prescriber_id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone_number", label: "Phone" },
    { key: "specialty", label: "Specialty" },
    { key: "pmdc_number", label: "PMDC" },
    { key: "education", label: "Education" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingDoctor(row);
              setShowModal(true);
            }}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
            title="Edit doctor"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteError(null);
              setDeletingDoctor(row);
            }}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400"
            title="Delete doctor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
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
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Management</h1>
        <button
          onClick={() => {
            setEditingDoctor(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add New Doctor
        </button>
      </div>

      {error ? (
        <p className="text-red-600 dark:text-red-400 text-center py-8">{error}</p>
      ) : (
        <Table
          data={doctors}
          columns={columns}
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search by name or email..."
          filters={filters}
          loading={loading}
          onRowClick={(row) => console.log("Doctor row clicked:", row.prescriber_id)}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={totalPages > 1 ? setPage : undefined}
        />
      )}

      <AddDoctorModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDoctor(null);
        }}
        onDoctorAdded={fetchDoctors}
        initialData={editingDoctor}
      />

      <ConfirmationModal
        isOpen={!!deletingDoctor}
        title="Delete doctor?"
        message={`This will permanently remove ${deletingDoctor?.name || "this doctor"}'s account. This cannot be undone.`}
        error={deleteError}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeletingDoctor(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}