import { Timestamp } from "firebase/firestore";

export type Store = {
  id: string;
  name: string;
  isActive: boolean;
  pradanaTokenBalance: number;
  premiumCatalogSubscriptionExpiry?: Timestamp | Date | string | null;
  // These fields will now be populated from the UserProfile
  ownerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string; // Note: address is not in the new UserProfile, might need to adjust later
  description?: string; // Note: description is not in the new UserProfile, might need to adjust later
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
