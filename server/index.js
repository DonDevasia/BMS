const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { logAudit, getAuditLogs } = require('./auditLogger');
const { 
  addNotification, 
  getCustomerNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} = require('./notificationService');

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'nexusbank-secure-jwt-key-2026-production';

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ==========================================
// Authentication & Security Middleware
// ==========================================

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // Also support query param for download links (e.g. CSV/PDF downloads)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied: Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Always verify the role and user from database
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (pError || !profile) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }

    let customerId = decoded.customerId;
    if (profile.role === 'customer' && !customerId) {
      const { data: cust } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('user_id', profile.id)
        .single();
      if (cust) customerId = cust.customer_id;
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      customer_id: customerId
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied: Administrative privileges required to perform this action.' 
    });
  }
  next();
}

function requireCustomer(req, res, next) {
  if (req.user?.role !== 'customer' || !req.user?.customer_id) {
    return res.status(403).json({ 
      error: 'Access denied: Customer banking privileges required.' 
    });
  }
  next();
}

// ==========================================
// Public & Authentication Routes
// ==========================================

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'API is running', 
    timestamp: new Date().toISOString(),
    service: 'NexusBank Core Banking Gateway' 
  });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password, portal } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .single();
  
  if (error || !data) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // If logging in through Admin portal, strictly enforce admin role
  if (portal === 'admin' && data.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied: This account does not have Administrator privileges. Please use the Customer Banking Portal.' 
    });
  }

  let customer = null;
  if (data.role === 'customer') {
    const { data: cData } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', data.id)
      .single();
    customer = cData;
  }

  // Generate verified JWT token
  const token = jwt.sign(
    { 
      id: data.id, 
      email: data.email, 
      role: data.role,
      customerId: customer?.customer_id || null 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Log successful login
  await logAudit(supabase, {
    actorId: data.id,
    actorEmail: data.email,
    actorRole: data.role,
    action: 'LOGIN_SUCCESS',
    details: { portal, email: data.email },
    ipAddress: req.ip
  });

  res.json({ 
    success: true, 
    token,
    user: {
      ...data,
      customer_id: customer?.customer_id || null
    }
  });
});

// Signup
app.post('/api/signup', async (req, res) => {
  const { fullName, email, password, phone, role = 'customer' } = req.body;
  
  if (!fullName || !email) {
    return res.status(400).json({ error: 'Full name and email are required.' });
  }

  // Enforce customer role on public signup
  const targetRole = 'customer';

  // 1. Insert into profiles
  const { data: profile, error: pError } = await supabase.from('profiles').insert([
    { full_name: fullName.trim(), email: email.trim().toLowerCase(), phone: phone?.trim(), role: targetRole }
  ]).select().single();
  
  if (pError) {
    return res.status(400).json({ error: 'Email already exists or invalid profile data.' });
  }

  // 2. Insert into customers
  const { data: customer, error: cError } = await supabase.from('customers').insert([
    { user_id: profile.id, full_name: fullName.trim(), email: email.trim().toLowerCase(), phone: phone?.trim(), kyc_status: 'pending' }
  ]).select().single();

  if (cError) {
    return res.status(400).json({ error: 'Failed to create customer record.' });
  }

  // 3. Create default savings account for customer
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const accNumber = `100020003000${randomSuffix}`;
  
  // Pick first available branch
  const { data: branches } = await supabase.from('branches').select('branch_id').limit(1);
  const branchId = branches && branches[0] ? branches[0].branch_id : null;

  const { data: account } = await supabase.from('accounts').insert([
    {
      customer_id: customer.customer_id,
      branch_id: branchId,
      account_number: accNumber,
      account_type: 'savings',
      balance: 1000,
      status: 'active'
    }
  ]).select().single();

  if (account) {
    // Record opening deposit transaction
    await supabase.from('transactions').insert([
      {
        account_id: account.account_id,
        transaction_type: 'deposit',
        amount: 1000,
        previous_balance: 0,
        new_balance: 1000,
        description: 'Account Opening Welcome Credit'
      }
    ]);
  }

  const token = jwt.sign(
    { 
      id: profile.id, 
      email: profile.email, 
      role: profile.role,
      customerId: customer.customer_id 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  await logAudit(supabase, {
    actorId: profile.id,
    actorEmail: profile.email,
    actorRole: profile.role,
    action: 'CUSTOMER_SIGNUP',
    details: { email: profile.email, account_number: accNumber },
    ipAddress: req.ip
  });

  await addNotification(supabase, {
    customerId: customer.customer_id,
    title: 'Welcome to NexusBank!',
    message: `Your savings account ${accNumber} has been created with a ₹1,000 welcome credit.`,
    type: 'success'
  });

  res.json({ 
    success: true, 
    token,
    user: {
      ...profile,
      customer_id: customer.customer_id
    }
  });
});

// Current User Profile Verification
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// CUSTOMER BANKING APIS (Strictly Isolated)
// ==========================================

// Customer Dashboard Data Aggregation
app.get('/api/customer/dashboard', authenticateToken, requireCustomer, async (req, res) => {
  const customerId = req.user.customer_id;

  try {
    // 1. Get customer's accounts
    const { data: accounts, error: aError } = await supabase
      .from('accounts')
      .select('*')
      .eq('customer_id', customerId);

    if (aError) throw aError;
    const customerAccounts = accounts || [];
    const accountIds = customerAccounts.map(a => a.account_id);

    // 2. Get transactions for these accounts only
    let customerTransactions = [];
    if (accountIds.length > 0) {
      const { data: txns, error: tError } = await supabase
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .order('created_at', { ascending: false });

      if (tError) throw tError;
      customerTransactions = txns || [];
    }

    const totalBalance = customerAccounts.reduce((acc, a) => acc + Number(a.balance || 0), 0);
    const totalDeposits = customerTransactions
      .filter(t => t.transaction_type === 'deposit')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalWithdrawals = customerTransactions
      .filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'withdraw' || t.transaction_type === 'transfer')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    // Build 6-month chart data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const dynamicExpenseData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIdx - i);
      dynamicExpenseData.push({
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        name: monthNames[d.getMonth()],
        income: 0,
        expense: 0
      });
    }

    customerTransactions.forEach((txn) => {
      if (!txn.created_at) return;
      const tDate = new Date(txn.created_at);
      const targetMonth = dynamicExpenseData.find(
        (m) => m.monthIdx === tDate.getMonth() && m.year === tDate.getFullYear()
      );
      if (targetMonth) {
        const amt = Number(txn.amount || 0);
        if (txn.transaction_type === 'deposit') {
          targetMonth.income += amt;
        } else {
          targetMonth.expense += amt;
        }
      }
    });

    res.json({
      accounts: customerAccounts,
      transactions: customerTransactions,
      totalBalance,
      totalDeposits,
      totalWithdrawals,
      chartData: dynamicExpenseData
    });
  } catch (err) {
    console.error('Error fetching customer dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch customer dashboard metrics.' });
  }
});

