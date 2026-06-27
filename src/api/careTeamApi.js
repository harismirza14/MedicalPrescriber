import client from "./client";

export const fetchCareTeam = async (patientId) => {
  const res = await client.get(`/patients/${patientId}/care-team`);
  return res.data;
};