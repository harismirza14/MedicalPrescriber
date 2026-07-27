import { useState, useEffect, useCallback } from 'react';
import {
  fetchPatientAppointments,
  fetchPrescriberAppointments,
  cancelAppointment as cancelAppointmentApi,
  completeAppointment as completeAppointmentApi,
} from '../api/appointmentApi';

export default function useAppointments(role, id, { page = 1, limit = 5 } = {}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const refetch = useCallback(() => {
    if (!id || !role) {
      setAppointments([]);
      setLoading(false);
      setTotalPages(1);
      setTotalCount(0);
      return;
    }
    setLoading(true);
    setError(null);

    const fetcher = role === 'patient' ? fetchPatientAppointments : fetchPrescriberAppointments;

    fetcher(id, { page, limit })
      .then((result) => {
        setAppointments(result.data);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
      })
      .catch((err) => {
        console.error('Failed to load appointments:', err);
        setError('Could not load appointments.');
      })
      .finally(() => setLoading(false));
  }, [role, id, page, limit]);

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

  const completeAppointment = useCallback(
    async (appointmentId) => {
      await completeAppointmentApi(appointmentId);
      refetch();
    },
    [refetch]
  );

  return {
    appointments,
    loading,
    error,
    refetch,
    cancelAppointment,
    completeAppointment,
    totalPages,
    totalCount,
  };
}