// Customer Accounts
app.get('/api/customer/accounts', authenticateToken, requireCustomer, async (req, res) => {
  const customerId = req.user.customer_id;
  const { data, error } = await supabase
    .from('accounts')
    .select('*, branches(branch_name, ifsc_code, city)')
    .eq('customer_id', customerId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Customer Transaction History
app.get('/api/customer/transactions', authenticateToken, requireCustomer, async (req, res) => {
  const customerId = req.user.customer_id;
  const { type, accountId, startDate, endDate, search, limit = 50, page = 1 } = req.query;

  try {
    // 1. Fetch customer's account IDs
    const { data: accounts } = await supabase
      .from('accounts')
      .select('account_id, account_number, account_type')
      .eq('customer_id', customerId);

    const accountMap = {};
    (accounts || []).forEach(a => { accountMap[a.account_id] = a; });
    const customerAccountIds = Object.keys(accountMap);

    if (customerAccountIds.length === 0) {
      return res.json({ transactions: [], total: 0 });
    }

    // 2. Query transactions
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .in('account_id', customerAccountIds)
      .order('created_at', { ascending: false });

    if (accountId && customerAccountIds.includes(accountId)) {
      query = query.eq('account_id', accountId);
    }

    if (type && type !== 'all') {
      if (type === 'transfer') {
        query = query.eq('transaction_type', 'transfer');
      } else if (type === 'deposit') {
        query = query.eq('transaction_type', 'deposit');
      } else if (type === 'withdrawal') {
        query = query.in('transaction_type', ['withdrawal', 'withdraw']);
      }
    }

    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString());
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }

    const fromIdx = (parseInt(page) - 1) * parseInt(limit);
    const toIdx = fromIdx + parseInt(limit) - 1;
    query = query.range(fromIdx, toIdx);

    const { data, count, error } = await query;
    if (error) throw error;

    let results = data || [];
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(t => 
        (t.description && t.description.toLowerCase().includes(s)) ||
        (t.reference_id && t.reference_id.toLowerCase().includes(s)) ||
        (t.transaction_id && t.transaction_id.toLowerCase().includes(s))
      );
    }

    // Attach account info
    const enriched = results.map(t => ({
      ...t,
      account_number: accountMap[t.account_id]?.account_number,
      account_type: accountMap[t.account_id]?.account_type
    }));

    res.json({ transactions: enriched, total: count || enriched.length });
  } catch (err) {
    console.error('Customer transactions error:', err);
    res.status(500).json({ error: 'Failed to retrieve transaction history.' });
  }
});

