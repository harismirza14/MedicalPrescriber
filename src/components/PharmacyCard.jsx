// PharmacyCard.jsx
import React from "react";

// Small icon helpers to avoid extra dependencies
function LocationIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd"
        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd" />
    </svg>
  );
}

export default function PharmacyCard({ pharmacy }) {
  return (
    <div className="bg-blue-50 p-4 h-full rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-black">
          Preferred pharmacy
        </h2>
        <button
          className="text-xs font-medium text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer shrink-0 ml-2"
          onClick={() => console.log("Edit Pharmacy clicked")}
        >
          Edit
        </button>
      </div>

      {/* Pharmacy name as blue link */}
      <p className="text-sm font-semibold text-black mb-1">
        {pharmacy?.name}
      </p>

      {/* Detail rows with icons */}
      <div className="flex flex-col gap-1">
        {pharmacy?.address && (
          <div className="flex items-start gap-1.5">
            <LocationIcon />
            <p className="text-xs text-gray-600 leading-tight">
              {pharmacy.address}
            </p>
          </div>
        )}

        {pharmacy?.phone && (
          <div className="flex items-center gap-1.5">
            <PhoneIcon />
            <p className="text-xs text-gray-600">{pharmacy.phone}</p>
          </div>
        )}

        {pharmacy?.hours && (
          <div className="flex items-center gap-1.5">
            <ClockIcon />
            <p className="text-xs text-gray-600">{pharmacy.hours}</p>
          </div>
        )}

        {pharmacy?.controlledSubstances && (
          <div className="flex items-center gap-1.5">
            {/* Green dot */}
            <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            </span>
            <p className="text-xs text-gray-600">Controlled substances available</p>
          </div>
        )}
      </div>
    </div>
  );
}