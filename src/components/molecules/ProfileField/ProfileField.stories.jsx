import ProfileField from "./ProfileField";

/**
 * NOTE: The real ProfileField only ever displays a label + read-only value
 * (falling back to "N/A" when empty) — there's no edit-icon/input mode in
 * the actual implementation, so "Editable" from the original spec isn't
 * something this component supports.
 */
export default {
  title: "Molecules/ProfileField",
  component: ProfileField,
};

export const ReadOnly = {
  args: { label: "Full Name", value: "Muhammad Haris" },
};

export const EmptyValue = {
  args: { label: "Insurance", value: "" },
};