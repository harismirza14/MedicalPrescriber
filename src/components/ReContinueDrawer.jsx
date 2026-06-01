import MedicationActionDrawer from './MedicationActionDrawer';

export default function ReContinueDrawer({ isOpen, onClose, medication, onConfirm }) {
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