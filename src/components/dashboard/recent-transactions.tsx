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
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="font-headline">Recent Transactions</CardTitle>
        <CardDescription>An overview of the most recent transactions on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.storeName}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell className={cn("text-right", transaction.amount < 0 ? "text-destructive" : "text-emerald-600")}>
                  {transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      transaction.status === "Completed"
                        ? "default"
                        : transaction.status === "Pending"
                        ? "secondary"
                        : "destructive"
                    }
                    className={cn(
                      transaction.status === "Completed" && "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20",
                      transaction.status === "Pending" && "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20"
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
