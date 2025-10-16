
'use client';

import { useState } from "react";
import type { ReferralCode } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, ToggleLeft, ToggleRight } from "lucide-react";
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
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc, Timestamp, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function ReferralCodesTable({ codes }: { codes: ReferralCode[] }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [newSalesPerson, setNewSalesPerson] = useState('');
    const [isSaving, setIsSaving] = useState(false);


    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }
    
    const formatDate = (date: Timestamp | Date | string | undefined) => {
      if (!date) return '-';
      try {
        const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date);
        return format(dateObj, "d MMM yyyy, HH:mm", { locale: id });
      } catch (error) {
        return "Tanggal tidak valid";
      }
    };

    const handleToggleActive = (code: ReferralCode) => {
        if (!firestore) return;
        const codeRef = doc(firestore, "referralCode", code.id);
        const newStatus = !code.isActive;
        updateDocumentNonBlocking(codeRef, { isActive: newStatus });
        toast({
            title: `Kode Referral ${newStatus ? 'Diaktifkan' : 'Dinonaktifkan'}`,
            description: `Kode ${code.id} telah berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
        });
    }

    const handleAddCode = async () => {
        if(!firestore || !newCode || !newSalesPerson) {
             toast({
                variant: 'destructive',
                title: "Input Tidak Lengkap",
                description: "Harap isi semua field yang diperlukan.",
            });
            return;
        }

        setIsSaving(true);
        try {
            const referralCollection = collection(firestore, "referralCode");
            await addDoc(referralCollection, {
                id: newCode.toUpperCase(),
                salesPersonName: newSalesPerson,
                isActive: true,
                createdAt: serverTimestamp()
            });

            toast({
                title: "Kode Referral Ditambahkan",
                description: `Kode ${newCode.toUpperCase()} untuk ${newSalesPerson} telah berhasil dibuat.`,
            });
            
            setNewCode('');
            setNewSalesPerson('');
            setIsAddDialogOpen(false);
            
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Gagal Menyimpan",
                description: `Tidak dapat membuat kode referral: ${error.message}`,
            });
        } finally {
            setIsSaving(false);
        }
    }


  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline">Daftar Kode Referral</CardTitle>
            <CardDescription>Kelola kode referral untuk tim sales Anda.</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Kode
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">Tambah Kode Referral Baru</DialogTitle>
                    <DialogDescription>
                        Buat kode unik baru untuk anggota tim sales.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Kode Referral</Label>
                        <Input 
                            id="code" 
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            placeholder="cth: SALESRIO01"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sales-name">Nama Sales</Label>
                        <Input 
                            id="sales-name" 
                            value={newSalesPerson}
                            onChange={(e) => setNewSalesPerson(e.target.value)}
                            placeholder="cth: Rio Pradana"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                    <Button type="submit" onClick={handleAddCode} disabled={isSaving}>
                        {isSaving ? 'Menyimpan...' : 'Simpan Kode'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Sales</TableHead>
              <TableHead>Tgl. Dibuat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.length > 0 ? codes.map((code) => (
              <TableRow key={code.id} className="cursor-default">
                <TableCell className="font-mono font-medium">
                    {code.id}
                </TableCell>
                <TableCell>{code.salesPersonName}</TableCell>
                <TableCell>
                    {formatDate(code.createdAt)}
                </TableCell>
                <TableCell>
                     <Badge variant={code.isActive ? "default" : "destructive"} className={cn(code.isActive ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20" : "")}>
                        {code.isActive ? 'Aktif' : 'Tidak Aktif'}
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
                            <DropdownMenuItem onClick={() => handleToggleActive(code)} className={!code.isActive ? 'text-emerald-600 focus:text-emerald-600' : 'text-destructive focus:text-destructive'}>
                                {code.isActive ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                {code.isActive ? 'Nonaktifkan' : 'Aktifkan'} Kode
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Belum ada kode referral yang dibuat.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  );

}
