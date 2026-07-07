import { fn } from "storybook/test";
import SearchInput from "./SearchInput";

export default {
  title: "Molecules/Table/SearchInput",
  component: SearchInput,
};

export const Default = {
  args: { value: "", onChange: fn(), placeholder: "Search by name, contact or insurance..." },
};

export const WithValue = {
  args: { value: "Haris", onChange: fn() },
};