import { useState, useEffect, useCallback } from "react";
import { fetchDoctorPatients as fetchDoctorPatientsApi } from "../api/patientApi";

export default function useDoctorPatients(prescriberId, filters = {}) {
  const { search = "", gender = "all", page = 1, limit = 5 } = filters;
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const refetch = useCallback(() => {
    if (!prescriberId) {
      setPatients([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchDoctorPatientsApi(prescriberId, { search, gender, page, limit })
      .then((res) => {
        setPatients(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      })
      .catch((err) => {
        console.error("Failed to fetch patients:", err);
        setError("Could not load patients.");
      })
      .finally(() => setLoading(false));
  }, [prescriberId, search, gender, page, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { patients, loading, error, refetch, total, totalPages };
}