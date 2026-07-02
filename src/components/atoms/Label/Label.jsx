import React from "react";

export default function Label({ children, className = "", ...props }) {
  return (
    <label className={`block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ${className}`} {...props}>
      {children}
    </label>
  );
}