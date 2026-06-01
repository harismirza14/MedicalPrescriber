import MedicationActionDrawer from './MedicationActionDrawer';
import { useBodyScrollLock } from "../layouts/BodyScrollLock";

export default function DisContinueDrawer({ isOpen, onClose, medication, onConfirm }) {
   useBodyScrollLock(isOpen); 
  return (
    <MedicationActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      medication={medication}
      onConfirm={onConfirm}
      title="Discontinue Medication"
      confirmLabel="Discontinue"
      confirmClassName="bg-red-600 hover:bg-red-700 text-white"
    />
  );
}