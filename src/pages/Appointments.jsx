import React, { useState } from "react";
import useAppointments from "../hooks/useAppointments";
import ConfirmationModal from "../components/molecules/ConfirmationModal/ConfirmationModal";
import PatientBookingDrawer from "../components/organisms/PatientBookingDrawer/PatientBookingDrawer";
import { Table } from "../components/molecules/Table";
import { formatTime } from "../utils/scheduleFormat";
import { Plus } from "lucide-react";

export default function Appointments({ role, id }) {
  const { appointments, loading, error, refetch, cancelAppointment } = useAppointments(role, id);
  const [cancelling, setCancelling] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleCancel = async () => {
    if (!cancelling) return;
    setCancelLoading(true);
    try {
      await cancelAppointment(cancelling.id);
      alert("Appointment cancelled.");
      setCancelling(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel appointment.");
    } finally {
      setCancelLoading(false);
    }
  };

  const columns = [
    { key: "appointment_date", label: "Date" },
    {
      key: "start_time",
      label: "Time",
      render: (_, row) => `${formatTime(row.start_time)} – ${formatTime(row.end_time)}`,
    },
    {
      key: role === "patient" ? "doctor_name" : "patient_name",
      label: role === "patient" ? "Doctor" : "Patient",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
            value === "cancelled"
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              : value === "completed"
              ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) =>
        row.status === "scheduled" ? (
          <button
            type="button"
            onClick={() => setCancelling(row)}
            className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            Cancel
          </button>
        ) : null,
    },
  ];

  return (
    <div className="w-full max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
        {role === "patient" && (
          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Book Appointment
          </button>
        )}
      </div>

      {error ? (
        <p className="text-red-600 dark:text-red-400 text-center py-8">{error}</p>
      ) : (
        <Table data={appointments} columns={columns} loading={loading} />
      )}

      {role === "patient" && (
        <PatientBookingDrawer
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          patientId={id}
          onAppointmentCreated={refetch}
        />
      )}

      <ConfirmationModal
        isOpen={!!cancelling}
        title="Cancel appointment?"
        message="This will cancel the appointment."
        loading={cancelLoading}
        onConfirm={handleCancel}
        onCancel={() => setCancelling(null)}
      />
    </div>
  );
}