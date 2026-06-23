import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  fetchPrescriptions,
  updatePrescription,
  addPrescription,
  clearError,
} from "../store/MedicationSlice";
import { fetchPdmp } from "../api/patientApi";
import { fetchPharmaciesByZip } from "../api/masterDataApi";
import usePrescriptions from "../hooks/usePrescriptions";
import usePatient from "../hooks/usePatient";
import PDMPCard from "../components/organisms/PDMPCard/PDMPCard";
import PharmacyCard from "../components/organisms/PharmacyCard/PharmacyCard";
import MedicationCard from "../components/organisms/MedicationCard/MedicationCard";
import AddMedicationModal from "../components/organisms/AddMedicationModal/AddMedicationModal";
import AddRX from "../components/organisms/AddRX/AddRX";
import ExternalRxDrawer from "../components/organisms/ExternalRxDrawer/ExternalRxDrawer";
import UpdateMedicationDrawer from "../components/organisms/UpdateMedicationDrawer/UpdateMedicationDrawer";
import PharmacySelectDrawer from "../components/organisms/PharmacySelectDrawer/PharmacySelectDrawer";

export default function Medications({ role, userId, patientId: propPatientId }) {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const urlPatientId = searchParams.get("patientId");
  const effectivePatientId = propPatientId || urlPatientId;

  const {
    prescriptions: medications,
    loading,
    error,
    refetch: refetchPrescriptions,
  } = usePrescriptions(effectivePatientId, role === "doctor" ? userId : undefined);

  const { patient, error: patientError } = usePatient(effectivePatientId);

  const [pdmpData, setPdmpData] = useState(null);
  const [pharmacyData, setPharmacyData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddRx, setShowAddRx] = useState(false);
  const [showExternalRx, setShowExternalRx] = useState(false);
  const [showUpdateRx, setShowUpdateRx] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [externalInitialData, setExternalInitialData] = useState(null);
  const [wizardTargetStep, setWizardTargetStep] = useState(1);
  const [showPharmacySelector, setShowPharmacySelector] = useState(false);

  const getZipFromAddress = (address) => {
    if (!address) return "22903";
    const match = address.match(/\b\d{5}\b/);
    return match ? match[0] : "22903";
  };

  const handlePharmacyChange = (newPharmacy) => setPharmacyData(newPharmacy);

  // Fetch PDMP and pharmacy data independently
  useEffect(() => {
    if (!effectivePatientId) {
      setPdmpData(null);
      setPharmacyData(null);
      return;
    }
    Promise.all([
      fetchPdmp(effectivePatientId),
      fetchPharmaciesByZip("22903"),
    ])
      .then(([pdmp, pharmacies]) => {
        setPdmpData(pdmp);
        setPharmacyData(pharmacies?.length ? pharmacies[0] : null);
      })
      .catch((err) => console.error("Failed to load supplementary data:", err));
  }, [effectivePatientId]);

  const handleEditMedication = (med) => {
    if (role !== "doctor" || String(med.prescriber_id) !== String(userId)) return;
    setEditingMedication(med);
    if (med.status === "external") {
      setExternalInitialData({
        id: med.id,
        drug: med.name,
        instructions: med.instructions,
        externalPrescriber: med.externalPrescriber,
        statusLabel: med.statusLabel,
        patientNote: med.patientNote,
        discontinuedOn: med.discontinuedOn,
        discontinueReason: med.discontinueReason,
      });
      setShowExternalRx(true);
    } else {
      setShowUpdateRx(true);
    }
  };

  const routeToIsolatedStep = (stepNumber) => {
    setWizardTargetStep(stepNumber);
    setShowUpdateRx(false);
    setShowAddRx(true);
  };

  const handleIsolatedStepSubmit = (stepFormValues) => {
    setEditingMedication((prev) => ({
      ...prev,
      ...stepFormValues,
      pharmacy_id: stepFormValues.pharmacy_id || prev?.pharmacy_id,
      med_id: stepFormValues.med_id || prev?.med_id,
    }));
    setShowAddRx(false);
    setShowUpdateRx(true);
  };

  const handleFinalGlobalSubmit = async () => {
    if (!editingMedication?.id) {
      alert("Cannot update: missing prescription ID");
      return;
    }
    const updates = {
      dosage: editingMedication.dosage,
      instructions: editingMedication.instructions,
      patient_note: editingMedication.patientNote,
      name: editingMedication.name,
      external_prescriber:
        editingMedication.external_prescriber || editingMedication.externalPrescriber,
    };
    if (editingMedication.pharmacy_id) updates.pharmacy_id = editingMedication.pharmacy_id;
    if (editingMedication.med_id) updates.med_id = editingMedication.med_id;
    if (editingMedication.form) updates.form = editingMedication.form;

    try {
      await dispatch(updatePrescription({ id: editingMedication.id, updates })).unwrap();
      refetchPrescriptions();
      setShowUpdateRx(false);
      setEditingMedication(null);
    } catch {
      // Error is already in Redux state and displayed via the error banner.
    }
  };

  if (patientError) {
    return <div className="p-4 text-red-600">{patientError}</div>;
  }

  if (!effectivePatientId) {
    return (
      <div className="p-8 text-center text-gray-500">
        No patient selected. Please go back and choose a patient.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <main className="w-full px-4 py-6 md:px-6 lg:px-8">
        {error && (
          <div className="flex items-center justify-between bg-red-100 text-red-700 p-3 rounded mb-4">
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-4 text-red-500 hover:text-red-700 font-bold text-sm"
              aria-label="Dismiss error"
            >
              Clear ✕
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Medications — {patient?.name || "Patient"}
          </h1>
          {role === "doctor" && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={() => {
                setEditingMedication(null);
                setWizardTargetStep(1);
                setShowModal(true);
              }}
            >
              + New medication
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PDMPCard pdmp={pdmpData} />
          <PharmacyCard
            pharmacy={pharmacyData}
            onEdit={() => setShowPharmacySelector(true)}
          />
        </div>

        <div className="space-y-4">
          {loading && <div className="text-center py-4">Loading prescriptions...</div>}
          {!loading && medications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No medications found for this patient.
            </div>
          )}
          {medications.map((med, idx) => {
            const canEdit = role === "doctor" && String(med.prescriber_id) === String(userId);
            return (
              <MedicationCard
                key={med.prescription_id || med.id || idx}
                med={med}
                patient={patient}
                onEdit={canEdit ? handleEditMedication : undefined}
              />
            );
          })}
        </div>
      </main>

      <PharmacySelectDrawer
        isOpen={showPharmacySelector}
        onClose={() => setShowPharmacySelector(false)}
        onSelect={handlePharmacyChange}
        zipCode={getZipFromAddress(patient?.address)}
        currentPharmacy={pharmacyData}
      />

      {role === "doctor" && (
        <>
          {showModal && (
            <AddMedicationModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onOpenSendRx={() => {
                setShowModal(false);
                setWizardTargetStep(1);
                setShowAddRx(true);
              }}
              patientId={effectivePatientId}
              prescriberId={userId}
              onPrescriptionAdded={refetchPrescriptions}
            />
          )}
          <AddRX
            isOpen={showAddRx}
            onClose={() => {
              setShowAddRx(false);
              setEditingMedication(null);
            }}
            patientId={effectivePatientId}
            prescriberId={userId}
            initialData={
              editingMedication
                ? {
                    ...editingMedication,
                    drug: editingMedication.name,
                    startAtStep: wizardTargetStep,
                    isIsolatedRoute: wizardTargetStep > 1,
                  }
                : null
            }
            onIsolatedStepSave={handleIsolatedStepSubmit}
          />
          <UpdateMedicationDrawer
            key={editingMedication?.id}
            isOpen={showUpdateRx}
            onClose={() => {
              setShowUpdateRx(false);
              setEditingMedication(null);
            }}
            med={editingMedication}
            patient={patient}
            onChangeMedication={() => routeToIsolatedStep(2)}
            onChangePharmacy={(selectedPharmacy) => {
              setEditingMedication((prev) => ({
                ...prev,
                pharmacy: selectedPharmacy.name,
                pharmacy_id: selectedPharmacy.id,
                pharmacyAddress: selectedPharmacy.address,
              }));
            }}
            onSave={handleFinalGlobalSubmit}
          />
          <ExternalRxDrawer
            isOpen={showExternalRx}
            onClose={() => {
              setShowExternalRx(false);
              setExternalInitialData(null);
              setEditingMedication(null);
            }}
            initialData={externalInitialData}
            patientId={effectivePatientId}
            prescriberId={userId}
            onSubmit={async (payload) => {
              try {
                await dispatch(addPrescription(payload)).unwrap();
                refetchPrescriptions();
                setShowExternalRx(false);
                setExternalInitialData(null);
                setEditingMedication(null);
              } catch {
                // Error is handled via Redux state
              }
            }}
          />
        </>
      )}
    </div>
  );
}