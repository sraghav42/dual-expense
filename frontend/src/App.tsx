import { FormEvent, useEffect, useState } from 'react';

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

const month = (): string => new Date().toISOString().slice(0, 7);
const todayISO = (): string => new Date().toISOString().slice(0, 10);
const dateOffsetISO = (days: number): string => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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

  useEffect(() => {
    void loadData(selectedMonth);
  }, [selectedMonth]);

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
    await loadData(selectedMonth);
    setTimeout(() => {
      setIsAddModalOpen(false);
      setSuccessMessage(null);
    }, 800);
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

      await loadData(selectedMonth);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete expense.');
    }
  };

  const currentMonth = month();
  const isCurrentMonth = selectedMonth === currentMonth;
  const householdTotal = summary?.householdTotal ?? 0;

  // Filtered and chronologically grouped expenses
  const filteredExpenses = selectedPayerFilter === 'all'
    ? expenses
    : expenses.filter((e) => String(e.payerId) === selectedPayerFilter);

  const groupedDates = Array.from(new Set(filteredExpenses.map((e) => e.expenseDate))).sort((a, b) => b.localeCompare(a));

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
                  const feedEl = document.getElementById('activity-feed');
                  if (feedEl) feedEl.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                All Expenses
              </button>
            </nav>
          </div>

          <div className="nav-actions">
            {/* Month Navigator */}
            <div className="month-selector" aria-label="Month navigation">
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
        {/* Step 3: Consolidated Spending Hero Card */}
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

        {/* Step 4: Individual User Summary Cards */}
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

        {/* Step 5: Chronological Activity Feed */}
        <section className="activity-section" id="activity-feed">
          <div className="feed-header-bar">
            <div className="feed-title-block">
              <h2>Recent Activity</h2>
              <p>Chronological expenditure log for {monthToLabel(selectedMonth)}</p>
            </div>

            {/* Filter Tabs */}
            <div className="feed-filter-tabs">
              <button
                type="button"
                className={`filter-tab-btn ${selectedPayerFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedPayerFilter('all')}
              >
                All
              </button>
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`filter-tab-btn ${selectedPayerFilter === String(u.id) ? 'active' : ''}`}
                  onClick={() => setSelectedPayerFilter(String(u.id))}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          {deleteError && (
            <div className="form-message-banner error" style={{ marginBottom: '16px' }}>
              <span className="material-symbols-outlined">error</span>
              <span>{deleteError}</span>
            </div>
          )}

          {filteredExpenses.length === 0 ? (
            <div className="feed-empty-state">
              <span className="material-symbols-outlined">receipt</span>
              <strong>No expenses recorded</strong>
              <span>No transactions found for {monthToLabel(selectedMonth)} with the selected filter.</span>
            </div>
          ) : (
            <div className="date-groups-container">
              {groupedDates.map((dateISO) => {
                const groupItems = filteredExpenses.filter((e) => e.expenseDate === dateISO);
                return (
                  <div key={dateISO} className="date-group">
                    <div className="date-group-header">{getDateGroupLabel(dateISO)}</div>
                    <ul className="feed-items-list">
                      {groupItems.map((expense) => {
                        const userObj = users.find((u) => u.id === expense.payerId);
                        const accent = userObj?.payerAccent ?? '#0f1e18';
                        const catObj = categories.find((c) => c.id === expense.categoryId);
                        const catIcon = catObj ? getCategoryIcon(catObj.iconIdentifier) : 'category';

                        return (
                          <li key={expense.id} className="feed-item">
                            <div className="feed-item-left">
                              <div className="feed-cat-icon">
                                <span className="material-symbols-outlined">{catIcon}</span>
                              </div>
                              <div className="feed-item-details">
                                <div className="feed-item-title">
                                  {expense.description || expense.categoryName}
                                </div>
                                <div className="feed-item-subtitle">
                                  <span>{expense.categoryName}</span>
                                  <span>•</span>
                                  <span
                                    className="feed-payer-badge"
                                    style={{ background: accent }}
                                  >
                                    {expense.payerName}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="feed-item-right">
                              <div className="feed-amount">{formatUsd(expense.amount)}</div>
                              <button
                                type="button"
                                className="feed-delete-btn"
                                onClick={() => void handleDelete(expense.id)}
                                title="Delete expense"
                                aria-label="Delete expense"
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Step 6: Dedicated Add Expense Modal */}
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
