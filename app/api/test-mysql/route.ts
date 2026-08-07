import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

export async function GET() {
  try {
    const [rows] = await mysqlPool.query(
      "SELECT CURRENT_USER() AS currentUser, DATABASE() AS db, VERSION() AS version"
    );

    return NextResponse.json({
      success: true,
      rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error:
        error instanceof Error ? error.message : String(error),
    });
  }
}