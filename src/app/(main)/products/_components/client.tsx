"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader,
  RefreshCcw,
  Settings2,
  ShoppingBag,
  X,
} from "lucide-react";
import { useGetFilters, useGetProducts } from "../_api";
import {
  parseAsArrayOf,
  parseAsInteger,
  useQueryState,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { useSearchQuery } from "@/lib/search";
import { FiltersSection } from "./_sections/filter";
import { Accordion } from "@/components/ui/accordion";
import { DrawerFilter } from "./_sections/drawer";

const Client = () => {
  const [isOpen, setIsOpen] = useState({
    categories: false,
    suppliers: false,
    pets: false,
    promos: false,
  });
  const [{ categories, suppliers, pets, promos }, setFilters] = useQueryStates({
    categories: parseAsArrayOf(parseAsString, ";").withDefault([]),
    suppliers: parseAsArrayOf(parseAsString, ";").withDefault([]),
    pets: parseAsArrayOf(parseAsString, ";").withDefault([]),
    promos: parseAsArrayOf(parseAsString, ";").withDefault([]),
  });
  const [isFilter, setIsFilter] = useState(false);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const { searchValue } = useSearchQuery();
  const { data: dataFilters, isPending: isFiltering } = useGetFilters();
  const { data, refetch, isRefetching, isPending } = useGetProducts({
    categories: categories ?? undefined,
    suppliers: suppliers ?? undefined,
    pets: pets ?? undefined,
    promos: promos ?? undefined,
    p: page,
    q: searchValue,
  });

  const products = useMemo(() => {
    return data?.data.data;
  }, [data]);
  const paginate = useMemo(() => {
    return data?.data.pagination;
  }, [data]);
  const filters = useMemo(() => {
    return dataFilters?.data;
  }, [dataFilters]);

  const toggleExpand = (label: string, open: boolean) => {
    setIsOpen((prev) => ({ ...prev, [label]: open }));
  };

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
    if (filters) {
      if (filters.categories.slice(3).some((i) => categories.includes(i.slug)))
        return toggleExpand("categories", true);
      if (filters.suppliers.slice(3).some((i) => suppliers.includes(i.slug)))
        return toggleExpand("suppliers", true);
      if (filters.pets.slice(3).some((i) => pets.includes(i.slug)))
        return toggleExpand("pets", true);
      if (filters.promos.slice(3).some((i) => promos.includes(i.slug)))
        return toggleExpand("promos", true);
    }
  }, [filters, categories, suppliers, pets, promos]);

  useEffect(() => {
    if (data) {
      if (page > data.data.pagination.totalPages) {
        setPage(1);
      } else {
        setPage(data.data.pagination.page);
      }
    }
  }, [data]);

  // Helper function for toggling filter selection
  const handleSelect = (filterKey: keyof typeof isOpen, slug: string) => {
    setFilters((prev) => {
      const encodedSlug = encodeURIComponent(slug);
      const selected = prev[filterKey] as string[];
      if (selected.includes(encodedSlug)) {
        return {
          ...prev,
          [filterKey]: selected.filter((i) => i !== encodedSlug),
        };
      } else {
        return {
          ...prev,
          [filterKey]: [...selected, encodedSlug],
        };
      }
    });
  };

  // Filter config for rendering sidebar and drawer sections
  const filterConfigs = [
    {
      key: "categories",
      label: "Categories",
      emptyLabel: "Categories not yet.",
      items: filters?.categories ?? [],
      selected: categories,
      isOpen: isOpen.categories,
      onToggle: (open: boolean) => toggleExpand("categories", open),
    },
    {
      key: "suppliers",
      label: "Suppliers",
      emptyLabel: "Suppliers not yet.",
      items: filters?.suppliers ?? [],
      selected: suppliers,
      isOpen: isOpen.suppliers,
      onToggle: (open: boolean) => toggleExpand("suppliers", open),
    },
    {
      key: "pets",
      label: "Pets",
      emptyLabel: "Pets not yet.",
      items: filters?.pets ?? [],
      selected: pets,
      isOpen: isOpen.pets,
      onToggle: (open: boolean) => toggleExpand("pets", open),
    },
    {
      key: "promos",
      label: "Promo",
      emptyLabel: "Promo not yet.",
      items: filters?.promos ?? [],
      selected: promos,
      isOpen: isOpen.promos,
      onToggle: (open: boolean) => toggleExpand("promos", open),
    },
  ];

  return (
    <div className="bg-sky-50 h-full">
      <DrawerFilter
        filters={filters}
        open={isFilter}
        onOpenChange={() => {
          if (isFilter) {
            setIsFilter(false);
          }
        }}
        resetFilter={
          categories.length > 0 ||
          suppliers.length > 0 ||
          pets.length > 0 ||
          promos.length > 0
        }
        filterConfigs={filterConfigs}
        handleSelect={handleSelect}
        setFilters={setFilters}
      />
      <div className="max-w-[1240px] mx-auto w-full flex gap-7 px-4 lg:px-8 py-5 lg:py-14">
        <div className="relative hidden lg:flex">
          <div className="w-[250px] flex-none bg-white rounded-xl shadow sticky top-[2.5vh] overflow-hidden h-fit">
            <div className="w-full h-12 px-3.5 flex items-center">
              <h3 className="text-2xl font-bold">Filter</h3>
            </div>
            {isFiltering ? (
              <div className="flex flex-col gap-1 w-full h-[200px] relative items-center justify-center">
                <Loader className="animate-spin size-5" />
                <p className="ml-2 text-sm">Loading...</p>
              </div>
            ) : (
              <div className="max-h-[calc(95vh-48px)] overflow-y-scroll px-3.5 py-2">
                {filters && (
                  <Accordion
                    type="multiple"
                    defaultValue={["categories", "suppliers", "pets", "promos"]}
                  >
                    {filterConfigs.map((config, idx) => (
                      <div
                        key={config.key}
                        className={
                          idx !== filterConfigs.length - 1
                            ? "flex flex-col border-b border-gray-500"
                            : "flex flex-col"
                        }
                      >
                        <FiltersSection
                          config={config}
                          handleSelect={handleSelect}
                        />
                      </div>
                    ))}
                  </Accordion>
                )}
              </div>
            )}
          </div>
        </div>
        {isPending ? (
          <div className="flex flex-col gap-1 w-full h-[200px] relative items-center justify-center">
            <Loader className="animate-spin size-5" />
            <p className="ml-2 text-sm">Loading...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 w-full min-h-full relative">
            <div className="flex items-center gap-2 justify-end w-full">
              <Button
                variant={"sciOutline"}
                className="bg-transparent rounded-full"
                onClick={() => setIsFilter(true)}
              >
                Filter
                <Settings2 />
              </Button>
            </div>
            {products && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full h-full">
                {products.length > 0 ? (
                  products.map((item, idx) => (
                    <ProductCard key={`${item.title}-${idx}`} {...item} />
                  ))
                ) : (
                  <div className="min-h-96 h-full flex items-center justify-center flex-col col-span-2 md:col-span-4 w-full text-center">
                    <div className="size-20 md:size-28 lg:size-36 rounded-full flex items-center justify-center bg-white shadow -mt-16">
                      <ShoppingBag className="size-10 md:size-16 lg:size-20 text-sci stroke-[1.5]" />
                    </div>
                    <h5 className="text-2xl lg:text-4xl font-bold mt-6">
                      Coming Soon!
                    </h5>
                    <p className="max-w-xl mx-auto mt-2 text-gray-600 text-sm lg:text-base">
                      We&apos;re working hard to bring you amazing products. Our
                      store will be launching soon with carefully curated items
                      just for you.
                    </p>
                    <div className="flex items-center gap-3 mt-6">
                      <Button
                        className="bg-sci hover:bg-sci-hover"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                      >
                        <RefreshCcw
                          className={cn(isRefetching && "animate-spin")}
                        />
                        Refresh
                      </Button>
                      <Button
                        variant={"outline"}
                        className="border-sci hover:border-sci-hover bg-transparent hover:bg-emerald-50"
                        disabled={isRefetching}
                        onClick={() =>
                          setFilters({
                            categories: [],
                            pets: [],
                            promos: [],
                            suppliers: [],
                          })
                        }
                      >
                        <X />
                        Clear Filter
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {paginate && paginate.total > 0 && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Client;
