import client from "./client";

export const fetchPatient = async (patientId) => {
  const res = await client.get(`/patients/${patientId}`);
  return res.data;
};

export const fetchDoctorPatients = async (prescriberId, { search = '', gender = 'all' } = {}) => {
  const params = new URLSearchParams();
  if (search.trim()) params.append('search', search.trim());
  if (gender && gender !== 'all') params.append('gender', gender);
  const url = `/prescribers/${prescriberId}/patients${params.toString() ? '?' + params.toString() : ''}`;
  const res = await client.get(url);
  return res.data;
};
export const fetchPdmp = async (patientId) => {
  const res = await client.get(`/patients/${patientId}/pdmp`);
  return res.data;
};
