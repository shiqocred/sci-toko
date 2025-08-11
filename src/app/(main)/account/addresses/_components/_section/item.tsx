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
    <div className="flex gap-4 flex-col p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-lg">{item.name}</p>
          <p className="text-xs">{item.phone}</p>
        </div>
        <div className="flex items-center gap-2">
          {item.isDefault && (
            <Badge className="rounded-full bg-green-400 text-black">
              Default
            </Badge>
          )}
          <DropdownMenu>
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
            <DropdownMenuContent>
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
                  className="focus:bg-red-100 focus:text-red-500 group"
                >
                  <Trash2 className="group-focus:text-red-500" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-sm">
        <p>{item.detail}</p>
        <p>{item.address}</p>
      </div>
    </div>
  </div>
);
