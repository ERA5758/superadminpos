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
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";

export function StoresTable({ stores }: { stores: Store[] }) {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState(0);
    const { toast } = useToast();

    const handleOpenDialog = (store: Store) => {
        setSelectedStore(store);
        setOpenDialog(true);
    }

    const handleAdjustBalance = () => {
        if (!selectedStore) return;

        toast({
            title: "Saldo Disesuaikan",
            description: `Berhasil menyesuaikan saldo ${selectedStore.name} sebesar ${adjustmentAmount}.`,
        });

        // Here you would call a server action to update the balance
        setOpenDialog(false);
        setAdjustmentAmount(0);
        setSelectedStore(null);
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
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
              <TableRow key={store.id}>
                <TableCell className="font-medium">
                    <div>{store.name}</div>
                    <div className="text-xs text-muted-foreground">{store.ownerName}</div>
                </TableCell>
                <TableCell>
                  {formatCurrency(store.tokenBalance)}
                </TableCell>
                <TableCell>
                    <div className="flex items-center">
                        <Switch id={`premium-${store.id}`} checked={!!store.premiumCatalogSubscriptionId} aria-label="Langganan Premium"/>
                        <Label htmlFor={`premium-${store.id}`} className="ml-2">{!!store.premiumCatalogSubscriptionId ? 'Ya' : 'Tidak'}</Label>
                    </div>
                </TableCell>
                <TableCell>
                  <Badge variant={store.isActive ? "default" : "destructive"} className={store.isActive ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20" : ""}>
                    {store.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenDialog(store)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Sesuaikan Saldo Token
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                {!!store.premiumCatalogSubscriptionId ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                {!!store.premiumCatalogSubscriptionId ? 'Berhenti Berlangganan Premium' : 'Tingkatkan ke Premium'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className={store.isActive ? 'text-destructive' : 'text-emerald-600'}>
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
              Sesuaikan saldo token secara manual untuk {selectedStore?.name}. Masukkan nilai positif untuk menambah, atau nilai negatif untuk mengurangi.
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
                onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button type="submit" onClick={handleAdjustBalance}>Simpan perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
