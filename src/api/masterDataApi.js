import client from "./client";

/**
 * Fetch the full list of available medications.
 * GET /medications
 */
export const fetchMedications = async () => {
  const res = await client.get("/medications");
  return res.data;
};

/**
 * Fetch pharmacies filtered by ZIP code.
 * GET /pharmacies?zip=...
 */
export const fetchPharmaciesByZip = async (zip) => {
  const res = await client.get("/pharmacies", { params: { zip } });
  return res.data;
};
