// Delete confirmation modal: displays expense details and requires explicit
// confirmation before deletion.

import { Expense, formatUsd, getDateGroupLabel } from './utils';

type Props = {
  expense: Expense;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmModal({ expense, onConfirm, onCancel }: Props) {
  const formattedDate = getDateGroupLabel(expense.expenseDate);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-card delete-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <div className="modal-header-row">
          <div>
            <div className="modal-eyebrow delete-eyebrow">
              <span className="dot destructive" />
              <span>Delete Expense</span>
            </div>
            <h2 id="delete-modal-title">Confirm Deletion</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            title="Close"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="delete-expense-preview">
          <div className="delete-expense-amount">{formatUsd(expense.amount)}</div>
          <div className="delete-expense-description">
            {expense.description || expense.categoryName}
          </div>
          <div className="delete-expense-meta">
            <span className="material-symbols-outlined">calendar_today</span>
            <span>{formattedDate}</span>
          </div>
          <div className="delete-expense-payer">
            <span className="material-symbols-outlined">person</span>
            <span className="payer-tag">{expense.payerName}</span>
          </div>
        </div>

        <div className="modal-actions-row">
          <button
            type="button"
            className="modal-cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal-delete-btn"
            onClick={onConfirm}
          >
            <span className="material-symbols-outlined">delete</span>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}