const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Example endpoint to check status
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password, portal } = req.body;
  
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email).single();
  
  if (error || !data) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // If logging in through Admin portal, enforce admin role
  if (portal === 'admin' && data.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied: This account does not have Administrator privileges. Please use the Customer Banking Portal.' 
    });
  }

  // If logging in through Customer portal, let customers in
  if (portal === 'customer' && data.role === 'admin') {
    // Admin can also log in to customer portal if desired, but we can return their admin role
  }
  
  res.json({ success: true, user: data });
});

// Signup
app.post('/api/signup', async (req, res) => {
  const { fullName, email, password, phone, role = 'customer' } = req.body;
  
  // 1. Insert into profiles
  const { data: profile, error: pError } = await supabase.from('profiles').insert([
    { full_name: fullName, email, phone, role: role }
  ]).select().single();
  
  if (pError) {
    return res.status(400).json({ error: 'Email already exists or invalid data' });
  }

  // 2. Insert into customers if customer role
  if (role === 'customer') {
    const { data: customer, error: cError } = await supabase.from('customers').insert([
      { user_id: profile.id, full_name: fullName, email, phone, kyc_status: 'pending' }
    ]).select().single();

    if (cError) {
      return res.status(400).json({ error: 'Failed to create customer profile' });
    }
  }

  res.json({ success: true, user: profile });
});

// Accounts
app.get('/api/accounts', async (req, res) => {
  const { data, error } = await supabase.from('accounts').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Transactions
app.get('/api/transactions', async (req, res) => {
  const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Transfer
app.post('/api/transfer', async (req, res) => {
  const { fromAccountId, toAccountId, amount, description } = req.body;
  let targetId = toAccountId;

  if (toAccountId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(toAccountId)) {
    const { data: foundAcc } = await supabase.from('accounts').select('account_id').eq('account_number', toAccountId.trim()).single();
    if (foundAcc) {
      targetId = foundAcc.account_id;
    } else {
      return res.status(404).json({ error: 'Destination account number not found' });
    }
  }

  const { data, error } = await supabase.rpc('transfer_money', {
    p_from_account_id: fromAccountId,
    p_to_account_id: targetId,
    p_amount: amount,
    p_description: description || 'Inter-Account Transfer'
  });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

// Deposit
app.post('/api/deposit', async (req, res) => {
  const { accountId, amount, description } = req.body;
  const { data, error } = await supabase.rpc('deposit_money', {
    p_account_id: accountId,
    p_amount: amount,
    p_description: description
  });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, new_balance: data });
});

// Withdraw
app.post('/api/withdraw', async (req, res) => {
  const { accountId, amount, description } = req.body;
  const { data, error } = await supabase.rpc('withdraw_money', {
    p_account_id: accountId,
    p_amount: amount,
    p_description: description
  });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, new_balance: data });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
