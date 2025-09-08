import { PaymentFailed } from "@/components/email/payment-failed";
import { PaymentSuccess } from "@/components/email/payment-success";
import { smtpUser } from "@/config";
import { errorRes, successRes } from "@/lib/auth";
import { db, invoices, orders, users } from "@/lib/db";
import { transporter } from "@/lib/providers";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { external_id, payment_method, status, payment_channel, paid_at } =
      body;

    const [[externalIdExist], store] = await Promise.all([
      db
        .select({
          id: invoices.id,
          orderId: invoices.orderId,
          status: invoices.status,
          email: users.email,
          name: users.name,
          total: invoices.amount,
        })
        .from(invoices)
        .innerJoin(orders, eq(orders.id, invoices.orderId))
        .innerJoin(users, eq(users.id, orders.userId))
        .where(eq(invoices.orderId, external_id))
        .limit(1),
      db.query.about.findFirst({}),
    ]);

    if (!externalIdExist) return errorRes("Payment id not found", 400);
    if (!store) return errorRes("Seed data about store first", 400);
    if (externalIdExist.status === "CANCELLED")
      return successRes(null, "Admin has been cancelled payment");
    if (externalIdExist.status === "PAID")
      return successRes(null, "Admin has been paid payment");

    if (status === "EXPIRED") {
      await db.transaction(async (tx) => {
        await Promise.all([
          tx
            .update(invoices)
            .set({
              status,
              expiredAt: sql`NOW()`,
            })
            .where(eq(invoices.id, externalIdExist.id)),

          tx
            .update(orders)
            .set({
              status,
              willExpired: null,
              updatedAt: sql`NOW()`,
              expiredAt: sql`NOW()`,
            })
            .where(eq(orders.id, externalIdExist.orderId)),
        ]);
        await transporter.sendMail({
          from: `Sehat Cerah Indonesia<${smtpUser}>`,
          to: [externalIdExist.email ?? ""],
          subject: "Payment Failed",
          html: await PaymentFailed({
            name: externalIdExist.name,
            company: store.name,
            orderId: externalIdExist.orderId,
          }),
        });
      });

      return successRes(null, "Payment expired");
    }

    await db.transaction(async (tx) => {
      await Promise.all([
        tx
          .update(invoices)
          .set({
            status,
            updatedAt: sql`NOW()`,
            paidAt: new Date(paid_at),
            paymentChannel: payment_channel,
            paymentMethod: payment_method,
          })
          .where(eq(invoices.id, externalIdExist.id)),
        tx
          .update(orders)
          .set({
            willExpired: null,
            status: "PACKING",
            updatedAt: sql`NOW()`,
            paidAt: sql`NOW()`,
          })
          .where(eq(orders.id, externalIdExist.orderId)),
      ]);
    });
    await transporter.sendMail({
      from: `Sehat Cerah Indonesia<${smtpUser}>`,
      to: [externalIdExist.email ?? ""],
      subject: "Payment Success",
      html: await PaymentSuccess({
        name: externalIdExist.name,
        company: store.name,
        orderId: externalIdExist.orderId,
        paidAt: paid_at,
        total: externalIdExist.total,
      }),
    });

    return successRes(null, "Payment Success");
  } catch (error) {
    console.log(error);
    return errorRes(`Internal Error ${JSON.stringify(error)}`, 500);
  }
}
