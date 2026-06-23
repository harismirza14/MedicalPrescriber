import React from "react";

export default function StepIndicator({ currentStep }) {
  const steps = ['Select', 'Detail', 'Review'];
  return (
    <div className="flex items-center gap-2 mt-1">
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = num === currentStep;
        const isDone = num < currentStep;
        const filled = isActive || isDone;
        return (
          <span key={label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300 text-xs">→</span>}
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              filled ? 'bg-pink-500 text-white' : 'border border-gray-300 text-gray-400'
            }`}>
              {num}
            </span>
            <span className={`text-sm font-medium ${
              isActive ? 'text-pink-500' : isDone ? 'text-gray-700' : 'text-gray-400'
            }`}>
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
