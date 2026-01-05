"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { SessionType } from "./client";
import { useUpdateUser } from "../_api";
import Image from "next/image";
import { cn, sizesImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { LabelInput } from "@/components/label-input";

export const FormSection = ({ session }: { session: SessionType }) => {
  const { data, update } = session;
  const user = data?.user;
  const [dialCode, setDialCode] = useState(user?.phone?.split(" ")[0] ?? "+62");
  const [input, setInput] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone?.split(" ")[1] ?? "",
    image: null as File | null,
  });
  const [imageOld, setImageOld] = useState<string | null>(null);

  const isChanged = useMemo(
    () =>
      input.name !== user?.name ||
      input.email !== user?.email ||
      `${dialCode} ${input.phone}` !== user?.phone,
    [input, dialCode, user],
  );

  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUser();

  // Cek apakah ada perubahan pada data

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
      user?.image && user.image === imageOld ? user.image : "",
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
      },
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

  const imageUrl = useMemo(() => {
    if (input.image) return URL.createObjectURL(input.image);
    if (imageOld) return imageOld;
    return "/assets/images/logo-sci.png";
  }, [input.image, imageOld]);
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="flex flex-col items-center gap-3">
        <div className="size-24 md:size-28 lg:size-32 relative rounded-full overflow-hidden border">
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
        className="md:col-span-2 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Type your name"
              className={cn(
                "bg-gray-100 focus-visible:ring-0 shadow-none focus-visible:border-gray-500",
                input.name !== user?.name &&
                  "border-green-500 focus-visible:border-green-500",
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
                  "border-green-500 focus-visible:border-green-500",
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
                "border-green-500 focus-visible:border-green-500",
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
    </div>
  );
};
