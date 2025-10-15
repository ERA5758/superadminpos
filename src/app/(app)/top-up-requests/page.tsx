'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { TopUpRequestsTable } from '@/components/top-up-requests/top-up-requests-table';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { TopUpRequest } from "@/lib/types";

export default function TopUpRequestsPage() {
  const firestore = useFirestore();

  const topUpRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'top_up_requests'), orderBy('requestDate', 'desc'));
  }, [firestore]);

  const { data: requests, isLoading } = useCollection<TopUpRequest>(topUpRequestsQuery);

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
