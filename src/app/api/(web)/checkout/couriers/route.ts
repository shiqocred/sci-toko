import { biteshipAPI, biteshipUrl } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { db, orderDraft, orderDraftShippings } from "@/lib/db";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
type Courier = {
  name: string;
  company: string;
  shipment_duration_range: string;
  shipment_duration_unit: string;
  price: number;
  type: string;
} | null;

type PricingItem = {
  courier_name: string;
  company: string;
  shipment_duration_range: string;
  shipment_duration_unit: string;
  price: number;
  type: string;
};

function getAverageDurationInHours(range: string, unit: string): number {
  const [min, max] = (range.match(/\d+/g) || []).map(Number);
  const avg = (min + (max || min)) / 2;
  if (unit.toLowerCase().startsWith("day")) {
    return avg * 24;
  }
  // misal unit 'hours' langsung return avg
  return avg;
}

function isSameCourier(a: PricingItem, b: PricingItem) {
  return (
    a.courier_name === b.courier_name &&
    a.company === b.company &&
    a.shipment_duration_range === b.shipment_duration_range &&
    a.shipment_duration_unit === b.shipment_duration_unit &&
    a.price === b.price &&
    a.type === b.type
  );
}

function getFastestAndCheapest(pricing: PricingItem[]): {
  fastest: Courier;
  cheapest: Courier;
  middle: Courier;
} {
  if (pricing.length === 0) {
    return { fastest: null, cheapest: null, middle: null };
  }

  const fastest = pricing.reduce((a, b) =>
    getAverageDurationInHours(
      a.shipment_duration_range,
      a.shipment_duration_unit
    ) <=
    getAverageDurationInHours(
      b.shipment_duration_range,
      b.shipment_duration_unit
    )
      ? a
      : b
  );

  const cheapest = pricing.reduce((a, b) => (a.price <= b.price ? a : b));

  const top3Fastest = [...pricing]
    .sort(
      (a, b) =>
        getAverageDurationInHours(
          a.shipment_duration_range,
          a.shipment_duration_unit
        ) -
        getAverageDurationInHours(
          b.shipment_duration_range,
          b.shipment_duration_unit
        )
    )
    .slice(0, 3);

  const top3Cheapest = [...pricing]
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);

  const fastestFromCheapest = [...top3Cheapest].sort(
    (a, b) =>
      getAverageDurationInHours(
        a.shipment_duration_range,
        a.shipment_duration_unit
      ) -
      getAverageDurationInHours(
        b.shipment_duration_range,
        b.shipment_duration_unit
      )
  )[0];

  const cheapestFromFastest = [...top3Fastest].sort(
    (a, b) => a.price - b.price
  )[0];

  const middleCandidate =
    getAverageDurationInHours(
      fastestFromCheapest.shipment_duration_range,
      fastestFromCheapest.shipment_duration_unit
    ) <=
    getAverageDurationInHours(
      cheapestFromFastest.shipment_duration_range,
      cheapestFromFastest.shipment_duration_unit
    )
      ? fastestFromCheapest
      : cheapestFromFastest;

  const allSame =
    isSameCourier(cheapest, fastest) &&
    isSameCourier(cheapest, middleCandidate);

  if (allSame) {
    return {
      fastest: null,
      middle: null,
      cheapest: {
        name: cheapest.courier_name,
        company: cheapest.company,
        shipment_duration_range: cheapest.shipment_duration_range,
        shipment_duration_unit: cheapest.shipment_duration_unit,
        price: cheapest.price,
        type: cheapest.type,
      },
    };
  }

  const middleSameAsCheapest = isSameCourier(middleCandidate, cheapest);
  if (middleSameAsCheapest) {
    return {
      fastest: null,
      middle: null,
      cheapest: {
        name: cheapest.courier_name,
        company: cheapest.company,
        shipment_duration_range: cheapest.shipment_duration_range,
        shipment_duration_unit: cheapest.shipment_duration_unit,
        price: cheapest.price,
        type: cheapest.type,
      },
    };
  }

  return {
    fastest: {
      name: fastest.courier_name,
      company: fastest.company,
      shipment_duration_range: fastest.shipment_duration_range,
      shipment_duration_unit: fastest.shipment_duration_unit,
      price: fastest.price,
      type: fastest.type,
    },
    cheapest: {
      name: cheapest.courier_name,
      company: cheapest.company,
      shipment_duration_range: cheapest.shipment_duration_range,
      shipment_duration_unit: cheapest.shipment_duration_unit,
      price: cheapest.price,
      type: cheapest.type,
    },
    middle: {
      name: middleCandidate.courier_name,
      company: middleCandidate.company,
      shipment_duration_range: middleCandidate.shipment_duration_range,
      shipment_duration_unit: middleCandidate.shipment_duration_unit,
      price: middleCandidate.price,
      type: middleCandidate.type,
    },
  };
}

