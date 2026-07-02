import client from "./client";

export const fetchPatient = async (patientId) => {
  const res = await client.get(`/patients/${patientId}`);
  return res.data;
};

export const fetchDoctorPatients = async (prescriberId, { search = '', gender = 'all', page = 1, limit = 5 } = {}) => {
  const params = new URLSearchParams();
  if (search.trim()) params.append('search', search.trim());
  if (gender && gender !== 'all') params.append('gender', gender);
  params.append('page', page);
  params.append('limit', limit);
  const url = `/prescribers/${prescriberId}/patients${params.toString() ? '?' + params.toString() : ''}`;
  const res = await client.get(url);
  return res.data; 
};

export const fetchPdmp = async (patientId) => {
  const res = await client.get(`/patients/${patientId}/pdmp`);
  return res.data;
};

export const updatePatient = async (id, data) => {
  const res = await client.put(`/patients/${id}`, data);
  return res.data;
};

export const deletePatient = async (id) => {
  const res = await client.delete(`/patients/${id}`);
  return res.data;
};