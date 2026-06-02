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

const StatusContent = ({ med, onOpenUpdate }) => {
  if (med.status === "discontinued")
    return (
      <div className="text-sm mb-2 text-red-600">
        <p>Reason: {med.discontinueReason}</p>
        <p>Discontinued on {med.discontinuedOn}</p>
      </div>
    );

  if (med.status === "external")
    return (
      <div className="flex justify-between items-center py-2 border-t mt-2">
        <p className="text-xs">Prescribed by {med.externalPrescriber}</p>
        <OutlineBtn onClick={onOpenUpdate}>Update RX</OutlineBtn>
      </div>
    );

  return (
    (med.status === "success" || med.status === "failed") && (
      <div className="flex gap-4 items-center">
        <span className={`text-xs ${med.status === "success" ? "text-green-600" : "text-red-600"}`}>
          {med.statusLabel}
        </span>
        <PharmacyLink pharmacy={med.pharmacy} />
      </div>
    )
  );
};

// --- Main Component ---
export default function MedicationCard({
  med,
  patient,
  onDiscontinue,
  onUpdate,
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

  const PrescriberBlock = () =>
    prescriberName ? (
      <div className="flex items-center gap-2">
        <img
          src="/Doctor.png"
          alt="Doctor"
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
        <div className="flex flex-col items-start gap-1">
          <p className="text-xs font-medium text-gray-700">{prescriberName}</p>

          <span className="text-[10px] font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border">
            {prescriberRole}
          </span>
        </div>
      </div>
    ) : null;

  // Shared action buttons + prescriber bottom row
  const CardFooter = ({ showDiscontinue = true }) => (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
      <PrescriberBlock />
      <div className="flex items-center gap-2 ml-auto">
        <OutlineBtn variant="primary">Send Refill RX</OutlineBtn>
        <OutlineBtn variant="primary" onClick={() => setShowUpdateDrawer(true)}>
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
    </div>
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
              onClick={() => setShowUpdateDrawer(true)}
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
