"use client";

import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  Loader,
  SendIcon,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { MouseEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { LabelInput } from "@/components/label-input";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useGetReviewTrack, useSubmitReview } from "../_api";
import { sizesImage } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const Client = () => {
  const { orderId } = useParams();

  const [input, setInput] = useState({
    title: "",
    images: null as File[] | null,
    description: "",
    rating: 5,
  });
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const [errorImage, setErrorImage] = useState(false);

  const { mutate: submitReview } = useSubmitReview();

  const { data, isPending } = useGetReviewTrack({ orderId: orderId as string });

  const reviewData = useMemo(() => data?.data, [data]);

  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault();
    const body = new FormData();
    body.append("title", input.title);
    body.append("description", input.description);
    body.append("rating", input.rating.toString());
    if (input.images) input.images.map((i) => body.append("images", i));
    submitReview({ body, params: { id: orderId as string } });
  };

  return (
    <div className="bg-white p-3 md:p-5 flex flex-col text-sm gap-4">
      <div className="flex items-center w-full justify-between border-b border-gray-400 pb-4">
        <div className="flex items-center gap-3">
          <Button size={"icon"} variant={"ghost"} className="size-7" asChild>
            <Link href={`/account/orders/${orderId}`}>
              <ArrowLeft />
            </Link>
          </Button>
          <h4 className="font-bold text-base">Rate Order</h4>
        </div>
      </div>
      {isPending ? (
        <div className="w-full gap-1 flex items-center justify-center flex-col h-[200px]">
          <Loader className="animate-spin size-5" />
          <p className="ml-2 text-sm animate-pulse">Loader...</p>
        </div>
      ) : (
        <div className="w-full">
          {reviewData ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col">
                <h5 className="text-xl font-semibold">{reviewData.title}</h5>
                <p className="text-sm text-gray-400">
                  {reviewData.timestamp
                    ? format(new Date(reviewData.timestamp), "PPP HH:mm", {
                        locale: id,
                      })
                    : "-"}
                </p>
              </div>
              <Rating defaultValue={input.rating} readOnly>
                {Array.from({ length: 5 }).map((_, index) => (
                  <RatingButton
                    key={index}
                    className="text-yellow-500"
                    size={20}
                  />
                ))}
              </Rating>
              <p>{`"${reviewData.description}"`}</p>
              <div className="grid grid-cols-3 lg:grid-cols-7 gap-3">
                {reviewData.images.map((i) => (
                  <div
                    key={i}
                    className="w-full aspect-square relative rounded-md overflow-hidden border shadow"
                  >
                    <Image fill alt="Review" src={i} sizes={sizesImage} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <LabelInput
                label="Title"
                placeholder="Type title review"
                value={input.title}
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <div className="flex flex-col gap-1.5">
                <Label>Product Quality</Label>
                <Rating
                  value={input.rating}
                  onValueChange={(e) =>
                    setInput((prev) => ({ ...prev, rating: e }))
                  }
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RatingButton
                      key={index}
                      className="text-yellow-500 size-7"
                    />
                  ))}
                </Rating>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Description</Label>
                <Textarea
                  className="min-h-32 focus-visible:ring-0 focus-visible:border-gray-400 placeholder:text-gray-500 placeholder:text-xs"
                  placeholder="Share more thought on the product to help other buyers..."
                  value={input.description}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              {(!input.images ||
                (input.images && input.images?.length < 5)) && (
                <Label className="px-3 py-1.5 bg-sci rounded-md w-fit h-8 text-white hover:bg-sci-hover">
                  <ImageIcon className="size-4" />
                  Add Images
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      const newFiles = e.target.files
                        ? Array.from(e.target.files)
                        : [];
                      setInput((prev) => {
                        const combined = [...(prev.images || []), ...newFiles];
                        if (combined.length > 5) {
                          setErrorImage(true);
                          return { ...prev, images: combined.slice(0, 5) };
                        }
                        return { ...prev, images: combined };
                      });
                    }}
                  />
                </Label>
              )}
              {input.images && (
                <div className="grid grid-cols-3 lg:grid-cols-7 gap-3">
                  {input.images.map((i, idx) => (
                    <div
                      key={`${i.name}-${idx}`}
                      className="w-full aspect-square relative rounded-md overflow-hidden border shadow group"
                      onMouseEnter={() => setSelectedImage(idx)}
                      onMouseLeave={() => setSelectedImage(null)}
                    >
                      <Image
                        fill
                        alt="Review"
                        src={URL.createObjectURL(i)}
                        sizes={sizesImage}
                      />
                      {selectedImage === idx && (
                        <div className="size-full backdrop-blur-sm flex items-center rounded-md justify-center bg-black/10">
                          <Button
                            size={"icon"}
                            variant={"outline"}
                            className="hover:bg-red-100 text-red-500 hover:text-red-500"
                            onClick={() =>
                              setInput((prev) => ({
                                ...prev,
                                images:
                                  prev.images &&
                                  prev.images.filter((v) => v !== i),
                              }))
                            }
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {errorImage && (
                <div className="w-full px-3 py-2 text-xs md:text-sm lg:text-base lg:px-5 lg:py-2.5 flex items-center gap-2 border rounded-md bg-red-100 text-red-500 border-red-200 font-medium">
                  <AlertCircle className="size-3.5 md:size-4" />
                  <p>Maximum 5 images</p>
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    className="text-red-500 hover:bg-red-200 size-5 md:size-7 hover:text-red-500 ml-auto"
                    onClick={() => setErrorImage(false)}
                  >
                    <X className="size-3.5 md:size-4" />
                  </Button>
                </div>
              )}
              <Button
                variant={"destructive"}
                size={"sm"}
                onClick={handleSubmit}
              >
                <SendIcon />
                Submit
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Client;
