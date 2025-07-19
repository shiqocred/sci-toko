import { sign, SignOptions, verify } from "jsonwebtoken";
import { jwtSecret } from "@/config";
import { errorRes } from "./response";

export const signJWT = (
  payload: string | Buffer | object,
  options?: SignOptions
) => {
  return sign(payload, jwtSecret, options);
};

const tokenJWT = (req: Request) => {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) throw errorRes("Unauthorize", 401);

  const token = authHeader.replace("Bearer ", "");

  return token;
};

// cek auth semua halaman
export const isAuth = async (
  req: Request,
  type: "verify" | "noverify" = "noverify"
) => {
  const token = tokenJWT(req);

  if (!token) throw errorRes("Unauthorize", 401);

  let payload: { sub: string; email: string; password: string };
  try {
    payload = verify(token, jwtSecret) as typeof payload;
  } catch (err) {
    console.log(err);
    throw errorRes("Unauthorize", 401);
  }

  if (
    (type === "noverify" && payload.email) ||
    (type === "noverify" && payload.password) ||
    (type === "verify" && payload.sub)
  )
    throw errorRes("Unauthorize", 401);

  return payload;
};
