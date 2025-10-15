import { Timestamp } from "firebase/firestore";

export type Store = {
  id: string;
  name: string;
  isActive: boolean;
  tokenBalance: number;
  premiumCatalogSubscriptionId?: string;
  ownerName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  description: string;
  // Fields below are from static data and might not be in Firestore
  status?: 'aktif' | 'tidak aktif';
  isPremium?: boolean;
  owner?: string;
  registrationDate?: string;
};

export type TopUpRequest = {
  id: string;
  storeId: string;
  storeName: string;
  amount: number;
  requestDate: string | Date | Timestamp;
  status: 'tertunda' | 'disetujui' | 'ditolak';
};

export type Transaction = {
  id: string;
  storeName: string;
  amount: number;
  date: string;
  type: 'Isi Ulang' | 'Biaya' | 'Penjualan';
  status: 'Selesai' | 'Tertunda' | 'Gagal';
};
