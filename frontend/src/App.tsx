import { FormEvent, useEffect, useState } from 'react';
import { ActivityFeed } from './ActivityFeed';
import { CategoryBarChart } from './CategoryBarChart';
import {
  Category,
  DashboardSummary,
  Expense,
  User,
  addMonth,
  dateOffsetISO,
  formatUsd,
  getCategoryIcon,
  month,
  monthToLabel,
  todayISO,
} from './utils';

type User = { id: number; name: string; payerAccent: string };
type Category = { id: number; name: string; iconIdentifier: string };
type Expense = {
  id: number;
  amount: number;
  expenseDate: string;
  payerId: number;
  payerName: string;
  categoryId: number;
  categoryName: string;
  description: string | null;
};
type DashboardSummary = {
  householdTotal: number;
  userTotals: Array<{ userId: number; userName: string; total: number }>;
  topCategories: Array<{ userId: number; userName: string; categoryName: string; total: number }>;
};
type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

const getInitialTheme = (): Theme => {
  const fromDom = document.documentElement.getAttribute('data-theme');
  if (fromDom === 'light' || fromDom === 'dark') return fromDom;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const HOUSEHOLD_TIME_ZONE = 'America/New_York';

const easternDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: HOUSEHOLD_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// All "current date" logic is pinned to US Eastern time, matching the backend,
// regardless of the browser's local time zone.
const easternISODate = (date: Date): string => {
  const parts = easternDateFormatter.formatToParts(date);
  const get = (type: string): string => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};

const month = (): string => todayISO().slice(0, 7);
const todayISO = (): string => easternISODate(new Date());
const dateOffsetISO = (days: number): string => {
  const [year, monthNum, day] = todayISO().split('-').map(Number);
  // Anchor at UTC noon so the Eastern local time stays on the same calendar day.
  const date = new Date(Date.UTC(year, monthNum - 1, day, 12, 0, 0));
  date.setUTCDate(date.getUTCDate() + days);
  return easternISODate(date);
};
const monthKeyToDate = (value: string): Date => {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1);
};
const monthToLabel = (value: string): string =>
  monthKeyToDate(value).toLocaleString('en-US', { month: 'long', year: 'numeric' });
