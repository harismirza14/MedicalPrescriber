import React, { useMemo } from "react";

export default function UpdateMedicationDrawer({
  isOpen,
  onClose,
  med,
  patient,
  onSave,
  onChangeMedication,
  onChangePharmacy,
}) {
  if (!isOpen || !med) return null;
  const patientName = patient?.name || "Patient Name";
  const patientId = patient?.id || "N/A";
  const patientAddress = patient?.address || "";
  const medName = med.name || "Unknown Medication";
  const medInstructions = useMemo(() => {
    if (med.instructions) return med.instructions;
    const parts = [med.dosage, med.form].filter(Boolean);
    if (med.type) parts.push(`· ${med.type}`);
    return parts.join(" ");
  }, [med]);
  const pharmacyName = med.pharmacy || "No pharmacy selected";
  const pharmacyAddress =
    med.pharmacyAddress || "Click change to select a filling branch";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-50 shadow-2xl flex flex-col border-l border-gray-200">
        <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Update Medication
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 min-h-0">
          {/* Card Block 1: Patient Context Summary
          <div className="border border-gray-200 bg-white rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-base text-gray-900 leading-snug">
                {patientName} - {patientId}
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                {patientAddress}
              </p>
            </div>
          </div> */}
          <div className="border border-gray-200 bg-white rounded-xl p-4 flex items-start gap-4 shadow-sm relative group">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
              <svg
                className="w-6 h-6 rotate-45"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1 pr-16">
              <h4 className="font-bold text-base text-gray-900 leading-snug">
                {medName}
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                {medInstructions}
              </p>
            </div>
            <button
              type="button"
              onClick={onChangeMedication}
              className="absolute right-4 top-4 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Change
            </button>
          </div>
          <div className="border border-gray-200 bg-white rounded-xl p-4 flex items-start gap-4 shadow-sm relative group">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1 pr-16">
              <h4 className="font-bold text-base text-gray-900 leading-snug truncate">
                {pharmacyName}
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                {pharmacyAddress}
              </p>
            </div>
            <button
              type="button"
              onClick={onChangePharmacy}
              className="absolute right-4 top-4 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Change
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-6 py-2.5 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
          >
            Update Medication
          </button>
        </div>
      </div>
    </>
  );
}
