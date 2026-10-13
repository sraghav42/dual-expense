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

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [form, setForm] = useState({
    amount: '0',
    payerId: '',
    categoryId: '',
    description: '',
    expenseDate: new Date().toISOString().slice(0, 10),
  });

  const selectedMonth = useMemo(() => month(), []);

  const loadData = async () => {
    const [summaryRes, expenseRes, usersRes, categoriesRes] = await Promise.all([
      fetch(`/api/v1/dashboard/summary?month=${selectedMonth}`),
      fetch(`/api/v1/expenses?month=${selectedMonth}`),
      fetch('/api/v1/users'),
      fetch('/api/v1/categories'),
    ]);

    if (summaryRes.ok) setSummary(await summaryRes.json());
    if (expenseRes.ok) setExpenses(await expenseRes.json());
    if (usersRes.ok) setUsers(await usersRes.json());
    if (categoriesRes.ok) setCategories(await categoriesRes.json());

    if (!form.payerId && users.length > 0) {
      setForm((current) => ({ ...current, payerId: String(users[0].id) }));
    }
    if (!form.categoryId && categories.length > 0) {
      setForm((current) => ({ ...current, categoryId: String(categories[0].id) }));
    }
  };

  useEffect(() => {
    void loadData();
  }, [selectedMonth]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      amount: form.amount,
      payerId: Number(form.payerId),
      categoryId: Number(form.categoryId),
      expenseDate: form.expenseDate,
      description: form.description,
    };

    const response = await fetch('/api/v1/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setForm((current) => ({ ...current, amount: '0', description: '' }));
      await loadData();
    }
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
          <form className="expense-form" onSubmit={handleSubmit}>
            <label>
              Amount
              <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </label>
            <label>
              Date
              <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
            </label>
            <label>
              Payer
              <select value={form.payerId} onChange={(e) => setForm({ ...form, payerId: e.target.value })}>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Description
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={255} />
            </label>
            <button type="submit">Save Expense</button>
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
