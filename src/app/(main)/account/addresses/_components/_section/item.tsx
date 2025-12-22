import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleDot, Edit, MoreHorizontal, Trash2 } from "lucide-react";

export const AddressItem = ({
  item,
  isDeleting,
  isSettingDefault,
  setAddress,
  handleDelete,
  handleSetDefault,
}: {
  item: any;
  isDeleting: boolean;
  isSettingDefault: boolean;
  setAddress: (obj: { address: string; id?: string }) => void;
  handleDelete: (id: string) => void;
  handleSetDefault: (id: string) => void;
}) => (
  <div className="flex flex-col border border-green-500 rounded-md">
    <div className="flex gap-3 md:gap-4 flex-col p-2 md:p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-semibold md:text-lg">{item.name}</p>
          <p className="text-xs">{item.phone}</p>
        </div>
        <div className="flex items-center gap-2">
          {item.isDefault && (
            <Badge className="rounded-full bg-green-200 text-black">
              Default
            </Badge>
          )}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-7"
                disabled={isDeleting || isSettingDefault}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  disabled={isDeleting || isSettingDefault || item.isDefault}
                  onSelect={() => handleSetDefault(item.id)}
                >
                  <CircleDot />
                  Set is Default
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDeleting || isSettingDefault}
                  onSelect={() => setAddress({ address: "edit", id: item.id })}
                >
                  <Edit />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDeleting || isSettingDefault}
                  onSelect={() => handleDelete(item.id)}
                  className="focus:bg-red-100 focus:text-red-500 group text-red-500"
                >
                  <Trash2 className="group-focus:text-red-500" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex flex-col gap-1 md:gap-1.5 text-xs md:text-sm leading-relaxed">
        <p className="text-gray-600">{item.detail}</p>
        <p>{item.address}</p>
      </div>
    </div>
  </div>
);
