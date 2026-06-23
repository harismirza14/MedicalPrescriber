import React from "react";
import Button from "./Button";

export default {
  title: "Atoms/Button",
  component: Button,
};

export const PrimaryOutline = {
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const SuccessOutline = {
  args: {
    children: "Success Button",
    variant: "success",
  },
};

export const DangerOutline = {
  args: {
    children: "Danger Button",
    variant: "danger",
  },
};

export const Solid = {
  args: {
    children: "Solid Button",
    variant: "solid",
  },
};

export const Disabled = {
  args: {
    children: "Disabled Button",
    variant: "primary",
    disabled: true,
  },
};
