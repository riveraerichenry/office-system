import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function getCurrentUser(
  req: NextRequest
) {
  const token =
    req.cookies.get("token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  return verifyToken(token) as any;
}