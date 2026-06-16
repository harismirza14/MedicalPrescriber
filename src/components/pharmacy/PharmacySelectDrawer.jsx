import React, { useState, useEffect } from "react";
import { fetchPharmaciesByZip } from "../../store/api";

export default function PharmacySelectDrawer({
  isOpen,
  onClose,
  onSelect,
  zipCode,
  currentPharmacy,
}) {
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !zipCode) return;

    setLoading(true);
    fetchPharmaciesByZip(zipCode)
      .then((data) => {
        setPharmacies(data);
        setSelectedId(currentPharmacy?.id || null);
      })
      .finally(() => setLoading(false));
  }, [isOpen, zipCode, currentPharmacy]);

  if (!isOpen) return null;

  const handleSelect = () => {
    const selected = pharmacies.find((p) => p.id === selectedId);
    if (selected) onSelect(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">Select a Pharmacy</h3>
        {loading && <p className="text-center py-4">Loading pharmacies...</p>}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {pharmacies.map((ph) => (
            <label
              key={ph.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                selectedId === ph.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => setSelectedId(ph.id)}
            >
              <input
                type="radio"
                name="pharmacy"
                checked={selectedId === ph.id}
                onChange={() => {}}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-sm">{ph.name}</p>
                <p className="text-xs text-gray-500">{ph.address}</p>
                <p className="text-xs text-gray-400">
                  {ph.phone} • {ph.hours}
                </p>
              </div>
            </label>
          ))}
          {!loading && pharmacies.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No pharmacies found for zip {zipCode}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedId}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:bg-gray-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
