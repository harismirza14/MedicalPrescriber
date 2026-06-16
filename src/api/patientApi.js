import client from "./client";

/**
 * Fetch a single patient's details.
 * GET /patients/:patientId
 */
export const fetchPatient = async (patientId) => {
  const res = await client.get(`/patients/${patientId}`);
  return res.data;
};

/**
 * Fetch all patients assigned to a prescriber.
 * GET /prescribers/:prescriberId/patients
 */
export const fetchDoctorPatients = async (prescriberId) => {
  const res = await client.get(`/prescribers/${prescriberId}/patients`);
  return res.data;
};

/**
 * Fetch PDMP data for a patient.
 * GET /patients/:patientId/pdmp
 */
export const fetchPdmp = async (patientId) => {
  const res = await client.get(`/patients/${patientId}/pdmp`);
  return res.data;
};
