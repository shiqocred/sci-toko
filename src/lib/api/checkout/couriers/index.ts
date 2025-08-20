import { biteshipAPI, biteshipUrl } from "@/config";
import { errorRes } from "@/lib/auth";
import { db, orderDraft, orderDraftShippings } from "@/lib/db";
import { pronoun } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

// ================= TYPES =================
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

// ================= HELPERS =================
function getAverageDurationInHours(range: string, unit: string): number {
  const numbers = range.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) return Infinity;

  if (/hour/i.test(unit)) {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  } else {
    let avgDays = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    if (avgDays < 1) avgDays = 1;
    return avgDays * 24;
  }
}

function isSameCourier(a: Courier, b: Courier) {
  return (
    !!a &&
    !!b &&
    a.type === b.type &&
    a.company === b.company &&
    a.shipment_duration_range === b.shipment_duration_range &&
    a.shipment_duration_unit === b.shipment_duration_unit
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

  // 🔹 filter duplikat HOUR dengan range sama → pilih termurah
  const filtered = pricing.reduce((acc: PricingItem[], curr) => {
    const same = acc.find(
      (p) =>
        p.shipment_duration_unit === "hours" &&
        curr.shipment_duration_unit === "hours" &&
        p.shipment_duration_range === curr.shipment_duration_range
    );
    if (same) {
      if (curr.price < same.price) {
        return acc.map((p) => (p === same ? curr : p));
      }
      return acc;
    }
    return [...acc, curr];
  }, []);

  const fastest = filtered.reduce(
    (a, b) =>
      getAverageDurationInHours(
        a.shipment_duration_range,
        a.shipment_duration_unit
      ) <=
      getAverageDurationInHours(
        b.shipment_duration_range,
        b.shipment_duration_unit
      )
        ? a
        : b,
    filtered[0]
  );

  const cheapest = filtered.reduce(
    (a, b) => (a.price <= b.price ? a : b),
    filtered[0]
  );

  const top3Fastest = [...filtered]
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

  const top3Cheapest = [...filtered]
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

// 🔹 parse durasi jadi angka, bukan Date
function parseDurationRange(
  shipment_duration_range: string,
  shipment_duration_unit: string
): {
  fastest: number;
  longest: number;
  durationType: "DAY" | "HOUR";
} {
  const numbers = shipment_duration_range.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) numbers.push(1);
  if (numbers.length === 1) numbers.push(numbers[0]);

  let fastestNum = Math.min(numbers[0], numbers[1]);
  let longestNum = Math.max(numbers[0], numbers[1]);

  if (/hour/i.test(shipment_duration_unit)) {
    return { fastest: fastestNum, longest: longestNum, durationType: "HOUR" };
  }
  if (fastestNum === 0) fastestNum = 1;
  if (longestNum === 0) longestNum = 1;
  return { fastest: fastestNum, longest: longestNum, durationType: "DAY" };
}

// 🔹 merge aturan express/regular/economy
function mergeCouriers(
  express: Courier,
  regular: Courier,
  economy: Courier
): { express: Courier; regular: Courier; economy: Courier } {
  // express & regular sama → ke REGULAR
  if (isSameCourier(express, regular)) {
    regular =
      express!.price < regular!.price
        ? ({ ...express, name: "REGULAR" } as Courier)
        : regular;
    express = null;
  }

  // regular & economy sama → ke ECONOMY
  if (isSameCourier(regular, economy)) {
    economy =
      regular!.price < economy!.price
        ? ({ ...regular, name: "ECONOMY" } as Courier)
        : economy;
    regular = null;
  }

  // express & economy sama → ke ECONOMY
  if (isSameCourier(express, economy)) {
    economy =
      express!.price < economy!.price
        ? ({ ...express, name: "ECONOMY" } as Courier)
        : economy;
    express = null;
  }

  // semua sama → ke ECONOMY
  if (isSameCourier(express, regular) && isSameCourier(regular, economy)) {
    const candidates = [express, regular, economy].filter(
      Boolean
    ) as NonNullable<Courier>[];
    if (candidates.length === 0) {
      return {
        express: null,
        regular: null,
        economy: null,
      };
    }
    const cheapest = candidates.reduce(
      (a, b) => (a.price < b.price ? a : b),
      candidates[0]
    );
    return {
      express: null,
      regular: null,
      economy: { ...cheapest, name: "ECONOMY" },
    };
  }

  return { express, regular, economy };
}

// ================= INSERT =================
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
  const { fastest, longest, durationType } = parseDurationRange(
    courier.shipment_duration_range,
    courier.shipment_duration_unit
  );

  const [result] = await db
    .insert(orderDraftShippings)
    .values({
      label: courier.name,
      addressId,
      company: courier.company,
      fastestEstimate: fastest.toString(), // angka
      longestEstimate: longest.toString(), // angka
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
      company: orderDraftShippings.company,
      price: orderDraftShippings.price,
      fastestEstimate: orderDraftShippings.fastestEstimate,
      longestEstimate: orderDraftShippings.longestEstimate,
      duration: orderDraftShippings.duration,
      type: orderDraftShippings.type,
    });

  const formatted = {
    id: result.id,
    name: result.name,
    company: result.company,
    price: result.price,
    duration:
      result.fastestEstimate === result.longestEstimate
        ? `${result.fastestEstimate} ${result.duration.toLowerCase()}${pronoun(Number(result.fastestEstimate))}`
        : `${result.fastestEstimate} - ${result.longestEstimate} ${result.duration.toLowerCase()}${pronoun(Number(result.longestEstimate))}`,
    type: result.type,
  };

  return formatted;
}

