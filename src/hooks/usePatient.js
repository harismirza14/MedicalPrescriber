import { useState, useEffect, useCallback, useRef } from "react";
import { fetchPatient as fetchPatientApi } from "../api/patientApi";

const patientCache = new Map();

/**
 * @param {string|null} patientId 
 * @returns {{ patient: object|null, loading: boolean, error: string|null, refetch: Function }}
 */
export default function usePatient(patientId) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchFresh = useCallback(() => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    fetchPatientApi(patientId)
      .then((data) => {
        console.log("[usePatient] Fresh fetch complete for", patientId, data);
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

  const loadInitial = useCallback(() => {
    if (!patientId) {
      setPatient(null);
      setLoading(false);
      setError(null);
      return;
    }
    if (patientCache.has(patientId)) {
      console.log("[usePatient] Serving from cache for", patientId);
      setPatient(patientCache.get(patientId));
      setLoading(false);
      setError(null);
      return;
    }
    fetchFresh();
  }, [patientId, fetchFresh]);

  const refetch = useCallback(() => {
    if (!patientId) return;
    patientCache.delete(patientId);
    fetchFresh();
  }, [patientId, fetchFresh]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return { patient, loading, error, refetch };
}