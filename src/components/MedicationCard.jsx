import React, { useState, useMemo } from "react";
import DisContinueDrawer from "./DisContinueDrawer";
import RecontinueDrawer from "./ReContinueDrawer";

// --- Static Components ---
const StatusBadge = ({ status }) => {
  const map = {
    success:      { label: "Active",           className: "bg-green-700 text-white" },
    failed:       { label: "Active",           className: "bg-green-700 text-white" },
    discontinued: { label: "Discontinued",     className: "bg-red-700 text-white"   },
    external:     { label: "External Active",  className: "bg-green-700 text-white" },
  };
  const cfg = map[status] || { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

const OutlineBtn = ({ children, onClick, variant = "primary", className = "" }) => {
  const base = "text-[11px] font-semibold px-3 py-1 rounded-md border bg-white transition-colors";
  const styles =
    variant === "danger"
      ? "border-red-600 text-red-600 hover:bg-red-50"
      : variant === "success"
        ? "border-green-600 text-green-600 hover:bg-green-50"
        : "border-blue-600 text-blue-600 hover:bg-blue-50";
  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
};

const PharmacyLink = ({ pharmacy }) => {
  if (!pharmacy) return null;
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-600">Sent to</span>
      <span className="text-xs text-blue-600 font-medium">{pharmacy}</span>
    </div>
  );
};

// --- Main Component ---
export default function MedicationCard({
  med,
  patient,
  onDiscontinue,
  onUpdate,
  onRecontinue,
  onEdit,
}) {
  const [showDiscontinueDrawer, setShowDiscontinueDrawer] = useState(false);
  const [showRecontinueDrawer, setShowRecontinueDrawer]   = useState(false);

  const { subtitle, prescriberName, prescriberRole } = useMemo(() => {
    const parts = [med.name, med.dosage, med.form].filter(Boolean);
    if (med.type) parts.push(`· ${med.type}`);
    if (med.instructions) parts.push(`· ${med.instructions}`);
    const i = med.prescriber?.lastIndexOf(" ") ?? -1;
    return {
      subtitle:      parts.join(" "),
      prescriberName: i !== -1 ? med.prescriber.substring(0, i) : med.prescriber || "N/A",
      prescriberRole: i !== -1 ? med.prescriber.substring(i + 1) : "Prescriber",
    };
  }, [med]);

  const PrescriberBlock = () => (
    <div className="flex items-center gap-2">
      <img src="/Doctor.png" alt="Doctor" className="w-8 h-8 rounded-full" />
      <div>
        <p className="text-xs font-medium">{prescriberName}</p>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 rounded-full">
          {prescriberRole}
        </span>
      </div>
    </div>
  );

  const CardFooter = ({ showDiscontinue = true }) => (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
      <PrescriberBlock />
      <div className="flex items-center gap-2 ml-auto">
        <OutlineBtn variant="primary">Send Refill RX</OutlineBtn>
        <OutlineBtn 
          variant="primary" 
          onClick={() => onEdit ? onEdit(med) : setShowUpdateDrawer(true)}
        >
          Update RX
        </OutlineBtn>
        {showDiscontinue && (
          <OutlineBtn
            variant="danger"
            onClick={() => setShowDiscontinueDrawer(true)}
          >
            Discontinue RX
          </OutlineBtn>
        )}
      </div>
    </div>
  );

  const Drawers = () => (
    <>
      {showDiscontinueDrawer && (
        <DisContinueDrawer
          isOpen={true}
          onClose={() => setShowDiscontinueDrawer(false)}
          medication={med}
          onConfirm={onDiscontinue}
        />
      )}

      {showRecontinueDrawer && (
        <RecontinueDrawer
          isOpen={true}
          onClose={() => setShowRecontinueDrawer(false)}
          medication={med}
          onConfirm={onRecontinue}
        />
      )}
    </>
  );

  // ── SUCCESS ───────────────────────────────────────────────
  if (med.status === "success") {
    let successText = "";
    let restText = "";
    if (med.statusLabel) {
      const match = med.statusLabel.match(/^(Successfully sent)(.*)$/);
      if (match) {
        successText = match[1];
        restText = match[2];
      } else {
        successText = med.statusLabel;
      }
    }

    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-base text-gray-900">
              {med.name}
            </h3>
            <StatusBadge status="success" />
          </div>

          <p className="text-xs text-gray-500 mb-2">{subtitle}</p>

          {med.patientNote && (
            <p className="text-sm text-gray-600 mb-3">{med.patientNote}</p>
          )}

          <div className="flex items-center justify-start gap-10">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-green-500 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs">
                <span className="text-green-600">{successText}</span>
                <span className="text-gray-500">{restText}</span>
              </span>
            </div>
            <PharmacyLink pharmacy={med.pharmacy} />
          </div>

          <CardFooter />
        </div>
        <Drawers />
      </>
    );
  }

  // ── FAILED ────────────────────────────────────────────────
  if (med.status === "failed") {
    let failedText = "";
    let restText = "";
    if (med.statusLabel) {
      const match = med.statusLabel.match(/^(Failed to send)(.*)$/);
      if (match) {
        failedText = match[1];
        restText = match[2];
      } else {
        failedText = med.statusLabel;
      }
    }

    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-base text-gray-900">
              {med.name}
            </h3>
            <StatusBadge status="failed" />
          </div>

          <p className="text-xs text-gray-500 mb-2">{subtitle}</p>

          {med.patientNote && (
            <p className="text-sm text-gray-600 mb-3">{med.patientNote}</p>
          )}

          <div className="flex items-center justify-start gap-10">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-red-500 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs">
                <span className="text-red-600">{failedText}</span>
                <span className="text-gray-500">{restText}</span>
              </span>
            </div>
            <PharmacyLink pharmacy={med.pharmacy} />
          </div>

          <CardFooter />
        </div>
        <Drawers />
      </>
    );
  }

  // ── DISCONTINUED ──────────────────────────────────────────
  if (med.status === "discontinued") {
    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-base text-gray-900">
              {med.name}
            </h3>
            <StatusBadge status="discontinued" />
          </div>

          <p className="text-xs text-gray-500 mb-2">{subtitle}</p>

          {med.discontinueReason && (
            <p className="text-sm mb-1">
              <span className="font-medium text-red-500">
                Reason for discontinuation:
              </span>{" "}
              {med.discontinueReason}
            </p>
          )}

          {med.discontinuedOn && (
            <p className="text-sm mb-1">
              <span className="text-red-600">Discontinued on </span>
              <span className="text-gray-500">{med.discontinuedOn}</span>
            </p>
          )}

          <CardFooter showDiscontinue={false} />
        </div>
        <Drawers />
      </>
    );
  }

  // ── EXTERNAL ──────────────────────────────────────────────
  if (med.status === "external") {
    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-base text-gray-900">
              {med.name}
            </h3>
            <StatusBadge status="external" />
          </div>

          <p className="text-xs text-gray-500 mb-2">{subtitle}</p>

          {med.patientNote && (
            <p className="text-sm text-gray-600 mb-3">{med.patientNote}</p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <div className="leading-tight">
              <p className="text-xs text-black">
                Prescribed by{" "}
                <span className="text-black">
                  {med.externalPrescriber || "External Prescriber"}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                {med.externalPrescriberId || "Unknown"}
              </p>
            </div>
            <OutlineBtn
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => onEdit ? onEdit(med) : setShowUpdateDrawer(true)}
            >
              Update RX
            </OutlineBtn>
          </div>
        </div>
        <Drawers />
      </>
    );
  }

  return null;
}