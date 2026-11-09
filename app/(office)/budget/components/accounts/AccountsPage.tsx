
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import AccountCategoryModal from "./AccountCategoryModal";
import AccountModal from "./AccountModal";
import AccountsTable from "./AccountsTable";
import AccountCategoryTable from "./AccountCategorytable";

import type {
  AccountFormData,
  CategoryFormData,
  ExpenseAccount,
  ExpenseAccountCategory,
  OfficeOption,
  SubOfficeOption,
} from "./account-types";

const API = {
  categories: "/budget/api/expense_account_categories",
  accounts: "/budget/api/expense_accounts",
  offices: "/budget/api/offices",
  subOffices: "/budget/api/sub_offices",
};

async function readResponse(response: Response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Request failed.");
  }

  return result;
}

export default function AccountsPage() {
  // =====================================================
  // DATA
  // =====================================================

  const [categories, setCategories] = useState<ExpenseAccountCategory[]>([]);
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);
  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [subOffices, setSubOffices] = useState<SubOfficeOption[]>([]);

  // =====================================================
  // LOADING AND NOTIFICATIONS
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // =====================================================
  // SEARCH AND FILTERS
  // =====================================================

  const [categorySearch, setCategorySearch] = useState("");
  const [accountSearch, setAccountSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOffice, setSelectedOffice] = useState("All");
  const [selectedSubOffice, setSelectedSubOffice] = useState("All");

  // =====================================================
  // EXPANSION
  // =====================================================

  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [accountExpanded, setAccountExpanded] = useState(true);

  // =====================================================
  // MODALS
  // =====================================================

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<ExpenseAccountCategory | null>(null);

  const [editingAccount, setEditingAccount] =
    useState<ExpenseAccount | null>(null);

  // =====================================================
  // PAGINATION
  // =====================================================

  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(10);

  const [accountPage, setAccountPage] = useState(1);
  const [accountPageSize, setAccountPageSize] = useState(10);

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        catRes,
        accRes,
        officeRes,
        subRes,
      ] = await Promise.all([
        fetch(API.categories, { cache: "no-store" }),
        fetch(API.accounts, { cache: "no-store" }),
        fetch(API.offices, { cache: "no-store" }),
        fetch(API.subOffices, { cache: "no-store" }),
      ]);

      const [
        catJson,
        accJson,
        officeJson,
        subJson,
      ] = await Promise.all([
        readResponse(catRes),
        readResponse(accRes),
        readResponse(officeRes),
        readResponse(subRes),
      ]);

      setCategories(catJson.data ?? []);
      setAccounts(accJson.data ?? []);
      setOffices(officeJson.data ?? []);
      setSubOffices(subJson.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load account records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  // =====================================================
  // FILTER CATEGORIES
  // =====================================================

  const filteredCategories = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase();

    return categories.filter((item) =>
      [
        item.category_code,
        item.category_name,
        item.office_name,
        item.sub_office_name,
        item.description,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      )
    );
  }, [categories, categorySearch]);

  // =====================================================
  // FILTER ACCOUNTS
  // =====================================================

  const filteredAccounts = useMemo(() => {
    const keyword = accountSearch.trim().toLowerCase();

    return accounts.filter((item) => {
      // SEARCH
      const matchesSearch = [
        item.account_code,
        item.account_name,
        item.category_code,
        item.category_name,
        item.office_name,
        item.sub_office_name,
        item.description,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      );

      // CATEGORY
      const matchesCategory =
        selectedCategory === "All" ||
        item.category_id === selectedCategory;

      // OFFICE
      // Direct office category: item.office_id
      // Sub-office category: find its parent office through subOffices.
      const accountSubOffice = item.sub_office_id
        ? subOffices.find(
            (sub) => sub.id === item.sub_office_id
          )
        : undefined;

      const accountOfficeId =
        item.office_id || accountSubOffice?.office_id || "";

      const matchesOffice =
        selectedOffice === "All" ||
        accountOfficeId === selectedOffice;

      // SUB-OFFICE
      const matchesSubOffice =
        selectedSubOffice === "All" ||
        item.sub_office_id === selectedSubOffice;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesOffice &&
        matchesSubOffice
      );
    });
  }, [
    accounts,
    accountSearch,
    selectedCategory,
    selectedOffice,
    selectedSubOffice,
    subOffices,
  ]);

  // =====================================================
  // FILTER HANDLERS
  // =====================================================

  const handleOfficeChange = (value: string) => {
    setSelectedOffice(value);

    // Reset sub-office when office changes.
    setSelectedSubOffice("All");

    // Reset category and pagination.
    setSelectedCategory("All");
    setAccountPage(1);
  };

  const handleSubOfficeChange = (value: string) => {
    setSelectedSubOffice(value);
    setSelectedCategory("All");
    setAccountPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setAccountPage(1);
  };

  const handleAccountSearch = (value: string) => {
    setAccountSearch(value);
    setAccountPage(1);
  };

  // =====================================================
  // PAGINATED DATA
  // =====================================================

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * categoryPageSize;

    return filteredCategories.slice(
      start,
      start + categoryPageSize
    );
  }, [filteredCategories, categoryPage, categoryPageSize]);

  const paginatedAccounts = useMemo(() => {
    const start = (accountPage - 1) * accountPageSize;

    return filteredAccounts.slice(
      start,
      start + accountPageSize
    );
  }, [filteredAccounts, accountPage, accountPageSize]);

  // =====================================================
  // KEEP CURRENT PAGE VALID AFTER FILTERING
  // =====================================================

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredCategories.length / categoryPageSize)
    );

    if (categoryPage > totalPages) {
      setCategoryPage(totalPages);
    }
  }, [filteredCategories.length, categoryPageSize, categoryPage]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredAccounts.length / accountPageSize)
    );

    if (accountPage > totalPages) {
      setAccountPage(totalPages);
    }
  }, [filteredAccounts.length, accountPageSize, accountPage]);

  // =====================================================
  // SAVE CATEGORY
  // =====================================================

  async function saveCategory(data: CategoryFormData) {
    const editing = Boolean(editingCategory);

    const response = await fetch(
      editing
        ? `${API.categories}/${editingCategory!.id}`
        : API.categories,
      {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    await readResponse(response);

    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryPage(1);

    await loadData();

    notify(
      editing
        ? "Category updated successfully."
        : "Category created successfully."
    );
  }

  // =====================================================
  // SAVE ACCOUNT
  // =====================================================

  async function saveAccount(data: AccountFormData) {
    const editing = Boolean(editingAccount);

    const response = await fetch(
      editing
        ? `${API.accounts}/${editingAccount!.id}`
        : API.accounts,
      {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    await readResponse(response);

    setShowAccountModal(false);
    setEditingAccount(null);
    setAccountPage(1);

    await loadData();

    notify(
      editing
        ? "Account updated successfully."
        : "Account created successfully."
    );
  }

  // =====================================================
  // TOGGLE CATEGORY STATUS
  // =====================================================

  async function toggleCategory(item: ExpenseAccountCategory) {
    const action = item.is_active ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${item.category_name}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API.categories}/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          is_active: !item.is_active,
        }),
      });

      await readResponse(response);
      await loadData();

      notify("Category status updated.");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Update failed."
      );
    }
  }

  // =====================================================
  // TOGGLE ACCOUNT STATUS
  // =====================================================

  async function toggleAccount(item: ExpenseAccount) {
    const action = item.is_active ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${item.account_name}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API.accounts}/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          is_active: !item.is_active,
        }),
      });

      await readResponse(response);
      await loadData();

      notify("Account status updated.");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Update failed."
      );
    }
  }

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const statusBadge = (active: boolean) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-4 md:p-6">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            Budget Management
            <span>/</span>
            Settings
            <span>/</span>
            <span className="text-slate-600">Accounts</span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            Expense Account and Category Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage expense account categories and their corresponding accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
          {notice}
        </div>
      )}

      {/* ACCOUNT CATEGORIES */}
      <AccountCategoryTable
        categories={paginatedCategories}
        loading={loading}
        search={categorySearch}
        page={categoryPage}
        pageSize={categoryPageSize}
        total={filteredCategories.length}
        expanded={categoryExpanded}
        onSearchChange={(value) => {
          setCategorySearch(value);
          setCategoryPage(1);
        }}
        onPageChange={setCategoryPage}
        onPageSizeChange={(size) => {
          setCategoryPageSize(size);
          setCategoryPage(1);
        }}
        onToggleExpanded={() =>
          setCategoryExpanded((previous) => !previous)
        }
        onAdd={() => {
          setEditingCategory(null);
          setShowCategoryModal(true);
        }}
        onEdit={(item) => {
          setEditingCategory(item);
          setShowCategoryModal(true);
        }}
        onToggleStatus={(item) => void toggleCategory(item)}
        statusBadge={statusBadge}
      />

      {/* EXPENSE ACCOUNTS */}
      <AccountsTable
        accounts={paginatedAccounts}
        categories={categories}
        offices={offices}
        subOffices={subOffices}
        loading={loading}
        search={accountSearch}
        selectedCategory={selectedCategory}
        selectedOffice={selectedOffice}
        selectedSubOffice={selectedSubOffice}
        page={accountPage}
        pageSize={accountPageSize}
        total={filteredAccounts.length}
        expanded={accountExpanded}
        onSearchChange={handleAccountSearch}
        onCategoryChange={handleCategoryChange}
        onOfficeChange={handleOfficeChange}
        onSubOfficeChange={handleSubOfficeChange}
        onPageChange={setAccountPage}
        onPageSizeChange={(size) => {
          setAccountPageSize(size);
          setAccountPage(1);
        }}
        onToggleExpanded={() =>
          setAccountExpanded((previous) => !previous)
        }
        onAdd={() => {
          setEditingAccount(null);
          setShowAccountModal(true);
        }}
        onEdit={(item) => {
          setEditingAccount(item);
          setShowAccountModal(true);
        }}
        onToggleStatus={(item) => void toggleAccount(item)}
        statusBadge={statusBadge}
      />

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <AccountCategoryModal
          category={editingCategory}
          offices={offices}
          subOffices={subOffices}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={saveCategory}
        />
      )}

      {/* ACCOUNT MODAL */}
      {showAccountModal && (
        <AccountModal
          account={editingAccount}
          categories={categories}
          offices={offices}
          subOffices={subOffices}
          onClose={() => {
            setShowAccountModal(false);
            setEditingAccount(null);
          }}
          onSave={saveAccount}
        />
      )}
    </div>
  );
}
