
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
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
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

type SettingsData = {
    bankInfo: BankInfo;
    feeSettings: FeeSettings;
    notificationSettings: NotificationSettings;
};

export default function SettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SettingsData>({
    bankInfo: { bankName: "", accountHolder: "", accountNumber: "" },
    feeSettings: { feePercentage: 0, minFeeRp: 0, aiUsageFee: 0, newStoreBonusTokens: 0, catalogMonthlyFee: 0, catalogSixMonthFee: 0, catalogYearlyFee: 0 },
    notificationSettings: { waDeviceId: "", waAdminGroup: "" }
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
        
        const newSettings: SettingsData = {
            bankInfo: { ...settings.bankInfo },
            feeSettings: { ...settings.feeSettings },
            notificationSettings: { ...settings.notificationSettings }
        };
        const newDocIds: {[key: string]: string} = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const key = data.settingKey;
          const value = data.settingValue;
          newDocIds[key] = doc.id;

          if (key in newSettings.bankInfo) {
              (newSettings.bankInfo as any)[key] = value;
          } else if (key in newSettings.feeSettings) {
              (newSettings.feeSettings as any)[key] = Number(value);
          } else if (key in newSettings.notificationSettings) {
              (newSettings.notificationSettings as any)[key] = value;
          }
        });
        
        setSettings(newSettings);
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


  const handleInputChange = <T extends keyof SettingsData>(
    category: T,
    key: keyof SettingsData[T]
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, type } = e.target;
    let processedValue: string | number = value;
    if (type === 'number') {
        processedValue = value === '' ? 0 : Number(value);
    }
  
    setSettings(prev => ({
        ...prev,
        [category]: {
            ...prev[category],
            [key]: processedValue
        }
    }));
  };

  const handleFeePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseFloat(value);
     setSettings(prev => ({
        ...prev,
        feeSettings: {
            ...prev.feeSettings,
            feePercentage: isNaN(numericValue) ? 0 : numericValue / 100
        }
    }));
  };

  const handleSave = async (settingsToSave: Record<string, any>) => {
     if (!firestore) return;
     
     const updates = Object.entries(settingsToSave).map(([key, value]) => {
         const docId = docIds[key];
         if (docId) {
             const docRef = doc(firestore, "appsetting", docId);
             // Ensure value is a string for Firestore, as per original schema
             return updateDocumentNonBlocking(docRef, { settingValue: String(value) });
         }
         return Promise.resolve(); // Should not happen if docIds are correct
     });

     try {
        await Promise.all(updates);
        toast({
            title: "Pengaturan Disimpan",
            description: "Perubahan Anda telah berhasil disimpan.",
        });
     } catch (error) {
         // Errors are handled by the non-blocking update function's catch block and emitter.
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
                    <Input id="feePercentage" type="number" value={settings.feeSettings.feePercentage * 100} onChange={handleFeePercentageChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="minFeeRp">Biaya Minimum (Rp)</Label>
                    <Input id="minFeeRp" type="number" value={settings.feeSettings.minFeeRp} onChange={handleInputChange('feeSettings', 'minFeeRp')} />
                </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="aiUsageFee">Biaya Penggunaan AI (per request)</Label>
                <Input id="aiUsageFee" type="number" value={settings.feeSettings.aiUsageFee} onChange={handleInputChange('feeSettings', 'aiUsageFee')} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="newStoreBonusTokens">Bonus Token Toko Baru</Label>
                <Input id="newStoreBonusTokens" type="number" value={settings.feeSettings.newStoreBonusTokens} onChange={handleInputChange('feeSettings', 'newStoreBonusTokens')} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="catalogMonthlyFee">Langganan 1 Bulan (Rp)</Label>
                    <Input id="catalogMonthlyFee" type="number" value={settings.feeSettings.catalogMonthlyFee} onChange={handleInputChange('feeSettings', 'catalogMonthlyFee')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="catalogSixMonthFee">Langganan 6 Bulan (Rp)</Label>
                    <Input id="catalogSixMonthFee" type="number" value={settings.feeSettings.catalogSixMonthFee} onChange={handleInputChange('feeSettings', 'catalogSixMonthFee')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="catalogYearlyFee">Langganan 1 Tahun (Rp)</Label>
                    <Input id="catalogYearlyFee" type="number" value={settings.feeSettings.catalogYearlyFee} onChange={handleInputChange('feeSettings', 'catalogYearlyFee')} />
                </div>
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={() => handleSave(settings.feeSettings)} disabled={isLoading}>Simpan Perubahan</Button>
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
                <Input id="bankName" value={settings.bankInfo.bankName} onChange={handleInputChange('bankInfo', 'bankName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolder">Nama Pemegang Rekening</Label>
                <Input id="accountHolder" value={settings.bankInfo.accountHolder} onChange={handleInputChange('bankInfo', 'accountHolder')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Nomor Rekening</Label>
                <Input id="accountNumber" value={settings.bankInfo.accountNumber} onChange={handleInputChange('bankInfo', 'accountNumber')} />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={() => handleSave(settings.bankInfo)} disabled={isLoading}>Simpan Perubahan</Button>
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
                <Input id="waDeviceId" value={settings.notificationSettings.waDeviceId} onChange={handleInputChange('notificationSettings', 'waDeviceId')} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="waAdminGroup">Grup Admin WhatsApp</Label>
                <Input id="waAdminGroup" value={settings.notificationSettings.waAdminGroup} onChange={handleInputChange('notificationSettings', 'waAdminGroup')} />
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={() => handleSave(settings.notificationSettings)} disabled={isLoading}>Simpan Perubahan</Button>
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
    

    