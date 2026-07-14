import React from "react";

const DEFAULT_STEPS = ['Select', 'Detail', 'Review'];

export default function StepIndicator({ currentStep, steps = DEFAULT_STEPS }) {
  return (
    <div className="flex items-center gap-2 mt-1 flex-wrap">
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = num === currentStep;
        const isDone = num < currentStep;
        const filled = isActive || isDone;
        return (
          <span key={label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300 dark:text-gray-600 text-xs">→</span>}
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              filled
                ? 'bg-pink-500 text-white'
                : 'border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
            }`}>
              {num}
            </span>
            <span className={`text-sm font-medium ${
              isActive
                ? 'text-pink-500'
                : isDone
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-400 dark:text-gray-500'
            }`}>
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}