function parseDurationToDateOrTime(
  shipment_duration_range: string,
  shipment_duration_unit: string
): {
  fastest: Date;
  longest: Date;
  durationType: "DAY" | "HOUR";
} {
  const numbers = shipment_duration_range.match(/\d+/g)?.map(Number) ?? [];

  if (numbers.length === 0) {
    numbers.push(1);
  }

  if (numbers.length === 1) {
    numbers.push(numbers[0]);
  }

  const fastestNum = Math.min(numbers[0], numbers[1]);
  const longestNum = Math.max(numbers[0], numbers[1]);

  const now = new Date();

  if (/hour/i.test(shipment_duration_unit)) {
    // Jam, mulai dari sekarang
    const fastest = new Date(now.getTime() + fastestNum * 60 * 60 * 1000);
    const longest = new Date(now.getTime() + longestNum * 60 * 60 * 1000);
    return { fastest, longest, durationType: "HOUR" };
  } else if (/day/i.test(shipment_duration_unit)) {
    // Hari, mulai dari awal hari besok
    const baseDate = new Date(now);
    baseDate.setDate(now.getDate() + 1);
    baseDate.setHours(0, 0, 0, 0);

    const fastest = new Date(baseDate);
    fastest.setDate(baseDate.getDate() + fastestNum);

    const longest = new Date(baseDate);
    longest.setDate(baseDate.getDate() + longestNum);

    return { fastest, longest, durationType: "DAY" };
  } else {
    // Default anggap hari
    const baseDate = new Date(now);
    baseDate.setDate(now.getDate() + 1);
    baseDate.setHours(0, 0, 0, 0);

    const fastest = new Date(baseDate);
    fastest.setDate(baseDate.getDate() + fastestNum);

    const longest = new Date(baseDate);
    longest.setDate(baseDate.getDate() + longestNum);

    return { fastest, longest, durationType: "DAY" };
  }
}

