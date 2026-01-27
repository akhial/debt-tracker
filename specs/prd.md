# Product Requirements Document (PRD): Multi-Currency Debt Tracker

## 1. Product Overview

A personal finance tool designed to track debts and credits across multiple currencies. The core philosophy is "manual control" over "automated complexity"—users set their own exchange rates to maintain a stable view of their finances. The app supports multiple users, but each user maintains their own private ledger of people and debts.

### Core Value Proposition

- **Clarity in Volatility**: By using manual fixed rates, users avoid the noise of daily fluctuating FX markets when tracking long-term personal debts.
- **Shadow-Text Context**: Instantly see the value of a foreign debt in your primary currency without doing mental math.
- **Simplicity**: A general ledger approach means you just track "who owes what", without needing to link repayments to specific line items.

## 2. Technical Stack

- **Frontend**: React, generic web app (Vite or Next.js recommended for full app structure).
- **UI Framework**: ShadCN UI + TailwindCSS (Premium, dark-mode first aesthetic).
- **State/Data Management**: TanStack Query (React Query) + TanStack Table.
- **Backend / DB**: Supabase (PostgreSQL).
- **Auth**: Supabase Auth (Native integration for RLS).

## 3. Functional Requirements

### 3.1 Authentication & User Profile

- **Sign Up / Login**: Email/Password or Social login via Supabase.
- **Profile Settings**:
  - **Primary Currency**: The user selects one currency (e.g., USD, EUR) to be the "Anchor" for all shadow-text calculations.

### 3.2 Exchange Rate Management

- **Dashboard**: A specific view to manage custom rates.
- **Logic**:
  - Rates are relative to the Primary Currency.
  - Example: If Primary is USD, user sets: `EUR = 1.10`, `JPY = 0.007`.
  - Users can update these at any time. Updates reflect typically on _display_ logic (shadow text), but do not change the recorded historical face-value of debts.

### 3.3 Person Management (Private Aliases)

- **Create Person**: User defines a name (e.g., "Alice", "Landlord").
- **Scope**: These are strictly local to the user. "Alice" in my account is not linked to "Alice" in another user's account.

### 3.4 Debt & Repayment Tracking (The Ledger)

- **Add Transaction**:
  - **Type**: Debt (They owe me) vs Credit (I owe them) / Repayment.
  - **Counterparty**: Select a "Person".
  - **Amount**: Numerical value.
  - **Currency**: Select from list of active currencies.
  - **Date**: Date of transaction.
  - **Description**: Text field.
- **Balances**:
  - Calculated as `Sum(Debts) - Sum(Repayments)`.
  - Balances are calculated _per currency_ first.
  - Global "Net Worth" or "Total Outstanding" is calculated by converting all currency balances to Primary Currency using current manual rates.

## 4. UI/UX Guidelines

### 4.1 Aesthetic

- **Style**: "Premium Modern". Clean lines, glassmorphism hints, high contrast.
- **Typography**: Inter or similar clean sans-serif.

### 4.2 The "Shadow Test" Component

- **Concept**: Every time a foreign currency amount is displayed, its approximate primary currency value is shown faintly behind or below it.
- **Visual**:
  - Main Text: `¥ 10,000` (Bold, white/high-contrast)
  - Shadow Text: `~ $70.00` (Smaller, 50% opacity, slightly muted color).

## 5. Data Model (Supabase Schema Draft)

### `profiles`

- `id` (uuid, PK, refs auth.users)
- `primary_currency` (string, e.g., 'USD', default 'USD')
- `created_at`

### `exchange_rates`

- `id` (uuid, PK)
- `user_id` (uuid, refs profiles.id)
- `currency_code` (string, e.g., 'EUR')
- `rate_to_primary` (decimal, user defined multiplier)
- `updated_at` (timestamp)
- _Constraint: Unique per user+currency_

### `people`

- `id` (uuid, PK)
- `user_id` (uuid, refs profiles.id)
- `name` (string)
- `created_at`

### `transactions`

- `id` (uuid, PK)
- `user_id` (uuid, refs profiles.id)
- `person_id` (uuid, refs people.id)
- `type` (enum: 'DEBT', 'REPAYMENT') — _Or just use signed amounts_
- `amount` (decimal)
- `currency_code` (string)
- `description` (text)
- `incurred_date` (date)
- `created_at` (timestamp)
