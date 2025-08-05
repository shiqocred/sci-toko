"use client";

import { LabelInput } from "@/components/label-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CircleDot,
  Edit,
  Locate,
  LocateOff,
  MapPinned,
  MoreHorizontal,
  PlusCircle,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import React, {
  ChangeEvent,
  Dispatch,
  FormEvent,
  MouseEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { useDebounce } from "@/hooks/use-debounce";
import { apiGMaps } from "@/config";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  useAddAddress,
  useDeleteAddress,
  useGetAddress,
  useGetAddresses,
  useSetDefaultAddress,
} from "../../_api";
import { cn } from "@/lib/utils";
import { MessageInputError } from "@/components/message-input-error";
import { Badge } from "@/components/ui/badge";
import { useUpdateAddress } from "../../_api/mutation/use-update-address";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";

const initialValue = {
  address: "",
  district: "",
  city: "",
  province: "",
  latitude: "",
  longitude: "",
  postal_code: "",
  detail: "",
  name: "",
  phone: "",
  is_default: false,
};

export const AddressTab = () => {
  const router = useRouter();
  const [{ address, id: addressId }, setAddress] = useQueryStates({
    address: parseAsString.withDefault(""),
    id: parseAsString.withDefault(""),
  });
  const [dialCode, setDialCode] = useState("+62");
  const [errors, setErrors] = useState({
    address: "",
    district: "",
    city: "",
    province: "",
    latitude: "",
    longitude: "",
    postal_code: "",
    detail: "",
    name: "",
    phone: "",
    is_default: "",
  });

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Address?",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: addAddress, isPending: isAdding } = useAddAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefault, isPending: isSettingDefault } =
    useSetDefaultAddress();

  const [input, setInput] = useState<{
    address: string;
    district: string;
    city: string;
    province: string;
    latitude: string;
    longitude: string;
    postal_code: string;
    detail: string;
    name: string;
    phone: string;
    is_default: boolean | "indeterminate";
  }>(initialValue);

  const { data, isPending } = useGetAddresses();
  const { data: detailAddress, isPending: isPendingDetailAddress } =
    useGetAddress({ id: addressId });

  const listAddresses = useMemo(() => {
    return data?.data;
  }, [data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (address === "create") {
      addAddress(
        {
          body: {
            ...input,
            phone: `${dialCode} ${input.phone}`,
            is_default: input.is_default as boolean,
          },
        },
        {
          onSuccess: () => {
            setInput(initialValue);
            router.push("/account?tab=address");
          },
          onError: (data) => {
            setErrors((data.response?.data as any)?.errors);
          },
        }
      );
    } else if (address === "edit") {
      updateAddress(
        {
          body: {
            ...input,
            phone: `${dialCode} ${input.phone}`,
            is_default: input.is_default as boolean,
          },
          params: { id: addressId },
        },
        {
          onSuccess: () => {
            setInput(initialValue);
            router.push("/account?tab=address");
          },
          onError: (data) => {
            setErrors((data.response?.data as any)?.errors);
          },
        }
      );
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteAddress({ params: { id } });
  };

  const handleSetDefault = (id: string) => {
    setDefault({ params: { id } });
  };

  useEffect(() => {
    const detail = detailAddress?.data;
    if (detail) {
      const phone = detail?.phoneNumber.split(" ") ?? [];
      setInput({
        name: detail?.name ?? "",
        phone: phone[1],
        address: detail?.address ?? "",
        province: detail?.province ?? "",
        city: detail?.city ?? "",
        district: detail?.district ?? "",
        longitude: detail?.longitude ?? "",
        latitude: detail?.latitude ?? "",
        detail: detail?.detail ?? "",
        postal_code: detail?.postalCode ?? "",
        is_default: detail?.isDefault ?? false,
      });
      setDialCode(phone[0]);
    }
  }, [detailAddress]);

  return (
    <TabsContent
      value="address"
      className="bg-white p-5 flex flex-col text-sm gap-4"
    >
      <DeleteDialog />
      <div className="flex items-center gap-2">
        {address ? (
          <Button
            size={"icon"}
            onClick={() => {
              setAddress({ address: "", id: "" });
              setInput(initialValue);
            }}
            variant={"ghost"}
          >
            <ArrowLeft />
          </Button>
        ) : (
          <div className="size-9 flex items-center justify-center">
            <MapPinned className="size-4" />
          </div>
        )}
        <h4 className="font-bold text-lg capitalize">
          {address || "Shipping"} Address
        </h4>
      </div>
      <div className="flex flex-col gap-4">
        {!address && (
          <div className="flex w-full flex-col gap-4">
            {listAddresses?.length === 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex p-3 border border-red-500 rounded-md gap-3 items-center">
                  <div className="size-9 rounded-full border flex-none border-red-500 flex items-center justify-center">
                    <LocateOff className="text-red-500 size-5 flex-none " />
                  </div>
                  <div className="flex flex-col w-full">
                    <h5 className="font-semibold text-red-500 text-lg">
                      You don&apos;t have a shipping address yet!
                    </h5>
                    <p className="text-gray-700 text-sm">
                      Add your address now to ensure a smooth and timely
                      delivery.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setAddress({ address: "create" })}
                  className="w-auto mx-auto text-xs rounded-full !px-4 bg-green-100 text-green-700 font-semibold hover:bg-green-200"
                  size={"sm"}
                >
                  <PlusCircle className="size-3.5 stroke-[2.5]" />
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {listAddresses?.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col border rounded-md"
                  >
                    <div className="flex gap-4 flex-col p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">{item.name}</p>
                          <p className="text-xs">{item.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.isDefault && (
                            <Badge className="rounded-full">Default</Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant={"ghost"}
                                size={"icon"}
                                className="size-7"
                              >
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  disabled={item.isDefault}
                                  onSelect={() => handleSetDefault(item.id)}
                                >
                                  <CircleDot />
                                  Set is Default
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    setAddress({ address: "edit", id: item.id })
                                  }
                                >
                                  <Edit />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
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
                ))}
                <Button
                  onClick={() => setAddress({ address: "create" })}
                  className="w-auto mx-auto text-xs rounded-full !px-4 bg-green-100 text-green-700 font-semibold hover:bg-green-200"
                  size={"sm"}
                >
                  <PlusCircle className="size-3.5 stroke-[2.5]" />
                  Add Address
                </Button>
              </div>
            )}
          </div>
        )}
        {(address === "create" || (address === "edit" && !!addressId)) && (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <div className="flex flex-col w-full gap-1.5">
              <LabelInput
                label="Full Name"
                classLabel="required"
                placeholder="Type full name"
                className={cn(
                  "bg-gray-100 focus-visible:border-gray-500",
                  errors?.name && "border-red-500 hover:border-red-500"
                )}
                value={input.name ?? ""}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                disabled={false}
              />
              <MessageInputError error={errors?.name} />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <LabelInput
                label="Phone Number"
                classLabel="required"
                placeholder="Type phone number"
                className={cn(
                  "bg-gray-100 focus-visible:border-gray-500",
                  errors?.phone && "border-red-500 hover:border-red-500"
                )}
                value={input.phone ?? ""}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                isPhone
                dialCode={dialCode}
                setDialCode={setDialCode}
                disabled={false}
              />
              <MessageInputError error={errors?.phone} />
            </div>

            <MapPicker input={input} setInput={setInput} errors={errors} />

            <div className="flex flex-col w-full gap-1.5">
              <LabelInput
                label="Address Detail"
                classLabel="required"
                placeholder="Type address detail"
                className={cn(
                  "bg-gray-100 focus-visible:border-gray-500",
                  errors?.detail && "border-red-500 hover:border-red-500"
                )}
                value={input.detail ?? ""}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    detail: e.target.value,
                  }))
                }
                disabled={false}
              />
              <MessageInputError error={errors?.detail} />
            </div>

            <Label className="flex items-center gap-3">
              <Checkbox
                className="border-gray-500"
                checked={input.is_default}
                onCheckedChange={(e) =>
                  setInput((prev) => ({ ...prev, is_default: e }))
                }
              />
              <p className="text-sm font-medium">Set default address</p>
            </Label>

            <Button type="submit" variant={"destructive"}>
              <Send />
              Create Address
            </Button>
          </form>
        )}
      </div>
    </TabsContent>
  );
};

