import React, { useState, useEffect } from 'react';
//  import { useBodyScrollLock } from "../layouts/BodyScrollLock";

export default function ExternalRxDrawer({ isOpen, onClose, onSubmit, initialData = null }) {
  //  useBodyScrollLock(isOpen); 
  const [selectedDrug, setSelectedDrug] = useState('');
  const [drugInfo, setDrugInfo] = useState('');
  const [externalPrescriber, setExternalPrescriber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSelectedDrug(initialData.drug || '');
        setDrugInfo(initialData.instructions || '');
        setExternalPrescriber(initialData.externalPrescriber || '');
      } else {
        setSelectedDrug('');
        setDrugInfo('');
        setExternalPrescriber('');
      }
      setSubmitted(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    setSubmitted(true);
    
    // Only proceed if drug name is not just whitespace
    if (!selectedDrug.trim()) return;

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
      statusLabel: initialData?.statusLabel ?? `Recorded ${dateStr} at ${timeStr}`,
      prescriber: null,
      pharmacy: null,
      externalPrescriber: externalPrescriber || 'External Prescriber',
      patientNote: initialData?.patientNote ?? null,
      discontinuedOn: initialData?.discontinuedOn ?? null,
      discontinueReason: initialData?.discontinueReason ?? null,
    };

    onSubmit(newMed);
    handleClose();
  };

  const handleClose = () => {
    setSelectedDrug('');
    setDrugInfo('');
    setExternalPrescriber('');
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  // Error condition: show red styles/text if user submitted while field was empty
  const hasError = submitted && !selectedDrug.trim();

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

          {/* Drug Name - Manual Entry */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Drug Name</label>
              {hasError && (
                <span className="text-xs font-medium text-red-500">Required</span>
              )}
            </div>

            <input
              type="text"
              placeholder="Enter medication name"
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                hasError 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
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