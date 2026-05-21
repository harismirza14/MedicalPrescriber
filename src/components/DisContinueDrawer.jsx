import React, { useState } from 'react';

export default function DisContinueDrawer({ isOpen, onClose, medication, onConfirm }) {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState({ reason: false, date: false });

  if (!isOpen) return null;

  const handleSubmit = () => {
    const newErrors = {
      reason: !reason.trim(),
      date: !date.trim(),
    };
    setErrors(newErrors);
    if (newErrors.reason || newErrors.date) return;

    // Format date as "MM/DD/YY" (e.g., 12/1/25)
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    });
    onConfirm(medication.id, reason, formattedDate);
    onClose();
    setReason('');
    setDate('');
    setErrors({ reason: false, date: false });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Drawer from right */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Discontinue Medication</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Reason field */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="block text-sm font-semibold text-gray-700">Reason for discontinuation</label>
              <span className="text-red-500 text-xs">Required</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Record your reason for discontinuing the medication here"
              className={`w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">Reason is required</p>}
          </div>

          {/* Date field */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="block text-sm font-semibold text-gray-700">Date of discontinuation</label>
              <span className="text-red-500 text-xs">Required</span>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">Date is required</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="border-t p-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">
            Continue
          </button>
        </div>
      </div>
    </>
  );
}