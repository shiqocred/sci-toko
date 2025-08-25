import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FiltersProps } from "../../_api";
import { Button } from "@/components/ui/button";

export const DrawerFilter = ({
  open,
  onOpenChange,
  filters,
  filterConfigs,
  handleSelect,
  setFilters,
  resetFilter,
}: {
  open: boolean;
  onOpenChange: () => void;
  filters?: FiltersProps;
  filterConfigs: any[];
  handleSelect: (
    filterKey: "categories" | "suppliers" | "pets" | "promos",
    slug: string
  ) => void;
  setFilters: React.Dispatch<
    React.SetStateAction<{
      categories: string[];
      suppliers: string[];
      pets: string[];
      promos: string[];
    }>
  >;
  resetFilter: boolean;
}) => {
  if (!filters) return null;
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="z-10">
          <DrawerHeader className="!text-start px-4 pt-4 pb-2 border-b border-gray-200">
            <div className="w-full flex items-center gap-4 justify-between">
              <DrawerTitle className="text-2xl font-bold">Filters</DrawerTitle>
              {resetFilter && (
                <Button
                  className="text-xs border-gray-400 shadow-none rounded-full py-1 h-fit"
                  size={"sm"}
                  variant={"outline"}
                  onClick={() =>
                    setFilters({
                      categories: [],
                      suppliers: [],
                      pets: [],
                      promos: [],
                    })
                  }
                >
                  Reset filters
                </Button>
              )}
            </div>
            <DrawerDescription />
          </DrawerHeader>
          <div className="flex flex-col gap-5 px-4 pb-10 mt-3 overflow-y-auto">
            {filterConfigs.map((config) => (
              <div className="flex flex-col gap-3" key={config.key}>
                <h5 className="font-medium">{config.label}</h5>
                <div className="flex items-center flex-wrap gap-2">
                  {config.items.length > 0 ? (
                    config.items.map((item: any) => (
                      <Button
                        key={item.slug}
                        variant={
                          config.selected.includes(
                            encodeURIComponent(item.slug)
                          )
                            ? "default"
                            : "outline"
                        }
                        className="rounded-full text-xs"
                        size={"sm"}
                        onClick={() => handleSelect(config.key, item.slug)}
                      >
                        {item.name}
                      </Button>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">
                      {config.emptyLabel}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
