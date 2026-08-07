import { computeRPT } from "./computation";

function coverageLabel(
    startQuarter: number,
    startYear: number,
    endQuarter: number,
    endYear: number
) {
    if (
        startQuarter === endQuarter &&
        startYear === endYear
    ) {
        return `Q${startQuarter} ${startYear}`;
    }

    if (startYear === endYear) {
        return `Q${startQuarter}-Q${endQuarter} ${startYear}`;
    }

    return `Q${startQuarter} ${startYear} - Q${endQuarter} ${endYear}`;
}

export function createAssessmentRows({

    tdNumber,

    assessedValue,

    fromQuarter,
    fromYear,

    toQuarter,
    toYear,

    paymentDate,

    kind = "",

}:{

    tdNumber:string;

    assessedValue:number;

    fromQuarter:number;
    fromYear:number;

    toQuarter:number;
    toYear:number;

    paymentDate:Date;

    kind?:string;

}){

    const rows:any[]=[];

    for(
        let year=fromYear;
        year<=toYear;
        year++
    ){

        let startQuarter=1;
        let endQuarter=4;

        if(year===fromYear)
            startQuarter=fromQuarter;

        if(year===toYear)
            endQuarter=toQuarter;

        if(year<paymentDate.getFullYear()){

            const count=endQuarter-startQuarter+1;

            const result=computeRPT({

                assessedValue,

                taxYear:year,

                paymentDate,

            });

            rows.push({

                arp:tdNumber,

                kind,

                coverage:coverageLabel(
                    startQuarter,
                    year,
                    endQuarter,
                    year
                ),

                assessed_value:assessedValue,

                tax_due:result.taxDue*count,

                basic:result.basic*count,

                sef:result.sef*count,

                penalty_percent:result.penaltyPercent,

                penalty:result.penalty*count,

                discount_percent:result.discountPercent,

                discount:result.discount*count,

                total:result.total*count,

                startQuarter,
                startYear:year,

                endQuarter,
                endYear:year,

            });

            continue;

        }

        for(
            let quarter=startQuarter;
            quarter<=endQuarter;
            quarter++
        ){

            const result=computeRPT({

                assessedValue,

                taxYear:year,

                paymentDate,

            });

            rows.push({

                arp:tdNumber,

                kind,

                coverage:coverageLabel(

                    quarter,

                    year,

                    quarter,

                    year

                ),

                assessed_value:assessedValue,

                tax_due:result.taxDue,

                basic:result.basic,

                sef:result.sef,

                penalty_percent:result.penaltyPercent,

                penalty:result.penalty,

                discount_percent:result.discountPercent,

                discount:result.discount,

                total:result.total,

                startQuarter:quarter,

                startYear:year,

                endQuarter:quarter,

                endYear:year,

            });

        }

    }

    return rows;

}