import React, { useState } from 'react';
import PDMPCard from '../components/PDMPCard';
import PharmacyCard from '../components/PharmacyCard';
import MedicationCard from '../components/MedicationCard';
import AddMedicationModal from '../components/AddMedicationModal';
import AddRX from '../components/AddRX';
import allData from '../data/medications.json';

export default function Medications() {
  const [medications, setMedications] = useState(allData.initialMedications);
  const patient = allData.patient;
  const pdmpData = allData.pdmpCheck;
  const pharmacyData = allData.preferredPharmacy;

  const [showModal, setShowModal] = useState(false);
  const [showAddRx, setShowAddRx] = useState(false);

  const handleDiscontinue = (medId, reason, date) => {
    setMedications(prevMeds =>
      prevMeds.map(med =>
        med.id === medId
          ? {
              ...med,
              status: 'discontinued',
              discontinuedOn: date,
              discontinueReason: reason,
              statusLabel: '',
            }
          : med
      )
    );
  };

  const handleUpdate = (medId, updates) => {
    setMedications(prevMeds =>
      prevMeds.map(med =>
        med.id === medId ? { ...med, ...updates } : med
      )
    );
  };

  const handleMedicationAdded = (newMed) => {
    setMedications(prev => [newMed, ...prev]);
  };

  return (
    <div className=" px-10 py-6">

      {/* Header row */}
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
  <div className="flex-1  border-gray-200 pr-5">
    <PDMPCard pdmp={pdmpData} />
  </div>
  <div className="w-1/3 pl-5">
    <PharmacyCard pharmacy={pharmacyData} />
  </div>
</div>
      {/* Medication cards list */}
      <div className="flex flex-col gap-3">
        {medications.map(med => (
          <MedicationCard
            key={med.id}
            med={med}
            patient={patient}
            onDiscontinue={handleDiscontinue}
            onUpdate={handleUpdate}
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
            setShowAddRx(true);
          }}
        />
      )}

      <AddRX
        isOpen={showAddRx}
        onClose={() => setShowAddRx(false)}
        onMedicationAdded={handleMedicationAdded}
      />
    </div>
  );
}