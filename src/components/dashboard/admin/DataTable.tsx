"use client";

import {
  Search,
  Pencil,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useMemo, useState } from "react";

export type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterConfig<T> = {
  key: keyof T;
  label: string;
  options: FilterOption[];
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filters?: FilterConfig<T>[];
  pageSize?: number;
  actions?: {
    view?: (row: T) => void;
    edit?: (row: T) => void;
    delete?: (row: T) => void;
  };
};

export default function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  searchPlaceholder = "Cari…",
  searchKeys,
  filters = [],
  pageSize = 5,
  actions,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [page, setPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(filters.map((filter) => [String(filter.key), "all"])),
  );

  const filteredData = useMemo(() => {
    let result = [...data];
    const q = query.trim().toLowerCase();

    if (q) {
      const keys = searchKeys ?? columns.map((column) => column.key);
      result = result.filter((row) =>
        keys.some((key) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(q),
        ),
      );
    }

    filters.forEach((filter) => {
      const filterKey = String(filter.key);
      const currentValue = selectedFilters[filterKey] ?? "all";

      if (currentValue !== "all") {
        result = result.filter(
          (row) => String(row[filter.key] ?? "") === currentValue,
        );
      }
    });

    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison =
          typeof aValue === "number" && typeof bValue === "number"
            ? aValue - bValue
            : String(aValue).localeCompare(String(bValue), undefined, {
                numeric: true,
                sensitivity: "base",
              });

        return direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [columns, data, filters, query, searchKeys, selectedFilters, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedData = filteredData.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }

      return {
        key,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const handleFilterChange = (key: keyof T, value: string) => {
    setSelectedFilters((current) => ({
      ...current,
      [String(key)]: value,
    }));
    setPage(1);
  };

  const currentSort = sortConfig ? sortConfig.direction : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-[320px]">
          <Search
            size={16}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-[9px] border border-black bg-white py-[9px] pl-[33px] pr-3 text-sm outline-none placeholder:text-[#98A2B0] focus:border-[#006FCD] focus:ring-2 focus:ring-[#006FCD]/10"
          />
        </div>

        {filters.length > 0 && (
          <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
            {filters.map((filter) => (
              <div
                key={String(filter.key)}
                className="relative overflow-hidden rounded-full border border-black bg-white"
              >
                <select
                  value={selectedFilters[String(filter.key)] ?? "all"}
                  onChange={(event) =>
                    handleFilterChange(filter.key, event.target.value)
                  }
                  style={{ WebkitAppearance: "none", appearance: "none" }}
                  className="min-w-[170px] cursor-pointer bg-transparent px-5 py-2.5 pr-12 text-sm font-medium text-[#1f2937] outline-none focus:border-[#006FCD] focus:ring-0"
                >
                  <option value="all">Semua {filter.label}</option>
                  {filter.options.map((option) => (
                    <option
                      key={`${String(filter.key)}-${option.value}`}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <img
                  src="/assets/Icons/Chevron.svg"
                  alt=""
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-black">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-[#EDF1FE]">
                {columns.map((column) => {
                  const isSorted = sortConfig?.key === column.key;
                  const isSortable = column.sortable ?? true;

                  return (
                    <th
                      key={String(column.key)}
                      className="border-b border-black px-3.5 py-[11px] text-left text-[12.5px] font-medium text-[#606060]"
                    >
                      {isSortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(column.key)}
                          className="inline-flex items-center gap-1.5 font-medium"
                        >
                          {column.label}
                          {isSorted ? (
                            currentSort === "asc" ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )
                          ) : (
                            <span className="text-[#9AA4B2]">
                              <ChevronUp size={12} />
                            </span>
                          )}
                        </button>
                      ) : (
                        <span>{column.label}</span>
                      )}
                    </th>
                  );
                })}
                {actions && (
                  <th className="border-b border-black px-3.5 py-[11px] text-right text-[12.5px] font-medium text-[#606060]">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-10 text-center text-sm text-[#606060]"
                  >
                    <strong className="block font-medium text-[#242424]">
                      Tidak ada data yang cocok
                    </strong>
                    <span>Ubah kata kunci pencarian atau filter.</span>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={row.id ?? index}
                    className="transition hover:bg-[#FBFCFE]"
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="border-b border-[#E7E9EC] px-3.5 py-3 align-middle text-sm"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] ?? "-")}
                      </td>
                    ))}
                    {actions && (
                      <td className="border-b border-[#E7E9EC] px-3.5 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {actions.view && (
                            <button
                              type="button"
                              onClick={() => actions.view?.(row)}
                              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-black bg-white text-[#606060] hover:bg-[#EDF1FE] hover:text-[#006FCD]"
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          {actions.edit && (
                            <button
                              type="button"
                              onClick={() => actions.edit?.(row)}
                              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-black bg-white text-[#606060] hover:bg-[#EDF1FE] hover:text-[#006FCD]"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {actions.delete && (
                            <button
                              type="button"
                              onClick={() => actions.delete?.(row)}
                              className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-black bg-white text-[#606060] hover:bg-[#FFE6E6] hover:text-[#DF1C1C]"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black px-3.5 py-3">
          <span className="text-xs text-[#606060]">
            Menampilkan {paginatedData.length} dari {filteredData.length} data
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              className="rounded-lg border border-black bg-white px-3 py-1.5 text-xs font-medium text-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="text-xs text-[#606060]">
              Halaman {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={safePage >= totalPages}
              className="rounded-lg border border-black bg-white px-3 py-1.5 text-xs font-medium text-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
