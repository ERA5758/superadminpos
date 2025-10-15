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
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Pencil, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { doc, increment, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function StoresTable({ stores }: { stores: Store[] }) {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState(0);

    const handleRowClick = (storeId: string) => {
        router.push(`/stores/${storeId}`);
    };
    
    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    const handleOpenDialog = (store: Store) => {
        setSelectedStore(store);
        setAdjustmentAmount(0);
        setOpenDialog(true);
    }

    const handleAdjustBalance = () => {
        if (!firestore || !selectedStore || adjustmentAmount === 0) {
            setOpenDialog(false);
            return;
        };

        const storeRef = doc(firestore, "stores", selectedStore.id);
        const updateData = { tokenBalance: increment(adjustmentAmount) };

        updateDocumentNonBlocking(storeRef, updateData);

        toast({
            title: "Pengajuan Penyesuaian Saldo",
            description: `Berhasil mengajukan penyesuaian saldo untuk ${selectedStore.name} sebesar ${formatNumber(adjustmentAmount)}. Perubahan akan segera terlihat.`,
        });

        setOpenDialog(false);
        setSelectedStore(null);
    }

    const handleToggleActive = (store: Store) => {
        if (!firestore) return;
        const storeRef = doc(firestore, "stores", store.id);
        const newStatus = !store.isActive;
        updateDocumentNonBlocking(storeRef, { isActive: newStatus });
        toast({
            title: `Toko ${newStatus ? 'Diaktifkan' : 'Dinonaktifkan'}`,
            description: `${store.name} telah berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
        });
    }

    const handleTogglePremium = (store: Store) => {
        if (!firestore) return;
        const storeRef = doc(firestore, "stores", store.id);
        const isCurrentlyPremium = !!store.premiumCatalogSubscriptionId;
        const newPremiumStatus = !isCurrentlyPremium;

        updateDocumentNonBlocking(storeRef, { 
            premiumCatalogSubscriptionId: newPremiumStatus ? 'sub_premium_placeholder' : null
        });

        toast({
            title: `Langganan Premium Diperbarui`,
            description: `${store.name} sekarang ${newPremiumStatus ? 'menjadi' : 'berhenti menjadi'} pelanggan premium.`,
        });
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id} onClick={() => handleRowClick(store.id)} className="cursor-pointer">
                <TableCell className="font-medium">
                    <div>{store.name}</div>
                    <div className="text-xs text-muted-foreground">{store.ownerName}</div>
                </TableCell>
                <TableCell>
                  {formatNumber(store.tokenBalance)}
                </TableCell>
                <TableCell>
                    <Badge variant={store.premiumCatalogSubscriptionId ? 'default' : 'outline'} className={cn(store.premiumCatalogSubscriptionId && 'bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20')}>
                        {store.premiumCatalogSubscriptionId ? 'Ya' : 'Tidak'}
                    </Badge>
                </TableCell>
                <TableCell>
                     <Badge variant={store.isActive ? "default" : "destructive"} className={cn(store.isActive ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20" : "")}>
                        {store.isActive ? 'Aktif' : 'Tidak Aktif'}
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
                            <DropdownMenuItem onClick={() => handleOpenDialog(store)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Sesuaikan Saldo Token
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePremium(store)}>
                                {!!store.premiumCatalogSubscriptionId ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                {!!store.premiumCatalogSubscriptionId ? 'Hentikan Premium' : 'Jadikan Premium'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleActive(store)} className={!store.isActive ? 'text-emerald-600' : 'text-destructive focus:text-destructive'}>
                                {store.isActive ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                {store.isActive ? 'Nonaktifkan' : 'Aktifkan'} Toko
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
                <div className="col-span-3 font-mono text-sm">{formatNumber(selectedStore?.tokenBalance || 0)}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right col-span-1">Saldo Baru</Label>
                <div className="col-span-3 font-mono text-sm font-bold">{formatNumber(((selectedStore?.tokenBalance || 0) + adjustmentAmount))}</div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button type="submit" onClick={handleAdjustBalance} disabled={adjustmentAmount === 0}>Simpan perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
