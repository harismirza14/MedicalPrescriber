import axios from "axios";

const API_BASE = "http://localhost:3000/api";

export const fetchMedications = async () => {
  const res = await axios.get(`${API_BASE}/medications`);
  return res.data;
};

export const fetchPharmaciesByZip = async (zip) => {
  const res = await axios.get(`${API_BASE}/pharmacies`, { params: { zip } });
  return res.data;
};

export const fetchPatient = async (patientId) => {
  const res = await axios.get(`${API_BASE}/patients/${patientId}`);
  return res.data;
};

export const fetchDoctorPatients = async (prescriberId) => {
  const res = await axios.get(
    `${API_BASE}/prescribers/${prescriberId}/patients`,
  );
  return res.data;
};

export const fetchPdmp = async (patientId) => {
  const res = await axios.get(`${API_BASE}/patients/${patientId}/pdmp`);
  return res.data;
};

export const login = async (userId, password) => {
  const res = await axios.post(`${API_BASE}/login`, { userId, password });
  return res.data;
};

export const fetchPrescriptions = async (patientId, prescriberId) => {
  const params = prescriberId ? { prescriber_id: prescriberId } : {};
  const res = await axios.get(
    `${API_BASE}/patients/${patientId}/prescriptions`,
    { params },
  );
  return res.data;
};

export const updatePrescription = async (id, updates, role, userId) => {
  const res = await axios.put(`${API_BASE}/prescriptions/${id}`, updates, {
    headers: {
      "x-user-role": role,
      "x-user-id": userId,
    },
  });
  return res.data;
};

const api = {
  fetchMedications,
  fetchPharmaciesByZip,
  fetchPatient,
  fetchPdmp,
  fetchDoctorPatients,
  login,
  fetchPrescriptions,
  updatePrescription,
};

export default api;
