import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const q = (searchParams.get("q") || "").trim();
        const type = (searchParams.get("type") || "any").toLowerCase();

        if (!q) {
            return NextResponse.json({
                success: true,
                results: [],
            });
        }

        let sql = `
            SELECT
                objid,
                tdno,
                owner_name,
                owner_address,
                fullpin,
                barangay_name,
                classification_name,
                rputype,
                totalareasqm,
                totalmv,
                totalav,
                state
            FROM vw_faas_lookup
            WHERE state <> 'CANCELLED'
        `;

        const params: any[] = [];
        const keyword = `%${q}%`;

        switch (type) {
            case "owner":
                sql += " AND owner_name LIKE ?";
                params.push(keyword);
                break;

            case "td":
                sql += " AND tdno LIKE ?";
                params.push(keyword);
                break;

            case "pin":
                sql += " AND fullpin LIKE ?";
                params.push(keyword);
                break;

            case "barangay":
                sql += " AND barangay_name LIKE ?";
                params.push(keyword);
                break;

            default:
                sql += `
                    AND (
                        owner_name LIKE ?
                        OR tdno LIKE ?
                        OR fullpin LIKE ?
                        OR barangay_name LIKE ?
                    )
                `;

                params.push(
                    keyword,
                    keyword,
                    keyword,
                    keyword
                );
        }

        sql += `
            ORDER BY owner_name
            LIMIT 20
        `;

        const [rows] = await mysqlPool.query(sql, params);

        return NextResponse.json({
            success: true,
            results: rows,
        });
    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}