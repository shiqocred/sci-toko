import { LabelInput } from "@/components/label-input";
import { MessageInputError } from "@/components/message-input-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useDeleteUser } from "../_api";

export const DialogDelete = ({
  disabled,
  open,
  onOpenChange,
}: {
  disabled: boolean;
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}) => {
  const [errorEmail, setErrorEmail] = useState<string>("");
  const [inputEmail, setInputEmail] = useState<string>("");
  const { mutate: deleteUser, isPending: isDeletingUser } = useDeleteUser();

  const handleDeleteUser = () => {
    deleteUser(
      { searchParams: { email: encodeURIComponent(inputEmail) } },
      {
        onError: (error) => {
          setErrorEmail((error.response?.data as any)?.message);
        },
      }
    );
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        onOpenChange(!open);
        if (!e) setInputEmail("");
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructiveOutline"
          className="rounded-full w-full flex-auto"
          disabled={disabled}
        >
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="gap-4">
          <div className="flex items-center justify-center size-12 mx-auto rounded-full bg-destructive/10">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl font-semibold text-center">
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex flex-col w-full gap-1.5">
          <LabelInput
            label="Please type your email to confirm"
            className={errorEmail && "border-red-500 hover:border-red-500"}
            placeholder="Type your email..."
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            disabled={disabled && isDeletingUser}
          />
          <MessageInputError error={errorEmail} />
        </div>
        <DialogFooter>
          <Button
            onClick={handleDeleteUser}
            variant={"destructive"}
            type="button"
            disabled={disabled && isDeletingUser}
          >
            Delete Account
          </Button>
          <Button
            variant={"outline"}
            type="button"
            disabled={disabled && isDeletingUser}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
