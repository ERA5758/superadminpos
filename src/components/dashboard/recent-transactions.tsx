import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { recentTransactions } from "@/lib/data";
import { cn } from "@/lib/utils";

export function RecentTransactions() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
    
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="font-headline">Transaksi Terkini</CardTitle>
        <CardDescription>Gambaran umum transaksi terbaru di platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Toko</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.storeName}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell className={cn("text-right", transaction.amount < 0 ? "text-destructive" : "text-emerald-600")}>
                  {transaction.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(transaction.amount))}
                </TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      transaction.status === "Selesai"
                        ? "default"
                        : transaction.status === "Tertunda"
                        ? "secondary"
                        : "destructive"
                    }
                    className={cn(
                      transaction.status === "Selesai" && "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20",
                      transaction.status === "Tertunda" && "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20"
                    )}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
