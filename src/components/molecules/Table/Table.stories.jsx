import { fn } from "storybook/test";
import  Table  from "./Table";

const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const columns = [
  { key: "name", label: "Name" },
  { key: "dob", label: "Age", render: (value) => calculateAge(value) },
  { key: "phone_number", label: "Contact" },
  { key: "gender", label: "Gender" },
  { key: "insurance", label: "Insurance" },
];

const mockPatients = [
  { patient_id: "P1", name: "Muhammad Haris", dob: "2003-06-15", phone_number: "0300-1234567", gender: "Male", insurance: "Aetna" },
  { patient_id: "P2", name: "Ali Rehman", dob: "2003-01-10", phone_number: "0300-7654321", gender: "Male", insurance: "Blue Cross" },
  { patient_id: "P4", name: "Maria Khan", dob: "1999-03-22", phone_number: "0300-5566778", gender: "Female", insurance: "UnitedHealth" },
  { patient_id: "P7", name: "Armaghan", dob: "2006-08-01", phone_number: "03495514501", gender: "Male", insurance: "N/A" },
  { patient_id: "P8", name: "Hammad Hassan", dob: "2025-01-01", phone_number: "03495514501", gender: "Male", insurance: "N/A" },
];

/**
 * NOTE: The real Table's loading state renders the plain text "Loading..."
 * inside the results area — there's no skeleton-row implementation, so this
 * story reflects that real text state.
 */
export default {
  title: "Molecules/Table",
  component: Table,
};

export const Default = {
  args: {
    data: mockPatients,
    columns,
    searchValue: "",
    onSearchChange: fn(),
    searchPlaceholder: "Search by name, contact or insurance...",
    onRowClick: fn(),
  },
};

export const Loading = {
  args: { ...Default.args, loading: true },
};

export const Empty = {
  args: { ...Default.args, data: [] },
};

export const WithPagination = {
  args: {
    ...Default.args,
    currentPage: 2,
    totalPages: 5,
    onPageChange: fn(),
  },
};