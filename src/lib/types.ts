import { Timestamp } from "firebase/firestore";

export type Store = {
  id: string;
  name: string;
  pradanaTokenBalance: number;
  catalogSubscriptionExpiry?: Timestamp | Date | string | null;
  createdAt: Timestamp | Date | string;
  referralCode?: string;
  // This field will determine which link to show in the AI follow up
  storeType?: 'Retail' | 'F&B';
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
  storeName:string;
  tokensToAdd: number;
  requestedAt: Timestamp | Date | string;
  status: 'pending' | 'disetujui' | 'ditolak';
  approvalDate?: Timestamp | Date | string;
  approvedBy?: string;
  proofUrl?: string;
  userId?: string; // Add userId to know who requested it
};

export type Transaction = {
  id: string;
  storeId: string;
  type: 'pos' | 'ai' | 'topup';
  tokensTransacted: number; // The number of tokens transacted
  createdAt: Timestamp;
  description: string; // e.g., "AI Business Plan Usage", "POS Transaction Fee"
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

export type ReferralCode = {
  id: string;
  salesPersonName: string;
  isActive: boolean;
  createdAt: Timestamp | Date | string;
};
