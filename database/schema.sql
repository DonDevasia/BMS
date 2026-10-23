-- Run this in your Supabase SQL Editor

-- Create enum for roles
CREATE TYPE user_role AS ENUM ('admin', 'customer', 'employee');

-- Profiles table (linked to auth.users if using Supabase Auth, otherwise standalone for now)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role user_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  gender TEXT,
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_name TEXT NOT NULL,
  ifsc_code TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  manager_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(customer_id),
  branch_id UUID REFERENCES branches(branch_id),
  account_number TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL,
  balance NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  opened_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(account_id),
  transaction_type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'transfer', etc.
  amount NUMERIC(15,2) NOT NULL,
  previous_balance NUMERIC(15,2),
  new_balance NUMERIC(15,2),
  description TEXT,
  reference_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transfers table
CREATE TABLE IF NOT EXISTS transfers (
  transfer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_account_id UUID REFERENCES accounts(account_id),
  to_account_id UUID REFERENCES accounts(account_id),
  amount NUMERIC(15,2) NOT NULL,
  reference_id TEXT UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(customer_id),
  account_id UUID REFERENCES accounts(account_id),
  loan_type TEXT,
  principal_amount NUMERIC(15,2),
  interest_rate NUMERIC(5,2),
  tenure_months INTEGER,
  emi NUMERIC(15,2),
  outstanding_amount NUMERIC(15,2),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Loan Payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(loan_id),
  amount NUMERIC(15,2),
  payment_date TIMESTAMPTZ DEFAULT now(),
  transaction_id UUID REFERENCES transactions(transaction_id),
  status TEXT DEFAULT 'completed'
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  employee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  branch_id UUID REFERENCES branches(branch_id),
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  position TEXT,
  salary NUMERIC(15,2),
  joining_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_reference_id ON transfers(reference_id);
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);

-- Stored Procedures / Functions for transactions
CREATE OR REPLACE FUNCTION deposit_money(p_account_id UUID, p_amount NUMERIC, p_description TEXT)
RETURNS NUMERIC AS $$
DECLARE
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    -- Lock the account row
    SELECT balance INTO v_current_balance 
    FROM accounts 
    WHERE account_id = p_account_id AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Account not found or inactive';
    END IF;

    v_new_balance := v_current_balance + p_amount;

    -- Update balance
    UPDATE accounts 
    SET balance = v_new_balance 
    WHERE account_id = p_account_id;

    -- Insert transaction
    INSERT INTO transactions (account_id, transaction_type, amount, previous_balance, new_balance, description)
    VALUES (p_account_id, 'deposit', p_amount, v_current_balance, v_new_balance, p_description);

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION withdraw_money(p_account_id UUID, p_amount NUMERIC, p_description TEXT)
RETURNS NUMERIC AS $$
DECLARE
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    -- Lock the account row
    SELECT balance INTO v_current_balance 
    FROM accounts 
    WHERE account_id = p_account_id AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Account not found or inactive';
    END IF;

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    v_new_balance := v_current_balance - p_amount;

    -- Update balance
    UPDATE accounts 
    SET balance = v_new_balance 
    WHERE account_id = p_account_id;

    -- Insert transaction
    INSERT INTO transactions (account_id, transaction_type, amount, previous_balance, new_balance, description)
    VALUES (p_account_id, 'withdrawal', p_amount, v_current_balance, v_new_balance, p_description);

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION transfer_money(p_from_account_id UUID, p_to_account_id UUID, p_amount NUMERIC, p_description TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_from_balance NUMERIC;
    v_to_balance NUMERIC;
    v_new_from_balance NUMERIC;
    v_new_to_balance NUMERIC;
    v_reference_id TEXT;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    IF p_from_account_id = p_to_account_id THEN
        RAISE EXCEPTION 'Cannot transfer to the same account';
    END IF;

    -- Lock both accounts in a consistent order to prevent deadlocks
    IF p_from_account_id < p_to_account_id THEN
        SELECT balance INTO v_from_balance FROM accounts WHERE account_id = p_from_account_id AND status = 'active' FOR UPDATE;
        SELECT balance INTO v_to_balance FROM accounts WHERE account_id = p_to_account_id AND status = 'active' FOR UPDATE;
    ELSE
        SELECT balance INTO v_to_balance FROM accounts WHERE account_id = p_to_account_id AND status = 'active' FOR UPDATE;
        SELECT balance INTO v_from_balance FROM accounts WHERE account_id = p_from_account_id AND status = 'active' FOR UPDATE;
    END IF;

    IF v_from_balance IS NULL THEN
        RAISE EXCEPTION 'Source account not found or inactive';
    END IF;
    
    IF v_to_balance IS NULL THEN
        RAISE EXCEPTION 'Destination account not found or inactive';
    END IF;

    IF v_from_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    v_new_from_balance := v_from_balance - p_amount;
    v_new_to_balance := v_to_balance + p_amount;

    -- Update balances
    UPDATE accounts SET balance = v_new_from_balance WHERE account_id = p_from_account_id;
    UPDATE accounts SET balance = v_new_to_balance WHERE account_id = p_to_account_id;

    v_reference_id := 'TRF-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || floor(random() * 10000)::text;

    -- Insert transfer record
    INSERT INTO transfers (from_account_id, to_account_id, amount, reference_id, description)
    VALUES (p_from_account_id, p_to_account_id, p_amount, v_reference_id, p_description);

    -- Insert transaction records
    INSERT INTO transactions (account_id, transaction_type, amount, previous_balance, new_balance, description, reference_id)
    VALUES (p_from_account_id, 'transfer', p_amount, v_from_balance, v_new_from_balance, p_description, v_reference_id);
    
    INSERT INTO transactions (account_id, transaction_type, amount, previous_balance, new_balance, description, reference_id)
    VALUES (p_to_account_id, 'deposit', p_amount, v_to_balance, v_new_to_balance, 'Transfer from ' || p_from_account_id, v_reference_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
