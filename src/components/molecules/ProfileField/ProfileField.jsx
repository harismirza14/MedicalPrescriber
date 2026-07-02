import React from "react";
import Label from "../../atoms/Label/Label";

export default function ProfileField({ label, value }) {
  return (
    <div className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <Label className="mb-0.5">{label}</Label>
      <p className="text-sm text-gray-900 dark:text-gray-100">{value || "N/A"}</p>
    </div>
  );
}