import { useState, useEffect, useCallback } from "react";
import { fetchDoctorPatients as fetchDoctorPatientsApi } from "../api/patientApi";

export default function useDoctorPatients(prescriberId, filters = {}) {
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
    fetchDoctorPatientsApi(prescriberId, filters)
      .then((data) => {
        const valid = (data || []).filter((p) => p && p.patient_id);
        setPatients(valid);
      })
      .catch((err) => {
        console.error("Failed to fetch patients:", err);
        setError("Could not load patients.");
      })
      .finally(() => setLoading(false));
  }, [prescriberId, filters.search, filters.gender]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { patients, loading, error, refetch };
}