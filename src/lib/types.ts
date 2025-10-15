import { Timestamp } from "firebase/firestore";

export type Store = {
  id: string;
  name: string;
  status: 'aktif' | 'tidak aktif';
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