// Recipient Verification before confirmation
app.post('/api/customer/verify-recipient', authenticateToken, requireCustomer, async (req, res) => {
  const { recipientAccountNumber } = req.body;
  const customerId = req.user.customer_id;

  if (!recipientAccountNumber) {
    return res.status(400).json({ error: 'Recipient account number is required.' });
  }

  const cleanNum = recipientAccountNumber.trim();

  // Find target account
  const { data: targetAcc, error } = await supabase
    .from('accounts')
    .select('account_id, customer_id, account_number, account_type, status, customers(full_name)')
    .eq('account_number', cleanNum)
    .single();

  if (error || !targetAcc) {
    return res.status(404).json({ error: 'Beneficiary account not found in NexusBank ledger.' });
  }

  if (targetAcc.status !== 'active') {
    return res.status(400).json({ error: 'The destination account is inactive or suspended.' });
  }

  // Mask recipient name for privacy (e.g., "John Doe" -> "J*** D***")
  const rawName = targetAcc.customers?.full_name || 'NexusBank Customer';
  const nameParts = rawName.split(' ');
  const maskedName = nameParts.map(p => p[0] + '*'.repeat(Math.max(2, p.length - 1))).join(' ');

  const isSelf = targetAcc.customer_id === customerId;

  res.json({
    valid: true,
    recipientAccountId: targetAcc.account_id,
    recipientAccountNumber: targetAcc.account_number,
    recipientAccountType: targetAcc.account_type,
    recipientMaskedName: maskedName,
    isSelfTransfer: isSelf
  });
});

// Customer Deposit
app.post('/api/customer/deposit', authenticateToken, requireCustomer, async (req, res) => {
  const { accountId, amount, description } = req.body;
  const customerId = req.user.customer_id;

  const numAmount = parseFloat(amount);
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Deposit amount must be a positive number greater than zero.' });
  }

  // Verify account belongs to this customer
  const { data: acc, error: aError } = await supabase
    .from('accounts')
    .select('*')
    .eq('account_id', accountId)
    .eq('customer_id', customerId)
    .single();

  if (aError || !acc) {
    return res.status(403).json({ error: 'Account verification failed. You can only deposit to your own accounts.' });
  }

  if (acc.status !== 'active') {
    return res.status(400).json({ error: 'Cannot deposit into an inactive or suspended account.' });
  }

  // Call Supabase RPC
  const cleanDesc = description ? description.trim() : 'Customer Direct Deposit';
  const { data: newBalance, error: rpcError } = await supabase.rpc('deposit_money', {
    p_account_id: accountId,
    p_amount: numAmount,
    p_description: cleanDesc
  });

  if (rpcError) {
    return res.status(500).json({ error: rpcError.message || 'Deposit transaction failed.' });
  }

  // Fetch the created transaction record
  const { data: txn } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Audit Log & Notification
  await logAudit(supabase, {
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: 'customer',
    action: 'CUSTOMER_DEPOSIT',
    targetType: 'account',
    targetId: accountId,
    details: { amount: numAmount, account_number: acc.account_number, new_balance: newBalance },
    ipAddress: req.ip
  });

  await addNotification(supabase, {
    customerId,
    title: 'Deposit Successful',
    message: `₹${numAmount.toLocaleString('en-IN')} has been successfully deposited into A/C ${acc.account_number}.`,
    type: 'success'
  });

  res.json({
    success: true,
    new_balance: newBalance,
    transaction: txn,
    message: 'Deposit completed successfully.'
  });
});

// Customer Withdraw
app.post('/api/customer/withdraw', authenticateToken, requireCustomer, async (req, res) => {
  const { accountId, amount, description } = req.body;
  const customerId = req.user.customer_id;

  const numAmount = parseFloat(amount);
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Withdrawal amount must be a positive number greater than zero.' });
  }

  // Verify account belongs to this customer
  const { data: acc, error: aError } = await supabase
    .from('accounts')
    .select('*')
    .eq('account_id', accountId)
    .eq('customer_id', customerId)
    .single();

  if (aError || !acc) {
    return res.status(403).json({ error: 'Account verification failed. You can only withdraw from your own accounts.' });
  }

  if (acc.status !== 'active') {
    return res.status(400).json({ error: 'Withdrawal rejected: Account is inactive or suspended.' });
  }

  if (Number(acc.balance) < numAmount) {
    return res.status(400).json({ 
      error: `Insufficient balance. Available funds: ₹${Number(acc.balance).toLocaleString('en-IN')}` 
    });
  }

  const cleanDesc = description ? description.trim() : 'Customer Cash Withdrawal';
  const { data: newBalance, error: rpcError } = await supabase.rpc('withdraw_money', {
    p_account_id: accountId,
    p_amount: numAmount,
    p_description: cleanDesc
  });

  if (rpcError) {
    return res.status(500).json({ error: rpcError.message || 'Withdrawal transaction failed.' });
  }

  // Fetch the created transaction record
  const { data: txn } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  await logAudit(supabase, {
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: 'customer',
    action: 'CUSTOMER_WITHDRAWAL',
    targetType: 'account',
    targetId: accountId,
    details: { amount: numAmount, account_number: acc.account_number, new_balance: newBalance },
    ipAddress: req.ip
  });

  await addNotification(supabase, {
    customerId,
    title: 'Withdrawal Alert',
    message: `₹${numAmount.toLocaleString('en-IN')} was debited from A/C ${acc.account_number}.`,
    type: 'warning'
  });

  res.json({
    success: true,
    new_balance: newBalance,
    transaction: txn,
    message: 'Withdrawal completed successfully.'
  });
});

