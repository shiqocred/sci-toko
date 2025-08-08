"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sizesImage } from "@/lib/utils";
import {
  BadgeCheck,
  CheckCircle,
  ChevronRight,
  Crown,
  Loader2,
  LogOut,
  MailWarning,
  Stethoscope,
  Store,
  User2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { MouseEvent } from "react";
import { Separator } from "@/components/ui/separator";
import { signOut, useSession } from "next-auth/react";
import { TooltipText } from "@/providers/tooltip-provider";
import Link from "next/link";
import { useSendOTP } from "../_api";
import { useRouter } from "next/navigation";
import { OrderTab } from "./_tabs/order";
import { ProfileTab } from "./_tabs/profile";
import { PasswordTab } from "./_tabs/password";
import { AddressTab } from "./_tabs/address";
import { parseAsString, useQueryState } from "nuqs";

const Client = () => {
  const { data, update } = useSession();
  const router = useRouter();
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("order")
  );

  const { mutate: sendOTP, isPending: isSendingOTP } = useSendOTP();

  const user = data?.user;

  const handleLogout = async (e: MouseEvent) => {
    e.preventDefault();
    await signOut({ redirect: true, redirectTo: "/" });
  };

  const handleSendOTP = (e: MouseEvent) => {
    e.preventDefault();
    sendOTP(
      {},
      {
        onSuccess: () => {
          router.push("/verification-email?from=account");
        },
      }
    );
  };

  return (
    <div className="bg-sky-50 h-full">
      <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-4 px-4 lg:px-8 py-14">
        {!user?.emailVerified && (
          <div className="w-full flex items-center gap-4 justify-between bg-yellow-100 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="size-8 flex items-center justify-center rounded-full bg-yellow-200">
                <MailWarning className="size-5" />
              </div>
              <p className="text-sm font-medium">
                Email verification is required to unlock all features.
              </p>
            </div>
            <Button
              size={"sm"}
              variant={"outline"}
              className="bg-transparent border-gray-700 hover:bg-yellow-200 text-xs font-medium"
              onClick={handleSendOTP}
              disabled={isSendingOTP}
            >
              {isSendingOTP && <Loader2 className="animate-spin" />}
              Verify{isSendingOTP}
            </Button>
          </div>
        )}
        <div className="w-full grid grid-cols-3 gap-6">
          <div className="col-span-1 w-full flex flex-col gap-4">
            <div className="bg-white shadow flex gap-4 p-5 rounded-lg">
              <div className="size-14 relative flex-none rounded-full overflow-hidden border bg-white">
                <Image
                  fill
                  src={user?.image ?? "/assets/images/logo-sci.png"}
                  alt="profile"
                  sizes={sizesImage}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col w-full gap-1">
                <h5 className="text-lg font-semibold">{user?.name}</h5>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  {user?.emailVerified && (
                    <TooltipText value="Verified">
                      <CheckCircle className="size-3 text-sci" />
                    </TooltipText>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{user?.phone}</p>
                {user?.role === "VETERINARIAN" && (
                  <Badge
                    className="bg-green-50 [a&]:hover:bg-green-100 border-green-600 text-green-600 rounded-full"
                    asChild
                  >
                    <Link href={"/choose-role/veterinarian"}>
                      <Stethoscope />
                      <p>Veterinarian</p>
                    </Link>
                  </Badge>
                )}
                {user?.role === "PETSHOP" && (
                  <Badge
                    className="bg-green-50 [a&]:hover:bg-green-100 border-green-600 text-green-600 rounded-full"
                    asChild
                  >
                    <Link href={"/choose-role/pet-shop"}>
                      <Store />
                      <p>Petshop</p>
                    </Link>
                  </Badge>
                )}
                {user?.role === "BASIC" && (
                  <Badge className="bg-green-50 hover:bg-green-50 border-green-600 text-green-600 rounded-full">
                    <User2 />
                    <p>Basic</p>
                  </Badge>
                )}
                {user?.role === "ADMIN" && (
                  <Badge className="bg-green-50 hover:bg-green-50 border-green-600 text-green-600 rounded-full">
                    <Crown />
                    <p>Admin</p>
                  </Badge>
                )}
              </div>
            </div>
            {user?.role !== "ADMIN" && user?.role !== "VETERINARIAN" && (
              <div className="bg-white text-black items-center shadow flex flex-col gap-3 p-5 rounded-lg h-auto">
                <div className="flex gap-3 w-full items-center">
                  <BadgeCheck className="size-9 text-white fill-sky-500 flex-none" />
                  <div className="flex flex-col w-full text-start gap-1">
                    <h5 className="text-base font-semibold">Get a verified</h5>
                    <p className="text-gray-500 text-xs text-wrap">
                      Upload required document to get exclusive deals
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2 w-full">
                  {user?.role === "BASIC" && (
                    <Button
                      className="w-full flex-auto"
                      size={"sm"}
                      variant={"sciOutline"}
                      asChild
                    >
                      <Link href={"/choose-role/pet-shop"}>
                        <Store />
                        Petshop
                        <ChevronRight />
                      </Link>
                    </Button>
                  )}
                  {(user?.role === "BASIC" || user?.role === "PETSHOP") && (
                    <Button
                      className="w-full flex-auto"
                      size={"sm"}
                      variant={"sciOutline"}
                      asChild
                    >
                      <Link href={"/choose-role/veterinarian"}>
                        <Stethoscope />
                        Veterinarian
                        <ChevronRight />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div className="bg-white text-black items-center shadow flex flex-col gap-3 p-5 rounded-lg h-auto">
              <Button
                className="w-full text-red-400 hover:bg-red-50 hover:text-red-500 justify-start"
                variant={"ghost"}
                onClick={handleLogout}
              >
                <LogOut />
                Logout
              </Button>
            </div>
          </div>
          <div className="w-full col-span-2">
            <div className="w-full rounded-lg overflow-hidden shadow">
              <Tabs
                value={tab}
                onValueChange={setTab}
                defaultValue="order"
                className="gap-0 h-full"
              >
                <TabsList className="w-full bg-transparent gap-1 p-0 h-12 shadow-none *:w-full *:h-12 *:flex-auto *:rounded-none *:shadow-none *:text-gray-500 *:bg-white *:hover:bg-green-50 *:hover:text-green-600 *:border-0 *:border-b-2 *:border-gray-300 *:data-[state=active]:shadow-none *:data-[state=active]:border-green-600 *:data-[state=active]:text-green-600 *:hover:data-[state=active]:bg-green-50">
                  <TabsTrigger value="order" asChild>
                    <Button>My Order</Button>
                  </TabsTrigger>
                  <TabsTrigger value="profile" asChild>
                    <Button>Basic Profile</Button>
                  </TabsTrigger>
                  <TabsTrigger value="password" asChild>
                    <Button>Change Password</Button>
                  </TabsTrigger>
                  <TabsTrigger value="address" asChild>
                    <Button>Shipping Address</Button>
                  </TabsTrigger>
                </TabsList>
                <OrderTab tab={tab} />
                <ProfileTab user={user} update={update} />
                <PasswordTab />
                <AddressTab />
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Client;