async function insertShippingChoice({
  name,
  courier,
  orderDraftId,
  addressId,
  weight,
  userId,
}: {
  name: "EXPRESS" | "REGULAR" | "ECONOMY";
  courier: Courier;
  orderDraftId: string;
  addressId: string;
  weight: string;
  userId: string;
}) {
  if (!courier) return null;
  const { fastest, longest, durationType } = parseDurationToDateOrTime(
    courier.shipment_duration_range,
    courier.shipment_duration_unit
  );
  console.log(fastest, longest, durationType);
  const [result] = await db
    .insert(orderDraftShippings)
    .values({
      label: courier.name,
      addressId,
      company: courier.company,
      fastestEstimate: fastest,
      longestEstimate: longest,
      price: courier.price.toString(),
      type: courier.type,
      duration: durationType,
      name,
      weight,
      orderDraftId,
      userId,
    })
    .returning({
      id: orderDraftShippings.id,
      name: orderDraftShippings.name,
      label: orderDraftShippings.label,
      company: orderDraftShippings.company,
      price: orderDraftShippings.price,
      fastest: orderDraftShippings.fastestEstimate,
      longest: orderDraftShippings.longestEstimate,
      durationType: orderDraftShippings.duration,
      type: orderDraftShippings.type,
    });

  console.log(result);

  return result;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    // order-draft-exist
    const draftOrderExist = await db.query.orderDraft.findFirst({
      columns: {
        id: true,
        addressId: true,
        totalWeight: true,
      },
      where: (od, { eq, and }) =>
        and(eq(od.userId, userId), eq(od.status, "ACTIVE")),
    });

    // order-draft-exist error
    if (!draftOrderExist) return errorRes("No current order");

    // address id
    const addressId = draftOrderExist.addressId;
    const totalWeight = draftOrderExist.totalWeight;

    // address id kosong (belum punya address)
    if (!addressId)
      return successRes(
        {
          express: null,
          regular: null,
          economy: null,
        },
        "No address selected"
      );

    // shipping address (ongkir)
    const shippingAddress = await db.query.orderDraftShippings.findMany({
      columns: {
        id: true,
        addressId: true,
        name: true,
        company: true,
        fastestEstimate: true,
        longestEstimate: true,
        duration: true,
        price: true,
        type: true,
      },
      where: (dos, { eq, and }) =>
        and(
          eq(dos.orderDraftId, draftOrderExist.id),
          eq(dos.addressId, addressId),
          eq(dos.weight, totalWeight)
        ),
    });

    console.log(shippingAddress);

    if (shippingAddress.length > 1) {
      const express = shippingAddress.find((item) => item.name === "EXPRESS");
      const regular = shippingAddress.find((item) => item.name === "REGULAR");
      const economy = shippingAddress.find((item) => item.name === "ECONOMY");
      return successRes(
        {
          express: express
            ? {
                ...express,
                fastest:
                  express.duration === "HOUR"
                    ? format(express.fastestEstimate, "HH:mm", { locale: id })
                    : format(express.fastestEstimate, "PP", { locale: id }),
                longest:
                  express &&
                  (express.duration === "HOUR"
                    ? format(express.longestEstimate, "HH:mm", { locale: id })
                    : format(express.longestEstimate, "PP", { locale: id })),
              }
            : null,
          regular: regular
            ? {
                ...regular,
                fastest:
                  regular &&
                  (regular.duration === "HOUR"
                    ? format(regular.fastestEstimate, "HH:mm", { locale: id })
                    : format(regular.fastestEstimate, "PP", { locale: id })),
                longest:
                  regular &&
                  (regular.duration === "HOUR"
                    ? format(regular.longestEstimate, "HH:mm", { locale: id })
                    : format(regular.longestEstimate, "PP", { locale: id })),
              }
            : null,
          economy: economy
            ? {
                ...economy,
                fastest:
                  economy &&
                  (economy.duration === "HOUR"
                    ? format(economy.fastestEstimate, "HH:mm", { locale: id })
                    : format(economy.fastestEstimate, "PP", { locale: id })),
                longest:
                  economy &&
                  (economy.duration === "HOUR"
                    ? format(economy.longestEstimate, "HH:mm", { locale: id })
                    : format(economy.longestEstimate, "PP", { locale: id })),
              }
            : null,
        },
        "Ongkir detail 1"
      );
    }

    console.time("checkout");

    const [address, couriersRaw, storeLocation] = await Promise.all([
      db.query.addresses.findFirst({
        where: (a, { eq }) => eq(a.id, addressId),
      }),
      db.query.couriers.findMany({
        columns: { value: true },
        where: (c, { eq }) => eq(c.isActive, true),
      }),
      db.query.storeDetail.findFirst({
        columns: { latitude: true, longitude: true },
      }),
    ]);

    if (!address) return errorRes("Invalid address", 400);
    if (!storeLocation) return errorRes("Store location not found", 400);

    const requestBody = {
      origin_latitude: storeLocation.latitude,
      origin_longitude: storeLocation.longitude,
      destination_latitude: address.latitude,
      destination_longitude: address.longitude,
      couriers: couriersRaw.map((c) => c.value).join(","),
      items: [
        {
          weight: totalWeight,
          quantity: 1,
        },
      ],
    };

    console.time("biteship");
    const res = await fetch(`${biteshipUrl}/rates/couriers`, {
      method: "POST",
      headers: {
        Authorization: biteshipAPI,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    console.timeEnd("biteship");

    if (!res.ok)
      return successRes(
        {
          express: null,
          regular: null,
          economy: null,
        },
        "No courier found"
      );

    const biteshipRes = await res.json();

    const { fastest, middle, cheapest } = getFastestAndCheapest(
      biteshipRes.pricing ?? []
    );
    console.log(biteshipRes);

    const [express, regular, economy] = await Promise.all([
      fastest &&
        insertShippingChoice({
          addressId,
          courier: fastest,
          name: "EXPRESS",
          weight: totalWeight,
          orderDraftId: draftOrderExist.id,
          userId,
        }),
      middle &&
        insertShippingChoice({
          addressId,
          courier: middle,
          name: "REGULAR",
          weight: totalWeight,
          orderDraftId: draftOrderExist.id,
          userId,
        }),
      cheapest &&
        insertShippingChoice({
          addressId,
          courier: cheapest,
          name: "ECONOMY",
          weight: totalWeight,
          orderDraftId: draftOrderExist.id,
          userId,
        }),
    ]);

    console.timeEnd("checkout");

    return successRes(
      {
        express: express
          ? {
              ...express,
              fastest:
                express &&
                (express.durationType === "HOUR"
                  ? format(express.fastest, "HH:mm", { locale: id })
                  : format(express.fastest, "PP", { locale: id })),
              longest:
                express &&
                (express.durationType === "HOUR"
                  ? format(express.longest, "HH:mm", { locale: id })
                  : format(express.longest, "PP", { locale: id })),
            }
          : null,
        regular: regular
          ? {
              ...regular,
              fastest:
                regular &&
                (regular.durationType === "HOUR"
                  ? format(regular.fastest, "HH:mm", { locale: id })
                  : format(regular.fastest, "PP", { locale: id })),
              longest:
                regular &&
                (regular.durationType === "HOUR"
                  ? format(regular.longest, "HH:mm", { locale: id })
                  : format(regular.longest, "PP", { locale: id })),
            }
          : null,
        economy: economy
          ? {
              ...economy,
              fastest:
                economy &&
                (economy.durationType === "HOUR"
                  ? format(economy.fastest, "HH:mm", { locale: id })
                  : format(economy.fastest, "PP", { locale: id })),
              longest:
                economy &&
                (economy.durationType === "HOUR"
                  ? format(economy.longest, "HH:mm", { locale: id })
                  : format(economy.longest, "PP", { locale: id })),
            }
          : null,
      },
      "Ongkir detail"
    );
  } catch (error) {
    console.error("Checkout Error", error);
    return errorRes("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorRes("Unauthorized", 401);

    const userId = session.user.id;

    const { addressId } = await req.json();

    if (!addressId) return errorRes("Validation failed");

    const orderExist = await db.query.orderDraft.findFirst({
      columns: {
        id: true,
      },
      where: (od, { and, eq }) =>
        and(eq(od.userId, userId), eq(od.status, "ACTIVE")),
    });

    if (!orderExist) return errorRes("Checkout detail not found", 404);

    await db
      .update(orderDraft)
      .set({ addressId })
      .where(eq(orderDraft.id, orderExist.id));

    return successRes(null, "Checkout updated");
  } catch (error) {
    console.log("ERROR_UPDATE_CHECKOUT", error);
    return errorRes("Internal Error", 500);
  }
}
