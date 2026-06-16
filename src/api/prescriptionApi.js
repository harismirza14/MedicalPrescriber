import client from "./client";

/**
 * Fetch prescriptions for a patient, optionally filtered by prescriber.
 * GET /patients/:patientId/prescriptions
 */
export const fetchPrescriptions = async (patientId, prescriberId) => {
  const params = prescriberId ? { prescriber_id: prescriberId } : {};
  const res = await client.get(`/patients/${patientId}/prescriptions`, {
    params,
  });
  return res.data;
};

/**
 * Create a new prescription.
 * POST /prescriptions
 */
export const createPrescription = async (data) => {
  const res = await client.post("/prescriptions", data);
  return res.data;
};

/**
 * Update an existing prescription.
 * PUT /prescriptions/:id
 */
export const updatePrescription = async (id, updates) => {
  const res = await client.put(`/prescriptions/${id}`, updates);
  return res.data;
};

/**
 * Discontinue a prescription.
 * PATCH /prescriptions/:id/discontinue
 */
export const discontinuePrescription = async (id, reason) => {
  const res = await client.patch(`/prescriptions/${id}/discontinue`, {
    reason,
  });
  return res.data;
};

/**
 * Re-continue a previously discontinued prescription.
 * PATCH /prescriptions/:id/recontinue
 */
export const recontinuePrescription = async (id) => {
  const res = await client.patch(`/prescriptions/${id}/recontinue`);
  return res.data;
};
