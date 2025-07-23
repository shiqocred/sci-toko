import { Heading } from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import React from "react";

// const data = [
//   "AB Vista",
//   "Biopharma",
//   "Calier",
//   "Delacon",
//   "DOXYE",
//   "Emivest",
//   "Evonik",
//   "Innovad NV/SA",
//   "Broad Spe",
//   "ITPSA",
//   "antibiotic",
//   "LanXess",
//   "number of",
//   "Lípidos Toledo S.A. (Liptosa)",
//   "Neofarma SRL",
//   "Read N",
//   "Norel",
//   "Nuscience/Royal Agrifirm",
//   "Shandong NB Group",
//   "Sumitomo Chemical",
//   "Zoetis",
//   "DOXY",
// ];

export const BySupplierSection = ({ data }: { data: any[] }) => {
  return (
    <div className="[--max-width:1240px] w-full max-w-[var(--max-width)] mx-auto px-4 lg:px-8 flex flex-col items-center gap-8 py-6">
      <Heading label="Shop By Supplier" />
      <div className="flex items-center justify-between flex-wrap gap-3 w-full">
        {data.map((item) => (
          <Link key={item.id} href={`/products?suppliers=${item.id}`}>
            <Badge
              variant={"outline"}
              className="px-5 py-2 text-base rounded-full capitalize border-gray-500"
            >
              {item.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};
