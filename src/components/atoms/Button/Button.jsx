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
    styles = "border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 bg-white dark:bg-gray-800";
  } else if (variant === "success") {
    styles = "border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 bg-white dark:bg-gray-800";
  } else if (variant === "primary") {
    styles = "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-gray-800";
  } else if (variant === "solid") {
    styles = "border-transparent bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 text-sm";
  } else if (variant === "ghost") {
    styles = "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent";
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