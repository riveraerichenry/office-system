"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import AccountCategoryModal from "./AccountCategoryModal";
import AccountModal from "./AccountModal";
import AccountsTable from "./AccountsTable";
import AccountCategoryTable from "./AccountCategorytable";
import type { AccountFormData, CategoryFormData, ExpenseAccount, ExpenseAccountCategory } from "./account-types";

const API = {
  categories: "/budget/api/expense_account_categories",
  accounts: "/budget/api/expense_accounts",
};

async function readResponse(response: Response) {
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message || "Request failed.");
  return result;
}

export default function AccountsPage() {
  const [categories, setCategories] = useState<ExpenseAccountCategory[]>([]);
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [categorySearch, setCategorySearch] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [accountExpanded, setAccountExpanded] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseAccountCategory | null>(null);
  const [editingAccount, setEditingAccount] = useState<ExpenseAccount | null>(null);

  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(10);
  const [accountPage, setAccountPage] = useState(1);
  const [accountPageSize, setAccountPageSize] = useState(10);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [catRes, accRes] = await Promise.all([
        fetch(API.categories, { cache: "no-store" }),
        fetch(API.accounts, { cache: "no-store" }),
      ]);
      const [catJson, accJson] = await Promise.all([readResponse(catRes), readResponse(accRes)]);
      setCategories(catJson.data ?? []);
      setAccounts(accJson.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load account records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const filteredCategories = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase();
    return categories.filter((item) => [item.category_code, item.category_name, item.description].some((value) => String(value ?? "").toLowerCase().includes(keyword)));
  }, [categories, categorySearch]);

  const filteredAccounts = useMemo(() => {
    const keyword = accountSearch.trim().toLowerCase();
    return accounts.filter((item) => {
      const matchesSearch = [item.account_code, item.account_name, item.category_code, item.category_name, item.description].some((value) => String(value ?? "").toLowerCase().includes(keyword));
      const matchesCategory = selectedCategory === "All" || item.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [accounts, accountSearch, selectedCategory]);

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * categoryPageSize;
    return filteredCategories.slice(start, start + categoryPageSize);
  }, [filteredCategories, categoryPage, categoryPageSize]);

  const paginatedAccounts = useMemo(() => {
    const start = (accountPage - 1) * accountPageSize;
    return filteredAccounts.slice(start, start + accountPageSize);
  }, [filteredAccounts, accountPage, accountPageSize]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredCategories.length / categoryPageSize));
    if (categoryPage > pages) setCategoryPage(pages);
  }, [filteredCategories.length, categoryPageSize, categoryPage]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredAccounts.length / accountPageSize));
    if (accountPage > pages) setAccountPage(pages);
  }, [filteredAccounts.length, accountPageSize, accountPage]);

  async function saveCategory(data: CategoryFormData) {
    const editing = Boolean(editingCategory);
    const response = await fetch(editing ? `${API.categories}/${editingCategory!.id}` : API.categories, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await readResponse(response);
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryPage(1);
    await loadData();
    notify(editing ? "Category updated successfully." : "Category created successfully.");
  }

  async function saveAccount(data: AccountFormData) {
    const editing = Boolean(editingAccount);
    const response = await fetch(editing ? `${API.accounts}/${editingAccount!.id}` : API.accounts, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await readResponse(response);
    setShowAccountModal(false);
    setEditingAccount(null);
    setAccountPage(1);
    await loadData();
    notify(editing ? "Account updated successfully." : "Account created successfully.");
  }

  async function toggleCategory(item: ExpenseAccountCategory) {
    const action = item.is_active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} ${item.category_name}?`)) return;
    try {
      const response = await fetch(`${API.categories}/${item.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, is_active: !item.is_active }),
      });
      await readResponse(response);
      await loadData();
      notify("Category status updated.");
    } catch (err) { window.alert(err instanceof Error ? err.message : "Update failed."); }
  }

  async function toggleAccount(item: ExpenseAccount) {
    const action = item.is_active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} ${item.account_name}?`)) return;
    try {
      const response = await fetch(`${API.accounts}/${item.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, is_active: !item.is_active }),
      });
      await readResponse(response);
      await loadData();
      notify("Account status updated.");
    } catch (err) { window.alert(err instanceof Error ? err.message : "Update failed."); }
  }

  const statusBadge = (active: boolean) => (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />{active ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">Budget Management <span>/</span> Settings <span>/</span> <span className="text-slate-600">Accounts</span></div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">Expense Account and Category Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage global expense account categories and their corresponding accounts.</p>
        </div>
        <button type="button" onClick={() => void loadData()} disabled={loading} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Refresh</button>
      </div>

      {error && <div className="mb-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
      {notice && <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">{notice}</div>}

      <AccountCategoryTable
        categories={paginatedCategories} loading={loading} search={categorySearch} page={categoryPage} pageSize={categoryPageSize} total={filteredCategories.length} expanded={categoryExpanded}
        onSearchChange={(value) => { setCategorySearch(value); setCategoryPage(1); }} onPageChange={setCategoryPage}
        onPageSizeChange={(size) => { setCategoryPageSize(size); setCategoryPage(1); }}
        onToggleExpanded={() => setCategoryExpanded((value) => !value)}
        onAdd={() => { setEditingCategory(null); setShowCategoryModal(true); }}
        onEdit={(item) => { setEditingCategory(item); setShowCategoryModal(true); }} onToggleStatus={(item) => void toggleCategory(item)} statusBadge={statusBadge}
      />

      <AccountsTable
        accounts={paginatedAccounts} categories={categories} loading={loading} search={accountSearch} selectedCategory={selectedCategory} page={accountPage} pageSize={accountPageSize} total={filteredAccounts.length} expanded={accountExpanded}
        onSearchChange={(value) => { setAccountSearch(value); setAccountPage(1); }}
        onCategoryChange={(value) => { setSelectedCategory(value); setAccountPage(1); }} onPageChange={setAccountPage}
        onPageSizeChange={(size) => { setAccountPageSize(size); setAccountPage(1); }}
        onToggleExpanded={() => setAccountExpanded((value) => !value)}
        onAdd={() => { setEditingAccount(null); setShowAccountModal(true); }}
        onEdit={(item) => { setEditingAccount(item); setShowAccountModal(true); }} onToggleStatus={(item) => void toggleAccount(item)} statusBadge={statusBadge}
      />

      {showCategoryModal && <AccountCategoryModal category={editingCategory} onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }} onSave={saveCategory} />}
      {showAccountModal && <AccountModal account={editingAccount} categories={categories} onClose={() => { setShowAccountModal(false); setEditingAccount(null); }} onSave={saveAccount} />}
    </div>
  );
}
