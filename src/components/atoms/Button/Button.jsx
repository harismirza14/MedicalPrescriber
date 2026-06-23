import React from "react";

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}) {
  const base =
    "text-[11px] font-semibold px-3 py-1 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  let styles = "";
  if (variant === "danger") {
    styles = "border-red-600 text-red-600 hover:bg-red-50 bg-white";
  } else if (variant === "success") {
    styles = "border-green-600 text-green-600 hover:bg-green-50 bg-white";
  } else if (variant === "primary") {
    styles = "border-blue-600 text-blue-600 hover:bg-blue-50 bg-white";
  } else if (variant === "solid") {
    // For primary solid buttons
    styles = "border-transparent bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 text-sm";
  } else if (variant === "ghost") {
    styles = "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 bg-transparent";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
