"use client";

import * as React from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Maximize,
  Minimize,
  Rows2,
  Rows3,
  Rows4,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { CustomSelect } from "./custom-select";
import { useTranslations } from "next-intl";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
  }[];
  searchPlaceholder?: string;
  noDataMessage?: string;
  initialRowsPerPage?: number;
}

type Density = "tight" | "normal" | "relaxed";

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder,
  noDataMessage = "Nenhum dado encontrado.",
  initialRowsPerPage = 10,
}: DataTableProps<T>) {
  const t = useTranslations("Layout");
  const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);
  const [density, setDensity] = React.useState<Density>("relaxed");
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  // Filter and pagination logic
  const filteredData = React.useMemo(() => {
    if (!search) return data;
    const lowerSearch = search.toLowerCase();
    return data.filter((item) => {
      return Object.values(item as object).some((val) =>
        String(val).toLowerCase().includes(lowerSearch)
      );
    });
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  // Handle ESC key to exit fullscreen
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullScreen]);

  const toggleDensity = () => {
    const sequence: Density[] = ["tight", "normal", "relaxed"];
    const currentIndex = sequence.indexOf(density);
    const nextIndex = (currentIndex + 1) % sequence.length;
    setDensity(sequence[nextIndex]);
  };

  const DensityIcon = {
    tight: Rows4,
    normal: Rows3,
    relaxed: Rows2,
  }[density];

  const rowPadding = {
    tight: "py-1.5",
    normal: "py-2.5",
    relaxed: "py-4",
  }[density];

  return (
    <div
      className={cn(
        "glass-panel group flex flex-col overflow-hidden transition-all duration-300",
        isFullScreen
          ? "fixed inset-0 z-[99999] h-screen w-screen rounded-none bg-[#0b080f]!"
          : "relative rounded-4xl"
      )}
    >
      {/* Search & Actions Header */}
      <div className="bg-white/2 flex items-center justify-end gap-2 px-4 py-3">
        {/* Density Toggle */}
        <button
          onClick={toggleDensity}
          title="Ajustar densidade"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white"
        >
          <DensityIcon className="size-4" />
        </button>

        <div className="relative w-full max-w-[240px]">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 opacity-30 transition-opacity group-focus-within:opacity-60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder || t("searchPlaceholder")}
            className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-xl border border-white/5 bg-white/5 py-2 pr-4 pl-9 text-[11px] text-white outline-hidden transition-all placeholder:text-white/20 focus:bg-white/10 focus:ring-4"
          />
        </div>

        {/* Full Screen Toggle */}
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          title={isFullScreen ? "Sair da tela cheia" : "Tela cheia"}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white"
        >
          {isFullScreen ? (
            <Minimize className="size-4" />
          ) : (
            <Maximize className="size-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-white/2 border-b border-white/10">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase opacity-40",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedData.map((item, rowIdx) => (
              <tr
                key={rowIdx}
                className="group/row transition-colors hover:bg-white/5"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn("px-6", rowPadding, col.className)}
                  >
                    {col.cell
                      ? col.cell(item)
                      : col.accessorKey
                      ? String(item[col.accessorKey] ?? "")
                      : null}
                  </td>
                ))}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-muted px-6 py-12 text-center italic opacity-40"
                >
                  {noDataMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-white/2 flex flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-3 sm:flex-row">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
              {t("rowsPerPage")}
            </span>
            <CustomSelect
              value={rowsPerPage}
              onChange={(val) => setRowsPerPage(Number(val))}
              options={[
                { label: "5", value: 5 },
                { label: "10", value: 10 },
                { label: "20", value: 20 },
                { label: "50", value: 50 },
              ]}
              triggerClassName="h-8 min-w-[60px]"
            />
          </div>
          <div className="text-[10px] font-bold tracking-widest text-white/20 uppercase">
            {t("pageOf", { current: currentPage, total: totalPages })}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            title="Primeira página"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="flex size-8 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20"
          >
            <ChevronsLeft className="size-4" />
          </button>
          <button
            title="Anterior"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="flex size-8 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex items-center px-1">
            <CustomSelect
              value={currentPage}
              onChange={(val) => setCurrentPage(Number(val))}
              options={Array.from({ length: totalPages }, (_, i) => ({
                label: String(i + 1),
                value: i + 1,
              }))}
              triggerClassName="h-8 min-w-[60px]"
            />
          </div>

          <button
            title="Próxima"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="flex size-8 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            title="Última página"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="flex size-8 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20"
          >
            <ChevronsRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
