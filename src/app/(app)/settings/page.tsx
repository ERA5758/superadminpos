
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
import { Skeleton } from "@/components/ui/skeleton";

type BankInfo = {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
};

type FeeSettings = {
    feePercentage: number;
    minFeeRp: number;
    aiUsageFee: number;
    newStoreBonusTokens: number;
    catalogMonthlyFee: number;
    catalogSixMonthFee: number;
    catalogYearlyFee: number;
};

type NotificationSettings = {
    waDeviceId: string;
    waAdminGroup: string;
}

export default function SettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
  });

  const [feeSettings, setFeeSettings] = useState<FeeSettings>({
    feePercentage: 0,
    minFeeRp: 0,
    aiUsageFee: 0,
    newStoreBonusTokens: 0,
    catalogMonthlyFee: 0,
    catalogSixMonthFee: 0,
    catalogYearlyFee: 0
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
      waDeviceId: "",
      waAdminGroup: ""
  });
  
  const [docIds, setDocIds] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      if (!firestore) return;
      setIsLoading(true);
      try {
        const settingsRef = collection(firestore, "appsetting");
        const querySnapshot = await getDocs(settingsRef);
        
        const newBankInfo: Partial<BankInfo> = {};
        const newFeeSettings: Partial<FeeSettings> = {};
        const newNotificationSettings: Partial<NotificationSettings> = {};
        const newDocIds: {[key: string]: string} = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const key = data.settingKey;
          const value = data.settingValue;
          newDocIds[key] = doc.id;

          if (key in bankInfo) {
              (newBankInfo as any)[key] = value;
          }
          if (key in feeSettings) {
              (newFeeSettings as any)[key] = Number(value);
          }
           if (key in notificationSettings) {
              (newNotificationSettings as any)[key] = value;
          }
        });
        
        setBankInfo(prev => ({ ...prev, ...newBankInfo }));
        setFeeSettings(prev => ({ ...prev, ...newFeeSettings }));
        setNotificationSettings(prev => ({ ...prev, ...newNotificationSettings }));
        setDocIds(newDocIds);

      } catch (error) {
        console.error("Error fetching settings: ", error);
        toast({
          variant: "destructive",
          title: "Gagal memuat pengaturan",
          description: "Tidak dapat mengambil data pengaturan dari server.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [firestore, toast]);


  const handleInputChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setter((prev: T) => ({ ...prev, [id]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };

  const handleSave = async (settings: Record<string, any>) => {
     if (!firestore) return;
     
     const updates = Object.entries(settings).map(([key, value]) => {
         const docId = docIds[key];
         if (docId) {
             const docRef = doc(firestore, "appsetting", docId);
             return updateDocumentNonBlocking(docRef, { settingValue: String(value) });
         }
         return Promise.resolve();
     });

     try {
        await Promise.all(updates);
        toast({
            title: "Pengaturan Disimpan",
            description: "Perubahan Anda telah berhasil disimpan.",
        });
     } catch (error) {
         // Errors are handled by the non-blocking update function via the emitter
         // The toast for errors is handled there.
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
          {isLoading ? <SettingsSkeleton /> : (
            <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="feePercentage">Persentase Biaya (%)</Label>
                    <Input id="feePercentage" type="number" value={feeSettings.feePercentage * 100} onChange={(e) => setFeeSettings(prev => ({...prev, feePercentage: parseFloat(e.target.value) / 100}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="minFeeRp">Biaya Minimum (Rp)</Label>
                    <Input id="minFeeRp" type="number" value={feeSettings.minFeeRp} onChange={handleInputChange(setFeeSettings)} />
                </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="aiUsageFee">Biaya Penggunaan AI (per request)</Label>
                <Input id="aiUsageFee" type="number" value={feeSettings.aiUsageFee} onChange={handleInputChange(setFeeSettings)} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="newStoreBonusTokens">Bonus Token Toko Baru</Label>
                <Input id="newStoreBonusTokens" type="number" value={feeSettings.newStoreBonusTokens} onChange={handleInputChange(setFeeSettings)} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="catalogMonthlyFee">Langganan 1 Bulan (Rp)</Label>
                    <Input id="catalogMonthlyFee" type="number" value={feeSettings.catalogMonthlyFee} onChange={handleInputChange(setFeeSettings)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="catalogSixMonthFee">Langganan 6 Bulan (Rp)</Label>
                    <Input id="catalogSixMonthFee" type="number" value={feeSettings.catalogSixMonthFee} onChange={handleInputChange(setFeeSettings)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="catalogYearlyFee">Langganan 1 Tahun (Rp)</Label>
                    <Input id="catalogYearlyFee" type="number" value={feeSettings.catalogYearlyFee} onChange={handleInputChange(setFeeSettings)} />
                </div>
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={() => handleSave(feeSettings)} disabled={isLoading}>Simpan Perubahan</Button>
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
          {isLoading ? <SettingsSkeleton /> : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Nama Bank</Label>
                <Input id="bankName" value={bankInfo.bankName} onChange={handleInputChange(setBankInfo)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolder">Nama Pemegang Rekening</Label>
                <Input id="accountHolder" value={bankInfo.accountHolder} onChange={handleInputChange(setBankInfo)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Nomor Rekening</Label>
                <Input id="accountNumber" value={bankInfo.accountNumber} onChange={handleInputChange(setBankInfo)} />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={() => handleSave(bankInfo)} disabled={isLoading}>Simpan Perubahan</Button>
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
          {isLoading ? <SettingsSkeleton /> : (
            <div className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="waDeviceId">Device ID WhatsApp</Label>
                <Input id="waDeviceId" value={notificationSettings.waDeviceId} onChange={handleInputChange(setNotificationSettings)} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="waAdminGroup">Grup Admin WhatsApp</Label>
                <Input id="waAdminGroup" value={notificationSettings.waAdminGroup} onChange={handleInputChange(setNotificationSettings)} />
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={() => handleSave(notificationSettings)} disabled={isLoading}>Simpan Perubahan</Button>
        </CardFooter>
      </Card>
    </div>
  );
}


function SettingsSkeleton() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}

    