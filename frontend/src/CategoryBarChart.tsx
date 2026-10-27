// Dashboard chart: consolidated spending by category as vertical columns.
// One column per category (solid, household-total — no payer segregation),
// total on top, category icon + name below. Sorted by total descending.

import { useMemo } from 'react';
import { Category, Expense, formatUsd, getCategoryIcon } from './utils';

type Props = {
  expenses: Expense[];
  categories: Category[];
  monthLabel: string;
};

type CategorySlice = {
  categoryId: number;
  name: string;
  icon: string;
  total: number;
  count: number;
};

export function CategoryBarChart({ expenses, categories, monthLabel }: Props) {
  const slices = useMemo<CategorySlice[]>(() => {
    const totals = new Map<number, { total: number; count: number }>();
    for (const expense of expenses) {
      const entry = totals.get(expense.categoryId) ?? { total: 0, count: 0 };
      entry.total += expense.amount;
      entry.count += 1;
      totals.set(expense.categoryId, entry);
    }
    return categories
      .filter((category) => totals.has(category.id))
      .map((category) => ({
        categoryId: category.id,
        name: category.name,
        icon: getCategoryIcon(category.iconIdentifier),
        total: totals.get(category.id)!.total,
        count: totals.get(category.id)!.count,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses, categories]);

  const max = slices.length > 0 ? slices[0].total : 0;

  return (
    <section className="activity-section" aria-label="Spending by category">
      <div className="feed-header-bar">
        <div className="feed-title-block">
          <h2>Spending by Category</h2>
          <p>Consolidated totals for {monthLabel}</p>
        </div>
      </div>

      {slices.length === 0 ? (
        <div className="feed-empty-state">
          <span className="material-symbols-outlined">bar_chart</span>
          <strong>No expenses recorded</strong>
          <span>Nothing to chart for {monthLabel} yet.</span>
        </div>
      ) : (
        <div className="category-chart">
          {slices.map((slice) => {
            const heightPct = max > 0 ? Math.max((slice.total / max) * 100, 4) : 0;
            return (
              <div key={slice.categoryId} className="category-chart-column">
                <div className="category-chart-total">{formatUsd(slice.total)}</div>
                <div className="category-chart-track">
                  <div
                    className="category-chart-bar"
                    style={{ height: `${heightPct}%` }}
                    title={`${slice.name}: ${formatUsd(slice.total)} (${slice.count} expense${
                      slice.count === 1 ? '' : 's'
                    })`}
                  />
                </div>
                <div className="category-chart-xlabel">
                  <span className="material-symbols-outlined">{slice.icon}</span>
                  <span className="category-chart-xname">{slice.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
