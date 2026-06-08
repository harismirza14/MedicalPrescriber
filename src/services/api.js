import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

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

export const fetchPdmp = async (patientId) => {
  const res = await axios.get(`${API_BASE}/patients/${patientId}/pdmp`);
  return res.data;
};

export const fetchPrescribers = async () => {
  const res = await axios.get(`${API_BASE}/prescribers`);
  return res.data;
};


const api = {
  fetchMedications,
  fetchPharmaciesByZip,
  fetchPatient,
  fetchPdmp,
  fetchPrescribers,
};

export default api;