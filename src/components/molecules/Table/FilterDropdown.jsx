import Select from "../../atoms/Select/Select";

export default function FilterDropdown({
  label,
  value,
  options = [],
  onChange,
  className = "",
}) {
  return (
    <Select value={value} onChange={onChange} className={className}>
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}