// Customer Fund Transfer
app.post('/api/customer/transfer', authenticateToken, requireCustomer, async (req, res) => {
  const { fromAccountId, toAccountId, amount, description } = req.body;
  const customerId = req.user.customer_id;

  const numAmount = parseFloat(amount);
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Transfer amount must be a positive number greater than zero.' });
  }

  // 1. Verify sender account ownership
  const { data: fromAcc, error: fError } = await supabase
    .from('accounts')
    .select('*')
    .eq('account_id', fromAccountId)
    .eq('customer_id', customerId)
    .single();

  if (fError || !fromAcc) {
    return res.status(403).json({ error: 'Transfer rejected: You can only transfer funds from your own accounts.' });
  }

  if (fromAcc.status !== 'active') {
    return res.status(400).json({ error: 'Source account is inactive or suspended.' });
  }

  if (Number(fromAcc.balance) < numAmount) {
    return res.status(400).json({ 
      error: `Insufficient balance. Available funds: ₹${Number(fromAcc.balance).toLocaleString('en-IN')}` 
    });
  }

  // 2. Resolve destination account
  let targetId = toAccountId;
  let targetAcc = null;

  if (toAccountId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(toAccountId)) {
    const { data: foundAcc } = await supabase
      .from('accounts')
      .select('*')
      .eq('account_number', toAccountId.trim())
      .single();

    if (!foundAcc) {
      return res.status(404).json({ error: 'Beneficiary account number not found in NexusBank ledger.' });
    }
    targetId = foundAcc.account_id;
    targetAcc = foundAcc;
  } else {
    const { data: foundAcc } = await supabase
      .from('accounts')
      .select('*')
      .eq('account_id', toAccountId)
      .single();
    if (!foundAcc) {
      return res.status(404).json({ error: 'Destination account not found.' });
    }
    targetAcc = foundAcc;
  }

  if (fromAccountId === targetId) {
    return res.status(400).json({ error: 'Cannot transfer funds to the same source account.' });
  }

  if (targetAcc.status !== 'active') {
    return res.status(400).json({ error: 'Destination account is suspended or inactive.' });
  }

  const cleanDesc = description ? description.trim() : `Transfer to A/C ${targetAcc.account_number}`;

  // 3. Execute atomic transfer via RPC
  const { data: success, error: tError } = await supabase.rpc('transfer_money', {
    p_from_account_id: fromAccountId,
    p_to_account_id: targetId,
    p_amount: numAmount,
    p_description: cleanDesc
  });

  if (tError) {
    return res.status(500).json({ error: tError.message || 'Transfer failed during execution.' });
  }

  // Get the latest transfer record
  const { data: transferRecord } = await supabase
    .from('transfers')
    .select('*')
    .eq('from_account_id', fromAccountId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const refId = transferRecord?.reference_id || `TRF-${Date.now()}`;

  // Fetch updated sender balance
  const { data: updatedFromAcc } = await supabase
    .from('accounts')
    .select('balance')
    .eq('account_id', fromAccountId)
    .single();

  // Audit Log
  await logAudit(supabase, {
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: 'customer',
    action: 'FUNDS_TRANSFER',
    targetType: 'transfer',
    targetId: refId,
    details: { 
      from_account: fromAcc.account_number, 
      to_account: targetAcc.account_number, 
      amount: numAmount,
      reference_id: refId
    },
    ipAddress: req.ip
  });

  // Notify Sender
  await addNotification(supabase, {
    customerId,
    title: 'Funds Transferred',
    message: `₹${numAmount.toLocaleString('en-IN')} transferred to A/C ${targetAcc.account_number}. Ref: ${refId}`,
    type: 'info'
  });

  // Notify Recipient if within NexusBank
  if (targetAcc.customer_id && targetAcc.customer_id !== customerId) {
    await addNotification(supabase, {
      customerId: targetAcc.customer_id,
      title: 'Credit Received',
      message: `₹${numAmount.toLocaleString('en-IN')} received from A/C ${fromAcc.account_number}. Ref: ${refId}`,
      type: 'success'
    });
  }

  res.json({
    success: true,
    reference_id: refId,
    amount: numAmount,
    sender_new_balance: updatedFromAcc?.balance,
    message: 'Fund transfer successfully processed.'
  });
});

