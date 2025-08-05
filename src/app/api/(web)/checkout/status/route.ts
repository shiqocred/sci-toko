import { successRes } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(body);

    return successRes(null, "success");
  } catch (error) {
    console.log(error);
  }
}
