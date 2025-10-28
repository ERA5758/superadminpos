
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
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type BankInfo = {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
};

type FeeSettings = {
    feePercentage: number;
    minFeeRp: number;
    maxFeeRp: number;
    aiUsageFee: number;
    newStoreBonusTokens: number;
    catalogMonthlyFee: number;
    catalogSixMonthFee: number;
    catalogYearlyFee: number;
    aiBusinessPlanFee: number;
    aiSessionDurationMinutes: number;
    aiSessionFee: number;

    tokenValueRp: number;
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

// Default values to prevent NaN and undefined errors
const defaultSettings: SettingsData = {
    bankInfo: {
        bankName: "",
        accountHolder: "",
        accountNumber: "",
    },
    feeSettings: {
        feePercentage: 0,
        minFeeRp: 0,
        maxFeeRp: 0,
        aiUsageFee: 0,
        newStoreBonusTokens: 0,
        catalogMonthlyFee: 0,
        catalogSixMonthFee: 0,
        catalogYearlyFee: 0,
        aiBusinessPlanFee: 0,
        aiSessionDurationMinutes: 0,
        aiSessionFee: 0,
        tokenValueRp: 1,
    },
    notificationSettings: {
        waDeviceId: "",
        waAdminGroup: "",
    }
};

export default function SettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      if (!firestore) return;
      setIsLoading(true);

      try {
        const settingsCollectionRef = collection(firestore, "appSettings");

        const [
            feesDocSnap,
            bankDocSnap,
            notifDocSnap
        ] = await Promise.all([
            getDoc(doc(settingsCollectionRef, 'transactionFees')),
            getDoc(doc(settingsCollectionRef, 'bankAccount')),
            getDoc(doc(settingsCollectionRef, 'whatsappConfig'))
        ]);
        
        const feeSettingsData = feesDocSnap.exists() ? feesDocSnap.data() : {};
        const bankInfoData = bankDocSnap.exists() ? bankDocSnap.data() : {};
        const notificationSettingsData = notifDocSnap.exists() ? notifDocSnap.data() : {};

        // Merge fetched data with defaults to ensure all fields are present and have the correct type
        const newSettings: SettingsData = {
            bankInfo: {
                ...defaultSettings.bankInfo,
                ...bankInfoData,
            },
            feeSettings: {
                ...defaultSettings.feeSettings,
                ...Object.entries(feeSettingsData).reduce((acc, [key, value]) => {
                    (acc as any)[key] = Number(value) || 0;
                    return acc;
                }, {}),
            },
            notificationSettings: {
                ...defaultSettings.notificationSettings,
                ...notificationSettingsData,
            }
        };

        setSettings(newSettings);

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
    if (!settings) return;
    const { value } = e.target;
    let processedValue: string | number = value;

    // For all numeric inputs, handle empty string and convert to number
    if (typeof (settings[category] as any)[key] === 'number') {
        processedValue = value === '' ? 0 : Number(value);
        if (isNaN(processedValue)) {
            processedValue = 0; // Fallback to 0 if conversion results in NaN
        }
    }
  
    setSettings(prev => {
        if (!prev) return null;
        return {
            ...prev,
            [category]: {
                ...prev[category],
                [key]: processedValue
            }
        };
    });
  };

  const handleSave = async (category: keyof SettingsData, docId: string) => {
     if (!firestore || !settings) return;
     
     const dataToSave = settings[category];

     // Convert all values to string for Firestore, as per original logic if needed,
     // or save as numbers. Saving as numbers is generally better.
     const payload = Object.entries(dataToSave).reduce((acc, [key, value]) => {
        (acc as any)[key] = value;
        return acc;
     }, {});

     const docRef = doc(firestore, "appSettings", docId);

     try {
        await updateDoc(docRef, payload);
        toast({
            title: "Pengaturan Disimpan",
            description: "Perubahan Anda telah berhasil disimpan.",
        });
     } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Gagal Menyimpan",
            description: `Tidak dapat menyimpan perubahan: ${error.message}`,
        });
     }
  };


  if (isLoading || !settings) {
    return (
        <div className="grid gap-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Biaya Platform & Langganan</CardTitle>
                    <CardDescription>Kelola biaya transaksi, AI, dan langganan untuk platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsSkeleton count={12} />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button disabled>Simpan Perubahan</Button>
                </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Informasi Rekening Bank</CardTitle>
                    <CardDescription>Akun ini akan ditampilkan kepada toko untuk tujuan top-up.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsSkeleton count={3} />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button disabled>Simpan Perubahan</Button>
                </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Konfigurasi Notifikasi</CardTitle>
                    <CardDescription>Kelola konfigurasi untuk notifikasi, mis. WhatsApp.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsSkeleton count={2} />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button disabled>Simpan Perubahan</Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="grid gap-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Biaya Platform & Langganan</CardTitle>
          <CardDescription>
            Kelola biaya transaksi, AI, dan langganan untuk platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="feePercentage">Persentase Biaya (%)</Label>
                    <Input id="feePercentage" type="number" value={settings.feeSettings.feePercentage} onChange={handleInputChange('feeSettings', 'feePercentage')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="minFeeRp">Biaya Minimum (Rp)</Label>
                    <Input id="minFeeRp" type="number" value={settings.feeSettings.minFeeRp} onChange={handleInputChange('feeSettings', 'minFeeRp')} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="maxFeeRp">Biaya Maksimum (Rp)</Label>
                    <Input id="maxFeeRp" type="number" value={settings.feeSettings.maxFeeRp} onChange={handleInputChange('feeSettings', 'maxFeeRp')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="newStoreBonusTokens">Bonus Token Toko Baru</Label>
                    <Input id="newStoreBonusTokens" type="number" value={settings.feeSettings.newStoreBonusTokens} onChange={handleInputChange('feeSettings', 'newStoreBonusTokens')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tokenValueRp">Nilai 1 Token (Rp)</Label>
                    <Input id="tokenValueRp" type="number" value={settings.feeSettings.tokenValueRp} onChange={handleInputChange('feeSettings', 'tokenValueRp')} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="aiUsageFee">Biaya AI (per token)</Label>
                    <Input id="aiUsageFee" type="number" value={settings.feeSettings.aiUsageFee} onChange={handleInputChange('feeSettings', 'aiUsageFee')} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="aiBusinessPlanFee">Biaya AI Business Plan (token)</Label>
                    <Input id="aiBusinessPlanFee" type="number" value={settings.feeSettings.aiBusinessPlanFee} onChange={handleInputChange('feeSettings', 'aiBusinessPlanFee')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="aiSessionFee">Biaya Sesi AI (token)</Label>
                    <Input id="aiSessionFee" type="number" value={settings.feeSettings.aiSessionFee} onChange={handleInputChange('feeSettings', 'aiSessionFee')} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="aiSessionDurationMinutes">Durasi Sesi AI (menit)</Label>
                    <Input id="aiSessionDurationMinutes" type="number" value={settings.feeSettings.aiSessionDurationMinutes} onChange={handleInputChange('feeSettings', 'aiSessionDurationMinutes')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="catalogMonthlyFee">Langganan 1 Bulan (token)</Label>
                    <Input id="catalogMonthlyFee" type="number" value={settings.feeSettings.catalogMonthlyFee} onChange={handleInputChange('feeSettings', 'catalogMonthlyFee')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="catalogSixMonthFee">Langganan 6 Bulan (token)</Label>
                    <Input id="catalogSixMonthFee" type="number" value={settings.feeSettings.catalogSixMonthFee} onChange={handleInputChange('feeSettings', 'catalogSixMonthFee')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="catalogYearlyFee">Langganan 1 Tahun (token)</Label>
                    <Input id="catalogYearlyFee" type="number" value={settings.feeSettings.catalogYearlyFee} onChange={handleInputChange('feeSettings', 'catalogYearlyFee')} />
                </div>
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={() => handleSave('feeSettings', 'transactionFees')}>Simpan Perubahan</Button>
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
            <div className="space-y-4 max-w-md">
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
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={() => handleSave('bankInfo', 'bankAccount')}>Simpan Perubahan</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Konfigurasi Notifikasi</CardTitle>
          <CardDescription>
            Kelola konfigurasi untuk notifikasi, mis. WhatsApp. Backend (Cloud Function) diperlukan untuk mengirim notifikasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                    <Label htmlFor="waDeviceId">Device ID WhatsApp</Label>
                    <Input id="waDeviceId" value={settings.notificationSettings.waDeviceId} onChange={handleInputChange('notificationSettings', 'waDeviceId')} />
                    <p className="text-sm text-muted-foreground">ID unik dari perangkat yang terhubung ke gateway WhatsApp Anda.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="waAdminGroup">Grup Admin WhatsApp</Label>
                    <Input id="waAdminGroup" value={settings.notificationSettings.waAdminGroup} onChange={handleInputChange('notificationSettings', 'waAdminGroup')} />
                    <p className="text-sm text-muted-foreground">Nomor atau ID grup WhatsApp yang akan menerima notifikasi.</p>
                </div>
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={() => handleSave('notificationSettings', 'whatsappConfig')}>Simpan Perubahan</Button>
        </CardFooter>
      </Card>
    </div>
  );
}


function SettingsSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </div>
    )
}

    