// Customer Bank Statement Data
app.get('/api/customer/statement-data', authenticateToken, requireCustomer, async (req, res) => {
  const { accountId, startDate, endDate } = req.query;
  const customerId = req.user.customer_id;

  if (!accountId) {
    return res.status(400).json({ error: 'Account ID is required.' });
  }

  // Verify ownership
  const { data: acc, error: aError } = await supabase
    .from('accounts')
    .select('*, branches(branch_name, ifsc_code, city), customers(full_name, email, phone, address)')
    .eq('account_id', accountId)
    .eq('customer_id', customerId)
    .single();

  if (aError || !acc) {
    return res.status(403).json({ error: 'Access denied: Account ownership verification failed.' });
  }

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  // Fetch transactions ordered chronologically
  const { data: txns, error: tError } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true });

  if (tError) {
    return res.status(500).json({ error: 'Failed to retrieve statement transactions.' });
  }

  const statementTxns = txns || [];

  // Calculate opening balance before startDate
  const { data: priorTxns } = await supabase
    .from('transactions')
    .select('new_balance')
    .eq('account_id', accountId)
    .lt('created_at', start.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  let openingBalance = 0;
  if (priorTxns && priorTxns.length > 0 && priorTxns[0].new_balance !== null) {
    openingBalance = Number(priorTxns[0].new_balance);
  } else if (statementTxns.length > 0) {
    openingBalance = Number(statementTxns[0].previous_balance || 0);
  }

  let running = openingBalance;
  let totalDebits = 0;
  let totalCredits = 0;

  const enrichedTxns = statementTxns.map(t => {
    const isCredit = t.transaction_type === 'deposit';
    const amt = Number(t.amount);
    if (isCredit) {
      totalCredits += amt;
      running += amt;
    } else {
      totalDebits += amt;
      running -= amt;
    }
    return {
      transaction_id: t.transaction_id,
      date: t.created_at,
      reference_id: t.reference_id || t.transaction_id.slice(0, 8),
      description: t.description || (isCredit ? 'Credit Deposit' : 'Debit Withdrawal'),
      type: t.transaction_type,
      credit: isCredit ? amt : null,
      debit: !isCredit ? amt : null,
      running_balance: t.new_balance !== null ? Number(t.new_balance) : running,
      status: t.status || 'completed'
    };
  });

  const closingBalance = enrichedTxns.length > 0 
    ? enrichedTxns[enrichedTxns.length - 1].running_balance 
    : openingBalance;

  res.json({
    bankName: 'NexusBank International',
    customer: {
      name: acc.customers?.full_name || req.user.full_name,
      email: acc.customers?.email || req.user.email,
      phone: acc.customers?.phone || 'N/A',
      address: acc.customers?.address || 'Registered Customer'
    },
    account: {
      accountId: acc.account_id,
      accountNumber: acc.account_number,
      accountType: acc.account_type,
      branchName: acc.branches?.branch_name || 'Main Branch',
      ifscCode: acc.branches?.ifsc_code || 'BANK0001234',
      status: acc.status
    },
    period: {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    openingBalance,
    totalCredits,
    totalDebits,
    closingBalance,
    transactions: enrichedTxns
  });
});

// Customer Bank Statement CSV Download
app.get('/api/customer/statements/csv', authenticateToken, requireCustomer, async (req, res) => {
  const { accountId, startDate, endDate } = req.query;
  const customerId = req.user.customer_id;

  const { data: acc } = await supabase
    .from('accounts')
    .select('*, customers(full_name)')
    .eq('account_id', accountId)
    .eq('customer_id', customerId)
    .single();

  if (!acc) {
    return res.status(403).json({ error: 'Unauthorized or account not found.' });
  }

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const { data: txns } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true });

  let csvContent = 'Date,Reference ID,Description,Type,Debit (INR),Credit (INR),Running Balance (INR),Status\n';

  (txns || []).forEach(t => {
    const isCredit = t.transaction_type === 'deposit';
    const debit = !isCredit ? Number(t.amount).toFixed(2) : '';
    const credit = isCredit ? Number(t.amount).toFixed(2) : '';
    const running = t.new_balance ? Number(t.new_balance).toFixed(2) : '';
    const dateStr = new Date(t.created_at).toISOString().split('T')[0];
    const desc = (t.description || '').replace(/"/g, '""');
    csvContent += `"${dateStr}","${t.reference_id || t.transaction_id}","${desc}","${t.transaction_type}","${debit}","${credit}","${running}","${t.status || 'completed'}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="NexusBank_Statement_${acc.account_number}.csv"`);
  res.send(csvContent);
});

