import MedicationActionDrawer from '../MedicationActionDrawer/MedicationActionDrawer';
import { useDispatch } from 'react-redux';
import { recontinuePrescription } from '../../../store/MedicationSlice';

export default function ReContinueDrawer({ isOpen, onClose, medication }) {
  const dispatch = useDispatch();
  const handleConfirm = (id, reason, date) => {
    dispatch(recontinuePrescription({ id, reason, date }));
    onClose();
  };
  return (
    <MedicationActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      medication={medication}
      onConfirm={handleConfirm}
      title="Recontinue Medication"
      confirmLabel="Recontinue"
      confirmClassName="bg-green-600 hover:bg-green-700 text-white"
    />
  );
}