
'use client';

import { useState, useEffect } from 'react';
import { Banknote, WalletCards, Building2, Users } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { GrowthChart } from '@/components/dashboard/growth-chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, subMonths, getMonth, getYear } from 'date-fns';
import { id } from 'date-fns/locale';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit, Timestamp, doc } from 'firebase/firestore';
import type { Store, TopUpRequest, Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const firestore = useFirestore();

  const [totalTokenBalance, setTotalTokenBalance] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [growthChartData, setGrowthChartData] = useState([]);


  // --- Data Fetching ---
  const storesQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'stores') : null,
  [firestore]);

  const transactionsQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'transactions') : null,
  [firestore]);

  const topUpRequestsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'topUpRequests'), where('status', '==', 'pending'), limit(5)) : null,
  [firestore]);

  const approvedTopUpsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'topUpRequests'), where('status', '==', 'disetujui')) : null,
  [firestore]);

  const recentStoresQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'stores'), orderBy('name', 'desc'), limit(5)) : null,
  [firestore]);

  const { data: stores, isLoading: isLoadingStores } = useCollection<Store>(storesQuery);
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);
  const { data: pendingTopUps, isLoading: isLoadingTopUps, error: topUpsError } = useCollection<TopUpRequest>(topUpRequestsQuery);
  const { data: approvedTopUps, isLoading: isLoadingApprovedTopUps } = useCollection<TopUpRequest>(approvedTopUpsQuery);
  const { data: recentStores, isLoading: isLoadingRecentStores } = useCollection<Store>(recentStoresQuery);
  
  // --- Client-side Aggregation ---
  useEffect(() => {
    if (stores) {
      const calculatedTokenBalance = stores.reduce((acc, store) => acc + (store.pradanaTokenBalance || 0), 0);
      setTotalTokenBalance(calculatedTokenBalance);
    }
  }, [stores]);

  useEffect(() => {
    if (transactions) {
      // Calculate total token usage (POS + AI)
      const calculatedTransactions = transactions
        .filter(t => t.type === 'pos' || t.type === 'ai')
        .reduce((acc, t) => acc + Math.abs(t.amount || 0), 0); // Use Math.abs for usage
      setTotalTransactions(calculatedTransactions);
    }
  }, [transactions]);
  
  useEffect(() => {
    if (approvedTopUps) {
        const calculatedRevenue = approvedTopUps.reduce((acc, req) => acc + (req.amount || 0), 0);
        setTotalRevenue(calculatedRevenue);
    }
  }, [approvedTopUps]);

  // --- Growth Chart Data Calculation ---
  useEffect(() => {
    if (stores && approvedTopUps) {
      const getSafeDate = (date: Timestamp | Date | string | undefined): Date | null => {
        if (!date) return null;
        try {
          return date instanceof Timestamp ? date.toDate() : new Date(date);
        } catch (e) {
          return null;
        }
      };

      const monthlyData: { [key: string]: { newStores: number; totalTopUp: number } } = {};
      const monthLabels: { [key: string]: string } = {};
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const year = getYear(d);
        const month = getMonth(d);
        const key = `${year}-${month}`;
        monthlyData[key] = { newStores: 0, totalTopUp: 0 };
        monthLabels[key] = format(d, 'MMM', { locale: id });
      }
      
      // Process new stores
      stores.forEach(store => {
        const createdAt = getSafeDate(store.createdAt);
        if (createdAt) {
          const year = getYear(createdAt);
          const month = getMonth(createdAt);
          const key = `${year}-${month}`;
          if (key in monthlyData) {
            monthlyData[key].newStores++;
          }
        }
      });
      
      // Process approved top-ups
      approvedTopUps.forEach(req => {
        const approvalDate = getSafeDate(req.approvalDate);
        if (approvalDate) {
          const year = getYear(approvalDate);
          const month = getMonth(approvalDate);
          const key = `${year}-${month}`;
          if (key in monthlyData) {
            monthlyData[key].totalTopUp += req.amount;
          }
        }
      });

      const chartData = Object.keys(monthlyData).map(key => ({
        month: monthLabels[key],
        ...monthlyData[key]
      }));

      setGrowthChartData(chartData as any);
    }
  }, [stores, approvedTopUps]);


  const totalStores = stores?.length ?? 0;

  // --- Formatting Functions ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };
  
  const formatDate = (date: Timestamp | Date | string | undefined) => {
      if (!date) return '-';
      const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date);
      try {
        return format(dateObj, "d MMM yyyy", { locale: id });
      } catch (e) {
        return '-'
      }
  }

  const isLoading = isLoadingTopUps || isLoadingRecentStores || isLoadingStores || isLoadingTransactions || isLoadingApprovedTopUps;

  // --- Render Skeletons ---
  if (isLoading && !pendingTopUps && !recentStores && !stores) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3"><Skeleton className="h-[435px]" /></div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Saldo Token"
          value={isLoadingStores ? <Skeleton className='h-7 w-24'/> : formatNumber(totalTokenBalance)}
          icon={WalletCards}
          description="Gabungan saldo dari semua toko"
        />
        <StatCard
          title="Total Toko Terdaftar"
          value={isLoadingStores ? <Skeleton className='h-7 w-12'/> : totalStores.toString()}
          icon={Building2}
          description="Jumlah total tenant aktif"
        />
        <StatCard
          title="Total Transaksi"
          value={isLoadingTransactions ? <Skeleton className='h-7 w-20'/> : formatNumber(totalTransactions)}
          icon={Users}
          description="Penggunaan token di seluruh platform"
        />
        <StatCard
          title="Total Pendapatan"
          value={isLoadingApprovedTopUps ? <Skeleton className='h-7 w-28'/> : formatCurrency(totalRevenue)}
          icon={Banknote}
          description="Total dari semua top-up"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <GrowthChart data={growthChartData} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle className="font-headline">Verifikasi Top-up</CardTitle>
                <CardDescription>5 permintaan terbaru</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/top-up-requests">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingTopUps ? <TableSkeleton rows={5} cols={3}/> : 
               topUpsError ? (
                  <div className="text-center text-muted-foreground py-10 text-sm">
                    Gagal memuat permintaan. Anda mungkin perlu membuat indeks di Firebase Console.
                  </div>
               ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Toko</TableHead>
                            <TableHead>Jumlah</TableHead>
                            <TableHead className='text-right'>Tanggal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingTopUps && pendingTopUps.length > 0 ? (
                            pendingTopUps.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell className='font-medium'>{req.storeName}</TableCell>
                                    <TableCell>{formatCurrency(req.amount)}</TableCell>
                                    <TableCell className='text-right text-xs'>{formatDate(req.requestedAt)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">Belum ada permintaan top-up.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
               )
              }
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle className="font-headline">Toko Baru</CardTitle>
                <CardDescription>5 pendaftar terakhir</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/stores">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingRecentStores ? <TableSkeleton rows={5} cols={2}/> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Toko</TableHead>
                      <TableHead className='text-right'>Tgl. Daftar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentStores && recentStores.length > 0 ? (
                      recentStores.map(store => (
                        <TableRow key={store.id}>
                          <TableCell className='font-medium'>{store.name}</TableCell>
                          <TableCell className='text-right'>{formatDate(store.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">Belum ada toko baru.</TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


function TableSkeleton({ rows = 5, cols = 2}: {rows?: number, cols?: number}) {
    return (
        <div className="space-y-4 p-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className={`grid grid-cols-${cols} gap-4`}>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/2 justify-self-end" />
                </div>
            ))}
        </div>
    )
}

    

    