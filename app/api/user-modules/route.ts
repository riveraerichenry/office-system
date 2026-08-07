import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getUserModules } from "@/lib/user-modules";

export async function GET(
  req: NextRequest
) {
  try {

    const user =
      await getCurrentUser(req);

    const modules =
      await getUserModules(
        user.id
      );

    return NextResponse.json({
      success: true,
      data: modules,
    });

  } catch {

    return NextResponse.json(
      {
        message:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );

  }
}