export const MapPicker = ({
  input,
  setInput,
  errors,
}: {
  input: any;
  setInput: Dispatch<SetStateAction<any>>;
  errors: {
    address: string;
    district: string;
    city: string;
    province: string;
    latitude: string;
    longitude: string;
    postal_code: string;
    detail: string;
    name: string;
    phone: string;
    is_default: string;
  };
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiGMaps,
    libraries: ["places"],
  });

  if (!isLoaded) {
    return <p>Loading....</p>;
  }
  return <Maps input={input} setInput={setInput} errors={errors} />;
};

const Maps = ({
  input,
  setInput,
  errors,
}: {
  input: any;
  setInput: Dispatch<SetStateAction<any>>;
  errors: {
    address: string;
    district: string;
    city: string;
    province: string;
    latitude: string;
    longitude: string;
    postal_code: string;
    detail: string;
    name: string;
    phone: string;
    is_default: string;
  };
}) => {
  const [address, setAddress] = useState("");
  // center marker by lat lng
  const center = useMemo(
    () => ({
      lat: -6.175392,
      lng: 106.827153,
    }),
    []
  );

  //   center position
  const [centerPosition, setCenterPosition] = useState(center);

  // Referensi untuk objek Google Map
  const mapRef = useRef<google.maps.Map | null>(null);

  //   use-places-autocomplete
  const {
    ready,
    setValue,
    suggestions: { data, status },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "ID" }, // <-- Perubahan utama di sini
    },
  });

  //   fetch data for every setValue to get suggest
  const [fetchData, setFetchData] = useState(false);

  //   to debounce address
  const placeDebounce = useDebounce(address);

  //   zoom maps
  const [zoomLevel, setZoomLevel] = useState(14);

  //   debounce at address change
  useEffect(() => {
    setValue(placeDebounce, fetchData);
  }, [placeDebounce]);

  //   handle select suggest
  const handleSelect = async (address: any) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = getLatLng(results[0]);

    const {
      district,
      city,
      province,
      newFormatted,
      postal_code,
      formattedAddress,
    } = sanitizeAddress(results);

    setAddress(formattedAddress ?? "");

    setInput((prev: any) => ({
      ...prev,
      address: newFormatted ?? "",
      district,
      city,
      province,
      postal_code,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    setFetchData(false);
    setCenterPosition({ lat, lng });
    setZoomLevel(18);
  };

  //   handle drag end
  const handleDragEnd = async () => {
    if (mapRef.current) {
      const newCenter = {
        lat: mapRef.current.getCenter()?.lat() ?? center.lat,
        lng: mapRef.current.getCenter()?.lng() ?? center.lng,
      };
      setCenterPosition(newCenter);

      const results = await getGeocode({ location: newCenter });
      const { lat, lng } = getLatLng(results[0]);

      const {
        district,
        city,
        province,
        newFormatted,
        postal_code,
        formattedAddress,
      } = sanitizeAddress(results);

      setAddress(formattedAddress ?? "");

      setInput((prev: any) => ({
        ...prev,
        address: newFormatted ?? "",
        district,
        city,
        province,
        postal_code,
        latitude: lat.toString(),
        longitude: lng.toString(),
      }));
      setFetchData(false);
    }
  };

  //   handle change zoom
  const handleZoomChanged = async () => {
    if (mapRef.current) {
      const newCenter = {
        lat: mapRef.current.getCenter()?.lat() ?? center.lat,
        lng: mapRef.current.getCenter()?.lng() ?? center.lng,
      };
      setCenterPosition(newCenter);
      setZoomLevel(mapRef.current?.getZoom() ?? 14);

      const results = await getGeocode({ location: newCenter });
      const { lat, lng } = getLatLng(results[0]);

      const {
        district,
        city,
        province,
        newFormatted,
        postal_code,
        formattedAddress,
      } = sanitizeAddress(results);

      setAddress(formattedAddress ?? "");

      setInput((prev: any) => ({
        ...prev,
        address: newFormatted ?? "",
        district,
        city,
        province,
        postal_code,
        latitude: lat.toString(),
        longitude: lng.toString(),
      }));

      setFetchData(false);
    }
  };

  const handleZoomChangeSlider = (e: ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseInt(e.target.value, 10);
    setZoomLevel(newZoom);

    if (mapRef.current) {
      mapRef.current.setZoom(newZoom); // Update zoom level on the map
    }
  };

  //   style maps
  const grayscaleMapStyle = [
    {
      elementType: "geometry",
      stylers: [
        {
          saturation: -100, // Grayscale filter
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: zoomLevel >= 17 ? "on" : "off" }], // Tampilkan label jika zoom >= 18
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [
        { visibility: "on" }, // Tampilkan label administratif jika zoom < 18
      ],
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "on" }], // Menampilkan label jalan jika zoom >= 18
    },
  ];

  //   handle clear address
  const handleClear = (e: MouseEvent) => {
    e.preventDefault();
    setAddress("");
    setInput((prev: any) => ({
      ...prev,
      address: "",
      district: "",
      city: "",
      province: "",
      latitude: "0",
      longitude: "0",
      postal_code: "",
    }));
    clearSuggestions();
  };

  //   map load
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  //   handle get adress from lat lng
  const handleLatLng = async (lat: number, lng: number) => {
    const results = await getGeocode({ location: { lat, lng } });

    const {
      district,
      city,
      province,
      newFormatted,
      postal_code,
      formattedAddress,
    } = sanitizeAddress(results);

    setAddress(formattedAddress ?? "");

    setInput((prev: any) => ({
      ...prev,
      address: newFormatted ?? "",
      district,
      city,
      province,
      postal_code,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    setFetchData(false);
    setCenterPosition({ lat, lng });
  };

  //   debounce lat lng
  const latDebounce = useDebounce(input.latitude);
  const lngDebounce = useDebounce(input.longitude);

  //   get address every change lat lng
  useEffect(() => {
    if (
      latDebounce &&
      latDebounce !== "0" &&
      lngDebounce &&
      lngDebounce !== "0"
    ) {
      handleLatLng(parseFloat(latDebounce), parseFloat(lngDebounce));
    }
  }, [latDebounce, lngDebounce]);

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const results = await getGeocode({ location: { lat, lng } });

        const {
          district,
          city,
          province,
          newFormatted,
          postal_code,
          formattedAddress,
        } = sanitizeAddress(results);

        console.log(results, formattedAddress);

        setAddress(formattedAddress ?? "");

        setInput((prev: any) => ({
          ...prev,
          address: newFormatted ?? "",
          district,
          city,
          province,
          postal_code,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
        setFetchData(false);
        setZoomLevel(18);
      },
      () => {
        toast.error(
          "Unable to get your location. Please allow location access in your browser settings."
        );
      }
    );
  };

  const isSomeError = errors.address || errors.latitude || errors.longitude;

  return (
    <div className="w-full flex-col flex-none relative flex gap-1.5 justify-center overflow-hidden">
      <div
        className={cn(
          "flex flex-col gap-4 relative border border-gray-300 rounded-md p-3 w-full",
          isSomeError && "border-red-500"
        )}
      >
        <Command className="h-fit absolute top-3 z-10 w-[calc(100%-24px)]">
          <div className="flex flex-col gap-1.5">
            <Label>Search Address</Label>
            <div className="w-full relative flex items-center">
              <Input
                className="pr-10 bg-gray-100 border-gray-300 focus-visible:border-gray-500 focus-visible:ring-transparent"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setFetchData(true);
                }}
                disabled={!ready}
                placeholder="Type search address"
              />
              {address?.length > 0 && (
                <Button
                  type="button"
                  onClick={handleClear}
                  className="px-0 w-8 h-7 bg-transparent justify-start hover:bg-transparent text-black absolute right-1 shadow-none hover:scale-110"
                >
                  <XCircle className="size-4" />
                </Button>
              )}
            </div>
          </div>
          {status === "OK" && (
            <CommandList className="mt-2 rounded-md border border-gray-500">
              <CommandGroup>
                {data.map(({ place_id, description }) => (
                  <CommandItem
                    onSelect={() => handleSelect(description)}
                    key={place_id}
                  >
                    {description}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </Command>

        <div className="w-full h-full mt-[70px]">
          <div className="w-full aspect-[5/3] relative overflow-hidden flex items-center justify-center border-gray-300">
            <div className="w-full h-full relative overflow-hidden rounded shadow">
              <GoogleMap
                mapContainerClassName="w-full h-full scale-110"
                options={{
                  disableDefaultUI: true, // Menghilangkan semua tombol default
                  zoomControl: false, // Menghilangkan tombol zoom (opsional)
                  mapTypeControl: false, // Menghilangkan kontrol tipe peta (opsional)
                  streetViewControl: false, // Menghilangkan kontrol street view (opsional)
                  fullscreenControl: false, // Menghilangkan tombol fullscreen (opsional)
                  clickableIcons: false,
                  styles: grayscaleMapStyle, // Terapkan gaya grayscale
                  maxZoom: 20, // Batas maksimum zoom
                  minZoom: 5, // Batas minimum zoom
                }}
                zoom={zoomLevel}
                center={centerPosition}
                onLoad={handleMapLoad} // Simpan referensi objek map
                onDragEnd={handleDragEnd} // Tangani event drag-end
                onZoomChanged={handleZoomChanged}
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[calc(50%+20px)] size-10 flex items-center justify-center">
                <svg
                  className="size-10"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule={"evenodd"}
                  imageRendering={"optimizeQuality"}
                  style={{
                    shapeRendering: "geometricPrecision",
                    textRendering: "geometricPrecision",
                  }}
                  viewBox="0 0 1.63 2.02"
                >
                  <g>
                    <path
                      className="fill-red-500 stroke-[0.08] stroke-black"
                      d="M1.59 0.82c0,0.48 -0.53,0.99 -0.71,1.14 -0.02,0.01 -0.04,0.02 -0.06,0.02 -0.02,0 -0.04,-0.01 -0.06,-0.02 -0.18,-0.15 -0.72,-0.66 -0.72,-1.14 0,-0.43 0.35,-0.78 0.78,-0.78 0.43,0 0.77,0.35 0.77,0.78zm-0.48 0c0,-0.16 -0.13,-0.29 -0.29,-0.29 -0.16,0 -0.29,0.13 -0.29,0.29 0,0.16 0.13,0.29 0.29,0.29 0.16,0 0.29,-0.13 0.29,-0.29z"
                    />
                  </g>
                </svg>
              </div>
              <div className="w-6 h-[150px] bg-white absolute left-3 bottom-3 flex items-center justify-center rounded-md shadow-md border">
                <input
                  type="range"
                  min="5"
                  max="20"
                  style={{ accentColor: "red" }}
                  className="w-[140px] h-2 rounded-full shadow cursor-pointer border border-white -rotate-90 vertical-range"
                  value={zoomLevel}
                  onChange={handleZoomChangeSlider}
                />
              </div>
              <Button
                onClick={handleCurrentLocation}
                variant={"destructiveOutline"}
                className="absolute right-3 bottom-3 hover:bg-red-50"
                type="button"
              >
                <Locate />
                Use current location
              </Button>
            </div>
          </div>
        </div>
        {(input.province || input.city || input.district) && (
          <div className="grid grid-cols-2 gap-4">
            <LabelInput
              label="Address"
              className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300"
              classContainer="col-span-2"
              value={input.address ?? ""}
              readOnly
            />
            <LabelInput
              label="Province"
              className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300"
              value={input.province ?? ""}
              readOnly
            />
            <LabelInput
              label="City"
              className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300"
              value={input.city ?? ""}
              readOnly
            />
            <LabelInput
              label="District"
              className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300"
              value={input.district ?? ""}
              readOnly
            />
            <LabelInput
              label="Postal Code"
              className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300"
              value={input.postal_code ?? ""}
              readOnly
            />
          </div>
        )}
      </div>
      {isSomeError && <MessageInputError error={"Address is required"} />}
    </div>
  );
};

const sanitizeAddress = (results: google.maps.GeocoderResult[]) => {
  const streetAddress = results.find(
    (item) =>
      (item.types.length === 1 && item.types.includes("street_address")) ||
      (item.types.length === 1 && item.types.includes("route"))
  );

  const addressComponent = streetAddress?.address_components;

  const formattedAddress = streetAddress?.formatted_address;

  const district = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_3")
  )?.long_name;
  const city = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_2")
  )?.long_name;
  const province = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_1")
  )?.long_name;
  const country = addressComponent?.find((item) =>
    item.types.includes("country")
  )?.long_name;
  const postal_code = addressComponent?.find((item) =>
    item.types.includes("postal_code")
  )?.long_name;
  const district_short = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_3")
  )?.short_name;
  const city_short = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_2")
  )?.short_name;
  const province_short = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_1")
  )?.short_name;
  const country_short = addressComponent?.find((item) =>
    item.types.includes("country")
  )?.short_name;
  const postal_code_short = addressComponent?.find((item) =>
    item.types.includes("postal_code")
  )?.short_name;

  const newFormatted = formattedAddress
    ?.replace(district ? `, ${district}` : "", "")
    ?.replace(city ? `, ${city}` : "", "")
    ?.replace(province ? `, ${province}` : "", "")
    ?.replace(postal_code ? ` ${postal_code}` : "", "")
    ?.replace(country ? `, ${country}` : "", "")
    ?.replace(district_short ? `, ${district_short}` : "", "")
    ?.replace(city_short ? `, ${city_short}` : "", "")
    ?.replace(province_short ? `, ${province_short}` : "", "")
    ?.replace(postal_code_short ? ` ${postal_code_short}` : "", "")
    ?.replace(country_short ? `, ${country_short}` : "", "");

  return {
    district,
    city,
    province,
    formattedAddress,
    newFormatted,
    postal_code,
  };
};
