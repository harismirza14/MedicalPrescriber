import { fn, expect, within, userEvent } from "storybook/test";
import ConfirmationModal from "./ConfirmationModal";

export default {
  title: "Molecules/ConfirmationModal",
  component: ConfirmationModal,
};

export const Default = {
  args: {
    isOpen: true,
    title: "Delete doctor?",
    message: "This will permanently remove Dr. Mohsin Khan's account. This cannot be undone.",
    onConfirm: fn(),
    onCancel: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Delete"));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

export const Loading = {
  args: {
    ...Default.args,
    loading: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Please wait...")).toBeDisabled();
  },
};

export const WithError = {
  args: {
    ...Default.args,
    error: "Failed to delete doctor.",
    onConfirm: fn(),
    onCancel: fn(),
  },
};