const addMonth = (value: string, delta: number): string => {
  const date = monthKeyToDate(value);
  date.setMonth(date.getMonth() + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
const formatUsd = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const CATEGORY_ICON_MAP: Record<string, string> = {
  'shopping-basket': 'shopping_basket',
  'house': 'apartment',
  'zap': 'bolt',
  'utensils': 'restaurant',
  'car': 'directions_car',
  'popcorn': 'theater_comedy',
  'spa': 'spa',
  'checkroom': 'checkroom',
  'ellipsis': 'more_horiz',
};

const getCategoryIcon = (iconIdentifier: string): string => {
  return CATEGORY_ICON_MAP[iconIdentifier] || iconIdentifier || 'category';
};

const getDateGroupLabel = (dateISO: string): string => {
  if (dateISO === todayISO()) return 'Today';
  if (dateISO === dateOffsetISO(-1)) return 'Yesterday';
  const [y, m, d] = dateISO.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const createDefaultFormState = (payerId?: number, categoryId?: number) => ({
  amount: '',
  payerId: payerId ? String(payerId) : '',
  categoryId: categoryId ? String(categoryId) : '',
  description: '',
  expenseDate: todayISO(),
});

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPayerFilter, setSelectedPayerFilter] = useState<'all' | string>('all');
  const [activeNavTab, setActiveNavTab] = useState<'dashboard' | 'all-expenses'>('dashboard');

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [form, setForm] = useState(() => createDefaultFormState());
  const [selectedMonth, setSelectedMonth] = useState(() => month());
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable (e.g. private mode) — theme still applies for the session.
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  const syncDefaultFormValues = (nextUsers: User[], nextCategories: Category[]) => {
    setForm((current) => ({
      ...current,
      payerId: nextUsers.some((user) => String(user.id) === current.payerId)
        ? current.payerId
        : nextUsers[0] ? String(nextUsers[0].id) : '',
      categoryId: nextCategories.some((category) => String(category.id) === current.categoryId)
        ? current.categoryId
        : nextCategories[0] ? String(nextCategories[0].id) : '',
      expenseDate: current.expenseDate || todayISO(),
    }));
  };

  const loadData = async (monthValue: string) => {
    const [summaryRes, expenseRes, usersRes, categoriesRes] = await Promise.all([
      fetch(`/api/v1/dashboard/summary?month=${monthValue}`),
      fetch(`/api/v1/expenses?month=${monthValue}`),
      fetch('/api/v1/users'),
      fetch('/api/v1/categories'),
    ]);

    const nextUsers = usersRes.ok ? ((await usersRes.json()) as User[]) : users;
    const nextCategories = categoriesRes.ok ? ((await categoriesRes.json()) as Category[]) : categories;

    if (summaryRes.ok) setSummary(await summaryRes.json());
    if (expenseRes.ok) setExpenses(await expenseRes.json());
    setUsers(nextUsers);
    setCategories(nextCategories);
    syncDefaultFormValues(nextUsers, nextCategories);
  };

  const currentMonth = month();

  // The All Expenses tab is pinned to the current month; the dashboard
  // follows the month navigator.
  const activeMonth = activeNavTab === 'all-expenses' ? currentMonth : selectedMonth;

  useEffect(() => {
    void loadData(activeMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMonth]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const selectedUser = users.find((user) => String(user.id) === form.payerId);
    if (!selectedUser) {
      setSubmitError('Select a valid payer.');
      return;
    }

    const selectedCategory = categories.find((category) => String(category.id) === form.categoryId);
    if (!selectedCategory) {
      setSubmitError('Select a valid category.');
      return;
    }

    const payload = {
      amount: form.amount || '0',
      payerId: selectedUser.id,
      categoryId: selectedCategory.id,
      expenseDate: form.expenseDate,
      description: form.description,
    };

    const response = await fetch('/api/v1/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
      setSubmitError(errorPayload.error ?? 'Unable to save expense.');
      return;
    }

    const defaultPayerId = users[0] ? users[0].id : Number(form.payerId) || undefined;
    const defaultCategoryId = categories[0] ? categories[0].id : Number(form.categoryId) || undefined;

    setForm({
      ...createDefaultFormState(defaultPayerId, defaultCategoryId),
      amount: '',
      description: '',
      expenseDate: todayISO(),
    });
    setSuccessMessage('Expense added successfully to ledger.');
    await loadData(activeMonth);
    document.getElementById('expense-amount-input')?.focus();
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleDelete = async (expenseId: number) => {
    const confirmed = window.confirm('Delete this expense?');
    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    try {
      const response = await fetch(`/api/v1/expenses/${expenseId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorPayload.error ?? 'Unable to delete expense.');
      }

      await loadData(activeMonth);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete expense.');
    }
  };

  const isCurrentMonth = selectedMonth === currentMonth;
  const householdTotal = summary?.householdTotal ?? 0;

  // Selected Category name
  const currentCategory = categories.find((c) => String(c.id) === form.categoryId);

  return (
    <div>
      {/* Sticky Top Navigation Bar */}
      <header className="top-nav">
        <div className="nav-container">
          <div className="brand-section">
            <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveNavTab('dashboard'); }}>
              <div className="brand-icon-badge">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <span>Dual Expense</span>
            </a>
            <nav className="nav-tabs">
              <button
                type="button"
                className={`nav-tab ${activeNavTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveNavTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                type="button"
                className={`nav-tab ${activeNavTab === 'all-expenses' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNavTab('all-expenses');
                  setSelectedMonth(currentMonth);
                  setSelectedPayerFilter('all');
                }}
              >
                All Expenses
              </button>
            </nav>
          </div>

          <div className="nav-actions">
            {/* Month Navigator (dashboard only — All Expenses is pinned to the current month) */}
            <div
              className="month-selector"
              aria-label="Month navigation"
              style={activeNavTab === 'all-expenses' ? { visibility: 'hidden' } : undefined}
            >
              <button
                type="button"
                className="month-nav-btn"
                onClick={() => setSelectedMonth((current) => addMonth(current, -1))}
                aria-label="Previous month"
                title="Previous month"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="month-label-wrap">
                <span className="material-symbols-outlined">calendar_today</span>
                <span>{monthToLabel(selectedMonth)}</span>
              </div>
              <button
                type="button"
                className="month-nav-btn"
                onClick={() => setSelectedMonth((current) => addMonth(current, 1))}
                disabled={isCurrentMonth}
                aria-label="Next month"
                title="Next month"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* CTA Button to open Add Expense Modal */}
            <button
              type="button"
              className="cta-add-button"
              onClick={() => {
                setSubmitError(null);
                setSuccessMessage(null);
                setIsAddModalOpen(true);
              }}
            >
              <span className="material-symbols-outlined">add</span>
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Shell */}
      <main className="page-shell">
        {activeNavTab === 'dashboard' ? (
          <>
            {/* Consolidated Spending Hero Card */}
            <section className="hero-card">
              <div className="hero-ambient-glow" />
              <div className="hero-header-row">
                <div>
                  <div className="hero-eyebrow">
                    <span className="eyebrow-dot" />
                    <span className="eyebrow-text">Shared Household Expense</span>
                  </div>
                  <h1>{monthToLabel(selectedMonth)} Household Spending</h1>
                  <p className="hero-subtitle">Dual expenditure log</p>
                </div>
                <div className="hero-amount-block">
                  <div className="hero-amount-value">{formatUsd(householdTotal)}</div>
                  <div className="hero-count-pill">
                    <span className="material-symbols-outlined">receipt_long</span>
                    <span>{expenses.length} transaction{expenses.length === 1 ? '' : 's'} this month</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Bicolor Split Proportion Bar */}
              <div className="proportion-box">
                <div className="proportion-header">
                  {summary?.userTotals.map((userEntry, index) => {
                    const userObj = users.find((u) => u.id === userEntry.userId);
                    const accent = userObj?.payerAccent ?? (index === 0 ? '#0f1e18' : '#29a195');
                    const userPercent = householdTotal > 0 ? (userEntry.total / householdTotal) * 100 : 0;
                    return (
                      <div key={userEntry.userId} className="proportion-user-info">
                        <span className="user-color-indicator" style={{ background: accent }} />
                        <span className="proportion-user-name">{userEntry.userName}</span>
                        <span className="proportion-user-stats">
                          {userPercent.toFixed(0)}% · {formatUsd(userEntry.total)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="proportion-track">
                  {summary?.userTotals.map((userEntry, index) => {
                    const userObj = users.find((u) => u.id === userEntry.userId);
                    const accent = userObj?.payerAccent ?? (index === 0 ? '#0f1e18' : '#29a195');
                    const userPercent = householdTotal > 0 ? (userEntry.total / householdTotal) * 100 : 50;
                    return (
                      <div
                        key={userEntry.userId}
                        className="proportion-segment"
                        style={{
                          width: `${userPercent}%`,
                          background: accent,
                        }}
                        title={`${userEntry.userName}: ${userPercent.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>

                <div className="proportion-footer">
                  <span className="left-note">
                    <span className="material-symbols-outlined">info</span>
                    <span>Unsplit Joint Accounting</span>
                  </span>
                  <span>Balance baseline: Equal equity goal</span>
                </div>
              </div>
            </section>

            {/* Individual User Summary Cards */}
            <section className="user-cards-grid">
              {summary?.userTotals.map((entry) => {
                const userObj = users.find((u) => u.id === entry.userId);
                const userAccent = userObj?.payerAccent ?? '#0f1e18';
                const topCategory = summary.topCategories.find((item) => item.userId === entry.userId);
                const share = householdTotal > 0 ? (entry.total / householdTotal) * 100 : 0;
                const userExpenses = expenses.filter((e) => e.payerId === entry.userId);
                const count = userExpenses.length;
                const avg = count > 0 ? entry.total / count : 0;

                const topCatObj = topCategory
                  ? categories.find((c) => c.name.toLowerCase() === topCategory.categoryName.toLowerCase())
                  : null;
                const topCatIcon = topCatObj ? getCategoryIcon(topCatObj.iconIdentifier) : 'category';

                return (
                  <article key={entry.userId} className="user-summary-card">
                    <div>
                      <div className="card-top-row">
                        <div className="card-user-meta">
                          <div className="user-avatar-circle" style={{ background: userAccent }}>
                            {entry.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-name-role">
                            <div className="user-name-title">
                              <h2>{entry.userName}</h2>
                              <span className="role-tag">Co-Tracker</span>
                            </div>
                            <span className="user-subtext">Household Contributor</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined" style={{ color: 'var(--outline-variant)' }}>
                          more_horiz
                        </span>
                      </div>

                      <div className="card-amount-block">
                        <div className="card-eyebrow">{monthToLabel(selectedMonth)} Logged</div>
                        <div className="card-amount-flex">
                          <strong>{formatUsd(entry.total)}</strong>
                          <span className="share-trend-pill">
                            <span className="material-symbols-outlined">north_east</span>
                            <span>{share.toFixed(0)}% of home</span>
                          </span>
                        </div>
                      </div>

                      {/* Top Category Pill */}
                      <div className="top-category-pill">
                        <div className="top-cat-left">
                          <div className="top-cat-icon">
                            <span className="material-symbols-outlined">{topCatIcon}</span>
                          </div>
                          <div className="top-cat-text">
                            <div className="top-cat-eyebrow">Top Expenditure</div>
                            <div className="top-cat-name">
                              {topCategory ? topCategory.categoryName : 'No expenses'}
                            </div>
                          </div>
                        </div>
                        {topCategory && (
                          <span className="top-cat-amount">{formatUsd(topCategory.total)}</span>
                        )}
                      </div>
                    </div>

                    <div className="card-footer-metrics">
                      <span className="metric-item">
                        <span className="material-symbols-outlined">data_table</span>
                        <span>{count} logged expense{count === 1 ? '' : 's'}</span>
                      </span>
                      <span className="metric-avg">Avg. {formatUsd(avg)}/item</span>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Consolidated spending-by-category bar chart */}
            <CategoryBarChart
              expenses={expenses}
              categories={categories}
              monthLabel={monthToLabel(selectedMonth)}
            />
          </>
        ) : (
          /* All Expenses tab: chronological feed, pinned to the current month */
          <ActivityFeed
            expenses={expenses}
            users={users}
            categories={categories}
            monthLabel={monthToLabel(activeMonth)}
            selectedPayerFilter={selectedPayerFilter}
            onPayerFilterChange={setSelectedPayerFilter}
            deleteError={deleteError}
            onDelete={(expenseId) => void handleDelete(expenseId)}
          />
        )}
      </main>

      {/* Dedicated Add Expense Modal */}
      {isAddModalOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header-row">
              <div>
                <div className="modal-eyebrow">
                  <span className="dot" />
                  <span>Expense Entry</span>
                </div>
                <h2 id="modal-title">Log New Expense</h2>
                <p className="modal-subtitle">Record an expenditure for the household ledger</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
                title="Close"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {submitError && (
              <div className="form-message-banner error">
                <span className="material-symbols-outlined">error</span>
                <span>{submitError}</span>
              </div>
            )}
            {successMessage && (
              <div className="form-message-banner success">
                <span className="material-symbols-outlined">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}

            <form className="modal-form" onSubmit={handleSubmit}>
              {/* Input 1: Typographic Amount Input */}
              <div className="amount-hero-box">
                <label className="amount-hero-label" htmlFor="expense-amount-input">
                  Amount
                </label>
                <div className="amount-hero-input-row">
                  <span className="amount-currency-symbol">$</span>
                  <input
                    id="expense-amount-input"
                    className="amount-hero-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Input 2: Tactile Payer Cards */}
              <div className="form-field-group">
                <div className="field-label-row">
                  <span className="field-label">Who Paid?</span>
                  <span className="field-hint">Single payer</span>
                </div>
                <div className="payer-cards-grid" role="radiogroup" aria-label="Who paid">
                  {users.map((user) => {
                    const isSelected = form.payerId === String(user.id);
                    return (
                      <div
                        key={user.id}
                        className={`payer-card-option ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => setForm({ ...form, payerId: String(user.id) })}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            setForm({ ...form, payerId: String(user.id) });
                          }
                        }}
                      >
                        <div className="payer-card-left">
                          <div className="payer-card-avatar" style={{ background: user.payerAccent }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="payer-card-names">
                            <span className="payer-card-title">{user.name}</span>
                            <span className="payer-card-role">Co-Partner</span>
                          </div>
                        </div>
                        <div className="payer-card-check">
                          <span
                            className="material-symbols-outlined"
                            style={{ opacity: isSelected ? 1 : 0 }}
                          >
                            check
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Input 3: Quick Date Chips + Native Picker */}
              <div className="form-field-group">
                <span className="field-label">Date</span>
                <div className="date-selector-row">
                  <button
                    type="button"
                    className={`date-pill-btn ${form.expenseDate === todayISO() ? 'is-active' : ''}`}
                    onClick={() => setForm({ ...form, expenseDate: todayISO() })}
                  >
                    <span className="material-symbols-outlined">event</span>
                    <span>Today</span>
                  </button>
                  <button
                    type="button"
                    className={`date-pill-btn ${form.expenseDate === dateOffsetISO(-1) ? 'is-active' : ''}`}
                    onClick={() => setForm({ ...form, expenseDate: dateOffsetISO(-1) })}
                  >
                    <span>Yesterday</span>
                  </button>
                  <input
                    type="date"
                    className="date-native-input"
                    value={form.expenseDate}
                    onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Input 4: Category Pill Cluster */}
              <div className="form-field-group">
                <div className="field-label-row">
                  <span className="field-label">Category</span>
                  <span className="field-hint" style={{ color: 'var(--secondary)', fontWeight: 500 }}>
                    {currentCategory?.name || 'Select category'}
                  </span>
                </div>
                <div className="category-cluster">
                  {categories.map((category) => {
                    const isSelected = form.categoryId === String(category.id);
                    const iconName = getCategoryIcon(category.iconIdentifier);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        className={`cat-pill-btn ${isSelected ? 'is-active' : ''}`}
                        onClick={() => setForm({ ...form, categoryId: String(category.id) })}
                      >
                        <span className="material-symbols-outlined">{iconName}</span>
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input 5: Description */}
              <div className="form-field-group">
                <span className="field-label">Description</span>
                <input
                  type="text"
                  className="text-input-field"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={255}
                  placeholder="Optional note (e.g. Whole Foods run, Internet bill)"
                />
              </div>

              {/* Actions */}
              <div className="modal-actions-row">
                <button type="submit" className="modal-submit-btn">
                  <span className="material-symbols-outlined">add_task</span>
                  <span>Add Expense</span>
                </button>
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
