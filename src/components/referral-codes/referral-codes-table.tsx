
'use client';

import { useState } from 'react';
import type { ReferralCode } from "@/lib/types";
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
import { MoreHorizontal, ToggleLeft, ToggleRight, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { cn } from "@/lib/utils";

export type AnalyticsData = ReferralCode & {
  totalStoresRegistered: number;
  totalTopUpAmount: number;
  registeredStoresList: string[];
};

export function ReferralCodesTable({ data }: { data: AnalyticsData[] }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleToggleActive = (code: AnalyticsData) => {
        if (!firestore) return;
        const codeRef = doc(firestore, "referralCode", code.id);
        const newStatus = !code.isActive;
        updateDocumentNonBlocking(codeRef, { isActive: newStatus });
        toast({
            title: `Kode ${newStatus ? 'Diaktifkan' : 'Dinonaktifkan'}`,
            description: `Kode referral ${code.id} telah ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
        });
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
        <Card>
            <CardContent className="pt-6">
                <Table>
                    {data.length === 0 && <TableCaption>Tidak ada data untuk periode yang dipilih.</TableCaption>}
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Sales</TableHead>
                            <TableHead>Kode Referral</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Toko Terdaftar</TableHead>
                            <TableHead>Total Top-up</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((code) => (
                            <TableRow key={code.id}>
                                <TableCell className="font-medium">{code.salesPersonName}</TableCell>
                                <TableCell className="font-mono">{code.id}</TableCell>
                                <TableCell>
                                    <Badge variant={code.isActive ? "default" : "destructive"} className={cn("text-xs", code.isActive ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20" : "")}>
                                        {code.isActive ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span>{code.totalStoresRegistered}</span>
                                    {code.registeredStoresList.length > 0 && (
                                      <TooltipProvider>
                                          <Tooltip>
                                              <TooltipTrigger asChild>
                                                  <button className="text-muted-foreground hover:text-foreground">
                                                    <Info className="h-3.5 w-3.5" />
                                                  </button>
                                              </TooltipTrigger>
                                              <TooltipContent side="top" align="center">
                                                  <p className="font-medium mb-1">Toko yang Didaftarkan:</p>
                                                  <ul className="list-disc pl-4 text-xs text-muted-foreground">
                                                      {code.registeredStoresList.map(storeName => <li key={storeName}>{storeName}</li>)}
                                                  </ul>
                                              </TooltipContent>
                                          </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{formatCurrency(code.totalTopUpAmount)}</TableCell>
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
                                            <DropdownMenuItem onClick={() => handleToggleActive(code)} className={!code.isActive ? 'text-emerald-600 focus:text-emerald-600' : 'text-destructive focus:text-destructive'}>
                                                 {code.isActive ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                                {code.isActive ? 'Nonaktifkan' : 'Aktifkan'} Kode
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
    );
}
