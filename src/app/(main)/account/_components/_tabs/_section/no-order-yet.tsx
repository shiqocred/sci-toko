import { ShoppingCart } from "lucide-react";
import React from "react";

export const NoOrderYet = () => {
  return (
    <div className="flex p-3 border border-red-500 rounded-md gap-3 items-center">
      <div className="size-8 rounded-full bg-red-500 flex items-center justify-center">
        <ShoppingCart className="text-white size-4 flex-none " />
      </div>
      <div className="flex flex-col w-full">
        <h5 className="font-semibold text-red-500 text-lg">
          You haven&apos;t placed an order yet!
        </h5>
        <p className="text-gray-700 text-sm">
          Explore, shop now, and find amazing deals just for you and your pets!
        </p>
      </div>
    </div>
  );
};
