import React from "react";
import Badge from "./Badge";

export default {
  title: "Atoms/Badge",
  component: Badge,
};

export const Active = {
  args: { status: "success" },
};

export const Discontinued = {
  args: { status: "discontinued" },
};

export const External = {
  args: { status: "external" },
};

export const Unknown = {
  args: { status: "pending" },
};
