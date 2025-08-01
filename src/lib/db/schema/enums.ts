import { pgEnum } from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "WAITING_PAYMENT", // Menunggu pembayaran
  "PACKING", // Dikemas
  "SHIPPING", // Dikirim
  "DELIVERED", // Selesai
  "CANCELLED", // Dibatalkan
]);

export const roleUserEnum = pgEnum("user_role", [
  "BASIC",
  "PETSHOP",
  "VETERINARIAN",
  "ADMIN",
]);

export const typeOtpEnum = pgEnum("type_otp", [
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
]);

export const statusRoleEnum = pgEnum("status_role", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const discountApplyEnum = pgEnum("apply_type", [
  "categories",
  "suppliers",
  "pets",
  "products",
]);
export const discountValueTypeEnum = pgEnum("discount_value_type", [
  "percentage",
  "fixed",
]);
export const minRequirementTypeEnum = pgEnum("min_requirement_type", [
  "amount",
  "quantity",
]);
export const eligibilityTypeEnum = pgEnum("eligibility_type", ["user", "role"]);
