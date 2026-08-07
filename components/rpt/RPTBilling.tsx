"use client";

import { useState } from "react";


import SearchPropertyCard from "./SearchPropertyCard";
import AssessmentTable from "./AssessmentTable";

export default function RPTBilling() {

    const [assessment, setAssessment] = useState<any>(null);

    return (

        <div className="space-y-6">

          

            <SearchPropertyCard
                onBillingCreated={setAssessment}
            />

            {assessment && (

                <AssessmentTable
                    assessment={assessment}
                />

            )}

        </div>

    );

}