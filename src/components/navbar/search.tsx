import React from "react";
import { SearchIcon } from "lucide-react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const Search = () => {
  return (
    <div className="[--margin-inline:50px] w-full mx-[var(--margin-inline)] flex items-center justify-center">
      <Input
        placeholder="Find Product"
        className="placeholder:text-center shadow-none rounded-r-none border-r-0 border-sci focus-visible:outline-0 focus-visible:ring-0 focus-visible:border-sci-hover"
      />
      <Button
        size={"icon"}
        className="rounded-l-none bg-sci hover:bg-sci-hover"
      >
        <SearchIcon />
      </Button>
    </div>
  );
};
