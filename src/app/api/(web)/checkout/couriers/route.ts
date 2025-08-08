import { biteshipAPI, biteshipUrl } from "@/config";
import { auth, errorRes, successRes } from "@/lib/auth";
import { db, orderDraft, orderDraftShippings } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
type Courier = {
  name: string;
  company: string;
  duration: string;
  price: number;
  type: string;
} | null;

type PricingItem = {
  courier_name: string;
  company: string;
  duration: string;
  price: number;
  type: string;
};

function getAverageDurationInHours(duration: string): number {
  const [min, max] = (duration.match(/\d+/g) || []).map(Number);
  const avg = (min + (max || min)) / 2;
  return duration.toLowerCase().includes("day") ? avg * 24 : avg;
}

function isSameCourier(a: PricingItem, b: PricingItem) {
  return (
    a.courier_name === b.courier_name &&
    a.company === b.company &&
    a.duration === b.duration &&
    a.price === b.price &&
    a.type === b.type
  );
}

function getFastestAndCheapest(pricing: PricingItem[]): {
  fastest: Courier;
  cheapest: Courier;
  middle: Courier;
} {
  const fastest = pricing.reduce((a, b) =>
    getAverageDurationInHours(a.duration) <=
    getAverageDurationInHours(b.duration)
      ? a
      : b
  );

  const cheapest = pricing.reduce((a, b) => (a.price <= b.price ? a : b));

  const top3Fastest = [...pricing]
    .sort(
      (a, b) =>
        getAverageDurationInHours(a.duration) -
        getAverageDurationInHours(b.duration)
    )
    .slice(0, 3);

  const top3Cheapest = [...pricing]
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);

  const fastestFromCheapest = [...top3Cheapest].sort(
    (a, b) =>
      getAverageDurationInHours(a.duration) -
      getAverageDurationInHours(b.duration)
  )[0];

  const cheapestFromFastest = [...top3Fastest].sort(
    (a, b) => a.price - b.price
  )[0];

  const middleCandidate =
    getAverageDurationInHours(fastestFromCheapest.duration) <=
    getAverageDurationInHours(cheapestFromFastest.duration)
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
        duration: cheapest.duration,
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
        duration: cheapest.duration,
        price: cheapest.price,
        type: cheapest.type,
      },
    };
  }

  return {
    fastest: {
      name: fastest.courier_name,
      company: fastest.company,
      duration: fastest.duration,
      price: fastest.price,
      type: fastest.type,
    },
    cheapest: {
      name: cheapest.courier_name,
      company: cheapest.company,
      duration: cheapest.duration,
      price: cheapest.price,
      type: cheapest.type,
    },
    middle: {
      name: middleCandidate.courier_name,
      company: middleCandidate.company,
      duration: middleCandidate.duration,
      price: middleCandidate.price,
      type: middleCandidate.type,
    },
  };
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
  const [result] = await db
    .insert(orderDraftShippings)
    .values({
      addressId,
      company: courier.company,
      duration: courier.duration,
      price: courier.price.toString(),
      type: courier.type,
      name,
      weight,
      orderDraftId,
      userId,
    })
    .returning({
      id: orderDraftShippings.id,
      name: orderDraftShippings.name,
      company: orderDraftShippings.company,
      price: orderDraftShippings.price,
      duration: orderDraftShippings.duration,
      type: orderDraftShippings.type,
    });

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

    if (shippingAddress.length > 1)
      return successRes(
        {
          express:
            shippingAddress.find((item) => item.name === "EXPRESS") ?? null,
          regular:
            shippingAddress.find((item) => item.name === "REGULAR") ?? null,
          economy:
            shippingAddress.find((item) => item.name === "ECONOMY") ?? null,
        },
        "Ongkir detail 1"
      );

    console.time("checkout");

    const [address, couriersRaw, storeLocation] = await Promise.all([
      db.query.addresses.findFirst({
        where: (a, { eq, and }) =>
          and(eq(a.userId, userId), eq(a.id, addressId)),
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
      insertShippingChoice({
        addressId,
        courier: fastest,
        name: "EXPRESS",
        weight: totalWeight,
        orderDraftId: draftOrderExist.id,
        userId,
      }),
      insertShippingChoice({
        addressId,
        courier: middle,
        name: "REGULAR",
        weight: totalWeight,
        orderDraftId: draftOrderExist.id,
        userId,
      }),
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

    return successRes({ express, regular, economy }, "Ongkir detail");
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
