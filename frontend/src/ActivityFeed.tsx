// Chronological expense feed (the "All Expenses" tab): date-grouped list of
// transactions with payer filter tabs and delete actions.

import { Category, Expense, User, formatUsd, getCategoryIcon, getDateGroupLabel } from './utils';

type Props = {
  expenses: Expense[];
  users: User[];
  categories: Category[];
  monthLabel: string;
  selectedPayerFilter: 'all' | string;
  onPayerFilterChange: (value: 'all' | string) => void;
  deleteError: string | null;
  onDelete: (expenseId: number) => void;
};

export function ActivityFeed({
  expenses,
  users,
  categories,
  monthLabel,
  selectedPayerFilter,
  onPayerFilterChange,
  deleteError,
  onDelete,
}: Props) {
  const filteredExpenses =
    selectedPayerFilter === 'all'
      ? expenses
      : expenses.filter((e) => String(e.payerId) === selectedPayerFilter);

  const groupedDates = Array.from(new Set(filteredExpenses.map((e) => e.expenseDate))).sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <section className="activity-section" id="activity-feed">
      <div className="feed-header-bar">
        <div className="feed-title-block">
          <h2>Recent Activity</h2>
          <p>Chronological expenditure log for {monthLabel}</p>
        </div>

        {/* Filter Tabs */}
        <div className="feed-filter-tabs">
          <button
            type="button"
            className={`filter-tab-btn ${selectedPayerFilter === 'all' ? 'active' : ''}`}
            onClick={() => onPayerFilterChange('all')}
          >
            All
          </button>
          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              className={`filter-tab-btn ${selectedPayerFilter === String(u.id) ? 'active' : ''}`}
              onClick={() => onPayerFilterChange(String(u.id))}
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
          <span>No transactions found for {monthLabel} with the selected filter.</span>
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
                              <span className="feed-payer-badge" style={{ background: accent }}>
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
                            onClick={() => onDelete(expense.id)}
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
  );
}
