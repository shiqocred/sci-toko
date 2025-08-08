import PaymentFailed from "@/components/email/payment-failed";
import PaymentSuccess from "@/components/email/payment-success";
import { errorRes, successRes } from "@/lib/auth";
import { db, invoices, orders, users } from "@/lib/db";
import { resend } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { external_id, payment_method, status, payment_channel, paid_at } =
      body;

    const [externalIdExist] = await db
      .select({
        id: invoices.id,
        orderId: invoices.orderId,
        email: users.email,
        name: users.name,
      })
      .from(invoices)
      .innerJoin(orders, eq(orders.id, invoices.orderId))
      .innerJoin(users, eq(users.id, orders.userId))
      .where(eq(invoices.orderId, external_id))
      .limit(1);

    if (!externalIdExist) return errorRes("Payment id not found", 400);

    console.log(externalIdExist, body, status === "EXPIRED", status);

    if (status === "EXPIRED") {
      await Promise.all([
        db
          .update(invoices)
          .set({
            status,
            expiredAt: sql`NOW()`,
          })
          .where(eq(invoices.id, externalIdExist.id)),

        db
          .update(orders)
          .set({
            status: "EXPIRED",
            updatedAt: sql`NOW()`,
          })
          .where(eq(orders.id, externalIdExist.orderId)),

        resend.emails.send({
          from: "SCI Team<inpo@support.sro.my.id>",
          to: [externalIdExist.email ?? ""],
          subject: "Payment Failed",
          react: PaymentFailed({
            name: "Fulan",
            code: "123456",
          }),
        }),
      ]);

      return successRes(null, "Payment expired");
    }

    await Promise.all([
      db
        .update(invoices)
        .set({
          status,
          updatedAt: sql`NOW()`,
          paidAt: new Date(paid_at),
          paymentChannel: payment_channel,
          paymentMethod: payment_method,
        })
        .where(eq(invoices.id, externalIdExist.id)),
      db
        .update(orders)
        .set({
          status: "PACKING",
          updatedAt: sql`NOW()`,
        })
        .where(eq(orders.id, externalIdExist.orderId)),
      resend.emails.send({
        from: "SCI Team<inpo@support.sro.my.id>",
        to: [externalIdExist.email ?? ""],
        subject: "Payment Success",
        react: PaymentSuccess({
          name: "Fulan",
          code: "123456",
        }),
      }),
    ]);

    return successRes(null, "Payment Success");
  } catch (error) {
    console.log(error);
    return errorRes(`Internal Error ${JSON.stringify(error)}`, 500);
  }
}
