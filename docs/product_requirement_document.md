# Dual Expense - Product Requirement Document

## 1. Executive Summary

Dual Expense is a lightweight expense logger for a two-person household. It records who paid each expense, shows each person's monthly spending alongside the household total, and avoids split-bill calculations, balances owed, and settlement workflows.

## 2. Target Audience and Core Principles

- **Users:** Exactly two household members sharing one private application instance.
- **Private access:** The first release has no application sign-in. The deployment must be reachable only through the household's private network. Production hosting is not selected yet.
- **Single payer:** Each expense is paid in full by exactly one of the two fixed users.
- **Simplicity:** No split calculations, balance owing, or debt settlement.
- **Currency:** USD only for the first release.

## 3. Technology and Development Setup

| Layer | Technology | Constraints |
|---|---|---|
| Language | Java 25 | Backend |
| Backend | Spring Boot 4.x | Spring Web, Spring Data JPA, Spring Validation; no Spring Security for the private-network-only first release |
| Frontend | React with TypeScript | Single-page application; no server-side rendering requirement |
| Styling | Tailwind CSS | Follow `docs/DESIGN.md` |
| Database | PostgreSQL | Store users, categories, and expenses |
| Backend build | Maven | Use a Maven wrapper for reproducible builds |
| Local database | Docker Compose | Run PostgreSQL in a persistent volume; run application processes natively |
| Production deployment | Undecided | Choose hosting and backup operations in a later deployment-planning step |

## 4. Household Users and Categories

- Seed exactly two fixed profiles named **User 1** and **User 2**.
- User 1 uses the indigo payer accent `#6366F1`; User 2 uses the teal payer accent `#14B8A6`.
- The application has no user-name configuration or login flow in v1.
- Seed the fixed categories in this display order: Groceries, Housing/Rent, Utilities, Dining, Transport, Entertainment, Health/Beauty, Clothing, and Other (Other always displays last).
- V1 has no UI for adding or editing categories.

## 5. Functional Requirements

### 5.1 Dashboard

- Default to the current calendar month.
- Allow navigation to the current month and past months; future months are not selectable.
- Show the household total and individual totals for the selected month.
- Show each user's top spending category for the selected month.
- Show a chronological expense feed for the selected month, ordered by expense date descending.
- Each feed row shows date, optional description, category, amount in USD, and payer.
- Follow the consolidated and individual spending presentation in `docs/DESIGN.md`.

### 5.2 Add an Expense

The form provides:

- A required positive amount with at most two decimal places, stored as an exact decimal value.
- A required payer selection containing exactly one of User 1 or User 2.
- A required expense date defaulting to today; today or earlier is allowed, not future dates. Provide Today and Yesterday shortcuts.
- A required category selected from the seeded categories.
- An optional description of up to 255 characters.
- A Save Expense action.

### 5.3 Delete an Expense

- A user can delete an expense from the feed after confirming the action.
- V1 does not support editing an existing expense.
- Deletion removes the expense from subsequent feed and summary results.

## 6. Data and API

### 6.1 Data Model

The relational model consists of:

- `users`: seeded household profiles with a name and payer accent color.
- `categories`: seeded category names, icon identifiers, and display order.
- `expenses`: positive `DECIMAL(10, 2)` amount, `DATE` expense date, optional description, required payer and category foreign keys, and creation timestamp.

Seed the two fixed users and nine fixed categories through versioned database migrations. The database must enforce positive amounts and valid payer/category references.

### 6.2 REST API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/dashboard/summary?month=YYYY-MM` | Household and per-user totals and top categories for a month |
| `GET` | `/api/v1/expenses?month=YYYY-MM` | Expenses for a month, ordered by expense date descending |
| `POST` | `/api/v1/expenses` | Create an expense |
| `DELETE` | `/api/v1/expenses/{id}` | Delete an expense |
| `GET` | `/api/v1/categories` | Return the seeded categories |
| `GET` | `/api/v1/users` | Return the two seeded users |

The server validates request data as well as database constraints. Invalid payer or category identifiers, non-positive amounts, amounts with more than two decimal places, future expense dates, and descriptions exceeding 255 characters must be rejected with an explicit client error.

## 7. Design System

`docs/DESIGN.md` is the source of truth for the UI palette, typography, spacing, shapes, and component styling. This PRD defines product behavior and must not duplicate or override design tokens.

## 8. Out of Scope for V1

- Application authentication and multi-household tenancy.
- Expense editing, split payments, balances, and settlement.
- Future-dated expenses and recurring or planned expenses.
- Custom categories.
- CSV export.
- Production hosting selection and automated production backups.
- A hard sub-50ms API latency service-level objective.

## 9. Acceptance Criteria

- The local development environment can start PostgreSQL with Docker Compose and run the backend and frontend against it.
- A new database is populated with exactly the two fixed users and nine categories.
- A valid expense appears in the selected month's feed and updates household and payer totals.
- Invalid amounts, future dates, and invalid payer/category references are rejected.
- The dashboard supports current and past months and does not allow future-month selection.
- A confirmed deletion removes the expense from the feed and recalculates the affected totals.
- The UI is responsive and follows `docs/DESIGN.md`.
- Tests cover the business rules and the API's create, list, summary, and delete behavior.
- Correctness and responsive user experience take priority over a hard latency target for the small household dataset.
