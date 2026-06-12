import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchPharmaciesByZip } from '../store/api';

export default function UpdateMedicationDrawer({
  isOpen,
  onClose,
  med,
  patient,
  onSave,
  onChangeMedication,
  onChangePharmacy,
}) {
  if (!isOpen || !med) return null;
  const { loading } = useSelector((state) => state.medications);

  const [showPharmacySelector, setShowPharmacySelector] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [loadingPharm, setLoadingPharm] = useState(false);
  const [zipInput, setZipInput] = useState('');
  const [activeZip, setActiveZip] = useState('');
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [noResults, setNoResults] = useState(false);

  const getZipFromAddress = (address) => {
    if (!address) return '22903';
    const match = address.match(/\b\d{5}\b/);
    return match ? match[0] : '22903';
  };

  useEffect(() => {
    if (showPharmacySelector && patient?.address) {
      const defaultZip = getZipFromAddress(patient.address);
      setZipInput(defaultZip);
      setActiveZip(defaultZip);
    } else {
      setPharmacySearch('');
      setZipInput('');
      setActiveZip('');
      setSelectedPharmacy(null);
    }
  }, [showPharmacySelector, patient?.address]);

  useEffect(() => {
    if (showPharmacySelector && activeZip) {
      setLoadingPharm(true);
      fetchPharmaciesByZip(activeZip)
        .then(results => {
          setPharmacies(results);
          setNoResults(results.length === 0);
          const matched = results.find(p => p.name === med.pharmacy);
          setSelectedPharmacy(matched || (results.length ? results[0] : null));
        })
        .catch(() => {
          setPharmacies([]);
          setNoResults(true);
        })
        .finally(() => setLoadingPharm(false));
    }
  }, [showPharmacySelector, activeZip, med.pharmacy]);

  const filteredPharmacies = useMemo(() => {
    if (!pharmacySearch.trim()) return pharmacies;
    const searchLower = pharmacySearch.toLowerCase();
    return pharmacies.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      (p.address && p.address.toLowerCase().includes(searchLower))
    );
  }, [pharmacies, pharmacySearch]);

  const handleZipSearch = () => {
    const zip = zipInput.trim();
    if (zip) setActiveZip(zip);
  };

  const handleSelectPharmacy = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    onChangePharmacy?.(pharmacy);
    setShowPharmacySelector(false);
  };

  const currentPharmacyName = med.pharmacy || "No pharmacy selected";
  const currentPharmacyAddress = med.pharmacyAddress || "Click change to select a filling branch";
  const medName = med.name || "Unknown Medication";

  const medInstructions = useMemo(() => {
    if (med.instructions) return med.instructions;
    const parts = [med.dosage, med.form].filter(Boolean);
    if (med.type) parts.push(`· ${med.type}`);
    return parts.join(" ");
  }, [med]);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={() => !loading && onClose()} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-50 shadow-2xl flex flex-col border-l border-gray-200">
        <div className="px-6 py-5 bg-white border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Update Medication</h2>
          <button onClick={onClose} disabled={loading} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <div className="border border-gray-200 bg-white rounded-xl p-4 flex items-start gap-4 shadow-sm relative">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <svg className="w-6 h-6 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1 pr-16">
              <h4 className="font-bold text-base text-gray-900">{medName}</h4>
              <p className="text-xs text-gray-500 mt-1">{medInstructions}</p>
            </div>
            <button
              onClick={onChangeMedication}
              className="absolute right-4 top-4 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Change
            </button>
          </div>

          <div className="border border-gray-200 bg-white rounded-xl p-4 shadow-sm relative">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1 pr-16">
                <h4 className="font-bold text-base text-gray-900 truncate">{currentPharmacyName}</h4>
                <p className="text-xs text-gray-500 mt-1">{currentPharmacyAddress}</p>
              </div>
              <button
                onClick={() => setShowPharmacySelector(!showPharmacySelector)}
                className="absolute right-4 top-4 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Change
              </button>
            </div>

            {showPharmacySelector && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Search pharmacy by name"
                    value={pharmacySearch}
                    onChange={(e) => setPharmacySearch(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="w-28">
                    <input
                      type="text"
                      placeholder="Zip code"
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleZipSearch()}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center"
                    />
                  </div>
                  <button
                    onClick={handleZipSearch}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Go
                  </button>
                </div>

                {loadingPharm && <p className="text-xs text-gray-400 text-center py-4">Loading pharmacies...</p>}
                {!loadingPharm && noResults && (
                  <div className="text-center py-6 text-sm text-gray-400 border border-dashed rounded-xl">
                    No pharmacies found for zip code "{activeZip}"
                  </div>
                )}
                {!loadingPharm && !noResults && filteredPharmacies.length > 0 && (
                  <>
                    <p className="text-xs text-gray-400 mb-2">Showing pharmacies near <strong>{activeZip}</strong></p>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {filteredPharmacies.map(pharmacy => {
                        const is24Hours = pharmacy.hours?.toLowerCase().includes('24');
                        const isSelected = selectedPharmacy?.id === pharmacy.id;
                        return (
                          <div
                            key={pharmacy.id}
                            onClick={() => handleSelectPharmacy(pharmacy)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${isSelected ? 'border-blue-600' : 'border-gray-300'}`}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600 mx-auto mt-0.5" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-gray-800 truncate">{pharmacy.name}</p>
                                  <p className="text-xs text-gray-500 mt-1">{pharmacy.address}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{pharmacy.phone}</p>
                                  {is24Hours && <p className="text-xs text-green-600 font-medium mt-1">Open 24 hours</p>}
                                </div>
                              </div>
                              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                is24Hours ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {pharmacy.hours || 'N/A'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between bg-white">
          <button onClick={onClose} disabled={loading} className="text-sm font-bold text-gray-500 hover:text-gray-700 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : 'Update Medication'}
          </button>
        </div>
      </div>
    </>
  );
}