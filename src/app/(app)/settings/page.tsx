'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirestore } from "@/firebase";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type BankInfo = {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
};

// Define a type for your settings to avoid using 'any'
type PlatformSettings = {
  [key: string]: string;
};


export default function SettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
  });
  const [docIds, setDocIds] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      if (!firestore) return;
      setIsLoading(true);
      try {
        const settingsRef = collection(firestore, "platform_settings");
        const q = query(settingsRef, where("settingKey", "in", ["bankName", "accountHolder", "accountNumber"]));
        const querySnapshot = await getDocs(q);
        
        const settings: Partial<BankInfo> = {};
        const ids: {[key: string]: string} = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          settings[data.settingKey as keyof BankInfo] = data.settingValue;
          ids[data.settingKey] = doc.id;
        });

        setBankInfo(settings as BankInfo);
        setDocIds(ids);

      } catch (error) {
        console.error("Error fetching settings: ", error);
        toast({
          variant: "destructive",
          title: "Gagal memuat pengaturan",
          description: "Tidak dapat mengambil data pengaturan bank dari server.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [firestore, toast]);


  const handleBankInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setBankInfo((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveBankInfo = async () => {
    if (!firestore) return;

    const updates = Object.entries(bankInfo).map(([key, value]) => {
      const docId = docIds[key];
      if (docId) {
        const docRef = doc(firestore, "platform_settings", docId);
        return updateDocumentNonBlocking(docRef, { settingValue: value });
      }
      return Promise.resolve(); // Should not happen if docs are set up correctly
    });

    try {
      await Promise.all(updates);
      toast({
        title: "Pengaturan Disimpan",
        description: "Informasi rekening bank telah berhasil diperbarui.",
      });
    } catch (error) {
        // Errors are handled by the non-blocking update function via the emitter
    }
  };


  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Biaya Platform & Langganan</CardTitle>
          <CardDescription>
            Kelola biaya transaksi, AI, dan langganan untuk platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee-percentage">Persentase Biaya (%)</Label>
                <Input id="fee-percentage" type="number" defaultValue="1.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-fee">Biaya Minimum (Rp)</Label>
                <Input id="min-fee" type="number" defaultValue="500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-usage-fee">Biaya Penggunaan AI (per request)</Label>
              <Input id="ai-usage-fee" type="number" defaultValue="100" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="new-store-bonus">Bonus Token Toko Baru</Label>
              <Input id="new-store-bonus" type="number" defaultValue="10000" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
               <div className="space-y-2">
                <Label htmlFor="catalog-monthly">Langganan 1 Bulan (Rp)</Label>
                <Input id="catalog-monthly" type="number" defaultValue="50000" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="catalog-six-month">Langganan 6 Bulan (Rp)</Label>
                <Input id="catalog-six-month" type="number" defaultValue="250000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catalog-yearly">Langganan 1 Tahun (Rp)</Label>
                <Input id="catalog-yearly" type="number" defaultValue="450000" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Simpan Perubahan</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Informasi Rekening Bank</CardTitle>
          <CardDescription>
            Akun ini akan ditampilkan kepada toko untuk tujuan top-up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <p>Memuat pengaturan...</p> : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Nama Bank</Label>
                <Input id="bankName" value={bankInfo.bankName} onChange={handleBankInfoChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolder">Nama Pemegang Rekening</Label>
                <Input id="accountHolder" value={bankInfo.accountHolder} onChange={handleBankInfoChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Nomor Rekening</Label>
                <Input id="accountNumber" value={bankInfo.accountNumber} onChange={handleBankInfoChange} />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSaveBankInfo} disabled={isLoading}>Simpan Perubahan</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Konfigurasi Notifikasi</CardTitle>
          <CardDescription>
            Kelola konfigurasi untuk notifikasi, mis. WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wa-device-id">Device ID WhatsApp</Label>
              <Input id="wa-device-id" defaultValue="device_12345" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa-admin-group">Grup Admin WhatsApp</Label>
              <Input id="wa-admin-group" defaultValue="admin_group_xyz" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Simpan Perubahan</Button>
        </CardFooter>
      </Card>
    </div>
  );
}