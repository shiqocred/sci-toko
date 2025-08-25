import React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface MenusProps {
  title: string;
  menus: {
    name: string;
    href: string | undefined;
  }[];
}

export const Menus = ({ data }: { data: MenusProps[] }) => {
  return (
    <div className="flex w-full flex-col md:flex-row justify-between gap-4 md:gap-6 max-w-3xl text-sm lg:text-base leading-relaxed">
      {data.map((item, idx) => (
        <ul key={item.title} className="flex flex-col">
          <li className="font-bold text-lg lg:text-xl pb-2 md:pb-3">
            {item.title}
          </li>
          {item.menus.map((subItem) => (
            <li
              key={subItem.name}
              className={cn(
                "[--color:#707070] text-[var(--color)] pl-3 lg:pl-5 h-8 lg:h-10",
                idx === data.length - 1 && "h-auto"
              )}
            >
              {subItem.href ? (
                <Link href={subItem.href} className="hover:text-black">
                  {subItem.name}
                </Link>
              ) : (
                subItem.name
              )}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
};
