import React, { useState, useEffect, useMemo } from 'react';
import allData from '../data/medications.json';

// ─── Icons ────────────────────────────────────────────────────────────────────

function PersonIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}

function PharmacyIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function EditCard({ icon, isOpen, onToggle, summary, children }) {
  return (
    <div className={`border rounded-xl transition-all duration-200 ${isOpen ? 'border-blue-400 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none" onClick={onToggle}>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">{summary}</div>
        <div className="flex-shrink-0 flex items-center gap-2"><ChevronIcon open={isOpen} /></div>
      </div>
      {isOpen && <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">{children}</div>}
    </div>
  );
}

export default function UpdateRxDrawer({ isOpen, onClose, medication, patient, onUpdate }) {
  const [openCard, setOpenCard] = useState(null);
  const [editedPatient, setEditedPatient] = useState({ name: '', id: '', address: '' });
  const [editedMed, setEditedMed] = useState({ name: '', dosage: '', instructions: '' });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [pharmacyOptions, setPharmacyOptions] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  // Flatten pharmacies for efficient searching
  const allPharmacies = useMemo(() => Object.values(allData.pharmaciesByZip || {}).flat(), []);

  useEffect(() => {
    if (isOpen) {
      setOpenCard(null);
      setEditedPatient({ name: patient.name || '', id: patient.id || '', address: patient.address || '' });
      setEditedMed({ name: medication.name || '', dosage: medication.dosage || '', instructions: medication.instructions || '' });
      setSearchQuery("");
      setPharmacyOptions(allPharmacies);
      setSelectedPharmacy(allPharmacies.find(p => p.name === medication.pharmacy) || null);
    }
  }, [isOpen, medication, patient, allPharmacies]);

  if (!isOpen) return null;

  const handlePharmacySearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setPharmacyOptions(allPharmacies);
      setNoResults(false);
      return;
    }
    const results = allPharmacies.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.address.toLowerCase().includes(query)
    );
    setPharmacyOptions(results);
    setNoResults(results.length === 0);
  };

  const handleSendRx = () => {
    onUpdate(medication.id, {
      name: editedMed.name,
      dosage: editedMed.dosage,
      instructions: editedMed.instructions,
      pharmacy: selectedPharmacy?.name || medication.pharmacy,
    });
    onClose();
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Update/New Medication</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          <EditCard icon={<PersonIcon />} isOpen={openCard === 'patient'} onToggle={() => setOpenCard(openCard === 'patient' ? null : 'patient')} summary={
            <div>
              <p className="text-sm font-semibold text-gray-800">{editedPatient.name} <span className="font-normal text-gray-500">{editedPatient.id && `– ${editedPatient.id}`}</span></p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{editedPatient.address}</p>
            </div>
          }>
            <label className={labelCls}>Full Name</label>
            <input type="text" value={editedPatient.name} onChange={e => setEditedPatient(p => ({ ...p, name: e.target.value }))} className={inputCls} />
          </EditCard>

          <EditCard icon={<PillIcon />} isOpen={openCard === 'medication'} onToggle={() => setOpenCard(openCard === 'medication' ? null : 'medication')} summary={
            <div>
              <p className="text-sm font-semibold text-gray-800">{editedMed.name} {editedMed.dosage}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{editedMed.instructions}</p>
            </div>
          }>
            <label className={labelCls}>Drug Name</label>
            <select value={editedMed.name} onChange={e => setEditedMed(m => ({ ...m, name: e.target.value }))} className={`${inputCls} bg-white`}>
              {(allData.medicationList || []).map(med => <option key={med} value={med}>{med}</option>)}
            </select>
            <label className={labelCls}>Dose</label>
            <select value={editedMed.dosage} onChange={e => setEditedMed(m => ({ ...m, dosage: e.target.value }))} className={`${inputCls} bg-white`}>
              {(allData.doseOptions || []).map(dose => <option key={dose} value={dose}>{dose}</option>)}
            </select>
          </EditCard>

          <EditCard icon={<PharmacyIcon />} isOpen={openCard === 'pharmacy'} onToggle={() => setOpenCard(openCard === 'pharmacy' ? null : 'pharmacy')} summary={
            <div>
              <p className="text-sm font-semibold text-gray-800">{selectedPharmacy?.name || medication.pharmacy || 'No pharmacy selected'}</p>
              {selectedPharmacy && <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedPharmacy.address}</p>}
            </div>
          }>
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="Search by name or zip..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePharmacySearch()} className={inputCls} />
              <button onClick={handlePharmacySearch} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg">Search</button>
            </div>
            {noResults && <p className="text-xs text-gray-400 text-center py-2">No pharmacies found.</p>}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pharmacyOptions.map(pharm => (
                <div key={pharm.id} onClick={() => setSelectedPharmacy(pharm)} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selectedPharmacy?.id === pharm.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 ${selectedPharmacy?.id === pharm.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{pharm.name}</p>
                    <p className="text-xs text-gray-500">{pharm.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </EditCard>
        </div>

        <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={handleSendRx} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Send RX</button>
        </div>
      </div>
    </>
  );
}