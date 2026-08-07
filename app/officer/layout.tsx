import OfficerTopbar from "@/components/officer/OfficerTopbar";

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <OfficerTopbar />

      <main className="p-8">
        {children}
      </main>
    </div>
  );
}