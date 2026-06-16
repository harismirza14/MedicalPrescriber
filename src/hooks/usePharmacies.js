import { useState, useEffect, useCallback } from "react";
import { fetchPharmaciesByZip as fetchPharmaciesByZipApi } from "../api/masterDataApi";

/**
 * Hook to fetch pharmacies by ZIP code.
 *
 * @param {string}      zip              – ZIP code to search.
 * @param {string|null} [initialPharmacy] – Name of the pharmacy to pre-select.
 * @returns {{
 *   pharmacies: Array,
 *   selectedPharmacy: object|null,
 *   setSelectedPharmacy: Function,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: Function,
 *   setZip: Function,
 *   zip: string
 * }}
 */
export default function usePharmacies(zip, initialPharmacy = null) {
  const [activeZip, setActiveZip] = useState(zip || "");
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!activeZip) return;

    setLoading(true);
    setError(null);

    fetchPharmaciesByZipApi(activeZip)
      .then((results) => {
        setPharmacies(results);
        const matched = initialPharmacy
          ? results.find((p) => p.name === initialPharmacy)
          : null;
        setSelectedPharmacy(matched || (results.length ? results[0] : null));
      })
      .catch((err) => {
        console.error("Failed to fetch pharmacies:", err);
        setPharmacies([]);
        setError("Could not load pharmacies.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeZip, initialPharmacy]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    pharmacies,
    selectedPharmacy,
    setSelectedPharmacy,
    loading,
    error,
    refetch,
    setZip: setActiveZip,
    zip: activeZip,
  };
}
