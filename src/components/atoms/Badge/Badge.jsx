import React from "react";

export default function Badge({ status }) {
  const map = {
    success: { label: "Active", className: "bg-green-700 text-white dark:bg-green-800" },
    failed: { label: "Active", className: "bg-green-700 text-white dark:bg-green-800" },
    discontinued: { label: "Discontinued", className: "bg-red-700 text-white dark:bg-red-800" },
    external: {
      label: "External Active",
      className: "bg-green-700 text-white dark:bg-green-800",
    },
  };
  const cfg = map[status] || {
    label: status || "Unknown",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}