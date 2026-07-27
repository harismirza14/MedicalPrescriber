import React, { useState } from "react";
import {
  X,
  Calendar,
  Edit,
  RefreshCw,
  Trash2,
  User,
  Stethoscope,
} from "lucide-react";
import Button from "../../atoms/Button/Button";
import { formatTime } from "../../../utils/scheduleFormat";
import toast from "react-hot-toast";
import { updateChiefComplaint } from "../../../api/appointmentApi";
import ConfirmationModal from "../../molecules/ConfirmationModal/ConfirmationModal";

export default function AppointmentActionDrawer({
  isOpen,
  onClose,
  appointment,
  onCancel,
  onReschedule,
  onRefetch,
}) {
  const [editingComplaint, setEditingComplaint] = useState(false);
  const [newComplaint, setNewComplaint] = useState(
    appointment?.chief_complaint || "",
  );
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleUpdateComplaint = async () => {
    setUpdating(true);
    try {
      await updateChiefComplaint(appointment.id, newComplaint);
      toast.success("Chief complaint updated.");
      onRefetch?.();
      setEditingComplaint(false);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to update chief complaint.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleReschedule = () => {
    onReschedule?.(appointment);
    onClose();
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(appointment.id);
      toast.success("Appointment cancelled.");
      setShowCancelModal(false);
      onClose();
    } catch (err) {
      setShowCancelModal(false);
    } finally {
      setCancelling(false);
    }
  };

  const statusColors = {
    scheduled:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    missed: "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300",
    completed: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Appointment Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {appointment.appointment_date} ·{" "}
              {formatTime(appointment.start_time)} –{" "}
              {formatTime(appointment.end_time)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Body ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Stethoscope className="w-4 h-4" />
                <span>Doctor</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {appointment.doctor_name}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>Patient</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {appointment.patient_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Status:
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[appointment.status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {appointment.status}
            </span>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chief Complaint
                </p>
                {editingComplaint ? (
                  <div className="mt-2">
                    <textarea
                      rows={3}
                      value={newComplaint}
                      onChange={(e) => setNewComplaint(e.target.value)}
                      placeholder="Enter chief complaint..."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="solid"
                        onClick={handleUpdateComplaint}
                        disabled={updating}
                      >
                        {updating ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setEditingComplaint(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-start gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                      {appointment.chief_complaint ||
                        "No chief complaint provided."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setNewComplaint(appointment.chief_complaint || "");
                        setEditingComplaint(true);
                      }}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer Actions ────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-2.5">
          {appointment.status === "scheduled" && (
            <>
              <button
                onClick={handleReschedule}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reschedule
              </button>
              <button
                onClick={handleCancel}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Cancel Appointment
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showCancelModal}
        title="Cancel appointment?"
        message="This will permanently cancel the appointment. This action cannot be undone."
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </>
  );
}