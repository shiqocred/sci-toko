"use client";

import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetProducts } from "../_api";

const filters = [
  {
    label: "animals",
    items: [
      "dogs",
      "cats",
      "birds",
      "horses",
      "cows",
      "sheep",
      "pigs",
      "chickens",
      "rabbits",
      "ducks",
    ],
  },
  {
    label: "category",
    items: [
      "Pet Medicine",
      "Farm Products",
      "Feed Additive",
      "Companion Animal",
    ],
  },
  {
    label: "promo",
    items: ["Discount", "Free Shipping", "Best Deal"],
  },
  {
    label: "supplier",
    items: [
      "AB Vista",
      "Biopharma",
      "Calier",
      "Delacon",
      "DOXYE",
      "Emivest",
      "Evonik",
      "Innovad NV/SA",
      "Broad Spe",
      "ITPSA",
      "antibiotic",
      "LanXess",
      "number of",
      "Lípidos Toledo S.A. (Liptosa)",
      "Neofarma SRL",
      "Read N",
      "Norel",
      "Nuscience/Royal Agrifirm",
      "Shandong NB Group",
      "Sumitomo Chemical",
      "Zoetis",
      "DOXY",
    ],
  },
];

const initialIsOpen = filters.reduce(
  (acc, item) => {
    acc[item.label] = false;
    return acc;
  },
  {} as Record<string, boolean>
);

const Client = () => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  const { data } = useGetProducts();

  const products = useMemo(() => {
    return data?.data.data;
  }, [data]);

  const toggleExpand = (label: string, open: boolean) => {
    setIsOpen((prev) => ({ ...prev, [label]: open }));
  };

  return (
    <div className="bg-sky-50 h-full">
      <div className="max-w-[1240px] mx-auto w-full flex gap-7 px-4 lg:px-8 py-14">
        <div className="relative">
          <div className="w-[250px] flex-none bg-white rounded-xl shadow sticky top-[2.5vh] overflow-hidden">
            <div className="w-full h-12 px-3.5 flex items-center">
              <h3 className="text-2xl font-bold">Filter</h3>
            </div>
            <div className="max-h-[calc(95vh-48px)] overflow-y-scroll px-3.5 py-2">
              <Accordion
                type="multiple"
                defaultValue={filters.map((item) => item.label)}
              >
                {filters.map((item, index) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex flex-col border-b border-gray-500",
                      index === filters.length - 1 && "border-0"
                    )}
                  >
                    <AccordionItem value={item.label}>
                      <AccordionTrigger className="capitalize">
                        {item.label}
                      </AccordionTrigger>
                      <AccordionContent
                        className={cn(
                          "w-full",
                          index === filters.length - 1 && "pb-0"
                        )}
                      >
                        <Collapsible
                          open={isOpen[item.label]}
                          onOpenChange={(open) =>
                            toggleExpand(item.label, open)
                          }
                          className="flex flex-col w-full"
                        >
                          {item.items.slice(0, 3).map((item) => (
                            <Button
                              key={item}
                              asChild
                              variant={"ghost"}
                              className="w-full justify-start"
                            >
                              <Label>
                                <Checkbox />
                                <p className="capitalize">{item}</p>
                              </Label>
                            </Button>
                          ))}
                          <CollapsibleContent className="flex flex-col w-full">
                            {item.items
                              .slice(3, item.items.length)
                              .map((item) => (
                                <Button
                                  key={item}
                                  asChild
                                  variant={"ghost"}
                                  className="w-full justify-start"
                                >
                                  <Label>
                                    <Checkbox />
                                    <p className="capitalize">{item}</p>
                                  </Label>
                                </Button>
                              ))}
                          </CollapsibleContent>
                          {item.items.length > 3 && (
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-green-600 hover:text-green-700 hover:underline hover:underline-offset-2 hover:bg-transparent bg-transparent"
                              >
                                <p>
                                  {isOpen[item.label] ? "See Less" : "See More"}
                                </p>
                                <span className="sr-only">Toggle</span>
                              </Button>
                            </CollapsibleTrigger>
                          )}
                        </Collapsible>
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-10 w-full">
          <div className="grid grid-cols-4 gap-3.5 w-full">
            {products &&
              products.map((item, idx) => (
                <ProductCard key={`${item.title}-${idx}`} {...item} />
              ))}
          </div>
          <div className="w-full flex justify-end">
            <div className="flex items-center *:hover:bg-green-200 *:hover:rounded-lg">
              <Button variant={"ghost"} size={"icon"}>
                <ChevronLeft />
              </Button>
              <Button variant={"ghost"} size={"icon"}>
                1
              </Button>
              <Button variant={"ghost"} size={"icon"}>
                2
              </Button>
              <Button
                variant={"ghost"}
                size={"icon"}
                disabled
                className="disabled:opacity-100"
              >
                ...
              </Button>
              <Button variant={"ghost"}>Last</Button>
              <Button variant={"ghost"} size={"icon"}>
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Client;
