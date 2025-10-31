
'use client';

import { useState, useEffect } from 'react';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { StoresTable } from '@/components/stores/stores-table';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Store, Transaction } from "@/lib/types";
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { subDays } from 'date-fns';

export default function StoresPage() {
  const firestore = useFirestore();

  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [showInactive, setShowInactive] = useState(false);

  // --- Data Fetching ---
  const storesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'stores'), orderBy('name', 'asc'));
  }, [firestore]);
  
  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // We only care about 'pos' transactions for sales activity
    return query(collection(firestore, 'transactions'));
  }, [firestore]);

  const { data: stores, isLoading: isLoadingStores } = useCollection<Store>(storesQuery);
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);
  
  // --- Filtering Logic ---
  useEffect(() => {
    if (!stores) {
      setFilteredStores([]);
      return;
    }

    if (showInactive && transactions) {
        const oneWeekAgo = subDays(new Date(), 7);

        // Create a map of the last transaction date for each store
        const lastTransactionMap = new Map<string, Date>();
        transactions.forEach(tx => {
            if (tx.type !== 'pos' || !tx.createdAt) return;

            const txDate = tx.createdAt instanceof Timestamp ? tx.createdAt.toDate() : new Date(tx.createdAt as string);
            const currentLastDate = lastTransactionMap.get(tx.storeId);
            
            if (!currentLastDate || txDate > currentLastDate) {
                lastTransactionMap.set(tx.storeId, txDate);
            }
        });

        // Filter stores based on the last transaction date
        const inactiveStores = stores.filter(store => {
            const lastTxDate = lastTransactionMap.get(store.id);
            // A store is inactive if it has no transactions at all,
            // or its last transaction was more than a week ago.
            return !lastTxDate || lastTxDate < oneWeekAgo;
        });

        setFilteredStores(inactiveStores);
    } else {
      // If the filter is off, or transactions haven't loaded yet, show all stores.
      setFilteredStores(stores);
    }

  }, [stores, transactions, showInactive]);


  const isLoading = isLoadingStores || isLoadingTransactions;

  if (isLoading && !stores) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className='pt-6'>
            <div className="flex items-center space-x-2">
                <Switch 
                    id="inactive-filter" 
                    checked={showInactive}
                    onCheckedChange={setShowInactive}
                />
                <Label htmlFor="inactive-filter">Filter Toko Tidak Aktif (tidak ada penjualan &gt; 7 hari)</Label>
            </div>
        </CardContent>
      </Card>
      <StoresTable stores={filteredStores || []} />
    </div>
  );
}
