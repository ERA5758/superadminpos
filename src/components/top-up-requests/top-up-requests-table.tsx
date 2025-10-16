
"use client";

import type { TopUpRequest } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc, increment, writeBatch, Timestamp, collection, addDoc } from "firebase/firestore";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

export function TopUpRequestsTable({ requests }: { requests: TopUpRequest[] }) {
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleAction = async (request: TopUpRequest, action: 'disetujui' | 'ditolak') => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Koneksi ke database gagal.",
            });
            return;
        }

        const batch = writeBatch(firestore);

        // Path to the top-up request document in the root collection
        const requestRef = doc(firestore, "topUpRequests", request.id);
        
        const updateData = { 
            status: action,
            approvalDate: Timestamp.now(),
            // approvedBy: currentAdminUid // TODO: Add current admin UID
        };

        batch.update(requestRef, updateData);

        // If approved, update the store's token balance and create a transaction log
        if (action === 'disetujui') {
            const storeRef = doc(firestore, "stores", request.storeId);
            batch.update(storeRef, { pradanaTokenBalance: increment(request.amount) });
            
            // Create a new transaction log for the top-up
            const transactionRef = doc(collection(firestore, "transactions"));
            batch.set(transactionRef, {
              storeId: request.storeId,
              type: 'topup',
              amount: request.amount,
              createdAt: Timestamp.now(),
              description: `Top-up disetujui untuk ${request.storeName}`
            });
        }
        
        try {
            await batch.commit();
            toast({
                title: `Permintaan ${action === 'disetujui' ? 'Disetujui' : 'Ditolak'}`,
                description: `Permintaan isi ulang untuk ${request.storeName} telah ${action}.`,
            });
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: "Gagal Memperbarui",
                description: `Gagal memperbarui status permintaan: ${error.message}`,
            });
            // Note: We are not using the global error emitter here for batch writes
            console.error("Batch write failed:", error);
        }

    };
    
    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('id-ID').format(amount);
    };

    const formatDate = (date: Timestamp | Date | string | undefined) => {
      if (!date) return '-';
      try {
        const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date);
        return format(dateObj, "d MMM yyyy, HH:mm", { locale: id });
      } catch (error) {
        return "Tanggal tidak valid";
      }
    };

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          {requests.length === 0 && <TableCaption>Tidak ada permintaan dengan status ini.</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead>Nama Toko</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Tgl. Permintaan</TableHead>
              <TableHead>Bukti Transfer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.storeName}</TableCell>
                <TableCell>
                  {formatNumber(request.amount)}
                </TableCell>
                <TableCell>{formatDate(request.requestDate)}</TableCell>
                 <TableCell>
                  {request.proofOfPaymentUrl ? (
                    <Button variant="link" asChild className="h-auto p-0 text-xs">
                        <Link href={request.proofOfPaymentUrl} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="mr-1 h-3 w-3" />
                            Lihat Bukti
                        </Link>
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.status === "disetujui"
                        ? "default"
                        : request.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                    className={cn(
                        request.status === "disetujui" && "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20",
                        request.status === "pending" && "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20",
                        request.status === "ditolak" && "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20"
                    )}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {request.status === "pending" ? (
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-600 hover:text-emerald-700 hover:bg-emerald-100" onClick={() => handleAction(request, 'disetujui')}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Setujui
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => handleAction(request, 'ditolak')}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Tolak
                      </Button>
                    </div>
                  ) : (
                     <div className="flex items-center justify-end text-muted-foreground text-xs">
                        {`Diperbarui pada ${formatDate(request.approvalDate)}`}
                     </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
