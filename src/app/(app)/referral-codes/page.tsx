
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { ReferralCode, Store, TopUpRequest } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddReferralCode } from '@/components/referral-codes/add-referral-code';
import { getYear, getMonth } from 'date-fns';
import { ReferralCodesTable, type AnalyticsData } from '@/components/referral-codes/referral-codes-table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ReferralCodesPage() {
  const firestore = useFirestore();

  const currentYear = getYear(new Date());
  const currentMonth = getMonth(new Date()); // 0-indexed

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [anyError, setAnyError] = useState<Error | null>(null);

  // --- Data Fetching ---
  const codesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'referralCode'), orderBy('createdAt', 'desc')) : null, 
  [firestore]);

  const storesQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'stores') : null, 
  [firestore]);
  
  const topUpsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'topUpRequests'), where('status', '==', 'disetujui')) : null, 
  [firestore]);

  const { data: codes, isLoading: isLoadingCodes, error: codesError } = useCollection<ReferralCode>(codesQuery);
  const { data: stores, isLoading: isLoadingStores, error: storesError } = useCollection<Store>(storesQuery);
  const { data: topUps, isLoading: isLoadingTopUps, error: topUpsError } = useCollection<TopUpRequest>(topUpsQuery);
  
  useEffect(() => {
    if (codesError) setAnyError(codesError);
    if (storesError) setAnyError(storesError);
    if (topUpsError) setAnyError(topUpsError);
  }, [codesError, storesError, topUpsError]);

  // --- Data Processing & Aggregation ---
  useEffect(() => {
    if (!codes || !stores || !topUps) return;

    // 1. Filter stores and top-ups based on the selected period
    const filteredStores = stores.filter(store => {
      if (!store.createdAt) return false;
      const createdAt = store.createdAt instanceof Timestamp ? store.createdAt.toDate() : new Date(store.createdAt);
      return getYear(createdAt) === selectedYear && getMonth(createdAt) === selectedMonth;
    });

    const filteredTopUps = topUps.filter(topUp => {
      if (!topUp.approvalDate) return false;
      const approvalDate = topUp.approvalDate instanceof Timestamp ? topUp.approvalDate.toDate() : new Date(topUp.approvalDate);
      return getYear(approvalDate) === selectedYear && getMonth(approvalDate) === selectedMonth;
    });

    // 2. Create a map of stores registered by each referral code
    const storesByReferralCode: { [key: string]: Store[] } = {};
    for (const store of filteredStores) {
      if (store.referralCode) {
        if (!storesByReferralCode[store.referralCode]) {
          storesByReferralCode[store.referralCode] = [];
        }
        storesByReferralCode[store.referralCode].push(store);
      }
    }
    
    // 3. Create a map of total top-up amounts per store ID
    const topUpAmountByStore: { [key: string]: number } = {};
    for (const topUp of filteredTopUps) {
        topUpAmountByStore[topUp.storeId] = (topUpAmountByStore[topUp.storeId] || 0) + topUp.amount;
    }

    // 4. Aggregate data for each referral code
    const newAnalyticsData = codes.map(code => {
      const registeredStores = storesByReferralCode[code.id] || [];
      
      const totalTopUp = registeredStores.reduce((acc, store) => {
        return acc + (topUpAmountByStore[store.id] || 0);
      }, 0);

      return {
        ...code,
        totalStoresRegistered: registeredStores.length,
        totalTopUpAmount: totalTopUp,
        registeredStoresList: registeredStores.map(s => s.name),
      };
    });

    setAnalyticsData(newAnalyticsData);

  }, [codes, stores, topUps, selectedMonth, selectedYear]);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const isLoading = isLoadingCodes || isLoadingStores || isLoadingTopUps;

  if (isLoading && analyticsData.length === 0 && !anyError) {
    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  if (anyError) {
     return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal Memuat Data</AlertTitle>
            <AlertDescription>
                Tidak dapat mengambil data dari server. Pastikan Anda memiliki izin yang benar dan coba lagi.
                <p className="mt-2 font-mono text-xs bg-muted p-2 rounded">{anyError.message}</p>
            </AlertDescription>
        </Alert>
     )
  }

  return (
    <div className='space-y-6'>
       <Card>
            <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
                <div className='flex items-center gap-4'>
                    <h3 className='text-sm font-medium text-muted-foreground whitespace-nowrap'>Filter Periode:</h3>
                    <div className='flex items-center gap-2'>
                        <Select
                            value={selectedMonth.toString()}
                            onValueChange={(value) => setSelectedMonth(Number(value))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month, index) => (
                                    <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={selectedYear.toString()}
                            onValueChange={(value) => setSelectedYear(Number(value))}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(year => (
                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <AddReferralCode />
            </CardContent>
        </Card>
      
      <ReferralCodesTable data={analyticsData} />
    </div>
  );
}
