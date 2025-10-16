
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type GrowthChartProps = {
  data: { month: string; newStores: number; totalTopUp: number }[];
};

export function GrowthChart({ data }: GrowthChartProps) {
  const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline">Pertumbuhan Platform</CardTitle>
        <CardDescription>Toko baru dan total top-up per bulan (12 bulan terakhir)</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              stroke="hsl(var(--chart-1))"
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => formatNumber(value as number)}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--chart-2))"
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `Rp${new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value as number)}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              labelClassName="font-bold"
              formatter={(value, name) => {
                if (name === 'newStores') return [formatNumber(value as number), 'Toko Baru'];
                if (name === 'totalTopUp') return [formatCurrency(value as number), 'Total Top-up'];
                return [value, name];
              }}
            />
            <Legend wrapperStyle={{fontSize: "0.8rem", paddingTop: "10px"}}/>
            <Bar yAxisId="left" dataKey="newStores" name="Toko Baru" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="totalTopUp" name="Total Top-up" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
