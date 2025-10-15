import { Banknote, Landmark, Store, Users } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { dashboardStats } from '@/lib/data';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { StoresGrowthChart } from '@/components/dashboard/stores-growth-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';

export default function DashboardPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Token Total"
          value={formatCurrency(dashboardStats.totalTokenBalance)}
          icon={Landmark}
          description="Total token di semua toko"
        />
        <StatCard
          title="Total Toko"
          value={dashboardStats.totalStores.toString()}
          icon={Store}
          description="+11 sejak bulan lalu"
        />
        <StatCard
          title="Total Transaksi"
          value={new Intl.NumberFormat('id-ID').format(dashboardStats.totalTransactions)}
          icon={Users}
          description="Dalam 30 hari terakhir"
        />
        <StatCard
          title="Total Pendapatan"
          value={formatCurrency(dashboardStats.totalRevenue)}
          icon={Banknote}
          description="+15.2% dari bulan lalu"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueChart />
        <StoresGrowthChart />
      </div>
      <div>
        <RecentTransactions />
      </div>
    </div>
  );
}
