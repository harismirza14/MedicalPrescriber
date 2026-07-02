import React from "react";

const SIZE_CLASSES = {
  sm: "w-9 h-9 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-14 h-14 text-lg",
};

const COLOR_CLASSES = {
  blue: "bg-blue-600",
  gray: "bg-gray-400",
};

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

export default function Avatar({ name, size = "md", color = "blue", className = "" }) {
  return (
    <div
      className={`rounded-full ${COLOR_CLASSES[color]} text-white flex items-center justify-center font-semibold flex-shrink-0 ${SIZE_CLASSES[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}