
"use client";

import SearchPropertyCard from "./SearchPropertyCard";
import { useState } from "react";

export default function RPTBilling() {
    const [, setAssessment] = useState<any>(null);

    return (
        <div className="space-y-6">
            <SearchPropertyCard
                onBillingCreated={setAssessment}
            />
        </div>
    );
}
