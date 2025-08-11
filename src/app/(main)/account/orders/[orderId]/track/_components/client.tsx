"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Clock,
  FileCheckIcon,
  PackageCheck,
  RefreshCcw,
  Truck,
  UserX2,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import { useGetOrderTrack } from "../_api";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";

const Client = () => {
  const { orderId } = useParams();

  const { data } = useGetOrderTrack({ orderId: orderId as string });
  const histories = useMemo(() => data?.data, [data]);
  return (
    <div className="bg-white p-5 flex flex-col text-sm gap-4">
      <div className="flex items-center w-full justify-between border-b border-gray-400 pb-4">
        <div className="flex items-center gap-3">
          <Button size={"icon"} variant={"ghost"} className="size-7" asChild>
            <Link href={`/account/orders/${orderId}`}>
              <ArrowLeft />
            </Link>
          </Button>
          <h4 className="font-bold text-base">Track Order</h4>
        </div>
      </div>
      {histories && (
        <Timeline>
          {histories.map((item) => (
            <TimelineItem
              key={item.id}
              step={0}
              className="group-data-[orientation=vertical]/timeline:ms-10"
            >
              <TimelineHeader>
                <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
                <TimelineDate className="mt-1 text-xs">
                  {format(item.updatedAt ?? new Date(), "PPP HH:mm:ss", {
                    locale: id,
                  })}
                </TimelineDate>
                <TimelineIndicator
                  className={cn(
                    "bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7",
                    (item.status === "CONFIRMED" ||
                      item.status === "ALLOCATED") &&
                      "!bg-blue-500",
                    item.status === "DELIVERED" && "!bg-green-500",
                    (item.status === "RETURNED" ||
                      item.status === "RETURN_IN_TRANSIT" ||
                      item.status === "ON_HOLD") &&
                      "!bg-orange-500",
                    (item.status === "COURIER_NOT_FOUND" ||
                      item.status === "DISPOSED" ||
                      item.status === "CANCELLED") &&
                      "!bg-red-500"
                  )}
                >
                  {(item.status === "CONFIRMED" ||
                    item.status === "ALLOCATED") && <FileCheckIcon size={14} />}
                  {(item.status === "PICKING_UP" ||
                    item.status === "DROPPING_OFF") && <Truck size={14} />}
                  {item.status === "PICKED" && <PackageCheck size={14} />}
                  {item.status === "COURIER_NOT_FOUND" && <UserX2 size={14} />}
                  {(item.status === "DISPOSED" ||
                    item.status === "CANCELLED") && <X size={14} />}
                  {(item.status === "RETURNED" ||
                    item.status === "RETURN_IN_TRANSIT") && (
                    <RefreshCcw size={14} />
                  )}
                  {item.status === "DELIVERED" && <Check size={14} />}
                  {item.status === "ON_HOLD" && <Clock size={14} />}
                </TimelineIndicator>
              </TimelineHeader>
              <TimelineContent>
                <TimelineTitle className="mt-0.5 text-sm">
                  {item.note}
                </TimelineTitle>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </div>
  );
};

export default Client;
