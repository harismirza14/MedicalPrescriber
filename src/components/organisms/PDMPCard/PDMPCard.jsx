import React from "react";

export default function PDMPCard({ pdmp }) {
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
          Virginia PDMP Check
        </h2>
        <button
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline bg-transparent border-none p-0 cursor-pointer shrink-0 ml-2"
          onClick={() => console.log("Check PDMP clicked")}
        >
          Check PDMP
        </button>
      </div>

      {/* Summary */}
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
        {pdmp?.summary || "No PDMP summary available."}
      </p>

      {/* Footer */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Checked on {formatDate(pdmp?.lastChecked)}
      </p>
    </div>
  );
}