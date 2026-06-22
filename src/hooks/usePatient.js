import { useState, useEffect, useCallback, useRef } from "react";
import { fetchPatient as fetchPatientApi } from "../api/patientApi";

const patientCache = new Map();

/**

 *
 * @param {string|null} patientId – Patient to load.
 * @returns {{ patient: object|null, loading: boolean, error: string|null, refetch: Function }}
 */
export default function usePatient(patientId) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const refetch = useCallback(() => {
    if (!patientId) {
      setPatient(null);
      setLoading(false);
      setError(null);
      return;
    }
    if (patientCache.has(patientId)) {
      setPatient(patientCache.get(patientId));
      setLoading(false);
      setError(null);
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    fetchPatientApi(patientId)
      .then((data) => {
        patientCache.set(patientId, data);
        setPatient(data);
      })
      .catch((err) => {
        console.error("Failed to load patient:", err);
        setError("Could not load patient information.");
      })
      .finally(() => {
        setLoading(false);
        fetchingRef.current = false;
      });
  }, [patientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { patient, loading, error, refetch };
}
