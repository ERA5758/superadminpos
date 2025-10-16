
"use client";

import { useState } from "react";
import type { Store } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc, increment, Timestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { cn } from "@/lib/utils";

export function StoresTable({ stores }: { stores: Store[] }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const [balanceDialog, setBalanceDialog] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState(0);

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    const handleOpenBalanceDialog = (store: Store) => {
        setSelectedStore(store);
        setAdjustmentAmount(0);
        setBalanceDialog(true);
    }

    const handleAdjustBalance = () => {
        if (!firestore || !selectedStore || adjustmentAmount === 0 || isNaN(adjustmentAmount)) {
            setBalanceDialog(false);
            return;
        };

        const storeRef = doc(firestore, "stores", selectedStore.id);
        const updateData = { pradanaTokenBalance: increment(adjustmentAmount) };

        updateDocumentNonBlocking(storeRef, updateData);

        toast({
            title: "Pengajuan Penyesuaian Saldo",
            description: `Berhasil mengajukan penyesuaian saldo untuk ${selectedStore.name} sebesar ${formatNumber(adjustmentAmount)}. Perubahan akan segera terlihat.`,
        });

        setBalanceDialog(false);
        setSelectedStore(null);
    }
    
    const isStorePremium = (store: Store): boolean => {
        if (!store.catalogSubscriptionExpiry) return false;
        // Ensure we can handle Timestamps from Firestore and Date objects
        const expiryDate = store.catalogSubscriptionExpiry instanceof Timestamp 
            ? store.catalogSubscriptionExpiry.toDate()
            : new Date(store.catalogSubscriptionExpiry);
        return expiryDate > new Date();
    }

    const formatNumber = (amount: number) => {
      return new Intl.NumberFormat('id-ID').format(amount);
    };

  return (
    <>
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Toko</TableHead>
              <TableHead>Saldo Token</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => {
              const premium = isStorePremium(store);
              return (
              <TableRow key={store.id} className="cursor-default">
                <TableCell className="font-medium">
                    <div>{store.name}</div>
                    <div className="text-xs text-muted-foreground">{store.ownerName}</div>
                </TableCell>
                <TableCell>
                  {formatNumber(store.pradanaTokenBalance)}
                </TableCell>
                <TableCell>
                    <Badge variant={premium ? 'default' : 'outline'} className={cn(premium && 'bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20')}>
                        {premium ? 'Ya' : 'Tidak'}
                    </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={handleActionClick}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi Cepat</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenBalanceDialog(store)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Sesuaikan Saldo Token
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={balanceDialog} onOpenChange={setBalanceDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Sesuaikan Saldo Token</DialogTitle>
            <DialogDescription>
              Sesuaikan saldo token untuk {selectedStore?.name}. Masukkan nilai positif untuk menambah, atau nilai negatif untuk mengurangi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Jumlah
              </Label>
              <Input
                id="amount"
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(parseInt(e.target.value, 10) || 0)}
                className="col-span-3"
                placeholder="cth: 50000 atau -10000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right col-span-1">Saldo Saat Ini</Label>
                <div className="col-span-3 font-mono text-sm">{selectedStore ? formatNumber(selectedStore.pradanaTokenBalance) : '...'}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right col-span-1">Saldo Baru</Label>
                <div className="col-span-3 font-mono text-sm font-bold">
                    {selectedStore && !isNaN(adjustmentAmount)
                      ? formatNumber(selectedStore.pradanaTokenBalance + adjustmentAmount)
                      : '...'}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setBalanceDialog(false)}>Batal</Button>
            <Button type="submit" onClick={handleAdjustBalance} disabled={adjustmentAmount === 0 || isNaN(adjustmentAmount)}>Simpan perubahan</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
    
    </>
  );

}
