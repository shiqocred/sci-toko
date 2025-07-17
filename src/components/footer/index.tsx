import React from "react";
import { Facebook, Instagram, LinkedinIcon } from "lucide-react";

import { Sosmed } from "./sosmed";
import { Menus } from "./menus";
import { Address } from "./address";

const data = {
  sosmed: [
    {
      title: "linkedIn",
      icon: LinkedinIcon,
      className: "fill-white stroke-[0.5]",
    },
    {
      title: "instagram",
      icon: Instagram,
      className: "",
    },
    {
      title: "facebook",
      icon: Facebook,
      className: "fill-white stroke-[0.5]",
    },
  ],
  menu: [
    {
      title: "Online Shopping",
      menus: [
        {
          name: "Cats",
          href: "#",
        },
        {
          name: "Dogs",
          href: "#",
        },
        {
          name: "Promos",
          href: "#",
        },
      ],
    },
    {
      title: "Quick Links",
      menus: [
        {
          name: "My Account",
          href: "#",
        },
        {
          name: "Track Your Order",
          href: "#",
        },
        {
          name: "Refund Policy",
          href: "#",
        },
        {
          name: "Privacy Policy",
          href: "#",
        },
        {
          name: "Term of Use",
          href: "#",
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
          name: "Saturday & Sunday: Closed",
          href: undefined,
        },
      ],
    },
  ],
};

export const Footer = () => {
  return (
    <div className="[--color:#CCCCCC] w-full bg-white flex flex-col gap-6 border-t border-[var(--color)] pt-12 mt-auto">
      <div className="[--max-width-foot:1240px] flex flex-col gap-6 w-full max-w-[var(--max-width-foot)] mx-auto px-4 lg:px-8">
        <div className="flex justify-between">
          <Sosmed data={data.sosmed} />
          <Menus data={data.menu} />
        </div>
        <Address />
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
