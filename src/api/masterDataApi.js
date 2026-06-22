import client from "./client";

export const fetchMedications = async () => {
  const res = await client.get("/medications");
  return res.data;
};
export const fetchPharmaciesByZip = async (zip) => {
  const res = await client.get("/pharmacies", { params: { zip } });
  return res.data;
};
