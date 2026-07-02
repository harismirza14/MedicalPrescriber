import { useState, useEffect, useCallback } from "react";
import { fetchCareTeam as fetchCareTeamApi } from "../api/careTeamApi";

export default function useCareTeam(patientId) {
  const [careTeam, setCareTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!patientId) {
      setCareTeam(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchCareTeamApi(patientId)
      .then((data) => setCareTeam(data))
      .catch((err) => {
        console.error("Failed to load care team:", err);
        setError("Could not load care team.");
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { careTeam, loading, error, refetch };
}