import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedData } from "@/hooks/usePaginationData";
import { fetchPrescribers, deletePrescriber } from "@/api/prescriberApi";
import { Table } from "@/components/molecules/Table";
import AddDoctorModal from "@/components/organisms/AddDoctorModal/AddDoctorModal";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import { Plus, Pencil, Trash2 } from "lucide-react";

const LIMIT = 5;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deletingDoctor, setDeletingDoctor] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Memoize the fetch function ──────────────────────────────────
  const fetchFn = useCallback(
    (params) =>
      fetchPrescribers({
        search: params.search,
        gender: params.filter,
        page: params.page,
        limit: params.limit,
      }),
    [] // fetchPrescribers is stable; no dependencies
  );

  // ─── Use the reusable pagination hook ──────────────────────────────
  const {
    data: doctors,
    loading,
    error,
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

  // ─── Delete handler ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingDoctor) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deletePrescriber(deletingDoctor.prescriber_id);
      setDeletingDoctor(null);
      refetch();
    } catch (err) {
      setDeleteError(err.response?.data?.error || "Failed to delete doctor.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Table columns ──────────────────────────────────────────────────
  const columns = [
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
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingDoctor(row);
              setDeleteError(null);
            }}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-red-600"
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

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Doctor Management
        </h1>
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
        <p className="text-red-600 text-center py-8">{error}</p>
      ) : (
        <Table
          data={doctors}
          columns={columns}
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search by name or email..."
          filters={filters}
          loading={loading}
          onRowClick={(row) => navigate(`/admin/doctor/${row.prescriber_id}`)}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <AddDoctorModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDoctor(null);
        }}
        onDoctorAdded={refetch}
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