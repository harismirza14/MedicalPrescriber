import React, { useState, useEffect, useMemo, useCallback } from "react";
import useCareTeam from "../../../hooks/useCareTeam";
import useDoctorPatients from "../../../hooks/useDoctorPatients";
import { fetchFreeSlots } from "../../../api/availabilityApi";
import { createAppointment } from "../../../api/appointmentApi";
import { fetchPrescribers } from "../../../api/prescriberApi";
import Avatar from "../../atoms/Avatar/Avatar";
import Button from "../../atoms/Button/Button";
import StepIndicator from "../../molecules/StepIndicator/StepIndicator";
import { formatTime } from "../../../utils/scheduleFormat";
import { X, Calendar, CheckCircle, AlertCircle, Search } from "lucide-react";
import toast from "react-hot-toast";

const Buffer_Minutes = 0;
const today = new Date().toISOString().split("T")[0];
const DURATION_OPTIONS = [15, 30, 45, 60];
const SEARCH_DEBOUNCE_MS = 300;

const STEP_LABELS = {
  doctor: "Doctor",
  patient: "Patient",
  duration: "Date & Duration",
  time: "Time",
  review: "Review",
};

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

const isFutureSlot = (slot, date) => {
  const slotDateTime = new Date(`${date}T${slot.start_time}`);
  const now = new Date();
  const bufferedNow = new Date(now.getTime() + Buffer_Minutes * 60000);
  return slotDateTime >= bufferedNow;
};

