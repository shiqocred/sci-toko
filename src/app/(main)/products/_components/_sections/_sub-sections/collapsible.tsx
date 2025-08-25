"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterCollapsibleProps {
  items: { name: string; slug: string }[];
  selected: string[];
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onSelect: (slug: string) => void;
}

// Reusable FilterButton component
type FilterButtonProps = {
  item: { name: string; slug: string };
  selected: string[];
  onSelect: (slug: string) => void;
};

const FilterButton = ({ item, selected, onSelect }: FilterButtonProps) => (
  <Button
    key={item.slug}
    variant="ghost"
    className="w-full justify-start"
    onClick={() => onSelect(item.slug)}
  >
    <div
      className={cn(
        "rounded size-4 flex items-center justify-center border border-gray-500 [&_svg]:text-transparent",
        selected.includes(decodeURIComponent(item.slug)) &&
          "bg-primary border-primary [&_svg]:text-white"
      )}
    >
      <Check className="size-3" />
    </div>
    <p className="capitalize">{item.name}</p>
  </Button>
);

export const FilterCollapsible = ({
  items,
  selected,
  isOpen,
  onToggle,
  onSelect,
}: FilterCollapsibleProps) => {
  const shownItems = items.slice(0, 3);
  const hiddenItems = items.slice(3);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onToggle}
      className="flex flex-col w-full"
    >
      {shownItems.map((item) => (
        <FilterButton
          key={item.slug}
          item={item}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
      <CollapsibleContent className="flex flex-col w-full">
        {hiddenItems.map((item) => (
          <FilterButton
            key={item.slug}
            item={item}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </CollapsibleContent>
      {hiddenItems.length > 0 && (
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-green-600 hover:text-green-700 hover:underline hover:underline-offset-2 hover:bg-transparent bg-transparent"
          >
            <p>{isOpen ? "See Less" : "See More"}</p>
          </Button>
        </CollapsibleTrigger>
      )}
    </Collapsible>
  );
};
