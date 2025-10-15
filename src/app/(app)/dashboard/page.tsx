import { Banknote, Landmark, Store, Users } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { dashboardStats } from '@/lib/data';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { StoresGrowthChart } from '@/components/dashboard/stores-growth-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';

export default function DashboardPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Token Balance"
          value={formatCurrency(dashboardStats.totalTokenBalance)}
          icon={Landmark}
          description="Total tokens across all stores"
        />
        <StatCard
          title="Total Stores"
          value={dashboardStats.totalStores.toString()}
          icon={Store}
          description="+11 since last month"
        />
        <StatCard
          title="Total Transactions"
          value={new Intl.NumberFormat('en-US').format(dashboardStats.totalTransactions)}
          icon={Users}
          description="In the last 30 days"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboardStats.totalRevenue)}
          icon={Banknote}
          description="+15.2% from last month"
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
