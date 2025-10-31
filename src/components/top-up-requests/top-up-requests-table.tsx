
'use client';

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
import { useFirestore, useUser } from "@/firebase";
import { doc, increment, writeBatch, Timestamp, collection, getDoc } from "firebase/firestore";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

export function TopUpRequestsTable({ requests }: { requests: TopUpRequest[] }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user: adminUser } = useUser();

    // This function will now be responsible for calling our new API route
    const triggerNotification = async (request: TopUpRequest, newStatus: 'disetujui' | 'ditolak') => {
        try {
            await fetch('/api/handle-top-up-decision', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestId: request.id,
                    storeId: request.storeId,
                    storeName: request.storeName,
                    userId: request.userId,
                    tokensToAdd: request.tokensToAdd,
                    newStatus: newStatus,
                }),
            });
            // We don't need to await a response, just fire and forget.
            // The API route will handle logging any errors.
        } catch (error) {
            console.error("Failed to trigger notification API:", error);
            // Optionally notify admin that notification might have failed,
            // but the primary action (approval/rejection) was successful.
        }
    };

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

        const requestRef = doc(firestore, "topUpRequests", request.id);
        
        const updateData = { 
            status: action,
            approvalDate: Timestamp.now(),
            approvedBy: adminUser?.uid || 'unknown_admin'
        };

        batch.update(requestRef, updateData);

        if (action === 'disetujui') {
            const storeRef = doc(firestore, "stores", request.storeId);
            batch.update(storeRef, { pradanaTokenBalance: increment(request.tokensToAdd) });
            
            const transactionRef = doc(collection(firestore, "transactions"));
            batch.set(transactionRef, {
              storeId: request.storeId,
              type: 'topup',
              tokensTransacted: request.tokensToAdd,
              createdAt: Timestamp.now(),
              description: `Top-up disetujui untuk ${request.storeName}`
            });
        }
        
        try {
            await batch.commit();
            toast({
                title: `Permintaan ${action === 'disetujui' ? 'Disetujui' : 'Ditolak'}`,
                description: `Permintaan isi ulang untuk ${request.storeName} telah ${action}. Notifikasi sedang dikirim.`,
            });
            
            // After successful DB update, trigger the notification API
            triggerNotification(request, action);

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: "Gagal Memperbarui",
                description: `Gagal memperbarui status permintaan: ${error.message}`,
            });
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
                  {formatNumber(request.tokensToAdd)}
                </TableCell>
                <TableCell>{formatDate(request.requestedAt)}</TableCell>
                 <TableCell>
                  {request.proofUrl ? (
                    <Button variant="link" asChild className="h-auto p-0 text-xs">
                        <Link href={request.proofUrl} target="_blank" rel="noopener noreferrer">
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
