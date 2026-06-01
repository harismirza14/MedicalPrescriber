import MedicationActionDrawer from './MedicationActionDrawer';
import { useBodyScrollLock } from "../layouts/BodyScrollLock";
export default function ReContinueDrawer({ isOpen, onClose, medication, onConfirm }) {
  useBodyScrollLock(isOpen);
  return (
    <MedicationActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      medication={medication}
      onConfirm={onConfirm}
      title="Recontinue Medication"
      confirmLabel="Recontinue"
      confirmClassName="bg-green-600 hover:bg-green-700 text-white"
    />
  );
}