export default function PatientBookingDrawer({
  isOpen,
  onClose,
  role,
  userId,
  preSelectedDoctorId = null,
  preSelectedPatientId = null,
  preSelectedDoctorName = "Selected doctor",
  preSelectedDoctorSpecialty = "",
  preSelectedPatientName = "Selected patient",
  onAppointmentCreated,
  initialAppointment = null,
  onReschedule = null,
}) {
  const steps = useMemo(() => {
    const arr = [];
    if (!preSelectedDoctorId && !initialAppointment) arr.push("doctor");
    if (role !== "patient" && !preSelectedPatientId && !initialAppointment)
      arr.push("patient");
    arr.push("duration", "time", "review");
    return arr;
  }, [role, preSelectedDoctorId, preSelectedPatientId, initialAppointment]);

  const [step, setStep] = useState(0);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [freeSlots, setFreeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorResults, setDoctorResults] = useState([]);
  const [doctorSearchLoading, setDoctorSearchLoading] = useState(false);

  const [patientSearch, setPatientSearch] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");

  const effectiveDoctorId =
    preSelectedDoctorId ??
    selectedDoctor?.prescriber_id ??
    initialAppointment?.prescriber_id ??
    null;
  const effectiveDoctorName = preSelectedDoctorId
    ? preSelectedDoctorName
    : (selectedDoctor?.name ?? initialAppointment?.doctor_name ?? "Doctor");
  const effectiveDoctorSpecialty = preSelectedDoctorId
    ? preSelectedDoctorSpecialty
    : (selectedDoctor?.specialty ?? "");

  const effectivePatientId =
    preSelectedPatientId ??
    (role === "patient"
      ? userId
      : (selectedPatient?.patient_id ??
        selectedPatient?.id ??
        initialAppointment?.patient_id ??
        null));
  const effectivePatientName = preSelectedPatientId
    ? preSelectedPatientName
    : role === "patient"
      ? null
      : (selectedPatient?.name ??
        initialAppointment?.patient_name ??
        "Patient");

  const careTeamPatientId = role === "patient" ? userId : null;
  const { careTeam } = useCareTeam(careTeamPatientId);
  const careTeamDoctors = careTeam?.members || [];
  const { patients: doctorPatients, loading: doctorPatientsLoading } =
    useDoctorPatients(
      role !== "patient" && !preSelectedPatientId && !initialAppointment
        ? effectiveDoctorId
        : null,
      { search: patientSearch, limit: 8 },
    );

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setSelectedDate(today);
    setSelectedDuration(null);
    setFreeSlots([]);
    setSelectedSlot(null);
    setDoctorSearch("");
    setDoctorResults([]);
    setPatientSearch("");
    setSelectedPatient(null);
    setChiefComplaint("");

    if (initialAppointment) {
      // Pre‑fill for reschedule
      setSelectedDoctor({
        prescriber_id: initialAppointment.prescriber_id,
        name: initialAppointment.doctor_name || "Doctor",
        specialty: initialAppointment.doctor_specialty || "",
      });
      setSelectedPatient({
        patient_id: initialAppointment.patient_id,
        name: initialAppointment.patient_name || "Patient",
      });
      setSelectedDate(initialAppointment.appointment_date);
      const dur =
        toMinutes(initialAppointment.end_time) -
        toMinutes(initialAppointment.start_time);
      const matched = DURATION_OPTIONS.find((d) => d === dur);
      if (matched) setSelectedDuration(matched);
      setChiefComplaint(initialAppointment.chief_complaint || "");
    } else if (preSelectedDoctorId) {
      setSelectedDoctor(null);
    } else if (role === "doctor") {
      setSelectedDoctor({ prescriber_id: userId, name: "You", specialty: "" });
    } else {
      setSelectedDoctor(null);
    }
  }, [isOpen, preSelectedDoctorId, role, userId, initialAppointment]);

  useEffect(() => {
    if (!isOpen || !steps.includes("doctor") || initialAppointment) return;
    setDoctorSearchLoading(true);
    const handle = setTimeout(() => {
      fetchPrescribers({ search: doctorSearch, limit: 8 })
        .then((res) => setDoctorResults(res?.data || []))
        .catch(() => setDoctorResults([]))
        .finally(() => setDoctorSearchLoading(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [isOpen, steps, doctorSearch, initialAppointment]);

  useEffect(() => {
    if (effectiveDoctorId && selectedDate) {
      setSlotsLoading(true);
      setSelectedSlot(null);
      fetchFreeSlots(effectiveDoctorId, selectedDate)
        .then(setFreeSlots)
        .catch(() => setFreeSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [effectiveDoctorId, selectedDate]);

  const availabilityPerDuration = useMemo(() => {
    const result = {};
    for (const dur of DURATION_OPTIONS) {
      const starts = generateStartTimes(freeSlots, dur);
      const futureStarts = starts.filter((slot) =>
        isFutureSlot(slot, selectedDate),
      );
      result[dur] = futureStarts.length > 0;
    }
    return result;
  }, [freeSlots, selectedDate]);

  const bookableStartTimes = useMemo(() => {
    if (!selectedDuration) return [];
    const allTimes = generateStartTimes(freeSlots, selectedDuration);
    return allTimes.filter((slot) => isFutureSlot(slot, selectedDate));
  }, [freeSlots, selectedDuration, selectedDate]);

  if (!isOpen) return null;

  const stepKey = steps[step];
  const isFirstStep = step === 0;

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleClose = () => {
    if (confirming) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !effectiveDoctorId || !effectivePatientId) return;
    setConfirming(true);
    try {
      if (initialAppointment && onReschedule) {
        await onReschedule(initialAppointment.id, {
          appointment_date: selectedDate,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
        });
        toast.success("Appointment rescheduled successfully.");
      } else {
        const payload = {
          patient_id: effectivePatientId,
          prescriber_id: effectiveDoctorId,
          appointment_date: selectedDate,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          chief_complaint: chiefComplaint || null,
        };
        await createAppointment(payload);
        toast.success("Appointment booked successfully.");
      }
      onAppointmentCreated?.();
      onClose();
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.error || "Failed to complete action.");
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
      .map(
        (slot) =>
          `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`,
      )
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

  const renderDoctorStep = () => {
    if (role !== "patient") {
      const results = doctorResults;
      return (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-6 pt-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Search doctors by name..."
                className="w-full pl-9 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {doctorSearchLoading ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                Searching...
              </p>
            ) : results.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                No doctors found.
              </p>
            ) : (
              results.map((doc) => (
                <button
                  key={doc.prescriber_id}
                  type="button"
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setSelectedPatient(null);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    selectedDoctor?.prescriber_id === doc.prescriber_id
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Avatar
                    name={doc.name}
                    src={doc?.profile_picture}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.specialty || "N/A"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="px-6 pt-4 pb-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button onClick={goNext} disabled={!selectedDoctor} variant="solid">
              Continue
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {careTeamDoctors.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No doctors on your care team yet.
            </p>
          )}
          {careTeamDoctors.map((doc) => (
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
              <Avatar name={doc.name} src={doc?.profile_picture} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {doc.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {doc.specialty || "N/A"}
                </p>
              </div>
            </button>
          ))}
        </div>
        <div className="px-6 pt-4 pb-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={goNext} disabled={!selectedDoctor} variant="solid">
            Continue
          </Button>
        </div>
      </div>
    );
  };

  const renderPatientStep = () => (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            placeholder={`Search ${effectiveDoctorName || "this doctor"}'s patients...`}
            className="w-full pl-9 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {doctorPatientsLoading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            Loading patients...
          </p>
        ) : doctorPatients.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            No patients found for this doctor.
          </p>
        ) : (
          doctorPatients.map((pat) => {
            const id = pat.patient_id ?? pat.id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedPatient(pat)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  (selectedPatient?.patient_id ?? selectedPatient?.id) === id
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Avatar name={pat.name} src={pat?.profile_picture} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {pat.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {pat.gender || "N/A"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
      <div className="px-6 pt-4 pb-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
        <Button onClick={goBack} variant="ghost">
          Back
        </Button>
        <Button onClick={goNext} disabled={!selectedPatient} variant="solid">
          Continue
        </Button>
      </div>
    </div>
  );

  const renderDurationStep = () => (
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
        {isFirstStep ? (
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
        ) : (
          <Button onClick={goBack} variant="ghost">
            Back
          </Button>
        )}
        <Button
          onClick={goNext}
          disabled={
            !selectedDuration || !availabilityPerDuration[selectedDuration]
          }
          variant="solid"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderTimeStep = () => (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <p className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Available times ({selectedDuration} min)
        </p>
        {slotsLoading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
            Loading slots...
          </p>
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
                {formatTime(slot.start_time)}
              </button>
            ))}
          </div>
        )}
        {!slotsLoading && selectedSlot && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-3 text-center">
            ✓ Selected: {formatTime(selectedSlot.start_time)}
          </p>
        )}
      </div>
      <div className="px-6 pt-4 pb-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
        <Button onClick={goBack} variant="ghost">
          Back
        </Button>
        <Button onClick={goNext} disabled={!selectedSlot} variant="solid">
          Continue
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="border border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar
              name={effectiveDoctorName}
              src={
                selectedDoctor?.profile_picture || preSelectedDoctorId
                  ? null
                  : undefined
              }
              size="sm"
            />
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {effectiveDoctorName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {effectiveDoctorSpecialty}
              </p>
            </div>
          </div>
          {effectivePatientName && (
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Avatar
                name={effectivePatientName}
                src={selectedPatient?.profile_picture}
                size="sm"
              />
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Patient
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {effectivePatientName}
                </p>
              </div>
            </div>
          )}
          {/* ─── Chief Complaint Textarea ─────────────────────────────── */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <label
              htmlFor="chief-complaint"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Chief Complaint{" "}
              <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <textarea
              id="chief-complaint"
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Briefly describe your symptoms or reason for visit..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1 text-sm">
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-900 dark:text-white">
                Date:
              </span>{" "}
              {selectedDate}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-900 dark:text-white">
                Duration:
              </span>{" "}
              {selectedDuration} minutes
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-900 dark:text-white">
                Time:
              </span>{" "}
              {selectedSlot ? formatTime(selectedSlot.start_time) : "—"}
            </p>
          </div>
          {(!selectedSlot || !effectiveDoctorId || !effectivePatientId) && (
            <p className="text-xs text-red-500 dark:text-red-400">
              Missing information for this booking — go back and complete every
              step.
            </p>
          )}
        </div>
      </div>
      <div className="px-6 pt-4 pb-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
        <Button onClick={goBack} disabled={confirming} variant="ghost">
          Back
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={
            confirming ||
            !selectedSlot ||
            !effectiveDoctorId ||
            !effectivePatientId
          }
          variant="solid"
        >
          {confirming ? "Booking..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={handleClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {initialAppointment
                  ? "Reschedule Appointment"
                  : "Book Appointment"}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Step {step + 1} - {STEP_LABELS[stepKey]}
              </p>
              <StepIndicator
                currentStep={step + 1}
                steps={steps.map((s) => STEP_LABELS[s])}
              />
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

        {stepKey === "doctor" && renderDoctorStep()}
        {stepKey === "patient" && renderPatientStep()}
        {stepKey === "duration" && renderDurationStep()}
        {stepKey === "time" && renderTimeStep()}
        {stepKey === "review" && renderReviewStep()}
      </div>
    </>
  );
}
