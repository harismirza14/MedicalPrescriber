import { useState, useEffect, useCallback } from "react";

const DEFAULT_LIMIT = 5;

export function usePaginatedData({
  fetchFn,         
  initialSearch = "",
  initialFilter = "",
  limit = DEFAULT_LIMIT,
  debounceDelay = 300,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [filter, setFilter] = useState(initialFilter);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), debounceDelay);
    return () => clearTimeout(handler);
  }, [search, debounceDelay]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn({
        search: debouncedSearch,
        filter, 
        page,
        limit,
      });
      setData(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, debouncedSearch, filter, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = fetchData;

  return {
    data,
    loading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    page,
    setPage,
    totalPages,
    refetch,
    debouncedSearch,
  };
}