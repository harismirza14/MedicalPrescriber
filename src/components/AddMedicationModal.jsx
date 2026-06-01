import React, { useState } from 'react';
import ExternalRxDrawer from './ExternalRxDrawer';
// import { useBodyScrollLock } from "../layouts/BodyScrollLock";
export default function AddMedicationModal({ onClose, onAdd,isOpen, onOpenSendRx }) {
  // useBodyScrollLock(isOpen);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExternalRx, setShowExternalRx] = useState(false);

  const handleContinue = () => {
    if (!selectedOption) return;

    if (selectedOption === 'send') {
      onOpenSendRx(); // closes this modal + opens AddRX wizard (Medications.jsx handles it)
      return;
    }

    if (selectedOption === 'external') {
      setShowExternalRx(true);
    }
  };

  const handleExternalSubmit = (newMed) => {
    if (onAdd) onAdd(newMed);  // bubble up to Medications.jsx
    setShowExternalRx(false);
    onClose();
  };

  // If the external drawer is open, render it instead
  if (showExternalRx) {
    return (
      <ExternalRxDrawer
        isOpen={showExternalRx}
        onClose={() => {
          setShowExternalRx(false);
          onClose();
        }}
        onSubmit={handleExternalSubmit}
      />
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
        onClick={onClose}
      />

      {/* Drawer panel from right */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Add Medication</h2>
            <button
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              onClick={onClose}
            >
              &times;
            </button>
          </div>

          {/* Options */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">

              {/* Option 1 — Send RX */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  selectedOption === 'send'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedOption('send')}
              >
                <h3 className="font-semibold text-gray-900">Send a RX to a pharmacy</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Create and electronically send a new prescription directly to the patient's selected pharmacy.
                </p>
              </div>

              {/* Option 2 — External RX */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  selectedOption === 'external'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedOption('external')}
              >
                <h3 className="font-semibold text-gray-900">Record an external RX</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Document a medication that was prescribed outside of Confident for care coordination and record keeping purposes.
                </p>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6 flex justify-end gap-3">
            <button
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-md font-medium ${
                selectedOption
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleContinue}
              disabled={!selectedOption}
            >
              Continue
            </button>
          </div>

        </div>
      </div>
    </>
  );
}