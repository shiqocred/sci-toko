"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";
import { Loader, RefreshCcw, Settings2, ShoppingBag, X } from "lucide-react";
import { useGetFilters, useGetProducts } from "../_api";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { useSearchQuery } from "@/lib/search";
import { FiltersSection } from "./_sections/filter";
import { Accordion } from "@/components/ui/accordion";
import { DrawerFilter } from "./_sections/drawer";
import { PaginateSection } from "./_sections/paginate";

export type GetProductsType = Exclude<
  ReturnType<typeof useGetProducts>["data"],
  undefined
>;

const Client = () => {
  /* =========================
   * Query State (URL)
   * ========================= */
  const [{ categories, suppliers, pets, promos }, setFilters] = useQueryStates({
    categories: parseAsArrayOf(parseAsString, ";").withDefault([]),
    suppliers: parseAsArrayOf(parseAsString, ";").withDefault([]),
    pets: parseAsArrayOf(parseAsString, ";").withDefault([]),
    promos: parseAsArrayOf(parseAsString, ";").withDefault([]),
  });

  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const { searchValue } = useSearchQuery();

  /* =========================
   * UI State
   * ========================= */
  const [isFilter, setIsFilter] = useState(false);

  // manual override accordion
  const [manualOpen, setManualOpen] = useState<{
    categories?: boolean;
    suppliers?: boolean;
    pets?: boolean;
    promos?: boolean;
  }>({});

  /* =========================
   * Fetch Data
   * ========================= */
  const { data: dataFilters, isPending: isFiltering } = useGetFilters();

  const { data, refetch, isRefetching, isPending } = useGetProducts({
    categories: categories.length ? categories : undefined,
    suppliers: suppliers.length ? suppliers : undefined,
    pets: pets.length ? pets : undefined,
    promos: promos.length ? promos : undefined,
    p: page,
    q: searchValue,
  });

  /* =========================
   * Derived Data
   * ========================= */
  const products = useMemo(() => data?.data.data ?? [], [data]);
  const paginate = useMemo(() => {
    return data?.data.pagination;
  }, [data]);
  const filters = useMemo(() => dataFilters?.data, [dataFilters]);

  /* =========================
   * Auto-expand accordion (DERIVED)
   * ========================= */
  const autoOpen = useMemo(() => {
    if (!filters) {
      return {
        categories: false,
        suppliers: false,
        pets: false,
        promos: false,
      };
    }

    return {
      categories: filters.categories
        .slice(3)
        .some((i) => categories.includes(i.slug)),

      suppliers: filters.suppliers
        .slice(3)
        .some((i) => suppliers.includes(i.slug)),

      pets: filters.pets.slice(3).some((i) => pets.includes(i.slug)),

      promos: filters.promos.slice(3).some((i) => promos.includes(i.slug)),
    };
  }, [filters, categories, suppliers, pets, promos]);

  const isOpen = {
    categories: manualOpen.categories ?? autoOpen.categories,
    suppliers: manualOpen.suppliers ?? autoOpen.suppliers,
    pets: manualOpen.pets ?? autoOpen.pets,
    promos: manualOpen.promos ?? autoOpen.promos,
  };

  /* =========================
   * Sync page with pagination (VALID EFFECT)
   * ========================= */
  useEffect(() => {
    if (!paginate) return;
    if (page > paginate.totalPages) {
      setPage(1);
    }
  }, [paginate, page, setPage]);

  /* =========================
   * Helpers
   * ========================= */
  const toggleExpand = (
    key: "categories" | "suppliers" | "pets" | "promos",
    open: boolean
  ) => {
    setManualOpen((prev) => ({ ...prev, [key]: open }));
  };

  const handleSelect = (
    filterKey: "categories" | "suppliers" | "pets" | "promos",
    slug: string
  ) => {
    const encoded = encodeURIComponent(slug);
    setFilters((prev) => {
      const selected = prev[filterKey];
      return selected.includes(encoded)
        ? { ...prev, [filterKey]: selected.filter((i) => i !== encoded) }
        : { ...prev, [filterKey]: [...selected, encoded] };
    });
  };

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

  /* =========================
   * Render
   * ========================= */
  if (isFiltering || isPending) {
    return (
      <div className="flex flex-col gap-1 w-full h-[70vh] items-center justify-center">
        <Loader className="animate-spin size-5" />
        <p className="text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-sky-50 h-full">
      <DrawerFilter
        filters={filters}
        open={isFilter}
        onOpenChange={() => setIsFilter(false)}
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

      <div className="max-w-[1240px] mx-auto w-full flex gap-7 px-4 lg:px-8 py-6">
        {/* Sidebar */}
        <div className="hidden lg:flex">
          <div className="w-[250px] bg-white rounded-xl shadow sticky top-6">
            <div className="px-4 py-3 text-xl font-bold">Filter</div>
            <div className="max-h-[calc(95vh-48px)] overflow-y-scroll scrollbar-hide px-3.5 py-2">
              {filters && (
                <Accordion
                  type="multiple"
                  defaultValue={["categories", "suppliers", "pets", "promos"]}
                >
                  {filterConfigs.map((config, idx) => (
                    <div
                      key={config.key}
                      className={
                        idx === filterConfigs.length - 1
                          ? "flex flex-col"
                          : "flex flex-col border-b border-gray-500"
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
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 w-full">
          <div className="lg:hidden flex justify-end">
            <Button onClick={() => setIsFilter(true)} variant="outline">
              Filter <Settings2 />
            </Button>
          </div>

          {products.length ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p, i) => (
                <ProductCard key={`${p.title}-${i}`} {...p} />
              ))}
            </div>
          ) : (
            <div className="min-h-96 flex flex-col items-center justify-center">
              <ShoppingBag className="size-16 mb-4" />
              <h3 className="text-2xl font-bold">Coming Soon</h3>
              <div className="flex gap-3 mt-4">
                <Button onClick={() => refetch()} disabled={isRefetching}>
                  <RefreshCcw className={cn(isRefetching && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      categories: [],
                      suppliers: [],
                      pets: [],
                      promos: [],
                    })
                  }
                >
                  <X /> Clear Filter
                </Button>
              </div>
            </div>
          )}

          {paginate && data && (
            <PaginateSection
              page={page}
              setPage={setPage}
              paginate={paginate}
              data={data}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Client;
