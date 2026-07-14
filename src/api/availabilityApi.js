import client from "./client";

export const fetchAvailability = async (prescriberId) => {
  const res = await client.get(`/prescribers/${prescriberId}/availability`);
  return res.data;
};

export const addAvailability = async (prescriberId, slots) => {
  const res = await client.post(`/prescribers/${prescriberId}/availability`, slots);
  return res.data;
};

export const deleteAvailability = async (prescriberId, slotId) => {
  const res = await client.delete(`/prescribers/${prescriberId}/availability/${slotId}`);
  return res.data;
};

export const fetchFreeSlots = async (prescriberId, date) => {
  const res = await client.get(`/prescribers/${prescriberId}/available-slots?date=${date}`);
  return res.data;
};