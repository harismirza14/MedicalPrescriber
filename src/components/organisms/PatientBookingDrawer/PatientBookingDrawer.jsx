import React, { useState, useEffect, useMemo } from "react";
import useCareTeam from "../../../hooks/useCareTeam";
import { fetchFreeSlots } from "../../../api/availabilityApi";
import { createAppointment } from "../../../api/appointmentApi";
import Avatar from "../../atoms/Avatar/Avatar";
import Button from "../../atoms/Button/Button";
import StepIndicator from "../../molecules/StepIndicator/StepIndicator";
import { formatTime } from "../../../utils/scheduleFormat";
import { X, Calendar, CheckCircle, AlertCircle } from "lucide-react";

const today = new Date().toISOString().split("T")[0];
const DURATION_OPTIONS = [15, 30, 45, 60];
const STEP_LABELS = ["Doctor", "Date & Duration", "Time", "Review"];

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function toTimeString(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function generateStartTimes(freeSlots, durationMinutes) {
  const results = [];
  for (const slot of freeSlots) {
    let start = toMinutes(slot.start_time);
    const end = toMinutes(slot.end_time);
    while (start + durationMinutes <= end) {
      results.push({
        start_time: toTimeString(start),
        end_time: toTimeString(start + durationMinutes),
      });
      start += durationMinutes;
    }
  }
  return results;
}

export default function PatientBookingDrawer({ isOpen, onClose, patientId, onAppointmentCreated }) {
  const { careTeam } = useCareTeam(patientId);
  const doctors = careTeam?.members || [];

  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [freeSlots, setFreeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDoctor(null);
      setSelectedDate(today);
      setSelectedDuration(null);
      setFreeSlots([]);
      setSelectedSlot(null);
    }
  }, [isOpen]);

  // Fetch free slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setSlotsLoading(true);
      setSelectedSlot(null);
      fetchFreeSlots(selectedDoctor.prescriber_id, selectedDate)
        .then(setFreeSlots)
        .catch(() => setFreeSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [selectedDoctor, selectedDate]);

  const availabilityPerDuration = useMemo(() => {
    const result = {};
    for (const dur of DURATION_OPTIONS) {
      const starts = generateStartTimes(freeSlots, dur);
      result[dur] = starts.length > 0;
    }
    return result;
  }, [freeSlots]);

  const bookableStartTimes = useMemo(() => {
    if (!selectedDuration) return [];
    return generateStartTimes(freeSlots, selectedDuration);
  }, [freeSlots, selectedDuration]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (confirming) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setConfirming(true);
    try {
      const payload = {
        patient_id: patientId,
        prescriber_id: selectedDoctor.prescriber_id,
        appointment_date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
      };
      await createAppointment(payload);
      alert("Appointment booked successfully.");
      onAppointmentCreated?.();
      onClose();
    } catch (err) {
      console.error("❌ Booking error:", err);
      alert(err.response?.data?.error || "Failed to book appointment.");
    } finally {
      setConfirming(false);
    }
  };

  const renderAvailabilityStatus = () => {
    if (slotsLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Checking availability...
        </div>
      );
    }

    if (freeSlots.length === 0) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mt-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>No slots available on this date.</span>
        </div>
      );
    }

    const formattedRanges = freeSlots
      .map((slot) => `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`)
      .join(", ");

    return (
      <div className="flex flex-col gap-1 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Slots available on this date:</span>
        </div>
        <div className="pl-6 text-xs text-gray-700 dark:text-gray-300">
          {formattedRanges}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={handleClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Book Appointment</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {{
                  1: "Step 1 - select doctor",
                  2: "Step 2 - date & duration",
                  3: "Step 3 - select time",
                  4: "Step 4 - review",
                }[step]}
              </p>
              <StepIndicator currentStep={step} steps={STEP_LABELS} />
            </div>
            <button
              onClick={handleClose}
              disabled={confirming}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEP 1: Select Doctor */}
        {step === 1 && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {doctors.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                  No doctors on your care team yet.
                </p>
              )}
              {doctors.map((doc) => (
                <button
                  key={doc.prescriber_id}
                  type="button"
                  onClick={() => setSelectedDoctor(doc)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    selectedDoctor?.prescriber_id === doc.prescriber_id
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Avatar name={doc.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{doc.specialty || "N/A"}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-6 pt-4 pb-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
              <Button onClick={onClose} variant="ghost">Cancel</Button>
              <Button onClick={() => setStep(2)} disabled={!selectedDoctor} variant="solid">Continue</Button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-9 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {renderAvailabilityStatus()}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Consultation time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATION_OPTIONS.map((mins) => {
                    const isAvailable = availabilityPerDuration[mins];
                    const isSelected = selectedDuration === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => isAvailable && setSelectedDuration(mins)}
                        disabled={!isAvailable}
                        className={`px-2 py-2 rounded-md text-sm font-medium border transition-colors ${
                          isSelected
                            ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : isAvailable
                              ? "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                              : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {mins} min
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-6 pt-4 pb-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
              <Button onClick={() => setStep(1)} variant="ghost">Back</Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedDuration || !availabilityPerDuration[selectedDuration]}
                variant="solid"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Available times ({selectedDuration} min)
              </p>
              {slotsLoading ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Loading slots...</p>
              ) : bookableStartTimes.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6 border border-dashed dark:border-gray-700 rounded-lg">
                  No available {selectedDuration}-minute slots for this date.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {bookableStartTimes.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                        selectedSlot === slot
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {formatTime(slot.start_time)}  {/* Only start time */}
                    </button>
                  ))}
                </div>
              )}
              {!slotsLoading && selectedSlot && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-3 text-center">
                  ✓ Selected: {formatTime(selectedSlot.start_time)}  {/* Only start time */}
                </p>
              )}
            </div>
            <div className="px-6 pt-4 pb-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
              <Button onClick={() => setStep(2)} variant="ghost">Back</Button>
              <Button onClick={() => setStep(4)} disabled={!selectedSlot} variant="solid">Continue</Button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="border border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedDoctor?.name} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedDoctor?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedDoctor?.specialty}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">Date:</span> {selectedDate}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">Duration:</span> {selectedDuration} minutes
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">Time:</span>{" "}
                    {selectedSlot ? formatTime(selectedSlot.start_time) : "—"}  {/* Only start time */}
                  </p>
                </div>
                {!selectedSlot && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    No available slot found for this combination.
                  </p>
                )}
              </div>
            </div>
            <div className="px-6 pt-4 pb-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
              <Button onClick={() => setStep(3)} disabled={confirming} variant="ghost">Back</Button>
              <Button onClick={handleConfirm} disabled={confirming || !selectedSlot} variant="solid">
                {confirming ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}