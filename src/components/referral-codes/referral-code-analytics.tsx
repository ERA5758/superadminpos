
'use client';

import type { ReferralCode } from "@/lib/types";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Banknote, Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export type AnalyticsData = ReferralCode & {
  totalStoresRegistered: number;
  totalTopUpAmount: number;
  registeredStoresList: string[];
};

export function ReferralCodeAnalytics({ data, error }: { data: AnalyticsData[], error?: Error | null }) {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

  if (error) {
     return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal Memuat Kode Referral</AlertTitle>
            <AlertDescription>
                Tidak dapat mengambil data dari server. Pastikan Anda memiliki izin yang benar dan coba lagi.
            </AlertDescription>
        </Alert>
     )
  }

  if (data.length === 0) {
    return (
        <Card className="flex flex-col items-center justify-center text-center py-20">
            <CardHeader>
                <div className="mx-auto bg-muted rounded-full p-3">
                    <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">Tidak Ada Data</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Tidak ada data referral untuk periode yang dipilih atau belum ada kode yang dibuat.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((code) => (
        <Card key={code.id} className="flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="font-headline text-xl">{code.salesPersonName}</CardTitle>
                    <CardDescription className="font-mono text-sm">{code.id}</CardDescription>
                </div>
                 <Badge variant={code.isActive ? "default" : "destructive"} className={cn("text-xs", code.isActive ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "")}>
                    {code.isActive ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {code.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                <Users className="w-6 h-6 text-primary" />
                <div>
                    <p className="text-xs text-muted-foreground">Toko Didaftarkan</p>
                    <p className="text-lg font-bold">{code.totalStoresRegistered} Toko</p>
                </div>
            </div>
             <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                <Banknote className="w-6 h-6 text-primary" />
                <div>
                    <p className="text-xs text-muted-foreground">Total Top-up</p>
                    <p className="text-lg font-bold">{formatCurrency(code.totalTopUpAmount)}</p>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full" disabled={code.registeredStoresList.length === 0}>
                           Lihat Toko Terdaftar ({code.registeredStoresList.length})
                        </Button>
                    </TooltipTrigger>
                    {code.registeredStoresList.length > 0 && (
                        <TooltipContent side="top" align="center">
                            <ul className="list-disc pl-4 text-xs text-muted-foreground">
                                {code.registeredStoresList.map(storeName => <li key={storeName}>{storeName}</li>)}
                            </ul>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

}
