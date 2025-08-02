import { productsList } from "@/lib/api";
import { errorRes, successRes } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const response = await productsList(req);

    return successRes(response, "Products list");
  } catch (error) {
    console.error("ERROR_GET_PRODUCTS", error);
    return errorRes("Internal Error", 500);
  }
}
