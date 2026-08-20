"use client";

import RCDPreview from "./RCDPreview";

type Props = {
    rcd: any;
};

export default function RCDReport({ rcd }: Props) {
    if (!rcd) {
        return (
            <div className="flex min-h-[500px] items-center justify-center text-sm text-gray-400">
                Select an RCD from the list.
            </div>
        );
    }

    return (
        <RCDPreview
            rcd={rcd}
            items={rcd.items ?? []}
            fundSource={
                rcd.fund_source ?? {
                    id: rcd.fund_source_id,
                    fund_code: rcd.fund_code,
                    fund_name: rcd.fund_name,
                    acronym: rcd.acronym,
                }
            }
            user={rcd.user ?? null}
            previousFormRows={rcd.previousFormRows ?? []}
        />
    );
}
