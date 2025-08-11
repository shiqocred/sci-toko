import { getTracking } from "@/lib/action";
import { errorRes, successRes } from "@/lib/auth";
import { db, orders, shippingHistories, shippings } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
type OrderStatusEvent = {
  event: "order.status";
  order_id: string;
  order_price: number;
  courier_tracking_id: string;
  courier_waybill_id: string;
  courier_company: string;
  courier_type: string;
  courier_driver_name: string;
  courier_driver_phone: string;
  courier_driver_plate_number: string;
  courier_driver_photo_url: string;
  courier_link: string;
  status: any;
  updated_at: string; // ISO date string
};

type Histories = {
  note: string;
  service_type: string;
  status: any;
  updated_at: string;
};

const sanitizeStatus = async (
  status:
    | "confirmed"
    | "scheduled"
    | "allocated"
    | "picking_up"
    | "picked"
    | "cancelled"
    | "on_hold"
    | "dropping_off"
    | "return_in_transit"
    | "returned"
    | "rejected"
    | "disposed"
    | "courier_not_found"
    | "delivered"
) => {
  if (
    status === "allocated" ||
    status === "scheduled" ||
    status === "picking_up" ||
    status === "picked" ||
    status === "on_hold" ||
    status === "dropping_off"
  )
    return "SHIPPING";
  if (
    status === "cancelled" ||
    status === "return_in_transit" ||
    status === "returned" ||
    status === "rejected" ||
    status === "disposed" ||
    status === "courier_not_found"
  )
    return "CANCELLED";
  return "DELIVERED";
};

export async function POST(req: NextRequest) {
  try {
    const body: OrderStatusEvent = await req.json();

    if (body.event !== "order.status") return errorRes("Event not match");

    const shippingExist = await db.query.shippings.findFirst({
      columns: { id: true, trackingId: true, orderId: true },
      where: (s, { and, eq }) =>
        and(
          eq(s.trackingId, body.courier_tracking_id),
          eq(s.waybillId, body.courier_waybill_id)
        ),
    });
    if (!shippingExist) return errorRes("No waybill or tracking id found");

    const { ok: historiesOk, response: historiesRes } = await getTracking(
      shippingExist.trackingId as string
    );

    if (!historiesOk)
      return errorRes(`Failed to get histories, ${historiesRes.error}`, 400);

    const historiesFormatted: Histories[] = historiesRes.history;

    const historiesExist = await db.query.shippingHistories.findMany({
      where: (sh, { eq }) => eq(sh.shippingId, shippingExist.id),
    });

    const existingSet = new Set(
      historiesExist.map(
        (h) =>
          `${(h.note ?? "").trim()}|${new Date(h.updatedAt ?? new Date()).getTime()}|${h.status.toUpperCase()}`
      )
    );

    // 3️⃣ Filter hanya data yang belum ada
    const filteredNew = historiesFormatted.filter(
      (h) =>
        !existingSet.has(
          `${h.note.trim()}|${new Date(h.updated_at).getTime()}|${h.status.toUpperCase()}`
        )
    );

    await db.transaction(async (tx) => {
      if (filteredNew.length > 0) {
        await tx.insert(shippingHistories).values(
          filteredNew.map((history) => ({
            shippingId: shippingExist.id,
            status: history.status.toUpperCase(),
            note: history.note,
            serviceType: history.service_type,
            updatedAt: new Date(history.updated_at),
          }))
        );
      }
      if (body.status === "disposed") {
        await tx.insert(shippingHistories).values({
          shippingId: shippingExist.id,
          status: "DISPOSED",
          note: "Order successfully disposed",
          serviceType: "",
          updatedAt: sql`NOW()`,
        });
      }
      await tx
        .update(shippings)
        .set({
          status: body.status.toUpperCase(),
        })
        .where(eq(shippings.id, shippingExist.id));
      await tx
        .update(orders)
        .set({
          status: await sanitizeStatus(body.status),
        })
        .where(eq(orders.id, shippingExist.orderId));
    });

    return successRes(null, "Retrieve");
  } catch (error) {
    console.error("ERROR", error);
    return errorRes("Internal Server Error", 500);
  }
}
