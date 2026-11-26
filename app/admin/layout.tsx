
import Topbar from "@/components/dashboard/Topbar";
import QueueResetAdmin from "@/components/dashboard/QueueResetAdmin";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Topbar />

            <main className="p-4 md:p-8">
                <div className="mb-6">
                    <QueueResetAdmin />
                </div>

                {children}
            </main>
        </div>
    );
}
