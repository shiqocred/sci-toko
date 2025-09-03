"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader, MessageSquareOffIcon, XIcon } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import { useGetFaqs } from "../_api";
import { useSearchQuery } from "@/lib/search";
import { cn } from "@/lib/utils";

export const Client = () => {
  const { search, searchValue, setSearch } = useSearchQuery();
  const { data: faqs, isPending } = useGetFaqs({ q: searchValue });

  const faqsList = useMemo(() => faqs?.data ?? [], [faqs]);
  return (
    <div className="bg-sky-50 h-full">
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-4 md:gap-7 px-4 lg:px-8 pt-10 md:pt-14 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center md:gap-2">
            <Button
              variant={"ghost"}
              size={"icon"}
              className="hover:bg-green-200"
            >
              <Link href={"/"}>
                <ArrowLeft className="size-5 stroke-2" />
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">FAQ&apos;s</h1>
          </div>
          <Button variant={"link"} asChild>
            <Link href={"/policies/privacy"}>Policies</Link>
          </Button>
        </div>
        <div className="flex flex-col w-full gap-12">
          <div className="w-full rounded-lg bg-sci items-center justify-center flex-col gap-3 md:gap-4 lg:gap-6 flex p-6 lg:p-8">
            <h3 className="text-xl lg:text-4xl text-white font-semibold">
              Hi, how can we help?
            </h3>
            <div className="relative max-w-2xl  w-full flex items-center">
              <Input
                className="h-10 w-full border-0 focus-visible:ring-0 bg-white placeholder:text-sm"
                placeholder="e.g. shipping"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                className={cn(
                  "absolute right-2 size-7 rounded-full hover:bg-green-100 hidden",
                  search.length > 0 && "flex"
                )}
                variant={"ghost"}
                size={"icon"}
                onClick={() => setSearch("")}
              >
                <XIcon />
              </Button>
            </div>
          </div>
          {isPending ? (
            <div className="w-full flex flex-col h-[200px] lg:h-[300px] gap-2 items-center justify-center">
              <Loader className="size-5 animate-spin" />
              <p className="text-sm ml-2 animate-pulse">Loading...</p>
            </div>
          ) : (
            <div className="max-w-3xl w-full mx-auto">
              {faqsList.length > 0 ? (
                <Accordion
                  type="single"
                  collapsible
                  className="border rounded-lg border-gray-300 divide-gray-300 px-3 lg:px-5"
                >
                  {faqsList.map((i, idx) => (
                    <AccordionItem
                      key={`${i.question}-${idx}`}
                      value={`${i.question}-${idx}`}
                    >
                      <AccordionTrigger className="lg:text-base">
                        {i.question}
                      </AccordionTrigger>
                      <AccordionContent className="leading-relaxed text-gray-600">
                        {i.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="w-full flex flex-col gap-4 items-center justify-center h-[200px] md:h-[300px]">
                  <div className="size-14 md:size-16 lg:size-20 flex items-center justify-center bg-sci rounded-full text-white">
                    <MessageSquareOffIcon className="size-6 md:size-7 lg:size-8" />
                  </div>
                  <p className="text-sm md:text-base font-medium">
                    No frequently asked questions yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
