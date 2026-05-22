import React, { useState, useMemo } from "react";
import DisContinueDrawer from "./DisContinueDrawer";
import UpdateRxDrawer from "./UpdateRxDrawer";

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    success: { label: "Active", className: "bg-green-700 text-white" },
    failed: { label: "Active", className: "bg-green-700 text-white" },
    discontinued: { label: "Discontinued", className: "bg-red-700 text-white" },
    external: { label: "External Active", className: "bg-green-700 text-white" },
  };
  const cfg = map[status] || { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ── Outlined action button ────────────────────────────────────
function OutlineBtn({ children, onClick, variant = "primary", className = "" }) {
  const variants = {
    primary: "border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "border-red-600 text-red-600 hover:bg-red-50",
  };
  const SelectedStyle = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick || (() => {})}
      className={`text-[11px] font-semibold px-3 py-1 rounded-md border bg-white transition-colors ${SelectedStyle} ${className}`}
    >
      {children}
    </button>
  );
}

// ── Pharmacy send link ────────────────────────────────────────
function PharmacyLink({ pharmacy }) {
  if (!pharmacy) return null;
  return (
    <div className="flex items-center gap-1">
      <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      <span className="text-xs text-gray-600">Sent to</span>
      <span className="text-xs text-blue-600">{pharmacy}</span>
    </div>
  );
}

export default function MedicationCard({ med, patient, onDiscontinue, onUpdate }) {
  const [showDiscontinueDrawer, setShowDiscontinueDrawer] = useState(false);
  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);

  // Memoized subtitle ensures it recalculates whenever 'med' changes
  const subtitle = useMemo(() => {
    const parts = [];
    if (med.name) parts.push(med.name);
    if (med.dosage) parts.push(med.dosage);
    if (med.form) parts.push(med.form);
    if (med.type) parts.push(`· ${med.type}`);
    if (med.instructions) parts.push(`· ${med.instructions}`);
    return parts.join(" ");
  }, [med]);

  let prescriberName = "";
  let prescriberRole = "";
  if (med.prescriber) {
    const i = med.prescriber.lastIndexOf(" ");
    prescriberName = i !== -1 ? med.prescriber.substring(0, i) : med.prescriber;
    prescriberRole = i !== -1 ? med.prescriber.substring(i + 1) : "Prescriber";
  }

  const PrescriberBlock = () =>
    prescriberName ? (
      <div className="flex items-center gap-2">
        <img src="/Doctor.png" alt="Doctor" className="w-8 h-8 rounded-full object-cover shrink-0" />
        <div className="flex flex-col items-start gap-1">
          <p className="text-xs font-medium text-gray-700">{prescriberName}</p>
          <span className="text-[10px] font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border">
            {prescriberRole}
          </span>
        </div>
      </div>
    ) : null;

  const CardFooter = ({ showDiscontinue = true }) => (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
      <PrescriberBlock />
      <div className="flex items-center gap-2 ml-auto">
        <OutlineBtn variant="primary">Send Refill RX</OutlineBtn>
        <OutlineBtn variant="primary" onClick={() => setShowUpdateDrawer(true)}>Update RX</OutlineBtn>
        {showDiscontinue && (
          <OutlineBtn variant="danger" onClick={() => setShowDiscontinueDrawer(true)}>Discontinue RX</OutlineBtn>
        )}
      </div>
    </div>
  );

  const Drawers = () => (
    <>
      {showDiscontinueDrawer && (
        <DisContinueDrawer isOpen={showDiscontinueDrawer} onClose={() => setShowDiscontinueDrawer(false)} medication={med} onConfirm={onDiscontinue} />
      )}
      {showUpdateDrawer && (
        <UpdateRxDrawer isOpen={showUpdateDrawer} onClose={() => setShowUpdateDrawer(false)} medication={med} patient={patient} onUpdate={onUpdate} />
      )}
    </>
  );

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-base text-gray-900">{med.name}</h3>
          <StatusBadge status={med.status} />
        </div>

        {/* Subtitle */}
        <p className="text-xs text-gray-500 mb-2">{subtitle}</p>

        {/* Patient Note */}
        {med.patientNote && <p className="text-sm text-gray-600 mb-3">{med.patientNote}</p>}

        {/* Content based on status */}
        {med.status === "success" && (
          <div className="flex items-center justify-start gap-10">
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              {med.statusLabel}
            </div>
            <PharmacyLink pharmacy={med.pharmacy} />
          </div>
        )}

        {med.status === "failed" && (
          <div className="flex items-center justify-start gap-10">
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {med.statusLabel}
            </div>
            <PharmacyLink pharmacy={med.pharmacy} />
          </div>
        )}

        {med.status === "discontinued" && (
          <>
            {med.discontinueReason && <p className="text-sm mb-1"><span className="font-medium text-red-500">Reason:</span> {med.discontinueReason}</p>}
            {med.discontinuedOn && <p className="text-sm mb-1"><span className="text-red-600">Discontinued on </span> <span className="text-gray-500">{med.discontinuedOn}</span></p>}
          </>
        )}

        {med.status === "external" && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <div className="leading-tight">
              <p className="text-xs text-black">Prescribed by <span className="text-black">{med.externalPrescriber || "External Prescriber"}</span></p>
              <p className="text-xs text-gray-400">{med.externalPrescriberId || "Unknown"}</p>
            </div>
            <OutlineBtn onClick={() => setShowUpdateDrawer(true)}>Update RX</OutlineBtn>
          </div>
        )}

        {/* Footer for non-external */}
        {med.status !== "external" && <CardFooter showDiscontinue={med.status !== "discontinued"} />}
      </div>
      <Drawers />
    </>
  );
}