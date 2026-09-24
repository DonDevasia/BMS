export const mockUser = {
  id: 'CUST-847291',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=3b82f6&color=fff',
  memberSince: '2022-04-12',
  accounts: [
    {
      id: 'ACC-1928374',
      type: 'Savings',
      balance: 45000,
      currency: '₹',
      status: 'Active'
    },
    {
      id: 'ACC-5647382',
      type: 'Current',
      balance: 12500,
      currency: '₹',
      status: 'Active'
    }
  ],
  cards: [
    {
      id: 'CARD-112233',
      type: 'Smart Hybrid',
      number: '**** **** **** 4829',
      expiry: '12/28',
      cvv: '***',
      cardholderName: 'ALEX JOHNSON',
      debitBalance: 45000,
      creditLimit: 100000,
      availableCredit: 85000,
      status: 'Active',
      emergencySwitch: true
    }
  ]
};

export const mockTransactions = [
  { id: 'TXN-001', date: '2026-09-23', merchant: 'Amazon', category: 'Shopping', amount: 4500, type: 'Credit', status: 'Completed', account: 'Smart Hybrid' },
  { id: 'TXN-002', date: '2026-09-22', merchant: 'Starbucks', category: 'Food', amount: 350, type: 'Debit', status: 'Completed', account: 'Savings' },
  { id: 'TXN-003', date: '2026-09-20', merchant: 'Netflix', category: 'Entertainment', amount: 649, type: 'Credit', status: 'Completed', account: 'Smart Hybrid' },
  { id: 'TXN-004', date: '2026-09-18', merchant: 'Uber', category: 'Transport', amount: 450, type: 'Debit', status: 'Completed', account: 'Current' },
  { id: 'TXN-005', date: '2026-09-15', merchant: 'Salary', category: 'Income', amount: 85000, type: 'Credit', status: 'Completed', account: 'Savings' },
];

export const mockRules = [
  { id: 1, condition: 'Purchase > ₹2,000', category: 'Shopping', action: 'Use Credit', active: true },
  { id: 2, condition: 'Category = Groceries', category: 'Groceries', action: 'Use Debit', active: true },
  { id: 3, condition: 'Category = Travel', category: 'Travel', action: 'Use Credit', active: false },
];

export const mockFamily = [
  { 
    id: 'FAM-1', 
    name: 'Sarah Johnson', 
    relation: 'Child', 
    age: 16, 
    limits: { debit: 5000, credit: 2000, daily: 500 },
    allowed: ['Food', 'Education', 'Transport'],
    restricted: ['Gaming', 'Online Subscriptions']
  }
];
