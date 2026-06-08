import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import DisContinueDrawer from "./DisContinueDrawer";
import { recontinuePrescription } from "../store/MedicationSlice";

// --- Static Components ---
const StatusBadge = ({ status }) => {
  const map = {
    success: { label: "Active", className: "bg-green-700 text-white" },
    failed: { label: "Active", className: "bg-green-700 text-white" },
    discontinued: { label: "Discontinued", className: "bg-red-700 text-white" },
    external: {
      label: "External Active",
      className: "bg-green-700 text-white",
    },
  };
  const cfg = map[status] || {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
};

const OutlineBtn = ({
  children,
  onClick,
  variant = "primary",
  className = "",
}) => {
  const base =
    "text-[11px] font-semibold px-3 py-1 rounded-md border bg-white transition-colors";
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
const Time = ({ med }) => {
  if (med.status === "success")
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-green-600"> Sucessfully sent </span>
        <span className="text-xs text-gray-600 font-medium">
          {med.statusLabel}
        </span>
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
      <div className="flex gap-12 items-center">
        <Time med={med} />
        <PharmacyLink pharmacy={med.pharmacy} />
      </div>
    )
  );
};

// --- Main Component ---
export default function MedicationCard({ med, patient, onEdit }) {
  const dispatch = useDispatch();
  const [showDiscontinueDrawer, setShowDiscontinueDrawer] = useState(false);

  const { subtitle, prescriberName, prescriberRole } = useMemo(() => {
    const parts = [med.name, med.dosage, med.form].filter(Boolean);
    if (med.type) parts.push(`· ${med.type}`);
    if (med.instructions) parts.push(`· ${med.instructions}`);
    return {
      subtitle: parts.join(" "),
      prescriberName: med.prescriber || "N/A",
      prescriberRole: med.prescriberRole || "Prescriber",
    };
  }, [med]);

  const handleRecontinue = () => {
    dispatch(recontinuePrescription({ id: med.id }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-base text-gray-900">{med.name}</h3>
        <StatusBadge status={med.status} />
      </div>
      <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
      {med.patientNote && (
        <p className="text-sm text-gray-600 mb-3">{med.patientNote}</p>
      )}
      <StatusContent med={med} onOpenUpdate={() => onEdit(med)} />

      {med.status !== "external" && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
          <div className="flex items-center gap-2">
            <img
              src="/Doctor.png"
              alt="Doctor"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-xs font-medium">{prescriberName}</p>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 rounded-full">
                {prescriberRole}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <OutlineBtn>Send Refill RX</OutlineBtn>
            <OutlineBtn onClick={() => onEdit(med)}>Update RX</OutlineBtn>
            {med.status === "discontinued" ? (
              <OutlineBtn variant="success" onClick={handleRecontinue}>
                ReActive
              </OutlineBtn>
            ) : (
              <OutlineBtn
                variant="danger"
                onClick={() => setShowDiscontinueDrawer(true)}
              >
                Discontinue RX
              </OutlineBtn>
            )}
          </div>
        </div>
      )}

      {showDiscontinueDrawer && (
        <DisContinueDrawer
          isOpen={true}
          onClose={() => setShowDiscontinueDrawer(false)}
          medication={med}
        />
      )}
    </div>
  );
}
