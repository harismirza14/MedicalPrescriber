import SearchInput from "./SearchInput";
import FilterDropdown from "./FilterDropdown";
import PaginationControls from "./Pagination";

export default function Table({
  data = [],
  columns = [],
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
  loading = false,
  className = "",
}) {
  const showSearch = typeof onSearchChange === "function";
  const showPagination =
    currentPage != null && totalPages != null && typeof onPageChange === "function";

  return (
    <div className={className}>
      {(showSearch || filters.length > 0) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {showSearch && (
            <div className="flex-1 min-w-[200px]">
              <SearchInput
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
          {filters.map((filter) => (
            <FilterDropdown
              key={filter.key}
              label={filter.label}
              value={filter.value}
              options={filter.options}
              onChange={filter.onChange}
            />
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
        ) : !data || data.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={row.id ?? rowIndex}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`border-t border-gray-200 dark:border-gray-700 ${
                      onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" : ""
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] || "N/A"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showPagination && !loading && data.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}