import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPrescription, updatePrescription, formatStatusLabel } from '../store/MedicationSlice';
import { fetchMedications, fetchPharmaciesByZip } from '../store/api';

const DOSE_OPTIONS = ['1 tablet', '2 tablets', '1mL', '2 capsules', '5 mL', '10 mL'];
const DEFAULT_ZIP = '22903';

function StepIndicator({ currentStep }) {
  const steps = ['Select', 'Detail', 'Review'];
  return (
    <div className="flex items-center gap-2 mt-1">
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = num === currentStep;
        const isDone = num < currentStep;
        const filled = isActive || isDone;
        return (
          <span key={label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300 text-xs">→</span>}
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              filled ? 'bg-pink-500 text-white' : 'border border-gray-300 text-gray-400'
            }`}>
              {num}
            </span>
            <span className={`text-sm font-medium ${
              isActive ? 'text-pink-500' : isDone ? 'text-gray-700' : 'text-gray-400'
            }`}>
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function StepSelect({ selectedMed, onSelect, onCancel, onContinue, medicationNames }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() =>
    medicationNames.filter(m => m && m.toLowerCase().includes(search.toLowerCase())),
    [search, medicationNames]
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-6 pb-3">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-6 space-y-1">
        {filtered.map(med => (
          <label
            key={med}
            onClick={() => onSelect(med)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer border transition-colors ${
              selectedMed === med ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:bg-gray-50'
            }`}
          >
            <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
              selectedMed === med ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'
            }`}>
              {selectedMed === med && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 5l2.5 2.5 4.5-4.5" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-800">{med}</span>
          </label>
        ))}
        {filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No medications found</p>}
      </div>
      <div className="px-6 pt-4 pb-5 border-t border-gray-100 flex justify-between mt-auto">
        <button onClick={onCancel} className="text-sm font-medium text-blue-500 hover:text-blue-600">Cancel</button>
        <button
          onClick={onContinue}
          disabled={!selectedMed}
          className={`px-5 py-2 rounded-md text-sm font-medium ${
            selectedMed ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function StepDetail({ selectedMed, formData, setFormData, onBack, onContinue, isEditMode, medicationNames }) {
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const [drugSearch, setDrugSearch] = useState(formData.drug || selectedMed || '');
  const [showDrugList, setShowDrugList] = useState(false);

  useEffect(() => {
    setDrugSearch(formData.drug || selectedMed || '');
  }, [formData.drug, selectedMed]);

  const filteredDrugs = useMemo(() => {
    if (!drugSearch.trim()) return [];
    return medicationNames.filter(m => m.toLowerCase().includes(drugSearch.toLowerCase())).slice(0, 8);
  }, [drugSearch, medicationNames]);

  const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-6 pb-3 space-y-4">
        <div className="relative">
          <label className={labelCls}>Drug</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a drug"
              value={drugSearch}
              onChange={(e) => {
                setDrugSearch(e.target.value);
                handleChange('drug', e.target.value);
                setShowDrugList(true);
              }}
              onFocus={() => setShowDrugList(true)}
              onBlur={() => setTimeout(() => setShowDrugList(false), 150)}
              className={`${inputCls} pr-8`}
            />
            {drugSearch && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setDrugSearch('');
                  handleChange('drug', '');
                  setShowDrugList(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base"
              >
                ×
              </button>
            )}
          </div>
          {showDrugList && filteredDrugs.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
              {filteredDrugs.map(drug => (
                <li
                  key={drug}
                  onMouseDown={() => {
                    setDrugSearch(drug);
                    handleChange('drug', drug);
                    setShowDrugList(false);
                  }}
                  className="px-3 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer"
                >
                  {drug}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Quantity</label><input type="text" placeholder="Enter Quantity" value={formData.quantity || ''} onChange={e => handleChange('quantity', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Dose</label><select value={formData.dose || ''} onChange={e => handleChange('dose', e.target.value)} className={inputCls}><option value="">Select item</option>{DOSE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Frequency</label><input type="text" placeholder="Enter or Select Frequency" value={formData.frequency || ''} onChange={e => handleChange('frequency', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Duration</label><div className="relative"><input type="text" placeholder="Enter Duration" value={formData.duration || ''} onChange={e => handleChange('duration', e.target.value)} className={`${inputCls} pr-12`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Days</span></div></div>
        </div>

        <div><label className={labelCls}>Sig</label><input type="text" placeholder="Enter Sig (Directions)" value={formData.sig || ''} onChange={e => handleChange('sig', e.target.value)} className={inputCls} /></div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Dispense Amount</label><input type="text" placeholder="Enter Dispense Amount" value={formData.dispenseAmount || ''} onChange={e => handleChange('dispenseAmount', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Refills</label><select value={formData.refills ?? 0} onChange={e => handleChange('refills', Number(e.target.value))} className={inputCls}>{[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
        </div>

        <div><label className={labelCls}>Associated Diagnoses</label><input type="text" value={formData.diagnoses || ''} onChange={e => handleChange('diagnoses', e.target.value)} className={inputCls} /></div>
      </div>
      <div className="px-6 pt-4 pb-5 border-t border-gray-100 flex justify-between mt-auto">
        <button onClick={onBack} className="text-sm font-medium text-blue-500 hover:text-blue-600">{isEditMode ? 'Cancel' : 'Back'}</button>
        <button onClick={onContinue} disabled={!drugSearch.trim()} className={`px-5 py-2 rounded-md text-sm font-medium ${drugSearch.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Continue</button>
      </div>
    </div>
  );
}

function PharmacyPickerCard({ pharmacy, isSelected, onSelect }) {
  const is24Hours = pharmacy.hours?.toLowerCase().includes('24');
  return (
    <div onClick={() => onSelect(pharmacy)} className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${isSelected ? 'border-blue-600' : 'border-gray-300'}`}>
            {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-800 truncate">{pharmacy.name}</p>
            <p className="text-xs text-gray-500 mt-1">{pharmacy.address}</p>
            <p className="text-xs text-gray-400 mt-0.5">{pharmacy.phone}</p>
            {is24Hours && <p className="text-xs text-green-600 font-medium mt-1">Open 24 hours</p>}
          </div>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${is24Hours ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{pharmacy.hours || 'N/A'}</span>
      </div>
    </div>
  );
}

function StepReview({ selectedMed, formData, onBack, onSendRx, initialPharmacy, isIsolatedRoute, loading }) {
  const [zipInput, setZipInput] = useState(DEFAULT_ZIP);
  const [activeZip, setActiveZip] = useState(DEFAULT_ZIP);
  const [pharmacies, setPharmacies] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  useEffect(() => {
    if (activeZip) {
      setIsSearching(true);
      fetchPharmaciesByZip(activeZip)
        .then(results => {
          setPharmacies(results);
          setNoResults(results.length === 0);
          const matched = initialPharmacy ? results.find(p => p.name === initialPharmacy) : null;
          setSelectedPharmacy(matched || (results.length ? results[0] : null));
        })
        .catch(() => { setPharmacies([]); setNoResults(true); })
        .finally(() => setIsSearching(false));
    }
  }, [activeZip, initialPharmacy]);

  const handleZipSearch = () => {
    const zip = zipInput.trim();
    if (zip) setActiveZip(zip);
  };

  const formattedInstructions = useMemo(() => {
    const doseText = formData.dose || '1 Tablet';
    const freqText = formData.frequency ? `at ${formData.frequency}` : 'once a day';
    const durationText = formData.duration ? `Duration: ${formData.duration} days` : 'Duration: 30 days';
    const refillsText = `Refills: ${formData.refills ?? 0}`;
    return `${formData.sig || `Take ${doseText} ${freqText}`}. ${durationText}. ${refillsText}.`;
  }, [formData]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5">
        <div className="border border-blue-500 bg-white rounded-xl p-4 flex items-start gap-4 shadow-sm relative">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="min-w-0 flex-1 pr-14">
            <h4 className="font-bold text-sm text-gray-900 truncate">{formData.drug || selectedMed || 'Medication'}</h4>
            <p className="text-xs text-gray-500 mt-1">{formattedInstructions}</p>
          </div>
          {!isIsolatedRoute && (
            <button type="button" onClick={onBack} className="absolute right-4 top-4 text-xs font-bold text-blue-600 hover:text-blue-700">Change</button>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Choose Pharmacy</h3>
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Search for pharmacy here" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="Zip code" value={zipInput} onChange={e => setZipInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleZipSearch()} className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center" />
          </div>
          {isSearching && <p className="text-xs text-gray-400 text-center py-2">Loading pharmacies...</p>}
          {!isSearching && pharmacies.length > 0 && <p className="text-xs text-gray-400 mb-3">Showing pharmacies near <span className="font-semibold">{activeZip}</span></p>}
          {!isSearching && noResults && <div className="text-center py-8 text-sm text-gray-400 border border-dashed rounded-xl">No pharmacies found for {activeZip}</div>}
          <div className="space-y-2.5">
            {pharmacies.map(pharmacy => (
              <PharmacyPickerCard key={pharmacy.id} pharmacy={pharmacy} isSelected={selectedPharmacy?.id === pharmacy.id} onSelect={setSelectedPharmacy} />
            ))}
          </div>
        </div>
      </div>
      <div className="px-6 pt-4 pb-5 border-t border-gray-100 flex justify-between bg-white mt-auto">
        
        <button onClick={onBack} disabled={loading} className="text-sm font-bold text-blue-600 hover:text-blue-700 disabled:text-gray-300">Cancel</button>
         <button onClick={() => onSendRx(selectedPharmacy)} disabled={!selectedPharmacy || loading} className={`px-6 py-2.5 rounded-lg text-sm font-semibold ${selectedPharmacy && !loading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
          {loading ? 'Saving...' : (isIsolatedRoute ? 'Update Pharmacy' : 'Send RX')}
        </button>
      </div>
    </div>
  );
}

export default function AddRX({
  isOpen,
  onClose,
  initialData = null,
  onIsolatedStepSave,
  patientId,
  prescriberId,
}) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.medications);
  const isEditMode = !!initialData;

  const [step, setStep] = useState(1);
  const [selectedMed, setSelectedMed] = useState(null);
  const [formData, setFormData] = useState({});
  const [medicationNames, setMedicationNames] = useState([]);
  const [medicationList, setMedicationList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingLists(true);
      fetchMedications()
        .then(data => {
          setMedicationList(data);
          setMedicationNames(data.map(m => m.name).filter(Boolean));
        })
        .finally(() => setLoadingLists(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSelectedMed(initialData.drug);
        setFormData({
          drug: initialData.drug || '',
          dose: initialData.dosage || '',
          sig: initialData.instructions || '',
          quantity: initialData.quantity || '',
          frequency: initialData.frequency || '',
          duration: initialData.duration || '',
          dispenseAmount: initialData.dispenseAmount || '',
          diagnoses: initialData.diagnoses || '',
          refills: initialData.refills ?? 0,
          pharmacy: initialData.pharmacy || '',
        });
        setStep(initialData.startAtStep || 2);
      } else {
        setSelectedMed(null);
        setFormData({});
        setStep(1);
      }
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setStep(1);
    setSelectedMed(null);
    setFormData({});
    onClose();
  };

  const handleSendRx = async (pharmacy) => {
    if (!patientId) { alert('Patient ID missing.'); return; }
    if (!pharmacy?.id) { alert('Please select a pharmacy.'); return; }
    if (!prescriberId) { alert('Prescriber ID missing. Please log in again.'); return; }

    const payload = {
      patient_id: patientId,
      med_name: formData.drug || selectedMed,
      prescriber_id: prescriberId,
      pharmacy_id: pharmacy.id,
      dosage: formData.dose || '',
      form: 'Tablet',
      instructions: formData.sig || '',
      status: 'success',
      status_label: formatStatusLabel('Sent'),
      patient_note: formData.patientNote || '',
    };

    try {
      if (isEditMode && initialData?.prescription_id) {
        await dispatch(updatePrescription({
          id: initialData.prescription_id,
          updates: {
            dosage: payload.dosage,
            instructions: payload.instructions,
            patient_note: payload.patient_note,
          },
        })).unwrap();
      } else {
        await dispatch(addPrescription(payload)).unwrap();
      }
      
      handleClose();
    } catch {
    }
  };

  const handleStepContinue = () => {
    if (initialData?.isIsolatedRoute) {
      if (onIsolatedStepSave) {
        const drugName = formData.drug || selectedMed;
        const selectedMedObj = medicationList.find(m => m.name === drugName);
        onIsolatedStepSave({
          med_id: selectedMedObj?.med_id,
          name: drugName,
          dosage: formData.dose || '',
          instructions: formData.sig || '',
          quantity: formData.quantity || '',
          frequency: formData.frequency || '',
          duration: formData.duration || '',
          dispenseAmount: formData.dispenseAmount || '',
          diagnoses: formData.diagnoses || '',
          refills: formData.refills ?? 0,
        });
      }
    } else {
      setStep(3);
    }
  };

  const handlePharmacyIsolatedSave = (selectedPharmacy) => {
    if (initialData?.isIsolatedRoute) {
      onIsolatedStepSave?.({
        pharmacy: selectedPharmacy.name,
        pharmacy_id: selectedPharmacy.id,
        pharmacyAddress: selectedPharmacy.address || '',
      });
    } else {
      handleSendRx(selectedPharmacy);
    }
  };

  const stepSubtitle = { 1: 'Step 1 - select medication', 2: 'Step 2 - medication details', 3: 'Step 3 - review' }[step];

  if (!isOpen) return null;
  if (loadingLists && step === 1) return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl flex items-center justify-center">
      <p className="text-gray-500">Loading medications...</p>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={() => !loading && handleClose()} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{isEditMode ? 'Edit Medication' : 'New Medication'}</h2>
                {(!initialData?.isIsolatedRoute && !isEditMode) || step === 2 ? (
                  <>
                    <p className="text-xs text-gray-400 mt-0.5">{stepSubtitle}</p>
                    <StepIndicator currentStep={step} />
                  </>
                ) : null}
              </div>
              {/* CHANGED: disabled when loading (global) */}
              <button onClick={handleClose} disabled={loading} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex flex-col flex-1 min-h-0 pt-4 overflow-hidden">
            {step === 1 && (
              <StepSelect
                selectedMed={selectedMed}
                onSelect={setSelectedMed}
                onCancel={handleClose}
                onContinue={() => { setFormData(prev => ({ ...prev, drug: selectedMed })); setStep(2); }}
                medicationNames={medicationNames}
              />
            )}
            {step === 2 && (
              <StepDetail
                selectedMed={selectedMed}
                formData={formData}
                setFormData={setFormData}
                onBack={() => (initialData?.isIsolatedRoute || isEditMode ? handleClose() : setStep(1))}
                onContinue={handleStepContinue}
                isEditMode={isEditMode}
                medicationNames={medicationNames}
              />
            )}
            {step === 3 && (
              <StepReview
                selectedMed={selectedMed}
                formData={formData}
                onBack={() => (initialData?.isIsolatedRoute ? handleClose() : setStep(2))}
                onSendRx={handlePharmacyIsolatedSave}
                initialPharmacy={initialData?.pharmacy ?? null}
                isIsolatedRoute={initialData?.isIsolatedRoute}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}