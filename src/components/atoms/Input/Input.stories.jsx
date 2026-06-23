import React from "react";
import Input from "./Input";

export default {
  title: "Atoms/Input",
  component: Input,
};

export const Default = {
  args: {
    placeholder: "Enter value...",
  },
};

export const WithValue = {
  args: {
    value: "Some typed value",
    readOnly: true,
  },
};

export const NumberInput = {
  args: {
    type: "number",
    placeholder: "0",
  },
};
