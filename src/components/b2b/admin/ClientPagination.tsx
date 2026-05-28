import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Klassischer Client-Pagination-Hook (Phase C1).
 * - keine Server-Calls, arbeitet auf bereits geladenen Arrays
 * - resettet auf Seite 1, sobald sich die Datenlänge ändert
 *   (z. B. durch Filter/Suche im Parent)
 */
export function usePagedList<T>(items: T[], pageSize = 25) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [items.length, totalPages, page]);

  const paged = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return { paged, page, setPage, totalPages, pageSize, total: items.length };
}

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  label?: string;
}

export function PaginationBar({
  page, totalPages, total, pageSize, onPage, label = "Einträge",
}: PaginationBarProps) {
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 text-sm">
      <p className="text-muted-foreground">
        {from}–{to} von {total} {label}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline ml-1">Zurück</span>
        </Button>
        <span className="px-3 text-muted-foreground">
          Seite {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          <span className="hidden sm:inline mr-1">Weiter</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
