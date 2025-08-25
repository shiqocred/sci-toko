import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchQuery } from "@/lib/search";
import { Button } from "../ui/button";
import { XCircle } from "lucide-react";

export const InputSearch = ({ pathname }: { pathname: string }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const q = useSearchParams().get("q");

  const { search, searchValue, setSearch } = useSearchQuery();

  useEffect(() => {
    if (searchValue.length > 0 && search.length > 0 && q && q.length > 0) {
      if (pathname === "/" || pathname.includes("/products")) {
        if (pathname !== "/products") {
          router.push(`/products?q=${searchValue}`);
        }
      } else {
        setSearch("");
      }
    }
  }, [pathname, searchValue, search, q]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;

  return (
    <div className="w-full relative flex items-center">
      <Input
        placeholder="Find Product"
        className="placeholder:text-center shadow-none border-sci focus-visible:outline-0 focus-visible:ring-0 focus-visible:border-sci-hover"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
      {search.length > 0 && (
        <Button
          size={"icon"}
          variant={"ghost"}
          className="size-6 absolute right-2"
          onClick={() => setSearch("")}
        >
          <XCircle className="size-3.5" />
        </Button>
      )}
    </div>
  );
};
