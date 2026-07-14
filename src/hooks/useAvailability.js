import { useState, useEffect, useCallback } from "react";
import {
  fetchAvailability,
  addAvailability as addAvailabilityApi,
  deleteAvailability as deleteAvailabilityApi,
} from "../api/availabilityApi";

export default function useAvailability(prescriberId) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!prescriberId) {
      setSlots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchAvailability(prescriberId)
      .then(setSlots)
      .catch((err) => {
        console.error("Failed to load availability:", err);
        setError("Could not load availability.");
      })
      .finally(() => setLoading(false));
  }, [prescriberId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addSlot = useCallback(
    async (slotData) => {
      await addAvailabilityApi(prescriberId, slotData);
      refetch();
    },
    [prescriberId, refetch]
  );

  const deleteSlot = useCallback(
    async (slotId) => {
      await deleteAvailabilityApi(prescriberId, slotId);
      refetch();
    },
    [prescriberId, refetch]
  );

  return { slots, loading, error, refetch, addSlot, deleteSlot };
}