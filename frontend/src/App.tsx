import { FormEvent, useEffect, useMemo, useState } from 'react';

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
  const [form, setForm] = useState(() => createDefaultFormState());

  const selectedMonth = useMemo(() => month(), []);

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

  const loadData = async () => {
    const [summaryRes, expenseRes, usersRes, categoriesRes] = await Promise.all([
      fetch(`/api/v1/dashboard/summary?month=${selectedMonth}`),
      fetch(`/api/v1/expenses?month=${selectedMonth}`),
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
    void loadData();
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
    await loadData();
  };

  const handleDelete = async (expenseId: number) => {
    await fetch(`/api/v1/expenses/${expenseId}`, { method: 'DELETE' });
    await loadData();
  };

  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Household spend</p>
          <h1>{summary ? `$${summary.householdTotal.toFixed(2)}` : '$0.00'}</h1>
        </div>
        <div className="month-chip">{selectedMonth}</div>
      </header>

      <section className="summary-grid">
        {summary?.userTotals.map((entry) => (
          <article key={entry.userId} className="summary-card">
            <span className="label">{entry.userName}</span>
            <strong>${entry.total.toFixed(2)}</strong>
            <small>{summary.topCategories.find((x) => x.userId === entry.userId)?.categoryName ?? '—'}</small>
          </article>
        ))}
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
          <h2>Expenses</h2>
          <ul className="expense-list">
            {expenses.map((expense) => (
              <li key={expense.id} className="expense-item">
                <div>
                  <strong>{expense.categoryName}</strong>
                  <p>{expense.description || 'No description'}</p>
                </div>
                <div className="expense-meta">
                  <span>{expense.expenseDate}</span>
                  <span>{expense.payerName}</span>
                  <strong>${expense.amount.toFixed(2)}</strong>
                  <button type="button" onClick={() => void handleDelete(expense.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
