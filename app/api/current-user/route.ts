import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(
  req: NextRequest
) {
  try {

    const user =
      await getCurrentUser(req);

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch {

    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );

  }
}