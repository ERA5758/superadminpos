import type { Store, TopUpRequest, Transaction } from './types';

export const dashboardStats = {
  totalTokenBalance: 125430.50,
  totalStores: 89,
  totalTransactions: 12345,
  totalRevenue: 45230.75,
};

export const revenueData = [
  { month: 'Jan', revenue: 2000 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 2200 },
  { month: 'Apr', revenue: 2500 },
  { month: 'May', revenue: 2300 },
  { month: 'Jun', revenue: 3200 },
  { month: 'Jul', revenue: 3500 },
  { month: 'Aug', revenue: 3700 },
  { month: 'Sep', revenue: 2900 },
  { month: 'Oct', revenue: 3100 },
  { month: 'Nov', revenue: 4200 },
  { month: 'Dec', revenue: 4800 },
];

export const storesGrowthData = [
    { month: 'Jan', count: 5 },
    { month: 'Feb', count: 7 },
    { month: 'Mar', count: 10 },
    { month: 'Apr', count: 15 },
    { month: 'May', count: 18 },
    { month: 'Jun', count: 25 },
    { month: 'Jul', count: 30 },
    { month: 'Aug', count: 42 },
    { month: 'Sep', count: 55 },
    { month: 'Oct', count: 68 },
    { month: 'Nov', count: 79 },
    { month: 'Dec', count: 89 },
];


export const stores: Store[] = [
  { id: 'store-001', name: 'Kopi Kenangan', status: 'active', tokenBalance: 1250.00, isPremium: true, owner: 'James Bond', phone: '081234567890', address: '123 Coffee St, Jakarta', registrationDate: '2023-01-15' },
  { id: 'store-002', name: 'Janji Jiwa', status: 'active', tokenBalance: 850.50, isPremium: false, owner: 'Sarah Connor', phone: '081234567891', address: '456 Tea Ave, Bandung', registrationDate: '2023-02-20' },
  { id: 'store-003', name: 'Fore Coffee', status: 'inactive', tokenBalance: 50.00, isPremium: false, owner: 'John Wick', phone: '081234567892', address: '789 Beans Blvd, Surabaya', registrationDate: '2023-03-10' },
  { id: 'store-004', name: 'Tuku Kopi', status: 'active', tokenBalance: 2500.75, isPremium: true, owner: 'Ellen Ripley', phone: '081234567893', address: '101 Espresso Ln, Yogyakarta', registrationDate: '2023-04-05' },
  { id: 'store-005', name: 'Excelso', status: 'active', tokenBalance: 300.00, isPremium: false, owner: 'Tony Stark', phone: '081234567894', address: '202 Caffeine Rd, Medan', registrationDate: '2023-05-12' },
];

export const topUpRequests: TopUpRequest[] = [
  { id: 'req-001', storeId: 'store-002', storeName: 'Janji Jiwa', amount: 500, requestDate: '2024-07-28', status: 'pending' },
  { id: 'req-002', storeId: 'store-005', storeName: 'Excelso', amount: 1000, requestDate: '2024-07-27', status: 'pending' },
  { id: 'req-003', storeId: 'store-001', storeName: 'Kopi Kenangan', amount: 2000, requestDate: '2024-07-26', status: 'approved' },
  { id: 'req-004', storeId: 'store-004', storeName: 'Tuku Kopi', amount: 1500, requestDate: '2024-07-25', status: 'approved' },
  { id: 'req-005', storeId: 'store-003', storeName: 'Fore Coffee', amount: 300, requestDate: '2024-07-24', status: 'rejected' },
];

export const recentTransactions: Transaction[] = [
  { id: 'txn-001', storeName: 'Kopi Kenangan', amount: 25.50, date: '2024-07-28T10:30:00Z', type: 'Sale', status: 'Completed' },
  { id: 'txn-002', storeName: 'Janji Jiwa', amount: 500.00, date: '2024-07-28T09:00:00Z', type: 'Top-up', status: 'Pending' },
  { id: 'txn-003', storeName: 'Tuku Kopi', amount: 15.00, date: '2024-07-27T18:45:00Z', type: 'Sale', status: 'Completed' },
  { id: 'txn-004', storeName: 'Platform', amount: -2.50, date: '2024-07-27T18:45:00Z', type: 'Fee', status: 'Completed' },
  { id: 'txn-005', storeName: 'Excelso', amount: 30.00, date: '2024-07-27T15:20:00Z', type: 'Sale', status: 'Failed' },
];
