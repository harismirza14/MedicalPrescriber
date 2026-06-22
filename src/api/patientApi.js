import client from "./client";

export const fetchPatient = async (patientId) => {
  const res = await client.get(`/patients/${patientId}`);
  return res.data;
};

export const fetchDoctorPatients = async (prescriberId) => {
  const res = await client.get(`/prescribers/${prescriberId}/patients`);
  return res.data;
};
export const fetchPdmp = async (patientId) => {
  const res = await client.get(`/patients/${patientId}/pdmp`);
  return res.data;
};
