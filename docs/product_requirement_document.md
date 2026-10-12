# Product Requirement Document (PRD)

## 1. Executive Summary

**Project Name:** LedgerLite (2-Person Household Expense Logger)

**Objective:** A lightweight, minimal, and modern 2-person expense tracking web application. The application enables two pre-configured household users to log individual expenses, view their spending breakdowns side-by-side, and monitor their combined household total without the overhead or complexity of user logins, split-bill math, or debt tracking.

## 2. Target Audience & Core Principles

* **Users:** Exactly 2 household members sharing expense visibility (no multi-tenant access or login screens).

* **Core Philosophy:**

  * **Zero Auth Overhead:** No passwords, logins, or session tokens. The application loads directly into the shared household view.

  * **Simplicity First:** No split calculations, no balance owing, no settling up.

  * **Single Payer:** Every expense is paid in full by either User 1 or User 2.

  * **High Whitespace & Minimal Design:** Modern Nordic/Japanese minimalist aesthetic, avoiding corporate clutter.

## 3. Technology Stack Specification

| 

| **Architecture Layer** | **Technology Choice** | **Details / Constraints** | 
| **Language** | Java 25 | Leveraging modern Java features and virtual threads. | 
| **Framework** | Spring Boot 4.x | Spring Web, Spring Data JPA, Spring Validation (No Spring Security needed). | 
| **Frontend UI** | React / Next.js (TypeScript) + Tailwind CSS | Minimalist component library matching Stitch AI design specs (`Plus Jakarta Sans` / `Geist` font). | 
| **Database** | PostgreSQL | Relational DB storing users, categories, and expense records. | 
| **Build & Tooling** | Maven / Gradle + Docker | Containerized build environment for Java 25 runtime. | 

## 4. User System & Identity Model

* **Fixed 2-User Profiles:** The application runs on a single household context containing pre-seeded profiles:

  * **User 1** (e.g., Alex - Indigo Theme `#6366F1`)

  * **User 2** (e.g., Sam - Teal Theme `#14B8A6`)

* **No Authentication:** Access is completely open within the hosted instance network. Any user opening the URL can log expenses for either User 1 or User 2.

## 5. Functional Requirements & Feature Specifications

### Module 1: Dashboard / Home Page

#### 1.1 Consolidated Household Summary (Hero Section)

* **Combined Total:** Prominently display total monthly spending across both users (`User 1 Total + User 2 Total`).

* **Month Selector:** Simple selector to navigate between past, present, and future months (defaults to current month).

#### 1.2 Individual User Summaries

* **Side-by-Side Cards:** Equal-width dual layout displaying:

  * **User 1 Summary Card:** User avatar/name, accent color indicator, total spending this month, and top spending category.

  * **User 2 Summary Card:** User avatar/name, accent color indicator, total spending this month, and top spending category.

#### 1.3 Recent Transactions Feed

* **Chronological List:** Displays recent entries sorted by `expense_date` descending.

* **Line Item Attributes:**

  * Transaction Date

  * Description / Notes

  * Category Badge / Icon

  * Expense Amount

  * Payer Badge (indicating whether User 1 or User 2 paid)

* **Quick Actions:** Inline delete action per item.

### Module 2: Add Expense (Modal or Dedicated View)

#### 2.1 Expense Form Inputs

1. **Amount Input:**

   * Prominent, large numeric text field (e.g., `$ 0.00`).

   * Enforces two decimal places and positive floating-point values.

2. **Payer Selector ("Who Spent This?"):**

   * Single-selection 2-option toggle between `[ User 1 ]` or `[ User 2 ]`.

   * Exactly 1 payer selected per transaction (no splits or multi-payer options).

3. **Date Selector:**

   * Minimal date picker input default-set to **Today**.

   * Quick toggles for `Today`, `Yesterday`, or custom calendar selection.

4. **Category Selector:**

   * Visual grid/pills of pre-defined categories (Groceries, Housing/Rent, Utilities, Dining, Transport, Entertainment, Subscriptions, Other).

5. **Details / Notes:**

   * Single-line text input field for short descriptions (e.g., *"Weekly grocery run"*).

6. **Form Action:**

   * Full-width clean primary submit button ("Save Expense").

## 6. Technical Architecture & Data Schema

### 6.1 Database Schema (SQL)

```
-- Seeded Users Table (Strictly 2 rows)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255),
    accent_color VARCHAR(7) NOT NULL -- '#6366F1' or '#14B8A6'
);

-- Expense Categories Table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon_name VARCHAR(50) NOT NULL
);

-- Expenses Table
CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL,
    description VARCHAR(255),
    payer_id BIGINT NOT NULL REFERENCES users(id),
    category_id BIGINT NOT NULL REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Users
INSERT INTO users (name, accent_color) VALUES ('User 1', '#6366F1'), ('User 2', '#14B8A6');

```

### 6.2 REST API Specification

| **HTTP Method** | **Endpoint** | **Description** | **Query / Request Payload** | 
| **GET** | `/api/v1/dashboard/summary` | Fetch household, User 1, and User 2 total metrics | `?month=YYYY-MM` | 
| **GET** | `/api/v1/expenses` | Retrieve chronological expense feed | `?month=YYYY-MM` | 
| **POST** | `/api/v1/expenses` | Create a new expense entry | `{ amount, expenseDate, payerId, categoryId, description }` | 
| **DELETE** | `/api/v1/expenses/{id}` | Delete an expense entry | N/A | 
| **GET** | `/api/v1/categories` | List active expense categories | N/A | 
| **GET** | `/api/v1/users` | Fetch the 2 household user profiles | N/A | 

## 7. Design System & UI Specifications

* **Design Aesthetic:** Minimalist Nordic/Japanese software design.

* **Color Palette:**

  * Canvas Background: `#F9F9FB`

  * Card Container: `#FFFFFF`

  * Text Color: `#111827` (Dark Charcoal)

  * User 1 Accent: `#6366F1` (Soft Indigo)

  * User 2 Accent: `#14B8A6` (Muted Teal)

* **Borders & Radius:** Ultra-light 1px borders (`#E5E7EB`), no heavy drop shadows, smooth 10px rounded corners (`rounded-lg`).

## 8. Non-Functional Requirements

1. **Response Time:** Sub-50ms API response times for spending metrics and transaction updates.

2. **Data Validation:** Enforce positive decimal checks on amounts and strict foreign-key verification for `payer_id` and `category_id`.

3. **Simplicity:** Clean, dependency-light code structure across both Spring Boot 4 and the React frontend.