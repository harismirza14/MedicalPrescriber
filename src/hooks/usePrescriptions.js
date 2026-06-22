import { useSelector, useDispatch } from "react-redux";
import { useEffect, useCallback } from "react";
import { fetchPrescriptions } from "../store/MedicationSlice";

/**
 * Hook to fetch and access prescriptions from the Redux store.
 *
 * @param {string|null} patientId  
 * @param {string}      [prescriberId] 
 * @returns {{ prescriptions: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export default function usePrescriptions(patientId, prescriberId) {
  const dispatch = useDispatch();

  const prescriptions = useSelector((state) => state.medications.list);
  const loading = useSelector((state) => state.medications.loading);
  const error = useSelector((state) => state.medications.error);

  const refetch = useCallback(() => {
    if (!patientId) return;
    dispatch(fetchPrescriptions({ patientId, prescriberId }));
  }, [dispatch, patientId, prescriberId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { prescriptions, loading, error, refetch };
}
