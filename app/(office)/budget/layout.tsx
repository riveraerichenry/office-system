
import BudgetSidebar from "./components/BudgetSidebar";

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BudgetSidebar>{children}</BudgetSidebar>;
}
