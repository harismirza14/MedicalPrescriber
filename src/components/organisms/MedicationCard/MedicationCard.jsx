import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DisContinueDrawer from "../DisContinueDrawer/DisContinueDrawer";
import { recontinuePrescription } from "@/store/MedicationSlice";
import Badge from "@/components/atoms/Badge/Badge";
import Button from "@/components/atoms/Button/Button";


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
  if (med.status !== "success") return null;
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-green-600">Successfully sent</span>
      <span className="text-xs text-gray-600 font-medium">
        {med.statusLabel}
      </span>
    </div>
  );
};

const StatusContent = ({ med, onOpenUpdate, isDoctor, loading }) => {
  if (med.status === "discontinued") {
    return (
      <div className="text-sm mb-2 text-red-600">
        <p>Reason: {med.discontinueReason}</p>
        <p>Discontinued on {med.discontinuedOn}</p>
      </div>
    );
  }

  if (med.status === "external") {
    return (
      <div className="flex justify-between items-center py-2 border-t mt-2">
        <p className="text-xs font-semibold">
          Prescribed by:{" "}
          {med.external_prescriber || med.externalPrescriber || "N/A"}
        </p>
        {isDoctor && (
          <Button onClick={onOpenUpdate} disabled={loading}>
            Update RX
          </Button>
        )}
      </div>
    );
  }

  if (med.status === "success" || med.status === "failed") {
    return (
      <div className="flex gap-12 items-center">
        <Time med={med} />
        <PharmacyLink pharmacy={med.pharmacy} />
      </div>
    );
  }
  return null;
};

export default function MedicationCard({ med, patient, onEdit }) {
  const dispatch = useDispatch();
  const [showDiscontinueDrawer, setShowDiscontinueDrawer] = useState(false);
  const { role } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.medications);
  const isDoctor = role === "doctor";

  const { subtitle, displayName, displayRole, imageSrc } = useMemo(() => {
    const parts = [med.name, med.dosage, med.form].filter(Boolean);
    if (med.type) parts.push(`· ${med.type}`);
    if (med.instructions) parts.push(`· ${med.instructions}`);

    if (isDoctor) {
      return {
        subtitle: parts.join(" "),
        displayName: patient?.name || med.patient_name || "Unknown Patient",
        displayRole: "Patient",
        imageSrc: "/Doctor.png",
      };
    } else {
      return {
        subtitle: parts.join(" "),
        displayName: med.prescriber_name || med.prescriber || "N/A",
        displayRole: med.prescriberRole || "Prescriber",
        imageSrc: "/Doctor.png",
      };
    }
  }, [med, patient, isDoctor]);

  const handleRecontinue = () => {
    dispatch(recontinuePrescription({ id: med.id }));
  };

  const canEdit = isDoctor;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-base text-gray-900">{med.name}</h3>
        <Badge status={med.status} />
      </div>
      <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
      {med.patientNote && (
        <p className="text-sm text-gray-600 mb-3">{med.patientNote}</p>
      )}
      <StatusContent
        med={med}
        onOpenUpdate={() => onEdit && onEdit(med)}
        isDoctor={isDoctor}
        loading={loading}
      />

      {med.status !== "external" && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
          <div className="flex items-center gap-2">
            <img
              src={imageSrc}
              alt={isDoctor ? "Patient" : "Doctor"}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-xs font-medium">{displayName}</p>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 rounded-full">
                {displayRole}
              </span>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <Button disabled={loading}>Send Refill RX</Button>
              <Button
                onClick={() => onEdit && onEdit(med)}
                disabled={loading}
              >
                Update RX
              </Button>
              {med.status === "discontinued" ? (
                <Button
                  variant="success"
                  onClick={handleRecontinue}
                  disabled={loading}
                >
                  ReActive
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={() => setShowDiscontinueDrawer(true)}
                  disabled={loading}
                >
                  Discontinue RX
                </Button>
              )}
            </div>
          )}
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
