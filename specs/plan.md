# Debt Tracker Implementation Plan

> **Goal**: Build a multi-currency debt tracking web application with file attachments, using Supabase for backend services (Database, Auth, Storage).

---

## Phase 1: Supabase Project Setup

### 1.1 Create Supabase Project

- [ ] Create new project in [Supabase Dashboard](https://app.supabase.com)
- [ ] Note project URL and anon key for environment configuration
- [ ] Wait for project to be fully provisioned

### 1.2 Install Supabase Client

- [ ] Install `@supabase/supabase-js` package
  ```bash
  bun add @supabase/supabase-js
  ```
- [ ] Create `src/lib/supabase.ts` client configuration

### 1.3 Environment Configuration

- [ ] Create `.env.local` with Supabase credentials:
  ```
  VITE_SUPABASE_URL=your_project_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```
- [ ] Add `.env.local` to `.gitignore` if not already present
- [ ] Create `.env.example` for documentation

---

## Phase 2: Database Schema & Migrations

### 2.1 Create Core Tables

#### `profiles` Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `exchange_rates` Table

```sql
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL,
  rate_to_primary DECIMAL(18, 8) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, currency_code)
);
```

#### `people` Table

```sql
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `transactions` Table

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('DEBT', 'REPAYMENT')),
  amount DECIMAL(18, 2) NOT NULL,
  currency_code TEXT NOT NULL,
  description TEXT,
  incurred_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `transaction_attachments` Table (File Attachments Feature)

```sql
CREATE TABLE transaction_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.2 Create Migration Files

- [ ] Create migration for profiles table with auto-creation trigger
- [ ] Create migration for exchange_rates table
- [ ] Create migration for people table
- [ ] Create migration for transactions table
- [ ] Create migration for transaction_attachments table

### 2.3 Database Functions & Triggers

#### Auto-create profile on signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, primary_currency)
  VALUES (NEW.id, 'USD');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_exchange_rates_updated_at
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Phase 3: Row Level Security (RLS)

### 3.1 Enable RLS on All Tables

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_attachments ENABLE ROW LEVEL SECURITY;
```

### 3.2 Create RLS Policies

#### Profiles Policies

```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Exchange Rates Policies

```sql
CREATE POLICY "Users can view own rates"
  ON exchange_rates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rates"
  ON exchange_rates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rates"
  ON exchange_rates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rates"
  ON exchange_rates FOR DELETE
  USING (auth.uid() = user_id);
```

#### People Policies

```sql
CREATE POLICY "Users can view own people"
  ON people FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own people"
  ON people FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own people"
  ON people FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own people"
  ON people FOR DELETE
  USING (auth.uid() = user_id);
```

#### Transactions Policies

```sql
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

#### Transaction Attachments Policies

```sql
CREATE POLICY "Users can view own attachments"
  ON transaction_attachments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attachments"
  ON transaction_attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attachments"
  ON transaction_attachments FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Phase 4: Supabase Storage Setup

### 4.1 Create Storage Bucket

- [ ] Create a **private** bucket named `attachments` for debt file attachments
- [ ] Configure allowed MIME types: `image/*`, `application/pdf`, `text/*`
- [ ] Set max file size (e.g., 10MB)

### 4.2 Storage RLS Policies

```sql
-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload own attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to view their own files
CREATE POLICY "Users can view own attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Phase 5: TypeScript Types Generation

### 5.1 Generate Database Types

- [ ] Install Supabase CLI (if not already installed)
  ```bash
  bun add -D supabase
  ```
- [ ] Generate TypeScript types from database schema
  ```bash
  bunx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
  ```

### 5.2 Create Domain Types

- [ ] Create `src/types/domain.ts` with application-specific types:
  - `Profile`
  - `ExchangeRate`
  - `Person`
  - `Transaction`
  - `TransactionAttachment`
  - `NewTransaction`
  - `BalanceByPerson`
  - `BalanceByCurrency`

---

## Phase 6: Authentication Implementation

### 6.1 Auth Context & Provider

- [ ] Create `src/contexts/AuthContext.tsx`
- [ ] Implement auth state management with `onAuthStateChange`
- [ ] Create `useAuth` hook for consuming auth state

### 6.2 Auth Pages

- [ ] Create `src/pages/auth/LoginPage.tsx`
  - Email/password login form
  - Social login buttons (Google, GitHub - configure in Supabase)
  - Link to signup
- [ ] Create `src/pages/auth/SignupPage.tsx`
  - Email/password signup form
  - Email confirmation flow
- [ ] Create `src/pages/auth/ResetPasswordPage.tsx`

### 6.3 Protected Routes

- [ ] Create `src/components/ProtectedRoute.tsx`
- [ ] Implement redirect to login for unauthenticated users
- [ ] Implement redirect to dashboard for authenticated users on auth pages

---

## Phase 7: Routing Setup

### 7.1 Install React Router

```bash
bun add react-router-dom
```

### 7.2 Define Routes

- [ ] Create `src/router.tsx` with route definitions:
  - `/` → Landing/Dashboard (protected)
  - `/login` → Login page
  - `/signup` → Signup page
  - `/reset-password` → Password reset
  - `/settings` → User settings (profile, primary currency)
  - `/rates` → Exchange rate management
  - `/people` → People management
  - `/transactions` → Transaction ledger
  - `/transactions/:id` → Transaction detail with attachments

---

## Phase 8: State Management with TanStack Query

### 8.1 Install TanStack Query

```bash
bun add @tanstack/react-query
```

### 8.2 Create Query Hooks

- [ ] Create `src/hooks/useProfile.ts` - fetch/update user profile
- [ ] Create `src/hooks/useExchangeRates.ts` - CRUD for exchange rates
- [ ] Create `src/hooks/usePeople.ts` - CRUD for people
- [ ] Create `src/hooks/useTransactions.ts` - CRUD for transactions
- [ ] Create `src/hooks/useAttachments.ts` - upload/delete file attachments
- [ ] Create `src/hooks/useBalances.ts` - calculate balances by person/currency

---

## Phase 9: Core UI Components

### 9.1 Layout Components

- [ ] Create `src/components/layout/AppLayout.tsx` - main app shell
- [ ] Create `src/components/layout/Sidebar.tsx` - navigation sidebar
- [ ] Create `src/components/layout/Header.tsx` - top header with user menu

### 9.2 Shared Components

- [ ] Create `src/components/ui/ShadowText.tsx` - currency with shadow conversion
- [ ] Create `src/components/ui/CurrencyInput.tsx` - formatted currency input
- [ ] Create `src/components/ui/CurrencySelect.tsx` - currency dropdown
- [ ] Create `src/components/ui/PersonSelect.tsx` - person dropdown
- [ ] Create `src/components/ui/FileUpload.tsx` - drag & drop file upload
- [ ] Create `src/components/ui/FilePreview.tsx` - attachment thumbnail/preview

---

## Phase 10: Feature Pages

### 10.1 Dashboard

- [ ] Create `src/pages/Dashboard.tsx`
  - Total outstanding by primary currency
  - Quick summary cards per person
  - Recent transactions list

### 10.2 Exchange Rates Page

- [ ] Create `src/pages/ExchangeRatesPage.tsx`
  - List of currency rates relative to primary
  - Inline editing of rates
  - Add new currency rate

### 10.3 People Page

- [ ] Create `src/pages/PeoplePage.tsx`
  - List of people with balance summary
  - Add/edit/delete people
  - Click to view person's transactions

### 10.4 Transactions Page

- [ ] Create `src/pages/TransactionsPage.tsx`
  - TanStack Table with all transactions
  - Filters: person, currency, type, date range
  - Sort by any column
  - Balance totals in footer

### 10.5 Transaction Detail/Form

- [ ] Create `src/pages/TransactionDetailPage.tsx`
  - View transaction details
  - Edit transaction
  - Manage attachments (upload, view, delete)
- [ ] Create `src/components/transactions/TransactionForm.tsx`
  - Type selector (Debt/Repayment)
  - Person selector
  - Amount input with currency
  - Date picker
  - Description field
  - File attachment dropzone

### 10.6 Settings Page

- [ ] Create `src/pages/SettingsPage.tsx`
  - Change primary currency
  - Change password
  - Sign out

---

## Phase 11: File Attachments Feature

### 11.1 Upload Service

- [ ] Create `src/services/attachmentService.ts`
  - `uploadAttachment(transactionId, file)` - upload to Supabase Storage
  - `deleteAttachment(attachmentId)` - delete from storage and database
  - `getAttachmentUrl(filePath)` - generate signed URL for download

### 11.2 Attachment UI

- [ ] Integrate `FileUpload` component in transaction form
- [ ] Show attachment list in transaction detail
- [ ] Implement inline preview for images
- [ ] Implement download link for other file types

---

## Phase 12: TanStack Table Integration

### 12.1 Install TanStack Table

```bash
bun add @tanstack/react-table
```

### 12.2 Transactions Table

- [ ] Create `src/components/transactions/TransactionsTable.tsx`
  - Columns: Date, Person, Type, Amount (with shadow text), Description, Attachments
  - Sorting on all columns
  - Client-side filtering
  - Pagination

### 12.3 People Table

- [ ] Create `src/components/people/PeopleTable.tsx`
  - Columns: Name, Balance by Currency, Total (primary)
  - Click row to expand transactions

---

## Phase 13: Real-time Updates (Optional Enhancement)

### 13.1 Enable Realtime

- [ ] Add tables to `supabase_realtime` publication
- [ ] Subscribe to changes in TanStack Query hooks
- [ ] Invalidate queries on real-time events

---

## Phase 14: Testing & Verification

### 14.1 Manual Testing Checklist

- [ ] Sign up new user → profile created automatically
- [ ] Set primary currency in settings
- [ ] Add exchange rates for multiple currencies
- [ ] Create people (contacts)
- [ ] Add debt transactions
- [ ] Add repayment transactions
- [ ] Verify balance calculations
- [ ] Upload file attachments to transactions
- [ ] View/download attachments
- [ ] Delete attachments
- [ ] Verify shadow text conversions
- [ ] Test responsive design

### 14.2 Security Verification

- [ ] Verify RLS policies prevent cross-user data access
- [ ] Verify storage policies restrict file access
- [ ] Test authenticated vs unauthenticated requests

---

## Phase 15: Deployment

### 15.1 Production Configuration

- [ ] Set up production Supabase project (if using separate staging/prod)
- [ ] Configure environment variables in deployment platform
- [ ] Enable SSL enforcement in Supabase

### 15.2 Build & Deploy

- [ ] Run production build: `bun run build`
- [ ] Deploy to hosting platform (Vercel, Netlify, etc.)
- [ ] Configure custom domain (optional)

---

## Summary: Development Order

1. **Phase 1**: Supabase project creation + client installation
2. **Phase 2-4**: Database schema, RLS, and Storage setup (via Supabase Dashboard or migrations)
3. **Phase 5**: Generate TypeScript types
4. **Phase 6-7**: Authentication and routing
5. **Phase 8**: TanStack Query hooks
6. **Phase 9**: Core UI components (esp. ShadowText)
7. **Phase 10**: Feature pages
8. **Phase 11**: File attachments feature
9. **Phase 12**: TanStack Table for transactions
10. **Phase 13**: Real-time updates (optional)
11. **Phase 14-15**: Testing and deployment

---

## Tech Stack Summary

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Framework        | React 19 + Vite           |
| Styling          | TailwindCSS 4 + ShadCN UI |
| State Management | TanStack Query            |
| Tables           | TanStack Table            |
| Backend          | Supabase (PostgreSQL)     |
| Auth             | Supabase Auth             |
| Storage          | Supabase Storage          |
| Routing          | React Router              |
