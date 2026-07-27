import React, { useState, useEffect } from "react";

const SIZE_CLASSES = {
  sm: "w-9 h-9 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

const COLOR_CLASSES = {
  blue: "bg-blue-600",
  gray: "bg-gray-400",
  green: "bg-green-600",
  red: "bg-red-600",
  purple: "bg-purple-600",
};

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

export default function Avatar({ name, size = "md", color = "blue", src = null, className = "" }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [src]);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover ${SIZE_CLASSES[size]} ${className}`}
      />
    );
  }

  // Fallback to initials
  return (
    <div
      className={`rounded-full ${COLOR_CLASSES[color]} text-white flex items-center justify-center font-semibold flex-shrink-0 ${SIZE_CLASSES[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}