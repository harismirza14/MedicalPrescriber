import client from "./client";

export const fetchPrescriber = async (prescriberId) => {
  const res = await client.get(`/prescribers/${prescriberId}`);
  return res.data;
};

export const fetchPrescribers = async ({ search = "", gender = "", page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams();
  if (search.trim()) params.append("search", search.trim());
  if (gender && gender !== "all") params.append("gender", gender);
  params.append("page", page);
  params.append("limit", limit);
  const res = await client.get(`/prescribers?${params.toString()}`);
  return res.data;
};

export const updatePrescriber = async (id, data) => {
  const res = await client.put(`/prescribers/${id}`, data);
  return res.data;
};

export const deletePrescriber = async (id) => {
  const res = await client.delete(`/prescribers/${id}`);
  return res.data;
};