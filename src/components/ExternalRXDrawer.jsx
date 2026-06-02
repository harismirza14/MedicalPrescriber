import React, { useState, useMemo, useEffect } from 'react';
import allData from '../data/medications.json';

export default function ExternalRxDrawer({ isOpen, onClose, onSubmit, initialData }) {
  const [drugSearch, setDrugSearch] = useState('');
  const [selectedDrug, setSelectedDrug] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [drugInfo, setDrugInfo] = useState('');
  const [externalPrescriber, setExternalPrescriber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const medicationList = allData.medicationList || [];

  useEffect(() => {
    if (isOpen && initialData) {
      setSelectedDrug(initialData.drug || '');
      setDrugSearch(initialData.drug || '');
      setDrugInfo(initialData.instructions || '');
      setExternalPrescriber(initialData.externalPrescriber || '');
      setSubmitted(false);
    } else if (isOpen) {
      setDrugSearch('');
      setSelectedDrug('');
      setDrugInfo('');
      setExternalPrescriber('');
      setSubmitted(false);
    }
  }, [isOpen, initialData]);

  const suggestions = useMemo(() => {
    if (!drugSearch.trim()) return [];
    return medicationList.filter(m =>
      m.toLowerCase().includes(drugSearch.toLowerCase())
    );
  }, [drugSearch]);

  const handleSelectDrug = (med) => {
    setSelectedDrug(med);
    setDrugSearch(med);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!selectedDrug) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const newMed = {
      id: initialData?.id ?? `ext-${Date.now()}`,
      name: selectedDrug,
      dosage: 'Unknown',
      form: null,
      type: 'external',
      instructions: drugInfo || null,
      status: 'external',
      statusLabel: `Recorded ${dateStr} at ${timeStr}`,
      prescriber: null,
      pharmacy: null,
      externalPrescriber: externalPrescriber || 'External Prescriber',
      patientNote: null,
      discontinuedOn: null,
      discontinueReason: null,
    };

    onSubmit(newMed);
    handleClose();
  };

  const handleClose = () => {
    setDrugSearch('');
    setSelectedDrug('');
    setDrugInfo('');
    setExternalPrescriber('');
    setSubmitted(false);
    setShowSuggestions(false);
    onClose();
  };

  if (!isOpen) return null;

  const isDrugMissing = submitted && !selectedDrug;

  const inputCls = (hasError) =>
    `w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
      hasError
        ? 'border-red-400 focus:ring-red-400'
        : 'border-gray-300 focus:ring-blue-500'
    }`;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{initialData ? 'Edit External RX' : 'External RX'}</h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Drug Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Drug Name</label>
              {isDrugMissing && (
                <span className="text-xs font-medium text-red-500">Required</span>
              )}
              {!isDrugMissing && (
                <span className="text-xs font-medium text-red-400">Required</span>
              )}
            </div>

            {/* Search input with dropdown */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a medication"
                value={drugSearch}
                onChange={e => {
                  setDrugSearch(e.target.value);
                  setSelectedDrug('');
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className={inputCls(isDrugMissing)}
              />

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {suggestions.map(med => (
                    <div
                      key={med}
                      onMouseDown={() => handleSelectDrug(med)}
                      className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                        selectedDrug === med
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {med}
                    </div>
                  ))}
                </div>
              )}

              {/* No results */}
              {showSuggestions && drugSearch.trim() && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 px-3 py-3 text-sm text-gray-400">
                  No medications found
                </div>
              )}
            </div>
          </div>

          {/* Drug Information */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Drug Information
            </label>
            <textarea
              rows={3}
              placeholder="Record dosage, frequency, and other sig information"
              value={drugInfo}
              onChange={e => setDrugInfo(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Name of External Prescriber */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Name of External Prescriber
            </label>
            <input
              type="text"
              value={externalPrescriber}
              onChange={e => setExternalPrescriber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>

      </div>
    </>
  );
}