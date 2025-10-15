
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
import { MoreHorizontal, Pencil, ShieldCheck, ToggleLeft, ToggleRight, Star, PlusCircle, MinusCircle, CalendarPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
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
import { doc, increment, serverTimestamp, Timestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { add, format } from "date-fns";

export function StoresTable({ stores }: { stores: Store[] }) {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [balanceDialog, setBalanceDialog] = useState(false);
    const [premiumDialog, setPremiumDialog] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState(0);
    const [premiumDuration, setPremiumDuration] = useState<number | null>(null);

    const handleRowClick = (storeId: string) => {
        router.push(`/stores/${storeId}`);
    };
    
    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    const handleOpenBalanceDialog = (store: Store) => {
        setSelectedStore(store);
        setAdjustmentAmount(0);
        setBalanceDialog(true);
    }
    
    const handleOpenPremiumDialog = (store: Store, months: number) => {
        setSelectedStore(store);
        setPremiumDuration(months);
        setPremiumDialog(true);
    };

    const handleAdjustBalance = () => {
        if (!firestore || !selectedStore || adjustmentAmount === 0) {
            setBalanceDialog(false);
            return;
        };

        const storeRef = doc(firestore, "stores", selectedStore.id);
        const updateData = { tokenBalance: increment(adjustmentAmount) };

        updateDocumentNonBlocking(storeRef, updateData);

        toast({
            title: "Pengajuan Penyesuaian Saldo",
            description: `Berhasil mengajukan penyesuaian saldo untuk ${selectedStore.name} sebesar ${formatNumber(adjustmentAmount)}. Perubahan akan segera terlihat.`,
        });

        setBalanceDialog(false);
        setSelectedStore(null);
    }

    const handleSetPremium = () => {
        if (!firestore || !selectedStore || !premiumDuration) {
            setPremiumDialog(false);
            return;
        }

        const storeRef = doc(firestore, "stores", selectedStore.id);

        let currentExpiry: Date;
        if (selectedStore.premiumCatalogSubscriptionExpiry) {
            // If expiry is a Firestore Timestamp, convert it to a Date
            if (selectedStore.premiumCatalogSubscriptionExpiry instanceof Timestamp) {
                currentExpiry = selectedStore.premiumCatalogSubscriptionExpiry.toDate();
            } else {
                // Otherwise, assume it's a string or Date object
                currentExpiry = new Date(selectedStore.premiumCatalogSubscriptionExpiry as any);
            }
            // Check if current expiry is in the past, if so, start from now
            if (currentExpiry < new Date()) {
                currentExpiry = new Date();
            }
        } else {
            currentExpiry = new Date();
        }
        
        const newExpiryDate = add(currentExpiry, { months: premiumDuration });

        updateDocumentNonBlocking(storeRef, {
            premiumCatalogSubscriptionExpiry: Timestamp.fromDate(newExpiryDate)
        });

        toast({
            title: "Langganan Premium Diperbarui",
            description: `${selectedStore.name} sekarang premium hingga ${format(newExpiryDate, 'd MMMM yyyy')}.`,
        });
        
        setPremiumDialog(false);
        setSelectedStore(null);
        setPremiumDuration(null);
    }

    const handleStopPremium = (store: Store) => {
         if (!firestore) return;
        const storeRef = doc(firestore, "stores", store.id);
        updateDocumentNonBlocking(storeRef, { 
            premiumCatalogSubscriptionExpiry: null
        });
        toast({
            title: `Langganan Premium Dihentikan`,
            description: `Langganan premium untuk ${store.name} telah dihentikan.`,
        });
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
    
    const isStorePremium = (store: Store): boolean => {
        if (!store.premiumCatalogSubscriptionExpiry) return false;
        const expiryDate = (store.premiumCatalogSubscriptionExpiry as Timestamp).toDate();
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => {
              const premium = isStorePremium(store);
              return (
              <TableRow key={store.id} onClick={() => handleRowClick(store.id)} className="cursor-pointer">
                <TableCell className="font-medium">
                    <div>{store.name}</div>
                    <div className="text-xs text-muted-foreground">{store.ownerName}</div>
                </TableCell>
                <TableCell>
                  {formatNumber(store.tokenBalance)}
                </TableCell>
                <TableCell>
                    <Badge variant={premium ? 'default' : 'outline'} className={cn(premium && 'bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20')}>
                        {premium ? 'Ya' : 'Tidak'}
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
                            <DropdownMenuItem onClick={() => handleOpenBalanceDialog(store)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Sesuaikan Saldo Token
                            </DropdownMenuItem>
                            
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Star className="mr-2 h-4 w-4" />
                                    <span>Kelola Premium</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleOpenPremiumDialog(store, 1)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            <span>Tambah 1 Bulan</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleOpenPremiumDialog(store, 6)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            <span>Tambah 6 Bulan</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleOpenPremiumDialog(store, 12)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            <span>Tambah 1 Tahun</span>
                                        </DropdownMenuItem>
                                        {premium && <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleStopPremium(store)} className="text-destructive focus:text-destructive">
                                                <MinusCircle className="mr-2 h-4 w-4" />
                                                <span>Hentikan Langganan</span>
                                            </DropdownMenuItem>
                                        </>}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleActive(store)} className={!store.isActive ? 'text-emerald-600 focus:text-emerald-600' : 'text-destructive focus:text-destructive'}>
                                {store.isActive ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                {store.isActive ? 'Nonaktifkan' : 'Aktifkan'} Toko
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
                <div className="col-span-3 font-mono text-sm">{formatNumber(selectedStore?.tokenBalance || 0)}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right col-span-1">Saldo Baru</Label>
                <div className="col-span-3 font-mono text-sm font-bold">{formatNumber(((selectedStore?.tokenBalance || 0) + adjustmentAmount))}</div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setBalanceDialog(false)}>Batal</Button>
            <Button type="submit" onClick={handleAdjustBalance} disabled={adjustmentAmount === 0}>Simpan perubahan</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
    
    <Dialog open={premiumDialog} onOpenChange={setPremiumDialog}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="font-headline">Konfirmasi Langganan Premium</DialogTitle>
                <DialogDescription>
                    Anda akan memperpanjang langganan premium untuk <strong>{selectedStore?.name}</strong> selama <strong>{premiumDuration} bulan</strong>.
                </DialogDescription>
            </DialogHeader>
             <div className="space-y-2 text-sm">
                <p>Tanggal kedaluwarsa saat ini: {selectedStore?.premiumCatalogSubscriptionExpiry ? format((selectedStore.premiumCatalogSubscriptionExpiry as Timestamp).toDate(), 'd MMMM yyyy') : 'Tidak ada'}</p>
                <p>Tanggal kedaluwarsa baru akan menjadi: <strong>{premiumDuration && format(add(selectedStore?.premiumCatalogSubscriptionExpiry?.toDate() || new Date(), { months: premiumDuration }), 'd MMMM yyyy')}</strong></p>
            </div>
            <DialogFooter>
                <Button variant="secondary" onClick={() => setPremiumDialog(false)}>Batal</Button>
                <Button onClick={handleSetPremium}>Konfirmasi dan Simpan</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );

    