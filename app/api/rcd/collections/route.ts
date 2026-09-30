
import { NextRequest, NextResponse } from "next/server";

type CollectionItem = {
    form_code?: string | null;
    or_number?: string | number | null;
    amount?: number | string | null;
    booklet_registration_id?: string | null;
    beginning_or?: string | number | null;
    ending_or?: string | number | null;
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const items: CollectionItem[] = body?.items;

        if (!Array.isArray(items)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid items supplied.",
                },
                { status: 400 }
            );
        }

        // Group by form AND booklet.
        const groups = new Map<string, CollectionItem[]>();

        for (const item of items) {
            const formCode =
                String(item.form_code ?? "—").trim() || "—";

            const bookletId =
                String(item.booklet_registration_id ?? "").trim();

            const key = `${formCode}::${bookletId || "NO_BOOKLET"}`;

            if (!groups.has(key)) {
                groups.set(key, []);
            }

            groups.get(key)!.push(item);
        }

        const formRows = Array.from(groups.values()).map(
            (groupItems) => {
                const first = groupItems[0];

                const formCode =
                    String(first.form_code ?? "—").trim() || "—";

                const serials = groupItems
                    .map((item) =>
                        String(item.or_number ?? "").trim()
                    )
                    .filter((value) => value !== "");

                const numericSerials = serials
                    .filter((value) => /^\d+$/.test(value))
                    .map((value) => BigInt(value));

                let from = "—";
                let to = "—";

                if (numericSerials.length > 0) {
                    const min = numericSerials.reduce(
                        (a, b) => (a < b ? a : b)
                    );
                    const max = numericSerials.reduce(
                        (a, b) => (a > b ? a : b)
                    );

                    const width = Math.max(
                        ...serials.map((value) => value.length)
                    );

                    from = min.toString().padStart(width, "0");
                    to = max.toString().padStart(width, "0");
                } else if (serials.length > 0) {
                    const sorted = [...serials].sort();
                    from = sorted[0];
                    to = sorted[sorted.length - 1];
                }

                // Respect the booklet's assigned OR boundaries.
                const beginning = String(
                    first.beginning_or ?? ""
                ).trim();
                const ending = String(
                    first.ending_or ?? ""
                ).trim();

                if (numericSerials.length > 0) {
                    const min = numericSerials.reduce(
                        (a, b) => (a < b ? a : b)
                    );
                    const max = numericSerials.reduce(
                        (a, b) => (a > b ? a : b)
                    );

                    if (
                        /^\d+$/.test(beginning) &&
                        min < BigInt(beginning)
                    ) {
                        throw new Error(
                            `OR ${from} is below booklet beginning OR ${beginning} for ${formCode}.`
                        );
                    }

                    if (
                        /^\d+$/.test(ending) &&
                        max > BigInt(ending)
                    ) {
                        throw new Error(
                            `OR ${to} exceeds booklet ending OR ${ending} for ${formCode}.`
                        );
                    }
                }

                const amount = groupItems.reduce(
                    (sum, item) => {
                        const value = Number(item.amount ?? 0);
                        return sum + (
                            Number.isFinite(value) ? value : 0
                        );
                    },
                    0
                );

                return {
                    formCode,
                    from,
                    to,
                    quantity: serials.length,
                    amount,
                    bookletRegistrationId:
                        first.booklet_registration_id ?? null,
                };
            }
        );

        const totalCollections = formRows.reduce(
            (sum, row) => sum + row.amount,
            0
        );

        return NextResponse.json({
            success: true,
            formRows,
            totalCollections,
        });
    } catch (error) {
        console.error("RCD collections API error:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to generate RCD collections.",
            },
            { status: 500 }
        );
    }
}