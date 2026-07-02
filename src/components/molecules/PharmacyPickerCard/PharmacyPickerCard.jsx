import React from "react";

export default function PharmacyPickerCard({ pharmacy, isSelected, onSelect }) {
  const is24Hours = pharmacy.hours?.toLowerCase().includes('24');
  return (
    <div 
      onClick={() => onSelect(pharmacy)} 
      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500 dark:bg-blue-900/30' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${
            isSelected ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600'
          }`}>
            {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{pharmacy.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pharmacy.address}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{pharmacy.phone}</p>
            {is24Hours && <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Open 24 hours</p>}
          </div>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
          is24Hours 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}>
          {pharmacy.hours || 'N/A'}
        </span>
      </div>
    </div>
  );
}