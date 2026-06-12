import React, { useState, useEffect } from 'react';

export default function MedicationActionDrawer({
  isOpen,
  onClose,
  medication,
  onConfirm,
  title,
  confirmLabel = 'Confirm',
  confirmClassName = 'bg-blue-600 hover:bg-blue-700 text-white',
}) {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [touched, setTouched] = useState({ reason: false, date: false });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDate('');
      setTouched({ reason: false, date: false });
      setIsSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showReasonError = (isSubmitted || touched.reason) && !reason.trim();
  const showDateError = (isSubmitted || touched.date) && !date.trim();

  const handleClose = () => onClose();

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (!reason.trim() || !date.trim()) return;

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    });

    onConfirm(medication.id, reason, formattedDate);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          <span className="font-medium text-gray-700">{medication?.name}</span>
        </p>

        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-semibold text-gray-700">Reason</label>
            {showReasonError && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, reason: true }))}
            placeholder="Enter reason…"
            className={`w-full border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 ${
              showReasonError
                ? 'border-red-500 focus:ring-red-300'
                : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-semibold text-gray-700">Date</label>
            {showDateError && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, date: true }))}
            className={`w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 ${
              showDateError
                ? 'border-red-500 focus:ring-red-300'
                : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
        </div>

        <div className="mt-auto">
          <button
            onClick={handleSubmit}
            className={`w-full py-2.5 rounded-md font-semibold text-sm transition-colors ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}