import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Options } from "nuqs";
import React, { useEffect } from "react";
import { GetProductsType } from "../client";

export const PaginateSection = ({
  data,
  paginate,
  page,
  setPage,
}: {
  data: GetProductsType;
  paginate: {
    total: number;
    page: number;
    totalPages: number;
  };
  page: number;
  setPage: (
    value: number | ((old: number) => number | null) | null,
    options?: Options
  ) => Promise<URLSearchParams>;
}) => {
  const getPageNumbers = (p: any): number[] => {
    if (p.totalPages <= 3) {
      return Array.from({ length: p.totalPages }, (_, i) => i + 1);
    }

    if (page === 1) return [1, 2, 3];
    if (page === p.totalPages)
      return [p.totalPages - 2, p.totalPages - 1, p.totalPages];
    return [page - 1, page, page + 1];
  };

  useEffect(() => {
    if (page > data.data.pagination.totalPages) {
      setPage(1);
    } else {
      setPage(data.data.pagination.page);
    }
  }, [page, data]);
  return (
    <div className="w-fit p-3 flex justify-center bg-white shadow rounded-lg mx-auto mt-5">
      <div className="flex items-center *:hover:bg-green-200 *:hover:text-black *:size-8 gap-1">
        {/* First */}
        {paginate.totalPages > 3 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <ChevronsLeft />
          </Button>
        )}

        {/* Prev */}
        {paginate.totalPages > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage((i) => i - 1)}
            disabled={page === 1}
          >
            <ChevronLeft />
          </Button>
        )}

        {/* Numbered Pages */}
        {getPageNumbers(paginate).map((p) => (
          <Button
            key={p}
            variant="ghost"
            size="icon"
            className={cn(
              "disabled:opacity-100",
              p === page && "bg-sci text-white"
            )}
            onClick={() => setPage(p)}
            disabled={p === page}
          >
            <p className="select-none">{p}</p>
          </Button>
        ))}

        {/* Next */}
        {paginate.totalPages > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage((i) => i + 1)}
            disabled={page === paginate.totalPages}
          >
            <ChevronRight />
          </Button>
        )}

        {/* Last */}
        {paginate.totalPages > 3 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage(paginate.totalPages)}
            disabled={page === paginate.totalPages}
          >
            <ChevronsRight />
          </Button>
        )}
      </div>
    </div>
  );
};
