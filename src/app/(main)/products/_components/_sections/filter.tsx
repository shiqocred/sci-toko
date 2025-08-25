import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FilterCollapsible } from "./_sub-sections/collapsible";

export const FiltersSection = ({
  config,
  handleSelect,
}: {
  config: {
    key: string;
    label: string;
    emptyLabel: string;
    items: any[];
    selected: string[];
    isOpen: boolean;
    onToggle: (open: boolean) => void;
  };
  handleSelect: (
    filterKey: "categories" | "suppliers" | "pets" | "promos",
    slug: string
  ) => void;
}) => {
  return (
    <AccordionItem value={config.key}>
      <AccordionTrigger className="capitalize">{config.label}</AccordionTrigger>
      <AccordionContent className="w-full">
        {config.items.length > 0 ? (
          <FilterCollapsible
            items={config.items}
            selected={config.selected}
            isOpen={config.isOpen}
            onToggle={config.onToggle}
            onSelect={(slug) => handleSelect(config.key as any, slug)}
          />
        ) : (
          <div className="flex items-center justify-center h-10 mb-5 gap-1 font-medium">
            {config.emptyLabel}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