// Customer Permitted Profile
app.get('/api/customer/profile', authenticateToken, requireCustomer, async (req, res) => {
  const customerId = req.user.customer_id;
  const { data: cust, error } = await supabase
    .from('customers')
    .select('*, profiles(full_name, email, phone, role, created_at)')
    .eq('customer_id', customerId)
    .single();

  if (error || !cust) {
    return res.status(404).json({ error: 'Customer profile not found.' });
  }

  res.json({
    customerId: cust.customer_id,
    fullName: cust.full_name,
    email: cust.email,
    phone: cust.phone,
    address: cust.address,
    dateOfBirth: cust.date_of_birth,
    gender: cust.gender,
    kycStatus: cust.kyc_status,
    role: 'customer',
    createdAt: cust.created_at
  });
});

app.put('/api/customer/profile', authenticateToken, requireCustomer, async (req, res) => {
  const customerId = req.user.customer_id;
  const { phone, address, dateOfBirth, gender } = req.body;

  // Explicit whitelist of editable fields - NEVER role or balance!
  const updates = {};
  if (phone !== undefined) updates.phone = phone.trim();
  if (address !== undefined) updates.address = address.trim();
  if (dateOfBirth !== undefined) updates.date_of_birth = dateOfBirth;
  if (gender !== undefined) updates.gender = gender;

  const { error } = await supabase
    .from('customers')
    .update(updates)
    .eq('customer_id', customerId);

  if (error) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }

  await logAudit(supabase, {
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: 'customer',
    action: 'PROFILE_UPDATE',
    details: updates,
    ipAddress: req.ip
  });

  res.json({ success: true, message: 'Profile updated successfully.' });
});

// Customer Notifications
app.get('/api/customer/notifications', authenticateToken, requireCustomer, async (req, res) => {
  const customerId = req.user.customer_id;
  const list = await getCustomerNotifications(supabase, customerId);
  res.json(list);
});

app.put('/api/customer/notifications/:id/read', authenticateToken, requireCustomer, async (req, res) => {
  const customerId = req.user.customer_id;
  await markNotificationRead(supabase, req.params.id, customerId);
  res.json({ success: true });
});

app.put('/api/customer/notifications/read-all', authenticateToken, requireCustomer, async (req, res) => {
  const customerId = req.user.customer_id;
  await markAllNotificationsRead(supabase, customerId);
  res.json({ success: true });
});

// ==========================================
// ADMIN MANAGEMENT APIS (Guarded by requireAdmin)
// ==========================================

// Bank-wide Dashboard Overview
app.get('/api/admin/dashboard-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [accRes, txnRes, custRes, trfRes] = await Promise.all([
      supabase.from('accounts').select('*'),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('*'),
      supabase.from('transfers').select('*')
    ]);

    const accounts = accRes.data || [];
    const transactions = txnRes.data || [];
    const customers = custRes.data || [];
    const transfers = trfRes.data || [];

    const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance || 0), 0);
    const totalDeposits = transactions
      .filter(t => t.transaction_type === 'deposit')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalWithdrawals = transactions
      .filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'withdraw')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalTransfers = transfers
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    // Dynamic 6-month chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const dynamicExpenseData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIdx - i);
      dynamicExpenseData.push({
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        name: monthNames[d.getMonth()],
        income: 0,
        expense: 0
      });
    }

    transactions.forEach((txn) => {
      if (!txn.created_at) return;
      const tDate = new Date(txn.created_at);
      const targetMonth = dynamicExpenseData.find(
        (m) => m.monthIdx === tDate.getMonth() && m.year === tDate.getFullYear()
      );
      if (targetMonth) {
        const amt = Number(txn.amount || 0);
        if (txn.transaction_type === 'deposit') {
          targetMonth.income += amt;
        } else {
          targetMonth.expense += amt;
        }
      }
    });

    res.json({
      totalBalance,
      totalDeposits,
      totalWithdrawals,
      totalTransfers,
      activeAccountsCount: accounts.filter(a => a.status === 'active').length,
      totalAccountsCount: accounts.length,
      activeCustomersCount: customers.length,
      chartData: dynamicExpenseData,
      recentTransactions: transactions.slice(0, 8)
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to aggregate enterprise banking metrics.' });
  }
});

