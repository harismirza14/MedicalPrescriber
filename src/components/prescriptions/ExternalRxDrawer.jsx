import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePrescription,
  formatStatusLabel,
} from "../../store/MedicationSlice";

export default function ExternalRxDrawer({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
  patientId,
  prescriberId,
}) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.medications);
  const isEditMode = !!initialData;
  const [selectedDrug, setSelectedDrug] = useState("");
  const [drugInfo, setDrugInfo] = useState("");
  const [externalPrescriber, setExternalPrescriber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSelectedDrug(initialData.drug || "");
        setDrugInfo(initialData.instructions || "");
        setExternalPrescriber(
          initialData.external_prescriber ||
            initialData.externalPrescriber ||
            "",
        );
      } else {
        setSelectedDrug("");
        setDrugInfo("");
        setExternalPrescriber("");
      }
      setSubmitted(false);
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setSelectedDrug("");
    setDrugInfo("");
    setExternalPrescriber("");
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!selectedDrug.trim()) return;

    if (isEditMode) {
      const updates = {
        instructions: drugInfo || null,
        status: "external",
        external_prescriber: externalPrescriber || null,
        patient_note: initialData?.patientNote ?? null,
      };
      try {
        await dispatch(
          updatePrescription({ id: initialData.id, updates }),
        ).unwrap();
      } catch {
        return;
      }
      handleClose();
      return;
    }

    const serverPayload = {
      patient_id: patientId || "P1",
      med_name: selectedDrug,
      prescriber_id: prescriberId || null,
      pharmacy_id: null,
      dosage: "Unknown",
      form: null,
      instructions: drugInfo || null,
      status: "external",
      status_label: formatStatusLabel(),
      patient_note: null,
      external_prescriber: externalPrescriber || null,
    };

    if (onSubmit) onSubmit(serverPayload);
    handleClose();
  };

  if (!isOpen) return null;

  const hasError = submitted && !selectedDrug.trim();

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => !loading && handleClose()}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditMode ? "Edit External RX" : "External RX"}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Drug Name
              </label>
              {hasError && (
                <span className="text-xs font-medium text-red-500">
                  Required
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Enter medication name"
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                hasError
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Drug Information
            </label>
            <textarea
              rows={3}
              placeholder="Record dosage, frequency, and other sig information"
              value={drugInfo}
              onChange={(e) => setDrugInfo(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Name of External Prescriber
            </label>
            <input
              type="text"
              value={externalPrescriber}
              onChange={(e) => setExternalPrescriber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </>
  );
}
