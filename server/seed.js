const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function seedDatabase() {
  console.log('Seeding database...');
  
  // 1. Create a dummy Profile & Customer
  const { data: profile, error: pError } = await supabase.from('profiles').insert([
    { full_name: 'John Doe', email: 'john@example.com', phone: '1234567890', role: 'customer' }
  ]).select().single();
  
  if (pError) return console.error('Profile Error:', pError);

  const { data: customer, error: cError } = await supabase.from('customers').insert([
    { user_id: profile.id, full_name: 'John Doe', email: 'john@example.com', kyc_status: 'verified' }
  ]).select().single();
  
  if (cError) return console.error('Customer Error:', cError);

  // 2. Create a Branch
  const { data: branch, error: bError } = await supabase.from('branches').insert([
    { branch_name: 'Main Branch', ifsc_code: 'BANK0001234', city: 'New York' }
  ]).select().single();
  
  if (bError) return console.error('Branch Error:', bError);

  // 3. Create an Account
  const { data: account, error: aError } = await supabase.from('accounts').insert([
    { customer_id: customer.customer_id, branch_id: branch.branch_id, account_number: '1000200030004000', account_type: 'savings', balance: 5000 }
  ]).select().single();
  
  if (aError) return console.error('Account Error:', aError);

  // 4. Create an initial transaction to represent opening balance
  await supabase.from('transactions').insert([
    { account_id: account.account_id, transaction_type: 'deposit', amount: 5000, previous_balance: 0, new_balance: 5000, description: 'Initial Deposit' }
  ]);

  console.log('✅ Database successfully seeded with test customer, branch, account, and initial transaction!');
}

seedDatabase();
