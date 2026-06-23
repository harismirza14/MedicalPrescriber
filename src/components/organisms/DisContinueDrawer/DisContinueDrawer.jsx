import MedicationActionDrawer from '../MedicationActionDrawer/MedicationActionDrawer';
import {useDispatch} from 'react-redux';
import { discontinuePrescription } from '../../../store/MedicationSlice';

export default function DisContinueDrawer({ isOpen, onClose, medication}) {
  const dispatch = useDispatch();
  const handleConfirm = (id, reason, date) => {
    dispatch(discontinuePrescription({ id, reason, date }));
    onClose();
  }
  return (
    <MedicationActionDrawer
      isOpen={isOpen}
      onClose={onClose}
      medication={medication}
      onConfirm={handleConfirm}
      title="Discontinue Medication"
      confirmLabel="Discontinue"
      confirmClassName="bg-red-600 hover:bg-red-700 text-white"
    />
  );
}