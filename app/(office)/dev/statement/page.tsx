import StatementOfAccount from "@/components/rpt/StatementOfAccount";

export default function Page() {
    return (
        <div className="min-h-screen bg-gray-300 p-10">
            <StatementOfAccount billing={null} />
        </div>
    );
}