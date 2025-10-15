import { Banknote, Landmark, Store, Users, WalletCards, Building2 } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { dashboardStats, topUpRequests, stores } from '@/lib/data';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DashboardPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const pendingTopUps = topUpRequests.filter(req => req.status === 'tertunda').slice(0, 5);
  const recentStores = stores.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()).slice(0, 5);


  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Saldo Token"
          value={formatCurrency(dashboardStats.totalTokenBalance)}
          icon={WalletCards}
          description="Gabungan saldo dari semua toko"
        />
        <StatCard
          title="Total Toko Terdaftar"
          value={dashboardStats.totalStores.toString()}
          icon={Building2}
          description="Jumlah total tenant aktif"
        />
        <StatCard
          title="Total Transaksi"
          value={new Intl.NumberFormat('id-ID').format(dashboardStats.totalTransactions)}
          icon={Users}
          description="Transaksi di seluruh platform"
        />
        <StatCard
          title="Total Pendapatan"
          value={formatCurrency(dashboardStats.totalRevenue)}
          icon={Banknote}
          description="Pendapatan platform"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RevenueChart />
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Toko</TableHead>
                            <TableHead className='text-right'>Jumlah</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingTopUps.map(req => (
                            <TableRow key={req.id}>
                                <TableCell className='font-medium'>{req.storeName}</TableCell>
                                <TableCell className='text-right'>{formatCurrency(req.amount)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
                <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Toko</TableHead>
                                <TableHead className='text-right'>Tgl. Daftar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentStores.map(store => (
                                <TableRow key={store.id}>
                                    <TableCell className='font-medium'>{store.name}</TableCell>
                                    <TableCell className='text-right'>{format(new Date(store.registrationDate), "d MMM yyyy", { locale: id })}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
