import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPrescriptions, updatePrescription } from '../store/MedicationSlice';
import { fetchPatient, fetchPdmp, fetchPharmaciesByZip } from '../services/api';

import PDMPCard               from '../components/PDMPCard';
import PharmacyCard           from '../components/PharmacyCard';
import MedicationCard         from '../components/MedicationCard';
import AddMedicationModal     from '../components/AddMedicationModal';
import AddRX                  from '../components/AddRX';
import ExternalRxDrawer       from '../components/ExternalRXDrawer';
import UpdateMedicationDrawer from '../components/UpdateMedicationDrawe';
import PharmacySelectDrawer   from '../components/PharmacySelectDrawer';

export default function Medications() {
  const dispatch = useDispatch();
  const medications = useSelector((state) => state.medications.list);

  const patientId = '080392';

  const [patient, setPatient] = useState(null);
  const [pdmpData, setPdmpData] = useState(null);
  const [pharmacyData, setPharmacyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showAddRx, setShowAddRx] = useState(false);
  const [showExternalRx, setShowExternalRx] = useState(false);
  const [showUpdateRx, setShowUpdateRx] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [externalInitialData, setExternalInitialData] = useState(null);
  const [wizardTargetStep, setWizardTargetStep] = useState(1);
  const [showPharmacySelector, setShowPharmacySelector] = useState(false);

  const getZipFromAddress = (address) => {
    if (!address) return '22903';
    const match = address.match(/\b\d{5}\b/);
    return match ? match[0] : '22903';
  };

  const handlePharmacyChange = (newPharmacy) => {
    setPharmacyData(newPharmacy);
    console.log('Pharmacy changed to:', newPharmacy);
  };

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchPatient(patientId),
      fetchPdmp(patientId),
      fetchPharmaciesByZip('22903')
    ])
      .then(([patientData, pdmp, pharmacies]) => {
        setPatient(patientData);
        setPdmpData(pdmp);
        const firstPharmacy = pharmacies?.length ? pharmacies[0] : null;
        setPharmacyData(firstPharmacy);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setError('Could not load patient information.');
        setLoading(false);
      });
  }, [patientId]);

  useEffect(() => {
    if (patientId) dispatch(fetchPrescriptions(patientId));
  }, [dispatch, patientId]);

  // ==================== HANDLERS ====================
  const handleEditMedication = (med) => {
    console.log('Edit medication clicked:', med);
    setEditingMedication(med);
    if (med.type === 'external' || med.status === 'external') {
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
    console.log('Isolated step submitted:', stepFormValues);
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
      console.error('No prescription_id found');
      alert('Cannot update: missing prescription ID');
      return;
    }
    const updates = {
      dosage: editingMedication.dosage,
      instructions: editingMedication.instructions,
      patient_note: editingMedication.patientNote,
    };
    if (editingMedication.pharmacy_id) {updates.pharmacy_id = editingMedication.pharmacy_id;}
    if (editingMedication.med_id) { updates.med_id = editingMedication.med_id; }
    if (editingMedication.form){ updates.form = editingMedication.form;}

    console.log('Dispatching updatePrescription with:', {
      id: editingMedication.id,
      updates,
    });

    try {
       console.log('submitting update for server:', editingMedication);
      await dispatch(updatePrescription({
       
        id: editingMedication.id,
        updates:editingMedication
      })).unwrap();
      await dispatch(fetchPrescriptions(patientId));
      console.log('Update successful');
      setShowUpdateRx(false);
      setEditingMedication(null);
    } catch (err) {
      console.error('Update failed:', err);
      alert(`Error updating prescription: ${err.message || err}`);
    }
  };

  if (loading) return <div className="p-4">Loading patient information...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!patient || !pdmpData) return <div className="p-4">No patient data available.</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <main className="w-full px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Medications</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md"
            onClick={() => {
              setEditingMedication(null);
              setWizardTargetStep(1);
              setShowModal(true);
            }}
          >
            + New medication
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PDMPCard pdmp={pdmpData} />
          <PharmacyCard pharmacy={pharmacyData} onEdit={() => setShowPharmacySelector(true)} />
        </div>

        <div className="space-y-4">
          {medications.map((med) => (
            <MedicationCard
              key={med.prescription_id || med.id}
              med={med}
              patient={patient}
              onEdit={handleEditMedication}
            />
          ))}
        </div>
      </main>

      <PharmacySelectDrawer
        isOpen={showPharmacySelector}
        onClose={() => setShowPharmacySelector(false)}
        onSelect={handlePharmacyChange}
        zipCode={getZipFromAddress(patient?.address)}
        currentPharmacy={pharmacyData}
      />

      {showModal && (
        <AddMedicationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onOpenSendRx={() => {
            setShowModal(false);
            setWizardTargetStep(1);
            setShowAddRx(true);
          }}
        />
      )}
      <AddRX
        isOpen={showAddRx}
        onClose={() => {
          setShowAddRx(false);
          setEditingMedication(null);
        }}
        patientId={patientId}
        initialData={editingMedication ? { ...editingMedication, drug: editingMedication.name, startAtStep: wizardTargetStep, isIsolatedRoute: wizardTargetStep > 1 } : null}
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
        onChangePharmacy={() => routeToIsolatedStep(3)}
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
      />
    </div>
  );
}