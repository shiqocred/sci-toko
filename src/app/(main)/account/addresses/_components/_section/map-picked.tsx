"use client";

import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MouseEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Locate, Search, X, XCircle } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { apiGMaps } from "@/config";
import { useQuery } from "@tanstack/react-query";
import { LabelInput } from "@/components/label-input";

const DEFAULT_CENTER = {
  lat: -6.175392,
  lng: 106.827153,
};

export function MapPicker({ input, setInput }: any) {
  return (
    <APIProvider apiKey={apiGMaps} libraries={["places"]}>
      <MapContent input={input} setInput={setInput} />
    </APIProvider>
  );
}

function MapContent({ input, setInput }: any) {
  const places = useMapsLibrary("places");
  const map = useMap();

  const [address, setAddress] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [fetchData, setFetchData] = useState(false);

  const debouncedAddress = useDebounce(address);

  const { data: suggestionMap } = useQuery({
    queryKey: ["suggestion-map", { debouncedAddress }],
    queryFn: async () =>
      await places?.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: debouncedAddress,
        includedRegionCodes: ["ID"],
      }),
    enabled: !!debouncedAddress && fetchData,
    refetchOnWindowFocus: false,
  });

  const suggestionMapMemo = useMemo(
    () => suggestionMap?.suggestions ?? [],
    [suggestionMap]
  );

  const handleSelect = async (
    item: google.maps.places.AutocompleteSuggestion
  ) => {
    setIsSearch(false);
    setFetchData(false);

    const place = await item?.placePrediction?.toPlace();

    await place?.fetchFields({
      fields: ["location"],
    });

    if (!place?.location) return;

    const geocoder = new google.maps.Geocoder();
    const res = await geocoder.geocode({
      location: place.location?.toJSON(),
    });

    const lat = place.location.lat();
    const lng = place.location.lng();

    const parsed = sanitizeGeocoder(res.results);

    setAddress(parsed.formatted ?? "");

    setInput((prev: any) => ({
      ...prev,
      ...parsed.parsed,
      address: parsed.formatted ?? "",
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));

    map?.panTo({ lat, lng });
    map?.setZoom(18);
  };

  /* ---------------- DRAG MAP → REVERSE GEOCODE ---------------- */

  const handleIdle = async () => {
    if (!map) return;
    setFetchData(false);

    const center = map.getCenter();
    if (!center) return;

    console.log(center.toJSON());

    const geocoder = new google.maps.Geocoder();
    const res = await geocoder.geocode({
      location: center.toJSON(),
    });

    if (!res.results[0]) return;

    const parsed = sanitizeGeocoder(res.results);

    console.log(parsed, res.results, res);

    setAddress(parsed.formatted ?? "");

    setInput((prev: any) => ({
      ...prev,
      ...parsed.parsed,
      address: parsed.formatted ?? "",
      latitude: center.lat().toString(),
      longitude: center.lng().toString(),
    }));
  };

  /* ---------------- CURRENT LOCATION ---------------- */

  const handleCurrentLocation = (e: MouseEvent) => {
    e.preventDefault();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map?.panTo({ lat: latitude, lng: longitude });
        map?.setZoom(18);
      },
      () => toast.error("Please allow location access in your browser settings")
    );
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="w-full flex-col flex-none relative flex gap-1.5 justify-center">
      <div className="flex flex-col gap-4 relative md:border border-gray-300 rounded-md md:p-3 w-full">
        <div className="w-full h-full flex flex-col gap-4">
          <div className="w-full aspect-square md:aspect-[5/3] relative flex items-center justify-center border-gray-300">
            <div className="w-full h-full relative overflow-hidden rounded-md md:rounded shadow">
              <div className="flex gap-1 absolute w-[calc(100%-8px)] md:w-[calc(100%-24px)] top-1 right-1 md:top-3 md:right-3 ml-auto z-10">
                {isSearch && (
                  <Command className="h-fit z-10 w-full bg-transparent">
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="w-full relative flex items-center">
                        <Input
                          className="pr-10 bg-white border-gray-300 focus-visible:border-gray-500 shadow focus-visible:ring-transparent text-sm focus-visible:text-base lg:text-base"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            setFetchData(true);
                          }}
                          placeholder="Type search address"
                        />
                        {address?.length > 0 && (
                          <Button
                            type="button"
                            onClick={() => setAddress("")}
                            className="px-0 w-8 h-7 bg-transparent justify-start hover:bg-transparent text-black absolute right-1 shadow-none hover:scale-110"
                          >
                            <XCircle className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {suggestionMapMemo.length > 0 && (
                      <CommandList className="mt-2 rounded-md border border-gray-500 bg-white">
                        <CommandGroup>
                          {suggestionMapMemo.map((s) => (
                            <CommandItem
                              key={s?.placePrediction?.placeId}
                              onSelect={() => handleSelect(s)}
                            >
                              {s?.placePrediction?.text.text}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                )}
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className="shadow border-gray-300 hover:border-gray-500 ml-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSearch(!isSearch);
                  }}
                >
                  {isSearch ? <X /> : <Search />}
                </Button>
              </div>

              <Map
                defaultCenter={DEFAULT_CENTER}
                defaultZoom={14}
                disableDefaultUI
                gestureHandling="greedy"
                onIdle={handleIdle}
                style={{ height: "100%" }}
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
              <Button
                onClick={handleCurrentLocation}
                variant={"destructiveOutline"}
                className="absolute right-3 bottom-3 hover:bg-red-50 hidden md:flex"
                type="button"
              >
                <Locate />
                Use current location
              </Button>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCurrentLocation}
            variant="destructiveOutline"
            className="md:hidden"
          >
            <Locate />
            Use current location
          </Button>
          {(input.province || input.city || input.district) && (
            <div className="grid md:grid-cols-2 gap-4">
              <LabelInput
                label="District"
                className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300 read-only:pointer-events-none text-sm lg:text-base"
                value={input.district ?? ""}
                readOnly
              />
              <LabelInput
                label="City"
                className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300 read-only:pointer-events-none text-sm lg:text-base"
                value={input.city ?? ""}
                readOnly
              />
              <LabelInput
                label="Province"
                className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300 read-only:pointer-events-none text-sm lg:text-base"
                value={input.province ?? ""}
                readOnly
              />
              <LabelInput
                label="Postal Code"
                className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300 read-only:pointer-events-none text-sm lg:text-base"
                value={input.postal_code ?? ""}
                readOnly
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function sanitizeGeocoder(components: google.maps.GeocoderResult[]) {
  const selectedAddress = components.find((c) =>
    c.types.find((t) => t === "street_address")
  );

  const selectedAddressFirst = components[0];

  const availableAddress = selectedAddress ?? selectedAddressFirst;

  const get = (type: string) =>
    availableAddress?.address_components.find((c) => c.types.includes(type))
      ?.long_name ?? "";

  console.log(
    selectedAddress?.formatted_address,
    selectedAddressFirst?.formatted_address.replace(
      selectedAddressFirst.address_components.find((c) =>
        c.types.find((t) => t === "plus_code")
      )?.short_name
        ? `${
            selectedAddressFirst.address_components.find((c) =>
              c.types.find((t) => t === "plus_code")
            )?.short_name
          }, `
        : "",
      ""
    )
  );

  return {
    formatted: availableAddress?.formatted_address.replace(
      availableAddress.address_components.find((c) =>
        c.types.find((t) => t === "plus_code")
      )?.short_name
        ? `${
            availableAddress.address_components.find((c) =>
              c.types.find((t) => t === "plus_code")
            )?.short_name
          }, `
        : "",
      ""
    ),
    parsed: {
      district: get("administrative_area_level_3"),
      city: get("administrative_area_level_2"),
      province: get("administrative_area_level_1"),
      postal_code: get("postal_code"),
    },
  };
}
