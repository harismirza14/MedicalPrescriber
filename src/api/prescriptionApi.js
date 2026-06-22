import client from "./client";

export const fetchPrescriptions = async (patientId, prescriberId) => {
  const params = prescriberId ? { prescriber_id: prescriberId } : {};
  const res = await client.get(`/patients/${patientId}/prescriptions`, {
    params,
  });
  return res.data;
};

export const createPrescription = async (data) => {
  const res = await client.post("/prescriptions", data);
  return res.data;
};

export const updatePrescription = async (id, updates) => {
  const res = await client.put(`/prescriptions/${id}`, updates);
  return res.data;
};

export const discontinuePrescription = async (id, reason) => {
  const res = await client.patch(`/prescriptions/${id}/discontinue`, {
    reason,
  });
  return res.data;
};

export const recontinuePrescription = async (id) => {
  const res = await client.patch(`/prescriptions/${id}/recontinue`);
  return res.data;
};
