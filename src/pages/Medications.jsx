import React, { useState,useEffect } from "react";
import PDMPCard from "../components/PDMPCard";
import PharmacyCard from "../components/PharmacyCard";
import MedicationCard from "../components/MedicationCard";
import AddMedicationModal from "../components/AddMedicationModal";
import AddRX from "../components/AddRX";
import ExternalRxDrawer from "../components/ExternalRXDrawer";
import allData from "../data/medications.json";
export const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLocked]);
};
export default function Medications() {
  const [medications, setMedications] = useState(allData.initialMedications);
  const patient = allData.patient;
  const pdmpData = allData.pdmpCheck;
  const pharmacyData = allData.preferredPharmacy;

  const [showModal, setShowModal] = useState(false);
  const [showAddRx, setShowAddRx] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [showExternalRx, setShowExternalRx] = useState(false);
  const [externalInitialData, setExternalInitialData] = useState(null);

  
  const handleDiscontinue = (medId, reason, date) => {
    setMedications((prevMeds) =>
      prevMeds.map((med) =>
        med.id === medId
          ? {
              ...med,
              status: "discontinued",
              discontinuedOn: date,
              discontinueReason: reason,  
              statusLabel: "",
            }
          : med,
      ),
    );
  };

  const handleRecontinue = (medId, reason, date) => {
    setMedications((prevMeds) =>
      prevMeds.map((med) =>
        med.id === medId
          ? {
              ...med,
              status: "success",
              statusLabel: "Active",
              recontinueReason: reason,
              recontinuedOn: date,
              discontinueReason: undefined,
              discontinuedOn: undefined,
            }
          : med,
      ),
    );
  };

  const handleUpdate = (medId, updates) => {
    setMedications((prevMeds) =>
      prevMeds.map((med) => (med.id === medId ? { ...med, ...updates } : med)),
    );
  };

  const handleEditMedication = (med) => {
    setEditingMedication(med);
    if (med.type === 'external' || med.status === 'external') {
      setExternalInitialData({
        id: med.id,
        drug: med.name,
        instructions: med.instructions,
        externalPrescriber: med.externalPrescriber,
      });
      setShowExternalRx(true);
    } else {
      setShowAddRx(true);
    }
  };

  const handleExternalRxClose = () => {
    setShowExternalRx(false);
    setExternalInitialData(null);
    setEditingMedication(null);
  };

  const handleMedicationAdded = (newMed) => {
    if (editingMedication) {
      setMedications((prev) =>
        prev.map((m) =>
          m.id === editingMedication.id
            ? { ...newMed, id: editingMedication.id }
            : m,
        ),
      );
    } else {
      setMedications((prev) => [newMed, ...prev]);
    }
  };

  const handleAddRxClose = () => {
    setShowAddRx(false);
    setEditingMedication(null);
  };

  return (
    <div className="px-10 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Medications</h1>
        <button
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          onClick={() => setShowModal(true)}
        >
          <span className="text-base leading-none">+</span>
          New medication
        </button>
      </div>

      <div className="flex flex-col md:flex-row bg-white rounded-2xl p-5 mb-6">
        <div className="flex-1 border-gray-200 pr-5">
          <PDMPCard pdmp={pdmpData} />
        </div>
        <div className="w-1/3 pl-5">
          <PharmacyCard pharmacy={pharmacyData} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {medications.map((med) => (
          <MedicationCard
            key={med.id}
            med={med}
            patient={patient}
            onDiscontinue={handleDiscontinue}
            onRecontinue={handleRecontinue}
            onUpdate={handleUpdate}
            onEdit={handleEditMedication}
          />
        ))}
      </div>

      {showModal && (
        <AddMedicationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAdd={handleMedicationAdded}
          onOpenSendRx={() => {
            setShowModal(false);
            setEditingMedication(null);
            setShowAddRx(true);
           
          }}
        />
      )}

      <AddRX
        isOpen={showAddRx}
        onClose={handleAddRxClose}
        onMedicationAdded={handleMedicationAdded}
        
        initialData={
          editingMedication
            ? {
                id: editingMedication.id,
                drug: editingMedication.name,
                dosage: editingMedication.dosage,
                instructions: editingMedication.instructions,
                quantity: editingMedication.quantity,
                frequency: editingMedication.frequency,
                duration: editingMedication.duration,
                dispenseAmount: editingMedication.dispenseAmount,
                diagnoses: editingMedication.diagnoses,
                refills: editingMedication.refills,
                pharmacy: editingMedication.pharmacy,
              }
            : null
        }
      />

      <ExternalRxDrawer
        isOpen={showExternalRx}
        onClose={handleExternalRxClose}
        onSubmit={handleMedicationAdded}
        initialData={externalInitialData}
      />
    </div>
  );
}