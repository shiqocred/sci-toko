import { createId } from "@paralleldrive/cuid2";
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";

export const shippings = pgTable("shippings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  waybillId: text("waybill_id").notNull(), // untuk cek tracking
  courierCompany: text("courier_company").notNull(), // grab, jne, etc

  trackingLink: text("tracking_link"),
  orderRefId: text("order_ref_id"), // order_id dari Biteship

  shippingCost: numeric("shipping_cost", { precision: 12, scale: 0 }),
  estimatedDay: integer("estimated_day"),
  status: text("status").default("WAITING"), // delivered, etc

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
