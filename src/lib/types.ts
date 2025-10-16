
import { Timestamp } from "firebase/firestore";

export type Store = {
  id: string;
  name: string;
  isActive: boolean;
  pradanaTokenBalance: number;
  premiumCatalogSubscriptionExpiry?: Timestamp | Date | string | null;
  createdAt: Timestamp | Date | string;
  // These fields will now be populated from the UserProfile
  ownerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string; 
  description?: string; 
  adminUids?: string[];
};

export type UserProfile = {
  id: string; // Document ID is the user's UID
  email: string;
  name: string;
  role: string;
  status: string;
  storeId: string;
  whatsapp: string;
}

export type TopUpRequest = {
  id: string;
  storeId: string;
  storeName: string;
  amount: number;
  requestDate: Timestamp | Date | string;
  status: 'pending' | 'disetujui' | 'ditolak';
  approvalDate?: Timestamp | Date | string;
  approvedBy?: string;
};

export type Transaction = {
  id: string;
  storeName: string;
  amount: number;
  date: string;
  type: 'Isi Ulang' | 'Biaya' | 'Penjualan';
  status: 'Selesai' | 'Tertunda' | 'Gagal';
};

export type PlatformOverview = {
    id: string;
    totalTokenBalance: number;
    totalStores: number;
    totalTransactions: number;
    totalRevenue: number;
    growthChartData: string; // JSON string
    lastUpdated: Timestamp | Date | string;
}
