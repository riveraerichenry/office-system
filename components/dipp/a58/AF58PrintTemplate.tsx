"use client";

type Props = {
    orNumber: string;
    receiptDate: string;

    payor: string;

    cityMunicipality: string;
    province: string;

    permitAction: string;
    remainsOf: string;

    deceasedName: string;
    nationality: string;
    age: string;
    sex: string;

    dateOfDeath: string;
    causeOfDeath: string;
    cemeteryName: string;

    infectiousStatus: string;
    embalmedStatus: string;
    dispositionOfRemains: string;

    feeAmount: number;

    certificationCity: string;
    certificationProvince: string;
    certificationDate: string;
};

function formatDate(value: string) {
    if (!value) return "";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-PH", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
}

function formatAmount(value: number) {
    return Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function AF58PrintTemplate({
    orNumber,
    receiptDate,
    payor,
    cityMunicipality,
    province,
    permitAction,
    remainsOf,
    deceasedName,
    nationality,
    age,
    sex,
    dateOfDeath,
    causeOfDeath,
    cemeteryName,
    infectiousStatus,
    embalmedStatus,
    dispositionOfRemains,
    feeAmount,
    certificationCity,
    certificationProvince,
    certificationDate,
}: Props) {
    return (
        <div id="af58-print">

            {/* OR NUMBER */}

            <span
                className="af58-print-field"
                style={{
                    left: "1.28in",
                    top: "1.30in",
                }}
            >
                {orNumber}
            </span>


            {/* PAYOR */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.25in",
                    top: "1.72in",
                    width: "3.45in",
                }}
            >
                {payor}
            </span>


            {/* CITY */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.95in",
                    top: "2.08in",
                    width: "2.80in",
                }}
            >
                {cityMunicipality}
            </span>


            {/* PROVINCE */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.95in",
                    top: "2.40in",
                    width: "2.80in",
                }}
            >
                {province}
            </span>


            {/* PERMISSION */}

            <span
                className="af58-print-field"
                style={{
                    left: "2.12in",
                    top: "2.76in",
                }}
            >
                {permitAction}
            </span>


            {/* REMAINS OF */}

            <span
                className="af58-print-field"
                style={{
                    left: "2.95in",
                    top: "2.76in",
                    width: "0.80in",
                }}
            >
                {remainsOf}
            </span>


            {/* DECEASED NAME */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.82in",
                    top: "3.05in",
                    width: "2.85in",
                }}
            >
                {deceasedName}
            </span>


            {/* NATIONALITY */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.82in",
                    top: "3.34in",
                    width: "2.85in",
                }}
            >
                {nationality}
            </span>


            {/* AGE */}

            <span
                className="af58-print-field"
                style={{
                    left: "1.02in",
                    top: "3.62in",
                }}
            >
                {age}
            </span>


            {/* SEX */}

            <span
                className="af58-print-field"
                style={{
                    left: "2.22in",
                    top: "3.62in",
                }}
            >
                {sex}
            </span>


            {/* DATE OF DEATH */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.82in",
                    top: "3.91in",
                }}
            >
                {formatDate(dateOfDeath)}
            </span>


            {/* CAUSE OF DEATH */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.82in",
                    top: "4.19in",
                    width: "2.85in",
                }}
            >
                {causeOfDeath}
            </span>


            {/* CEMETERY */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.82in",
                    top: "4.48in",
                    width: "2.85in",
                }}
            >
                {cemeteryName}
            </span>


            {/* INFECTIOUS */}

            <span
                className="af58-print-field"
                style={{
                    left: "1.85in",
                    top: "5.01in",
                }}
            >
                {infectiousStatus}
            </span>


            {/* EMBALMED */}

            <span
                className="af58-print-field"
                style={{
                    left: "1.85in",
                    top: "5.30in",
                }}
            >
                {embalmedStatus}
            </span>


            {/* DISPOSITION */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.82in",
                    top: "5.59in",
                    width: "2.85in",
                }}
            >
                {dispositionOfRemains}
            </span>


            {/* FEE */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.70in",
                    top: "5.88in",
                    width: "2.70in",
                    textAlign: "right",
                }}
            >
                {formatAmount(feeAmount)}
            </span>


            {/* BOTTOM OR NUMBER */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.35in",
                    top: "6.24in",
                }}
            >
                {orNumber}
            </span>


            {/* BOTTOM DATE */}

            <span
                className="af58-print-field"
                style={{
                    left: "2.55in",
                    top: "6.24in",
                }}
            >
                {formatDate(receiptDate)}
            </span>


            {/* BOTTOM PESO */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.35in",
                    top: "6.54in",
                    width: "2.80in",
                }}
            >
                {formatAmount(feeAmount)}
            </span>


            {/* CITY */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.35in",
                    top: "6.86in",
                    width: "1.55in",
                }}
            >
                {certificationCity}
            </span>


            {/* PROVINCE */}

            <span
                className="af58-print-field"
                style={{
                    left: "1.95in",
                    top: "6.86in",
                    width: "1.45in",
                }}
            >
                {certificationProvince}
            </span>


            {/* DATE */}

            <span
                className="af58-print-field"
                style={{
                    left: "0.35in",
                    top: "7.23in",
                }}
            >
                {formatDate(certificationDate)}
            </span>


            {/* CERTIFICATION AMOUNT */}

            <span
                className="af58-print-field"
                style={{
                    left: "1.25in",
                    top: "7.84in",
                    width: "1.90in",
                }}
            >
                {formatAmount(feeAmount)}
            </span>

        </div>
    );
}