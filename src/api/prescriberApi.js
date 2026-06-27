import client from "./client";

export const fetchPrescriber = async (prescriberId) => {
  const res = await client.get(`/prescribers/${prescriberId}`);
  return res.data;
};