
'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { ReferralCodesTable } from '@/components/referral-codes/referral-codes-table';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReferralCode } from "@/lib/types";
import { Card, CardContent } from '@/components/ui/card';

export default function ReferralCodesPage() {
  const firestore = useFirestore();

  const codesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'referralCode'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: codes, isLoading } = useCollection<ReferralCode>(codesQuery);

  if (isLoading) {
    return (
        <Card>
            <CardContent className='pt-6'>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <div>
      <ReferralCodesTable codes={codes || []} />
    </div>
  );
}
