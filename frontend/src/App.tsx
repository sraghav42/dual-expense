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
const createDefaultFormState = (payerId?: number, categoryId?: number) => ({
  amount: '0',
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
        : (nextUsers[0] ? String(nextUsers[0].id) : ''),
      categoryId: nextCategories.some((category) => String(category.id) === current.categoryId)
        ? current.categoryId
        : (nextCategories[0] ? String(nextCategories[0].id) : ''),
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
      amount: form.amount,
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
      amount: '0',
      description: '',
      expenseDate: todayISO(),
    });
    setSuccessMessage('Expense saved.');
    await loadData(selectedMonth);
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

  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Household spend</p>
          <h1>{formatUsd(householdTotal)}</h1>
        </div>
        <div className="month-navigation" aria-label="Month navigation">
          <button type="button" className="nav-button" onClick={() => setSelectedMonth((current) => addMonth(current, -1))} aria-label="Previous month">
            ←
          </button>
          <div className="month-chip">{monthToLabel(selectedMonth)}</div>
          <button
            type="button"
            className="nav-button"
            onClick={() => setSelectedMonth((current) => addMonth(current, 1))}
            disabled={isCurrentMonth}
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </header>

      <section className="summary-grid">
        {summary?.userTotals.map((entry) => {
          const userAccent = users.find((user) => user.id === entry.userId)?.payerAccent ?? '#0f1e18';
          const topCategory = summary.topCategories.find((item) => item.userId === entry.userId);
          const share = householdTotal > 0 ? (entry.total / householdTotal) * 100 : 0;

          return (
            <article key={entry.userId} className="summary-card user-card" style={{ borderColor: userAccent }}>
              <div className="user-card-header">
                <span className="label" style={{ color: userAccent }}>{entry.userName}</span>
                {topCategory ? (
                  <span className="category-pill" style={{ background: `${userAccent}1F`, color: userAccent }}>
                    {topCategory.categoryName}
                  </span>
                ) : (
                  <span className="category-pill muted">No spending</span>
                )}
              </div>
              <strong>{formatUsd(entry.total)}</strong>
              <small>
                {topCategory ? `${share.toFixed(0)}% of household spend` : 'No expenses recorded'}
              </small>
            </article>
          );
        })}
      </section>

      <div className="layout-grid">
        <section className="panel">
          <h2>Add expense</h2>
          {submitError && <p className="form-message error">{submitError}</p>}
          {successMessage && <p className="form-message success">{successMessage}</p>}
          <form className="expense-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>USD amount</span>
              <div className="amount-row">
                <span className="currency">$</span>
                <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
              </div>
            </label>

            <div className="field">
              <span>Payer</span>
              <div className="payer-toggle" role="tablist" aria-label="Select payer">
                {users.map((user) => {
                  const isSelected = form.payerId === String(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      className={isSelected ? 'is-active' : ''}
                      style={{
                        background: isSelected ? user.payerAccent : '#f3f4f3',
                        color: isSelected ? '#ffffff' : '#1a1c1c',
                        borderColor: isSelected ? user.payerAccent : '#c3c8c3',
                      }}
                      onClick={() => setForm({ ...form, payerId: String(user.id) })}
                    >
                      {user.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="field">
              <span>Category</span>
              <div className="category-grid">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={form.categoryId === String(category.id) ? 'category-button active' : 'category-button'}
                    onClick={() => setForm({ ...form, categoryId: String(category.id) })}
                  >
                    <span>{category.iconIdentifier}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span>Date</span>
              <div className="date-actions">
                <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
                <button type="button" className="inline-button" onClick={() => setForm({ ...form, expenseDate: todayISO() })}>Today</button>
                <button type="button" className="inline-button" onClick={() => setForm({ ...form, expenseDate: dateOffsetISO(-1) })}>Yesterday</button>
              </div>
            </div>

            <label className="field">
              <span>Description</span>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={255} placeholder="Optional note" />
            </label>

            <button type="submit" className="primary-button">Save Expense</button>
          </form>
        </section>

        <section className="panel">
          <h2>Expense feed</h2>
          {deleteError && <p className="form-message error">{deleteError}</p>}
          {expenses.length === 0 ? (
            <div className="empty-state">No expenses for {monthToLabel(selectedMonth)}.</div>
          ) : (
            <ul className="expense-list">
              {expenses.map((expense) => (
                <li key={expense.id} className="expense-item">
                  <div className="expense-info">
                    <div className="expense-title-row">
                      <strong>{expense.categoryName}</strong>
                      <span className="expense-amount">{formatUsd(expense.amount)}</span>
                    </div>
                    <p>{expense.description || 'No description'}</p>
                    <div className="expense-meta">
                      <span>{expense.expenseDate}</span>
                      <span className="payer-badge" style={{ background: users.find((user) => user.id === expense.payerId)?.payerAccent ?? '#0f1e18', color: '#ffffff' }}>
                        {expense.payerName}
                      </span>
                    </div>
                  </div>
                  <button type="button" className="expense-delete" onClick={() => void handleDelete(expense.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
