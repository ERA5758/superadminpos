export type Store = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  tokenBalance: number;
  isPremium: boolean;
  owner: string;
  phone: string;
  address: string;
  registrationDate: string;
};

export type TopUpRequest = {
  id: string;
  storeId: string;
  storeName: string;
  amount: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type Transaction = {
  id: string;
  storeName: string;
  amount: number;
  date: string;
  type: 'Top-up' | 'Fee' | 'Sale';
  status: 'Completed' | 'Pending' | 'Failed';
};
