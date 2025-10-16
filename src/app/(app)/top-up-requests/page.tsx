
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { TopUpRequestsTable } from '@/components/top-up-requests/top-up-requests-table';
import { Skeleton } from '@/components/ui/skeleton';
import type { TopUpRequest } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function TopUpRequestsPage() {
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState<'pending' | 'disetujui' | 'ditolak'>('pending');

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'topUpRequests'), 
        where('status', '==', activeTab)
        // orderBy('requestDate', 'desc') -> This causes an error without a composite index
    );
  }, [firestore, activeTab]);

  const { data: requests, isLoading, error } = useCollection<TopUpRequest>(requestsQuery);

  if (error) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Error Memuat Data</CardTitle>
                <CardDescription>Tidak dapat mengambil data permintaan top-up.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Query Gagal</AlertTitle>
                    <AlertDescription>
                        <p>Firestore tidak dapat menyelesaikan query untuk mengambil permintaan top-up. Ini sering terjadi jika indeks yang diperlukan belum dibuat.</p>
                        <p className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                            {error.message}
                        </p>
                        <p className="mt-4">
                            <strong>Solusi:</strong> Buat indeks komposit di Firebase Console. Anda mungkin akan melihat link untuk membuatnya secara otomatis di log error Firebase Console.
                        </p>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className='mb-4'>
            <TabsTrigger value="pending">Tertunda</TabsTrigger>
            <TabsTrigger value="disetujui">Disetujui</TabsTrigger>
            <TabsTrigger value="ditolak">Ditolak</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
             {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <TopUpRequestsTable requests={requests || []} />
            )}
        </TabsContent>
    </Tabs>
  );
}
