import { LabelInput } from "@/components/label-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { cn, sizesImage } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useUpdateUser } from "../../_api";
import { UpdateSession } from "next-auth/react";

interface UserSessionProps {
  id: string;
  name: string | null;
  email: string | null;
  role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
  emailVerified: Date | null;
  phone: string | null;
  image: string | null;
}

interface ProfileTabProps {
  user: UserSessionProps | undefined;
  update: UpdateSession;
}

export const ProfileTab = ({ user, update }: ProfileTabProps) => {
  const [dialCode, setDialCode] = useState("+62");
  const [input, setInput] = useState({
    name: "",
    email: "",
    phone: "",
    image: null as File | null,
  });
  const [imageOld, setImageOld] = useState<string | null>(null);

  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUser();

  // Cek apakah ada perubahan pada data
  const isChanged = useMemo(
    () =>
      input.name !== user?.name ||
      input.email !== user?.email ||
      `${dialCode} ${input.phone}` !== user?.phone,
    [input, dialCode, user]
  );

  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("email", input.email);
    formData.append("phone", `${dialCode} ${input.phone}`);
    if (input.image) {
      formData.append("image", input.image);
    }
    formData.append(
      "imageOld",
      user?.image && user.image === imageOld ? user.image : ""
    );

    updateUser(
      { body: formData },
      {
        onSuccess: async (data) => {
          const userRes = data.data.data;
          await update({
            emailVerified: userRes.emailVerified,
            name: userRes.name,
            email: userRes.email,
            phone: userRes.phoneNumber,
            image: userRes.image,
          });
        },
      }
    );
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setInput((prev) => ({ ...prev, image: file ?? null }));
  };

  const removeImage = () => {
    setInput((prev) => ({ ...prev, image: null }));
    setImageOld(null);
  };

  useEffect(() => {
    if (user) {
      const phoneParts = user.phone?.split(" ") ?? ["+62", ""];
      setInput({
        name: user.name ?? "",
        email: user.email ?? "",
        phone: phoneParts[1],
        image: null,
      });
      setDialCode(phoneParts[0]);
      setImageOld(user.image);
    }
  }, [user]);

  const imageUrl = useMemo(() => {
    if (input.image) return URL.createObjectURL(input.image);
    if (imageOld) return imageOld;
    return "/assets/images/logo-sci.png";
  }, [input.image, imageOld]);

  return (
    <TabsContent
      value="profile"
      className="bg-white p-5 grid grid-cols-3 text-sm gap-4"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="size-32 relative rounded-full overflow-hidden border">
          <Image
            fill
            alt="profile"
            src={imageUrl}
            sizes={sizesImage}
            className="object-cover"
          />
        </div>

        <Button
          variant="link"
          type="button"
          className="text-green-600 hover:text-green-700"
          asChild
        >
          <Label>
            <Input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUpdatingUser}
            />
            <span>Change Photo Profile</span>
          </Label>
        </Button>

        {(input.image || imageOld) && (
          <Button
            onClick={removeImage}
            variant="destructive"
            size="sm"
            className="text-xs"
            disabled={isUpdatingUser}
          >
            <Trash2 className="size-3 mr-1" />
            Delete Image
          </Button>
        )}
      </div>

      <form
        onSubmit={handleUpdateUser}
        className="col-span-2 flex flex-col gap-4"
      >
        <div className="flex justify-between items-center">
          <h5 className="font-bold">Basic Info</h5>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Type your name"
              className={cn(
                "bg-gray-100 focus-visible:ring-0 shadow-none focus-visible:border-gray-500",
                input.name !== user?.name &&
                  "border-green-500 focus-visible:border-green-500"
              )}
              value={input.name}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isUpdatingUser}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Type your email"
              className={cn(
                "bg-gray-100 focus-visible:ring-0 shadow-none focus-visible:border-gray-500",
                input.email !== user?.email &&
                  "border-green-500 focus-visible:border-green-500"
              )}
              value={input.email}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={isUpdatingUser}
            />
          </div>

          <LabelInput
            label="Phone Number"
            className={cn(
              "bg-gray-100 border-gray-100 focus-visible:border-gray-500",
              `${dialCode} ${input.phone}` !== user?.phone &&
                "border-green-500 focus-visible:border-green-500"
            )}
            isPhone
            value={input.phone}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, phone: e.target.value }))
            }
            dialCode={dialCode}
            setDialCode={setDialCode}
            disabled={isUpdatingUser}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            variant="destructive"
            className="rounded-full w-full flex-auto"
            disabled={
              (!isChanged || isUpdatingUser) &&
              !input.image &&
              imageOld === user?.image
            }
          >
            Save
          </Button>
          <Button
            type="button"
            variant="destructiveOutline"
            className="rounded-full w-full flex-auto"
            disabled={isUpdatingUser}
          >
            Delete Account
          </Button>
        </div>
      </form>
    </TabsContent>
  );
};
