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
    <div className="flex w-full justify-between gap-6 max-w-3xl">
      {data.map((item, idx) => (
        <ul key={item.title} className="flex flex-col">
          <li className="font-bold text-xl pb-3">{item.title}</li>
          {item.menus.map((subItem) => (
            <li
              key={subItem.name}
              className={cn(
                "[--color:#707070] text-[var(--color)] pl-5 h-10",
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
