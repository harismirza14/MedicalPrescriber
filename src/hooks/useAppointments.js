import { useState, useEffect, useCallback } from "react";
import {
  fetchPatientAppointments,
  fetchPrescriberAppointments,
  cancelAppointment as cancelAppointmentApi,
} from "../api/appointmentApi";

export default function useAppointments(role, id) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!id || !role) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const fetcher = role === "patient" ? fetchPatientAppointments : fetchPrescriberAppointments;

    fetcher(id)
      .then(setAppointments)
      .catch((err) => {
        console.error("Failed to load appointments:", err);
        setError("Could not load appointments.");
      })
      .finally(() => setLoading(false));
  }, [role, id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const cancelAppointment = useCallback(
    async (appointmentId) => {
      await cancelAppointmentApi(appointmentId);
      refetch();
    },
    [refetch]
  );

  return { appointments, loading, error, refetch, cancelAppointment };
}