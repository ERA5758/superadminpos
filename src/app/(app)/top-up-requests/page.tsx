'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { TopUpRequestsTable } from '@/components/top-up-requests/top-up-requests-table';
import { collectionGroup, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { TopUpRequest } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function TopUpRequestsPage() {
  const firestore = useFirestore();

  const topUpRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Use a collection group query to get all topUpRequests from all stores.
    // This requires a Firestore index.
    return query(collectionGroup(firestore, 'topUpRequests'), orderBy('requestDate', 'desc'));
  }, [firestore]);

  const { data: requests, isLoading, error } = useCollection<TopUpRequest>(topUpRequestsQuery);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    const isIndexError = error.message.includes("requires an index") || error.message.includes("The query requires an index");
    const firestoreIndexUrlMatch = error.message.match(/(https?:\/\/[^\s]+)/);
    const firestoreIndexUrl = firestoreIndexUrlMatch ? firestoreIndexUrlMatch[0] : null;

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Mengambil Data</AlertTitle>
        <AlertDescription>
          {isIndexError && firestoreIndexUrl ? (
            <>
              <p className="mb-2">Query Firestore memerlukan indeks komposit yang belum dibuat. Ini adalah penyebab umum mengapa daftar ini kosong.</p>
              <p>Silakan klik tautan di bawah ini untuk membuat indeks di Firebase Console, lalu tunggu beberapa menit hingga indeks selesai dibuat sebelum memuat ulang halaman ini.</p>
              <a
                href={firestoreIndexUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 mt-2 inline-block"
              >
                Buat Indeks Firestore
              </a>
            </>
          ) : (
            <p>Terjadi kesalahan saat mengambil data: {error.message}. Pastikan aturan keamanan Firestore Anda mengizinkan query 'collectionGroup' pada 'topUpRequests'.</p>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  // Sort requests to show 'tertunda' status first
  const sortedRequests = requests?.sort((a, b) => {
    if (a.status === 'tertunda' && b.status !== 'tertunda') return -1;
    if (a.status !== 'tertunda' && b.status === 'tertunda') return 1;
    return 0; // Keep original order for other statuses
  });

  return (
    <div>
      <TopUpRequestsTable requests={sortedRequests || []} />
    </div>
  );
}