// ================= MAIN =================
export const courier = async (userId: string) => {
  const draftOrderExist = await db.query.orderDraft.findFirst({
    columns: { id: true, addressId: true, totalWeight: true },
    where: (od, { eq, and }) =>
      and(eq(od.userId, userId), eq(od.status, "ACTIVE")),
  });

  if (!draftOrderExist) throw errorRes("No current order");

  const addressId = draftOrderExist.addressId;
  const totalWeight = draftOrderExist.totalWeight;

  if (!addressId) {
    return {
      response: { express: null, regular: null, economy: null },
      message: "No address selected",
    };
  }

  // cek shipping yang sudah ada
  const shippingAddress = await db.query.orderDraftShippings.findMany({
    columns: {
      id: true,
      name: true,
      company: true,
      price: true,
      fastestEstimate: true,
      longestEstimate: true,
      duration: true,
      type: true,
    },
    where: (dos, { eq, and }) =>
      and(
        eq(dos.orderDraftId, draftOrderExist.id),
        eq(dos.addressId, addressId)
      ),
  });

  if (shippingAddress.length > 1) {
    const shippingAddressFormatted = shippingAddress.map((item) => ({
      id: item.id,
      name: item.name,
      company: item.company,
      price: item.price,
      duration:
        item.fastestEstimate === item.longestEstimate
          ? `${item.fastestEstimate} ${item.duration.toLowerCase()}${pronoun(Number(item.fastestEstimate))}`
          : `${item.fastestEstimate} - ${item.longestEstimate} ${item.duration.toLowerCase()}${pronoun(Number(item.longestEstimate))}`,
      type: item.type,
    }));
    return {
      response: {
        express:
          shippingAddressFormatted.find((i) => i.name === "EXPRESS") ?? null,
        regular:
          shippingAddressFormatted.find((i) => i.name === "REGULAR") ?? null,
        economy:
          shippingAddressFormatted.find((i) => i.name === "ECONOMY") ?? null,
      },
      message: "Ongkir detail 1",
    };
  }

  // panggil biteship
  const [address, couriersRaw, storeLocation] = await Promise.all([
    db.query.addresses.findFirst({ where: (a, { eq }) => eq(a.id, addressId) }),
    db.query.couriers.findMany({
      columns: { value: true },
      where: (c, { eq }) => eq(c.isActive, true),
    }),
    db.query.storeDetail.findFirst({
      columns: { latitude: true, longitude: true },
    }),
  ]);

  if (!address) throw errorRes("Invalid address", 400);
  if (!storeLocation) throw errorRes("Store location not found", 400);

  const requestBody = {
    origin_latitude: storeLocation.latitude,
    origin_longitude: storeLocation.longitude,
    destination_latitude: address.latitude,
    destination_longitude: address.longitude,
    couriers: couriersRaw.map((c) => c.value).join(","),
    items: [{ weight: totalWeight, quantity: 1 }],
  };

  const res = await fetch(`${biteshipUrl}/rates/couriers`, {
    method: "POST",
    headers: { Authorization: biteshipAPI, "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok)
    return {
      response: { express: null, regular: null, economy: null },
      message: "No courier found",
    };

  const biteshipRes = await res.json();
  const { fastest, middle, cheapest } = getFastestAndCheapest(
    biteshipRes.pricing ?? []
  );

  // merge aturan
  const merged = mergeCouriers(fastest, middle, cheapest);

  const [express, regular, economy] = await Promise.all([
    merged.express &&
      insertShippingChoice({
        addressId,
        courier: merged.express,
        name: "EXPRESS",
        weight: totalWeight,
        orderDraftId: draftOrderExist.id,
        userId,
      }),
    merged.regular &&
      insertShippingChoice({
        addressId,
        courier: merged.regular,
        name: "REGULAR",
        weight: totalWeight,
        orderDraftId: draftOrderExist.id,
        userId,
      }),
    merged.economy &&
      insertShippingChoice({
        addressId,
        courier: merged.economy,
        name: "ECONOMY",
        weight: totalWeight,
        orderDraftId: draftOrderExist.id,
        userId,
      }),
  ]);

  return { response: { express, regular, economy }, message: "Ongkir detail" };
};

export const updateAddressCourier = async (
  req: NextRequest,
  userId: string
) => {
  const { addressId } = await req.json();

  if (!addressId) throw errorRes("Validation failed");

  const orderExist = await db.query.orderDraft.findFirst({
    columns: {
      id: true,
    },
    where: (od, { and, eq }) =>
      and(eq(od.userId, userId), eq(od.status, "ACTIVE")),
  });

  if (!orderExist) throw errorRes("Checkout detail not found", 404);

  await db
    .update(orderDraft)
    .set({ addressId })
    .where(eq(orderDraft.id, orderExist.id));
};
