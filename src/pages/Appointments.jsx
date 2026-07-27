import React, { useState } from "react";
import useAppointments from "../hooks/useAppointments";
import ConfirmationModal from "../components/molecules/ConfirmationModal/ConfirmationModal";
import PatientBookingDrawer from "../components/organisms/PatientBookingDrawer/PatientBookingDrawer";
import AppointmentActionsDrawer from "../components/organisms/AppointmentActionDrawer/AppointmentActionDrawer";
import { Table } from "../components/molecules/Table";
import { formatTime } from "../utils/scheduleFormat";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { rescheduleAppointment } from "../api/appointmentApi"; //

const GRACE_MINUTES = 30;
const LIMIT = 5;

const isMissed = (appointment) => {
  if (appointment.status !== "scheduled") return false;
  const endDateTime = new Date(
    `${appointment.appointment_date}T${appointment.end_time}`,
  );
  const now = new Date();
  const diffMinutes = (now - endDateTime) / (1000 * 60);
  return diffMinutes > GRACE_MINUTES;
};

export default function Appointments({ role, id }) {
  const [page, setPage] = useState(1);

  const {
    appointments,
    loading,
    error,
    refetch,
    cancelAppointment,
    totalPages,
  } = useAppointments(role, id, { page, limit: LIMIT });

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleAppointmentData, setRescheduleAppointmentData] =
    useState(null);

  const columns = [
    { key: "appointment_date", label: "Date" },
    {
      key: "start_time",
      label: "Time",
      render: (_, row) =>
        `${formatTime(row.start_time)} – ${formatTime(row.end_time)}`,
    },
    {
      key: role === "patient" ? "doctor_name" : "patient_name",
      label: role === "patient" ? "Doctor" : "Patient",
    },
    {
      key: "chief_complaint",
      label: "Chief Complaint",
      render: (value) => value || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => {
        const missed = row.status === "missed" || isMissed(row);
        const displayStatus = missed ? "missed" : row.status;
        return (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
              displayStatus === "cancelled"
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                : displayStatus === "completed"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  : displayStatus === "missed"
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                    : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            }`}
          >
            {displayStatus}
          </span>
        );
      },
    },
  ];

  const canBook = role === "patient" || role === "doctor";

  const handleRowClick = (row) => {
    setSelectedAppointment(row);
    setIsActionDrawerOpen(true);
  };

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      toast.success("Appointment cancelled.");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel appointment.");
      throw err;
    }
  };

  const handleReschedule = (appointment) => {
    setRescheduleAppointmentData(appointment);
    setIsRescheduleOpen(true);
  };

  // ─── Actual reschedule API call ──────────────────────────────────
  const handleRescheduleConfirm = async (appointmentId, newSlot) => {
    try {
      await rescheduleAppointment(appointmentId, newSlot);
      toast.success("Appointment rescheduled successfully.");
      refetch();
      setIsRescheduleOpen(false);
      setRescheduleAppointmentData(null);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to reschedule appointment.",
      );
      throw err;
    }
  };

  return (
    <div className="w-full px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {role === "patient" ? "My Appointments" : "Appointments"}
        </h1>
        {canBook && (
          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            {role === "patient" ? "Book Appointment" : "Add Appointment"}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-red-600 dark:text-red-400 text-center py-8">
          {error}
        </p>
      ) : (
        <Table
          data={appointments}
          columns={columns}
          loading={loading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={totalPages > 1 ? setPage : undefined}
          onRowClick={handleRowClick}
        />
      )}

      {canBook && (
        <PatientBookingDrawer
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          role={role}
          userId={id}
          onAppointmentCreated={refetch}
        />
      )}

      <AppointmentActionsDrawer
        isOpen={isActionDrawerOpen}
        onClose={() => setIsActionDrawerOpen(false)}
        appointment={selectedAppointment}
        onCancel={handleCancel}
        onReschedule={handleReschedule}
        onRefetch={refetch}
      />

      {/* ─── Reschedule Drawer ────────────────────────────────────── */}
      <PatientBookingDrawer
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setRescheduleAppointmentData(null);
        }}
        role={role}
        userId={id}
        initialAppointment={rescheduleAppointmentData}
        onReschedule={handleRescheduleConfirm}
        onAppointmentCreated={() => {}}
      />
    </div>
  );
}
