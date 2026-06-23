import React from "react";
import Select from "./Select";

export default {
  title: "Atoms/Select",
  component: Select,
};

export const Default = {
  args: {
    children: (
      <>
        <option value="">Select option...</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </>
    ),
  },
};
