
'use client';

import { useState, useEffect } from 'react';
import { Banknote, WalletCards, Building2, Users } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { PlatformOverview, Store, TopUpRequest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const firestore = useFirestore();

  // --- Data Fetching ---
  const platformOverviewQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'platform_overviews'), limit(1)) : null, 
  [firestore]);
  
  // Temporarily disable this query as it causes permission errors
  // const topUpRequestsQuery = useMemoFirebase(() => 
  //   firestore ? query(collectionGroup(firestore, 'topUpRequests'), where('status', '==', 'tertunda'), orderBy('requestDate', 'desc'), limit(5)) : null,
  // [firestore]);

  const recentStoresQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'stores'), orderBy('createdAt', 'desc'), limit(5)) : null,
  [firestore]);

  const { data: overviewData, isLoading: isLoadingOverview } = useCollection<PlatformOverview>(platformOverviewQuery);
  // Temporarily disable this hook
  // const { data: pendingTopUps, isLoading: isLoadingTopUps } = useCollection<TopUpRequest>(topUpRequestsQuery);
  const pendingTopUps: TopUpRequest[] = []; // Set to empty array
  const isLoadingTopUps = false; // Set to false

  const { data: recentStores, isLoading: isLoadingStores } = useCollection<Store>(recentStoresQuery);
  
  const overview = overviewData?.[0];
  const growthChartData = overview?.growthChartData ? JSON.parse(overview.growthChartData) : [];


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
      return format(dateObj, "d MMM yyyy", { locale: id });
  }

  const isLoading = isLoadingOverview || isLoadingTopUps || isLoadingStores;

  // --- Render Skeletons ---
  if (isLoading && !overview) {
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
          value={overview ? formatNumber(overview.totalTokenBalance) : '...'}
          icon={WalletCards}
          description="Gabungan saldo dari semua toko"
        />
        <StatCard
          title="Total Toko Terdaftar"
          value={overview ? overview.totalStores.toString() : '...'}
          icon={Building2}
          description="Jumlah total tenant aktif"
        />
        <StatCard
          title="Total Transaksi"
          value={overview ? formatNumber(overview.totalTransactions) : '...'}
          icon={Users}
          description="Transaksi di seluruh platform"
        />
        <StatCard
          title="Total Pendapatan"
          value={overview ? formatCurrency(overview.totalRevenue) : '...'}
          icon={Banknote}
          description="Pendapatan platform"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RevenueChart data={growthChartData} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle className="font-headline">Verifikasi Top-up</CardTitle>
                <CardDescription>Fitur dinonaktifkan sementara</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline" disabled>
                <Link href="/top-up-requests">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-10">
                Fitur ini sedang dalam perbaikan.
              </div>
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
              {isLoadingStores ? <TableSkeleton rows={5} cols={2}/> : (
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
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className={`grid grid-cols-${cols} gap-4`}>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/2 justify-self-end" />
                </div>
            ))}
        </div>
    )
}

    

    