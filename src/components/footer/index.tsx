"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Facebook, Instagram, LinkedinIcon } from "lucide-react";

import { Sosmed } from "./sosmed";
import { Menus } from "./menus";
import { Address } from "./address";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useGetFooter } from "./_api";
import { useGetContact } from "@/app/(main)/account/_api";

export const Footer = () => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const { data: footer } = useGetFooter();
  const { data: contact } = useGetContact();
  const contactUrl = useMemo(() => contact?.data ?? "", [contact]);

  const footerRes = useMemo(() => footer?.data, [footer]);

  const data = {
    menu: [
      {
        title: "Online Shopping",
        menus: [
          {
            name: "Cats",
            href: "/products?pets=pets-67890",
          },
          {
            name: "Dogs",
            href: "/products?pets=dogs-12345",
          },
        ],
      },
      {
        title: "Quick Links",
        menus: [
          {
            name: "My Account",
            href: "/account",
          },
          {
            name: "Contact Us",
            href: contactUrl,
          },
          {
            name: "FAQ's",
            href: "/faqs",
          },
          {
            name: "Refund Policy",
            href: "/policies/refund",
          },
          {
            name: "Privacy Policy",
            href: "/policies/privacy",
          },
          {
            name: "Term of Use",
            href: "/policies/term-of-use",
          },
        ],
      },
      {
        title: "Opening Hours",
        menus: [
          {
            name: "Monday-Friday: 08:30 AM - 05:30 PM",
            href: undefined,
          },
          {
            name: "Saturday, Sunday & National Holiday: Closed",
            href: undefined,
          },
        ],
      },
    ],
  };

  const sosmedList = [
    {
      title: "linkedIn",
      icon: LinkedinIcon,
      className: "fill-white stroke-[0.5]",
      href: footerRes?.sosmed.linkedin ?? "#",
    },
    {
      title: "instagram",
      icon: Instagram,
      className: "",
      href: footerRes?.sosmed.instagram ?? "#",
    },
    {
      title: "facebook",
      icon: Facebook,
      className: "fill-white stroke-[0.5]",
      href: footerRes?.sosmed.facebook ?? "#",
    },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div></div>;
  }
  return (
    <div className="[--color:#CCCCCC] w-full bg-white flex-col gap-6 border-t border-[var(--color)] pt-12 mt-auto flex">
      <div
        className={cn(
          "[--max-width-foot:1240px] flex flex-col gap-6 w-full max-w-[var(--max-width-foot)] mx-auto px-4 lg:px-8",
          pathname.includes("/products") &&
            pathname !== "/products" &&
            "pb-5 md:pb-0",
          pathname === "/cart" && "pb-16 md:pb-20 lg:pb-0"
        )}
      >
        <div className="flex justify-between flex-col lg:flex-row gap-6">
          <Sosmed data={sosmedList} />
          <Menus data={data.menu} />
        </div>
        <Address data={footerRes?.store} />
      </div>
      <div
        className="[--height-grass:85px] h-[var(--height-grass)] w-full aspect-[1140/85] relative bg-repeat-x bg-[position:center_bottom] bg-[length:auto_100%]"
        style={{
          backgroundImage: "url('/assets/images/grass.webp')",
        }}
      />
    </div>
  );
};
