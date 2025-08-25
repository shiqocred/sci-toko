import React from "react";
import Link from "next/link";

export const Address = () => {
  return (
    <div className="flex flex-col gap-4 md:gap-1.5 border-t pt-5 mt-3 lg:border-0 lg:pt-0 lg:mt-0">
      <div className="flex flex-col items-center text-xs gap-1">
        <span className="font-bold mr-2 text-black lg:hidden">Head Office</span>
        <p className="[--color:#707070] text-center text-xs text-[var(--color)]">
          <span className="font-bold mr-2 text-black hidden lg:inline-block">
            Head Office
          </span>
          Jl. RS Fatmawati No. 39, Komplek Duta Mas Fatmawati Blok A1 No. 30 -
          32, Cipete Utara, Kebayoran Baru, Jakarta Selatan, 12150
        </p>
      </div>
      <p className="[--color:#707070] text-center text-xs text-[var(--color)]">
        Copyright © 2025 PT Sehat Cerah Indonesia |{" "}
        <Link href={"/"} className="underline hover:text-black">
          SehatCerahIndonesia.com
        </Link>
      </p>
    </div>
  );
};
