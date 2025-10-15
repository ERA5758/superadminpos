import type { Store, TopUpRequest, Transaction } from './types';

export const dashboardStats = {
  totalTokenBalance: 125430500,
  totalStores: 89,
  totalTransactions: 12345,
  totalRevenue: 45230750,
};

export const revenueData = [
  { month: 'Jan', revenue: 2000000 },
  { month: 'Feb', revenue: 1800000 },
  { month: 'Mar', revenue: 2200000 },
  { month: 'Apr', revenue: 2500000 },
  { month: 'Mei', revenue: 2300000 },
  { month: 'Jun', revenue: 3200000 },
  { month: 'Jul', revenue: 3500000 },
  { month: 'Agu', revenue: 3700000 },
  { month: 'Sep', revenue: 2900000 },
  { month: 'Okt', revenue: 3100000 },
  { month: 'Nov', revenue: 4200000 },
  { month: 'Des', revenue: 4800000 },
];

export const storesGrowthData = [
    { month: 'Jan', count: 5 },
    { month: 'Feb', count: 7 },
    { month: 'Mar', count: 10 },
    { month: 'Apr', count: 15 },
    { month: 'Mei', count: 18 },
    { month: 'Jun', count: 25 },
    { month: 'Jul', count: 30 },
    { month: 'Agu', count: 42 },
    { month: 'Sep', count: 55 },
    { month: 'Okt', count: 68 },
    { month: 'Nov', count: 79 },
    { month: 'Des', count: 89 },
];


export const stores: Store[] = [
  { id: 'store-001', name: 'Kopi Kenangan', status: 'aktif', tokenBalance: 1250000, isPremium: true, owner: 'James Bond', phone: '081234567890', address: 'Jl. Kopi No. 123, Jakarta', registrationDate: '2023-01-15' },
  { id: 'store-002', name: 'Janji Jiwa', status: 'aktif', tokenBalance: 850500, isPremium: false, owner: 'Sarah Connor', phone: '081234567891', address: 'Jl. Teh No. 456, Bandung', registrationDate: '2023-02-20' },
  { id: 'store-003', name: 'Fore Coffee', status: 'tidak aktif', tokenBalance: 50000, isPremium: false, owner: 'John Wick', phone: '081234567892', address: 'Jl. Biji Kopi No. 789, Surabaya', registrationDate: '2023-03-10' },
  { id: 'store-004', name: 'Tuku Kopi', status: 'aktif', tokenBalance: 2500750, isPremium: true, owner: 'Ellen Ripley', phone: '081234567893', address: 'Jl. Espresso No. 101, Yogyakarta', registrationDate: '2023-04-05' },
  { id: 'store-005', name: 'Excelso', status: 'aktif', tokenBalance: 300000, isPremium: false, owner: 'Tony Stark', phone: '081234567894', address: 'Jl. Kafein No. 202, Medan', registrationDate: '2023-05-12' },
];

export const topUpRequests: TopUpRequest[] = [
  { id: 'req-001', storeId: 'store-002', storeName: 'Janji Jiwa', amount: 500000, requestDate: '2024-07-28', status: 'tertunda' },
  { id: 'req-002', storeId: 'store-005', storeName: 'Excelso', amount: 1000000, requestDate: '2024-07-27', status: 'tertunda' },
  { id: 'req-003', storeId: 'store-001', storeName: 'Kopi Kenangan', amount: 2000000, requestDate: '2024-07-26', status: 'disetujui' },
  { id: 'req-004', storeId: 'store-004', storeName: 'Tuku Kopi', amount: 1500000, requestDate: '2024-07-25', status: 'disetujui' },
  { id: 'req-005', storeId: 'store-003', storeName: 'Fore Coffee', amount: 300000, requestDate: '2024-07-24', status: 'ditolak' },
];

export const recentTransactions: Transaction[] = [
  { id: 'txn-001', storeName: 'Kopi Kenangan', amount: 25500, date: '2024-07-28T10:30:00Z', type: 'Penjualan', status: 'Selesai' },
  { id: 'txn-002', storeName: 'Janji Jiwa', amount: 500000, date: '2024-07-28T09:00:00Z', type: 'Isi Ulang', status: 'Tertunda' },
  { id: 'txn-003', storeName: 'Tuku Kopi', amount: 15000, date: '2024-07-27T18:45:00Z', type: 'Penjualan', status: 'Selesai' },
  { id: 'txn-004', storeName: 'Platform', amount: -2500, date: '2024-07-27T18:45:00Z', type: 'Biaya', status: 'Selesai' },
  { id: 'txn-005', storeName: 'Excelso', amount: 30000, date: '2024-07-27T15:20:00Z', type: 'Penjualan', status: 'Gagal' },
];
