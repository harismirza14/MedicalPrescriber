import React, { useState } from "react";
import useAvailability from "../hooks/useAvailability";
import ConfirmationModal from "../components/molecules/ConfirmationModal/ConfirmationModal";
import { formatTime, DAYS_OF_WEEK, capitalize } from "../utils/scheduleFormat";
import { Plus, X, Calendar } from "lucide-react";

function AddSlotForm({ day, onAdd, onCancel, existingSlots = [] }) {
  const [startTime, setStartTime] = useState("09:00");
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endTime, setEndTime] = useState("05:00");
  const [endAmPm, setEndAmPm] = useState("PM");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const timeOptions = [];
  for (let h = 0; h < 12; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour12 = h === 0 ? 12 : h;
      const hourStr = String(hour12).padStart(2, "0");
      const minStr = String(m).padStart(2, "0");
      timeOptions.push(`${hourStr}:${minStr}`);
    }
  }

  const to24Hour = (time12, ampm) => {
    const [hour12, minute] = time12.split(":");
    let h = parseInt(hour12, 10);
    if (ampm === "AM" && h === 12) h = 0;
    if (ampm === "PM" && h !== 12) h += 12;
    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const MIN_SLOT_MINUTES = 15;
  const MAX_SLOT_MINUTES = 8 * 60;

  const validateSlot = (start24, end24) => {
    const startMin = toMinutes(start24);
    const endMin = toMinutes(end24);

    if (startMin >= endMin) {
      setError("Start time must be before end time.");
      return false;
    }

    const duration = endMin - startMin;
    if (duration < MIN_SLOT_MINUTES) {
      setError(`Slot must be at least ${MIN_SLOT_MINUTES} minutes long.`);
      return false;
    }
    if (duration > MAX_SLOT_MINUTES) {
      setError(`Slot cannot exceed ${MAX_SLOT_MINUTES / 60} hours.`);
      return false;
    }
    if (duration % 15 !== 0) {
      setError("Slot duration must be in 15‑minute increments.");
      return false;
    }

    for (const slot of existingSlots) {
      const existingStart = toMinutes(slot.start_time);
      const existingEnd = toMinutes(slot.end_time);

      if (startMin < existingEnd && endMin > existingStart) {
        setError(
          `Overlaps with existing slot (${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}).`
        );
        return false;
      }

      if (startMin < existingEnd + 30 && startMin > existingStart) {
        setError(
          `Must have at least 30 minutes gap after ${formatTime(slot.end_time)}.`
        );
        return false;
      }

      if (endMin > existingStart - 30 && endMin < existingEnd) {
        setError(
          `Must have at least 30 minutes gap before ${formatTime(slot.start_time)}.`
        );
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const start24 = to24Hour(startTime, startAmPm);
    const end24 = to24Hour(endTime, endAmPm);

    if (!validateSlot(start24, end24)) return;

    setSaving(true);
    try {
      await onAdd({ day_of_week: day, start_time: start24, end_time: end24 });
      onCancel();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add slot.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
      <div className="flex items-center gap-2 flex-wrap">
        <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          {timeOptions.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select value={startAmPm} onChange={(e) => setStartAmPm(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <option value="AM">AM</option><option value="PM">PM</option>
        </select>
        <span className="text-gray-400 dark:text-gray-500 text-sm">to</span>
        <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          {timeOptions.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select value={endAmPm} onChange={(e) => setEndAmPm(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <option value="AM">AM</option><option value="PM">PM</option>
        </select>
        <button type="submit" disabled={saving} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving..." : "Add"}
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Cancel</button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}

export default function DoctorSchedule({ prescriberId }) {
  const { slots, loading, error, addSlot, deleteSlot } = useAvailability(prescriberId);
  const [addingDay, setAddingDay] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddSlot = async (slotData) => {
    await addSlot(slotData);
    alert("Availability slot added.");
  };

  const handleDeleteSlot = async () => {
    if (!deletingSlot) return;
    setDeleteLoading(true);
    try {
      await deleteSlot(deletingSlot.id);
      alert("Slot removed.");
      setDeletingSlot(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete slot.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!prescriberId) return <div className="text-gray-700 dark:text-gray-300">No schedule available.</div>;

  return (
    <div className="w-full max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Schedule</h1>
      {error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading availability...</p>
      ) : (
        <div className="space-y-3">
          {DAYS_OF_WEEK.map((day) => {
            const daySlots = slots.filter((s) => s.day_of_week === day);
            return (
              <div key={day} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{capitalize(day)}</h3>
                  <button type="button" onClick={() => setAddingDay(addingDay === day ? null : day)} className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    <Plus className="w-3.5 h-3.5" /> Add slot
                  </button>
                </div>
                {daySlots.length === 0 && addingDay !== day && <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">No availability set.</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {daySlots.map((slot) => (
                    <span key={slot.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      <button type="button" onClick={() => setDeletingSlot(slot)} className="hover:text-red-600 dark:hover:text-red-400" aria-label="Remove slot">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {addingDay === day && <AddSlotForm day={day} onAdd={handleAddSlot} onCancel={() => setAddingDay(null)} existingSlots={daySlots} />}
              </div>
            );
          })}
        </div>
      )}
      <ConfirmationModal isOpen={!!deletingSlot} title="Remove availability slot?" message={deletingSlot ? `Remove ${formatTime(deletingSlot.start_time)} – ${formatTime(deletingSlot.end_time)} on ${capitalize(deletingSlot.day_of_week)}?` : ""} loading={deleteLoading} onConfirm={handleDeleteSlot} onCancel={() => setDeletingSlot(null)} />
    </div>
  );
}