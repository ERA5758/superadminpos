
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { PlusCircle } from 'lucide-react';

export function AddReferralCode() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [salesPersonName, setSalesPersonName] = useState('');
  const [codeId, setCodeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!firestore || !salesPersonName || !codeId) {
      toast({
        variant: 'destructive',
        title: 'Input Tidak Lengkap',
        description: 'Pastikan nama sales dan kode referral sudah diisi.',
      });
      return;
    }

    setIsLoading(true);
    const codeRef = doc(firestore, 'referralCode', codeId);

    try {
      await setDoc(codeRef, {
        id: codeId,
        salesPersonName,
        isActive: true,
        createdAt: Timestamp.now(),
      });

      toast({
        title: 'Kode Referral Dibuat',
        description: `Kode "${codeId}" untuk ${salesPersonName} berhasil ditambahkan.`,
      });

      // Reset form and close dialog
      setSalesPersonName('');
      setCodeId('');
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: `Tidak dapat membuat kode referral: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Kode Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Tambah Kode Referral Baru</DialogTitle>
          <DialogDescription>
            Buat kode referral unik untuk anggota tim sales Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama Sales
            </Label>
            <Input
              id="name"
              value={salesPersonName}
              onChange={(e) => setSalesPersonName(e.target.value)}
              className="col-span-3"
              placeholder="Contoh: Budi"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Kode Referral
            </Label>
            <Input
              id="code"
              value={codeId}
              onChange={(e) => setCodeId(e.target.value)}
              className="col-span-3"
              placeholder="Contoh: SALESBUDI01"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !salesPersonName || !codeId}>
            {isLoading ? 'Menyimpan...' : 'Simpan Kode'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
