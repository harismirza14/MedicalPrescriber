import React from "react";

export default function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${className}`}
      {...props}
    />
  );
}