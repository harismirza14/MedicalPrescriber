import { useState, useEffect, useCallback } from "react";
import { fetchDoctorPatients as fetchDoctorPatientsApi } from "../api/patientApi";

/**
 * Hook to fetch the list of patients assigned to a prescriber.
 *
 * @param {string|null} prescriberId 
 * @returns {{ patients: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export default function useDoctorPatients(prescriberId) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!prescriberId) {
      setPatients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchDoctorPatientsApi(prescriberId)
      .then((data) => {
        const valid = (data || []).filter((p) => p && p.patient_id);
        setPatients(valid);
      })
      .catch((err) => {
        console.error("Failed to fetch patients:", err);
        setError("Could not load patients.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [prescriberId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { patients, loading, error, refetch };
}
