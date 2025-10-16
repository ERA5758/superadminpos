
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { ReferralCode, Store, TopUpRequest } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReferralCodeAnalytics, type AnalyticsData } from '@/components/referral-codes/referral-code-analytics';
import { getYear, getMonth } from 'date-fns';

export default function ReferralCodesPage() {
  const firestore = useFirestore();

  const currentYear = getYear(new Date());
  const currentMonth = getMonth(new Date()); // 0-indexed

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);

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

  const { data: codes, isLoading: isLoadingCodes } = useCollection<ReferralCode>(codesQuery);
  const { data: stores, isLoading: isLoadingStores } = useCollection<Store>(storesQuery);
  const { data: topUps, isLoading: isLoadingTopUps } = useCollection<TopUpRequest>(topUpsQuery);
  
  // --- Data Processing & Aggregation ---
  useEffect(() => {
    if (!codes || !stores || !topUps) return;

    // 1. Filter stores and top-ups based on the selected period
    const filteredStores = stores.filter(store => {
      const createdAt = store.createdAt instanceof Timestamp ? store.createdAt.toDate() : new Date(store.createdAt);
      return getYear(createdAt) === selectedYear && getMonth(createdAt) === selectedMonth;
    });

    const filteredTopUps = topUps.filter(topUp => {
      const approvalDate = topUp.approvalDate instanceof Timestamp ? topUp.approvalDate.toDate() : new Date(topUp.approvalDate!);
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

  if (isLoading && analyticsData.length === 0) {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className='space-y-6'>
       <Card>
            <CardContent className="pt-6 flex flex-wrap items-center gap-4">
                <h3 className='text-sm font-medium text-muted-foreground'>Filter Periode:</h3>
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
            </CardContent>
        </Card>
      
      <ReferralCodeAnalytics data={analyticsData} />
    </div>
  );
}
