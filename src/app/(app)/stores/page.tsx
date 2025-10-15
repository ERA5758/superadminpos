'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { StoresTable } from '@/components/stores/stores-table';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Store } from "@/lib/types";

export default function StoresPage() {
  const firestore = useFirestore();

  const storesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'stores'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: stores, isLoading } = useCollection<Store>(storesQuery);

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

  return (
    <div>
      <StoresTable stores={stores || []} />
    </div>
  );
}
