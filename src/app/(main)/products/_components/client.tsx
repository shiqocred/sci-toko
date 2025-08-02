"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCcw,
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
import { FilterCollapsible } from "./filter-collapsible";

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
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const { data: dataFilters } = useGetFilters();
  const { data, refetch, isRefetching } = useGetProducts({
    categories: categories ?? undefined,
    suppliers: suppliers ?? undefined,
    pets: pets ?? undefined,
    promos: promos ?? undefined,
    p: page,
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
      setPage(data.data.pagination.page);
    }
  }, [data]);

  return (
    <div className="bg-sky-50 h-full">
      <div className="max-w-[1240px] mx-auto w-full flex gap-7 px-4 lg:px-8 py-14">
        <div className="relative">
          <div className="w-[250px] flex-none bg-white rounded-xl shadow sticky top-[2.5vh] overflow-hidden">
            <div className="w-full h-12 px-3.5 flex items-center">
              <h3 className="text-2xl font-bold">Filter</h3>
            </div>
            <div className="max-h-[calc(95vh-48px)] overflow-y-scroll px-3.5 py-2">
              {filters && (
                <Accordion
                  type="multiple"
                  defaultValue={["categories", "suppliers", "pets", "promos"]}
                >
                  <div className="flex flex-col border-b border-gray-500">
                    <AccordionItem value="categories">
                      <AccordionTrigger className="capitalize">
                        Categories
                      </AccordionTrigger>
                      <AccordionContent className="w-full">
                        {filters.categories.length > 0 ? (
                          <FilterCollapsible
                            items={filters.categories}
                            selected={categories}
                            isOpen={isOpen.categories}
                            onToggle={(open) =>
                              toggleExpand("categories", open)
                            }
                            onSelect={(slug) => {
                              if (
                                categories.includes(encodeURIComponent(slug))
                              ) {
                                setFilters((prev) => ({
                                  categories: prev.categories.filter(
                                    (i) => i !== encodeURIComponent(slug)
                                  ),
                                }));
                              } else {
                                setFilters((prev) => ({
                                  categories: [
                                    ...prev.categories,
                                    encodeURIComponent(slug),
                                  ],
                                }));
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-10 mb-5 gap-1 font-medium">
                            Categories not yet.
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                  <div className="flex flex-col border-b border-gray-500">
                    <AccordionItem value="suppliers">
                      <AccordionTrigger className="capitalize">
                        Suppliers
                      </AccordionTrigger>
                      <AccordionContent className="w-full">
                        {filters.suppliers.length > 0 ? (
                          <FilterCollapsible
                            items={filters.suppliers}
                            selected={suppliers}
                            isOpen={isOpen.suppliers}
                            onToggle={(open) => toggleExpand("suppliers", open)}
                            onSelect={(slug) => {
                              if (
                                suppliers.includes(encodeURIComponent(slug))
                              ) {
                                setFilters((prev) => ({
                                  suppliers: prev.suppliers.filter(
                                    (i) => i !== encodeURIComponent(slug)
                                  ),
                                }));
                              } else {
                                setFilters((prev) => ({
                                  suppliers: [
                                    ...prev.suppliers,
                                    encodeURIComponent(slug),
                                  ],
                                }));
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-10 mb-5 gap-1 font-medium">
                            Suppliers not yet.
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                  <div className="flex flex-col border-b border-gray-500">
                    <AccordionItem value="pets">
                      <AccordionTrigger className="capitalize">
                        Pets
                      </AccordionTrigger>
                      <AccordionContent className="w-full">
                        {filters.pets.length > 0 ? (
                          <FilterCollapsible
                            items={filters.pets}
                            selected={pets}
                            isOpen={isOpen.pets}
                            onToggle={(open) => toggleExpand("pets", open)}
                            onSelect={(slug) => {
                              if (pets.includes(encodeURIComponent(slug))) {
                                setFilters((prev) => ({
                                  pets: prev.pets.filter(
                                    (i) => i !== encodeURIComponent(slug)
                                  ),
                                }));
                              } else {
                                setFilters((prev) => ({
                                  pets: [
                                    ...prev.pets,
                                    encodeURIComponent(slug),
                                  ],
                                }));
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-10 mb-5 gap-1 font-medium">
                            Pets not yet.
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                  <div className="flex flex-col">
                    <AccordionItem value="promos">
                      <AccordionTrigger className="capitalize">
                        Promo
                      </AccordionTrigger>
                      <AccordionContent className="w-full">
                        {filters.promos.length > 0 ? (
                          <FilterCollapsible
                            items={filters.promos}
                            selected={promos}
                            isOpen={isOpen.promos}
                            onToggle={(open) => toggleExpand("promos", open)}
                            onSelect={(slug) => {
                              if (promos.includes(encodeURIComponent(slug))) {
                                setFilters((prev) => ({
                                  promos: prev.promos.filter(
                                    (i) => i !== encodeURIComponent(slug)
                                  ),
                                }));
                              } else {
                                setFilters((prev) => ({
                                  promos: [
                                    ...prev.promos,
                                    encodeURIComponent(slug),
                                  ],
                                }));
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-10 mb-5 gap-1 font-medium">
                            Promo not yet.
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                </Accordion>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-10 w-full min-h-full relative">
          {products && (
            <div className="grid grid-cols-4 gap-3.5 w-full">
              {products.length > 0 ? (
                products.map((item, idx) => (
                  <ProductCard key={`${item.title}-${idx}`} {...item} />
                ))
              ) : (
                <div className="h-full flex items-center justify-center flex-col col-span-4 absolute top-0 left-0 w-full text-center">
                  <div className="size-36 rounded-full flex items-center justify-center bg-white shadow -mt-16">
                    <ShoppingBag className="size-20 text-sci stroke-[1.5]" />
                  </div>
                  <h5 className="text-4xl font-bold mt-6">Coming Soon!</h5>
                  <p className="max-w-xl mx-auto mt-2 text-gray-600">
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
            <div className="w-full flex justify-center bg-white shadow rounded-lg py-3 mt-auto">
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
      </div>
    </div>
  );
};

export default Client;