// Admin Customer Management
app.get('/api/admin/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*, accounts(account_id, account_number, account_type, balance, status)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const list = (customers || []).map(c => {
      const accs = c.accounts || [];
      const totalBalance = accs.reduce((sum, a) => sum + Number(a.balance || 0), 0);
      return {
        ...c,
        accountsCount: accs.length,
        totalBalance,
        activeAccountsCount: accs.filter(a => a.status === 'active').length
      };
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Update Customer KYC Status
app.put('/api/admin/customers/:id/kyc', authenticateToken, requireAdmin, async (req, res) => {
  const { kycStatus } = req.body;
  const customerId = req.params.id;

  if (!['verified', 'pending', 'rejected'].includes(kycStatus)) {
    return res.status(400).json({ error: 'Invalid KYC status.' });
  }

  const { error } = await supabase
    .from('customers')
    .update({ kyc_status: kycStatus })
    .eq('customer_id', customerId);

  if (error) return res.status(500).json({ error: error.message });

  await logAudit(supabase, {
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: 'admin',
    action: 'KYC_STATUS_UPDATE',
    targetType: 'customer',
    targetId: customerId,
    details: { kyc_status: kycStatus },
    ipAddress: req.ip
  });

  await addNotification(supabase, {
    customerId,
    title: 'KYC Verification Update',
    message: `Your account KYC status has been updated to ${kycStatus.toUpperCase()} by Bank Compliance.`,
    type: kycStatus === 'verified' ? 'success' : 'alert'
  });

  res.json({ success: true, message: `Customer KYC status updated to ${kycStatus}.` });
});

// Admin Accounts Management
app.get('/api/admin/accounts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, customers(full_name, email, phone, kyc_status), branches(branch_name, ifsc_code)')
      .order('opened_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Suspend or Activate Account
app.put('/api/admin/accounts/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { status, reason } = req.body;
  const accountId = req.params.id;

  if (!['active', 'suspended', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid account status.' });
  }

  const { data: acc, error: fError } = await supabase
    .from('accounts')
    .select('account_number, customer_id')
    .eq('account_id', accountId)
    .single();

  if (fError || !acc) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  const { error } = await supabase
    .from('accounts')
    .update({ status })
    .eq('account_id', accountId);

  if (error) return res.status(500).json({ error: error.message });

  await logAudit(supabase, {
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: 'admin',
    action: status === 'active' ? 'ACCOUNT_ACTIVATE' : 'ACCOUNT_SUSPEND',
    targetType: 'account',
    targetId: accountId,
    details: { account_number: acc.account_number, status, reason: reason || 'Administrative action' },
    ipAddress: req.ip
  });

  if (acc.customer_id) {
    await addNotification(supabase, {
      customerId: acc.customer_id,
      title: `Account Status Changed: ${status.toUpperCase()}`,
      message: `Your account ${acc.account_number} status has been updated to ${status}. ${reason ? `Reason: ${reason}` : ''}`,
      type: status === 'active' ? 'success' : 'alert'
    });
  }

  res.json({ success: true, message: `Account ${acc.account_number} status updated to ${status}.` });
});

// Admin Transactions Monitor
app.get('/api/admin/transactions', authenticateToken, requireAdmin, async (req, res) => {
  const { type, accountId, startDate, endDate, search, limit = 100, page = 1 } = req.query;

  try {
    let query = supabase
      .from('transactions')
      .select('*, accounts(account_number, account_type, customer_id, customers(full_name))', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (accountId) query = query.eq('account_id', accountId);
    if (type && type !== 'all') query = query.eq('transaction_type', type);

    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString());
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }

    const fromIdx = (parseInt(page) - 1) * parseInt(limit);
    const toIdx = fromIdx + parseInt(limit) - 1;
    query = query.range(fromIdx, toIdx);

    const { data, count, error } = await query;
    if (error) throw error;

    let results = data || [];
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(t => 
        (t.description && t.description.toLowerCase().includes(s)) ||
        (t.reference_id && t.reference_id.toLowerCase().includes(s)) ||
        (t.transaction_id && t.transaction_id.toLowerCase().includes(s)) ||
        (t.accounts?.account_number && t.accounts.account_number.toLowerCase().includes(s)) ||
        (t.accounts?.customers?.full_name && t.accounts.customers.full_name.toLowerCase().includes(s))
      );
    }

    res.json({ transactions: results, total: count || results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Transfers
app.get('/api/admin/transfers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select('*, from_account:accounts!from_account_id(account_number, account_type, customers(full_name)), to_account:accounts!to_account_id(account_number, account_type, customers(full_name))')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Reports
app.get('/api/admin/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [txnsRes, accRes] = await Promise.all([
      supabase.from('transactions').select('*'),
      supabase.from('accounts').select('account_type, balance, status')
    ]);

    const txns = txnsRes.data || [];
    const accs = accRes.data || [];

    const totalInflow = txns
      .filter(t => t.transaction_type === 'deposit')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalOutflow = txns
      .filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'withdraw')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalTransfers = txns
      .filter(t => t.transaction_type === 'transfer')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const accountsByType = {};
    accs.forEach(a => {
      accountsByType[a.account_type] = (accountsByType[a.account_type] || 0) + Number(a.balance || 0);
    });

    res.json({
      summary: {
        totalInflow,
        totalOutflow,
        netLiquidityFlow: totalInflow - totalOutflow,
        totalTransfers,
        totalTransactionsCount: txns.length,
        averageTransactionAmount: txns.length > 0 ? (totalInflow + totalOutflow) / txns.length : 0
      },
      accountsByType
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Bank Statement Generator for Any Customer
app.get('/api/admin/statement-data', authenticateToken, requireAdmin, async (req, res) => {
  const { accountId, startDate, endDate } = req.query;

  if (!accountId) {
    return res.status(400).json({ error: 'Account ID is required.' });
  }

  const { data: acc, error: aError } = await supabase
    .from('accounts')
    .select('*, branches(branch_name, ifsc_code, city), customers(full_name, email, phone, address)')
    .eq('account_id', accountId)
    .single();

  if (aError || !acc) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const { data: txns } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true });

  const statementTxns = txns || [];

  const { data: priorTxns } = await supabase
    .from('transactions')
    .select('new_balance')
    .eq('account_id', accountId)
    .lt('created_at', start.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  let openingBalance = 0;
  if (priorTxns && priorTxns.length > 0 && priorTxns[0].new_balance !== null) {
    openingBalance = Number(priorTxns[0].new_balance);
  } else if (statementTxns.length > 0) {
    openingBalance = Number(statementTxns[0].previous_balance || 0);
  }

  let running = openingBalance;
  let totalDebits = 0;
  let totalCredits = 0;

  const enrichedTxns = statementTxns.map(t => {
    const isCredit = t.transaction_type === 'deposit';
    const amt = Number(t.amount);
    if (isCredit) {
      totalCredits += amt;
      running += amt;
    } else {
      totalDebits += amt;
      running -= amt;
    }
    return {
      transaction_id: t.transaction_id,
      date: t.created_at,
      reference_id: t.reference_id || t.transaction_id.slice(0, 8),
      description: t.description || (isCredit ? 'Credit Deposit' : 'Debit Withdrawal'),
      type: t.transaction_type,
      credit: isCredit ? amt : null,
      debit: !isCredit ? amt : null,
      running_balance: t.new_balance !== null ? Number(t.new_balance) : running,
      status: t.status || 'completed'
    };
  });

  const closingBalance = enrichedTxns.length > 0 
    ? enrichedTxns[enrichedTxns.length - 1].running_balance 
    : openingBalance;

  await logAudit(supabase, {
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: 'admin',
    action: 'ADMIN_STATEMENT_GENERATE',
    targetType: 'account',
    targetId: accountId,
    details: { account_number: acc.account_number },
    ipAddress: req.ip
  });

  res.json({
    bankName: 'NexusBank International (Official Bank Statement)',
    customer: {
      name: acc.customers?.full_name || 'Account Holder',
      email: acc.customers?.email || '',
      phone: acc.customers?.phone || '',
      address: acc.customers?.address || ''
    },
    account: {
      accountId: acc.account_id,
      accountNumber: acc.account_number,
      accountType: acc.account_type,
      branchName: acc.branches?.branch_name || 'Main Branch',
      ifscCode: acc.branches?.ifsc_code || 'BANK0001234',
      status: acc.status
    },
    period: {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    openingBalance,
    totalCredits,
    totalDebits,
    closingBalance,
    transactions: enrichedTxns
  });
});

// Admin Audit Logs Viewer
app.get('/api/admin/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
  const { action, search, limit = 100 } = req.query;
  const logs = await getAuditLogs(supabase, { 
    limit: parseInt(limit), 
    action, 
    search 
  });
  res.json(logs);
});

// Admin Settings
app.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  res.json({
    bankName: 'NexusBank International',
    systemVersion: '2.4.0 (Enterprise DBMS)',
    environment: 'Production / High-Availability',
    maintenanceMode: false,
    dailyTransferLimit: 500000,
    dailyWithdrawalLimit: 100000,
    fdicInsured: true,
    supportedCurrencies: ['INR (₹)', 'USD ($)', 'EUR (€)'],
    databaseStatus: 'Online (Connected)'
  });
});

// ==========================================
// Compatibility Fallback Routes (for unmigrated calls)
// ==========================================

app.get('/api/accounts', async (req, res) => {
  const { data, error } = await supabase.from('accounts').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/transactions', async (req, res) => {
  const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

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

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`NexusBank Core Server running on port ${port}`);
  });
}

module.exports = app;
