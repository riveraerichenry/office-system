import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const info = await pool.query(`
      SELECT
        inet_server_addr() AS host,
        inet_server_port() AS port,
        current_database() AS database,
        current_user,
        version();
    `);

    console.log("DATABASE INFO:");
    console.table(info.rows);

    return NextResponse.json({
      success: true,
      data: info.rows[0],
    });
  } catch (err: any) {
    console.error("DATABASE ERROR:");
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
        stack: err.stack,
      },
      {
        status: 500,
      }
    );
  }
}