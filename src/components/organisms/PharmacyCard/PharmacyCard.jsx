import React from "react";
import { MapPin, Phone, Clock } from 'lucide-react';

export default function PharmacyCard({ pharmacy, onEdit }) {
  return (
    <div className="bg-blue-50 p-4 h-full rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-black">
          Preferred pharmacy
        </h2>
        <button
          className="text-xs font-medium text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer shrink-0 ml-2"
          onClick={onEdit}
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
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-tight">
              {pharmacy.address}
            </p>
          </div>
        )}

        {pharmacy?.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <p className="text-xs text-gray-600">{pharmacy.phone}</p>
          </div>
        )}

        {pharmacy?.hours && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
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