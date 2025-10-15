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
import { CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function TopUpRequestsTable({ requests }: { requests: TopUpRequest[] }) {
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleAction = (request: TopUpRequest, action: 'disetujui' | 'ditolak') => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Koneksi ke database gagal.",
            });
            return;
        }

        const requestRef = doc(firestore, "top_up_requests", request.id);
        
        updateDocumentNonBlocking(requestRef, { status: action });
        
        // Note: Logic for updating store's tokenBalance will be added later
        // For now, we just update the request status

        toast({
            title: `Permintaan ${action === 'disetujui' ? 'Disetujui' : 'Ditolak'}`,
            description: `Permintaan isi ulang untuk ${request.storeName} telah ${action === 'disetujui' ? 'disetujui' : 'ditolak'}.`,
        });
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string | Date) => {
      try {
        return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: id });
      } catch (error) {
        return "Tanggal tidak valid";
      }
    };

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          {requests.length === 0 && <TableCaption>Belum ada permintaan isi ulang.</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead>Nama Toko</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Tanggal Permintaan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.storeName}</TableCell>
                <TableCell>
                  {formatCurrency(request.amount)}
                </TableCell>
                <TableCell>{formatDate(request.requestDate)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.status === "disetujui"
                        ? "default"
                        : request.status === "tertunda"
                        ? "secondary"
                        : "destructive"
                    }
                    className={cn(
                        request.status === "disetujui" && "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20",
                        request.status === "tertunda" && "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20",
                        request.status === "ditolak" && "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20"
                    )}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {request.status === "tertunda" ? (
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100" onClick={() => handleAction(request, 'disetujui')}>
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="sr-only">Setujui</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => handleAction(request, 'ditolak')}>
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Tolak</span>
                      </Button>
                    </div>
                  ) : (
                     <div className="flex items-center justify-end text-muted-foreground">
                        {request.status === 'disetujui' ? <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" /> : <XCircle className="h-4 w-4 mr-2 text-destructive" />}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
