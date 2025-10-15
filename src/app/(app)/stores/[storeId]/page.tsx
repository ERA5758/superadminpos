
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import type { Store } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, User, Building, Wallet, GanttChartSquare, CalendarClock, Shield, UserCog } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function StoreDetailPage() {
  const params = useParams();
  const firestore = useFirestore();
  const storeId = params.storeId as string;
  const ownerAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

  const storeRef = useMemoFirebase(() => {
    if (!firestore || !storeId) return null;
    return doc(firestore, 'stores', storeId);
  }, [firestore, storeId]);

  const { data: store, isLoading } = useDoc<Store>(storeRef);

  const formatNumber = (amount: number | undefined) => {
    if (amount === undefined) return '0';
    return new Intl.NumberFormat('id-ID').format(amount);
  };
  
  const isStorePremium = (store: Store | null): boolean => {
    if (!store || !store.premiumCatalogSubscriptionExpiry) return false;
    const expiryDate = (store.premiumCatalogSubscriptionExpiry as Timestamp).toDate();
    return expiryDate > new Date();
  }

  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-5 w-48" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full md:col-span-1" />
            </div>
        </div>
    );
  }

  if (!store) {
    return <div>Toko tidak ditemukan.</div>;
  }

  const premium = isStorePremium(store);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
            <Avatar className="h-24 w-24 rounded-lg border">
                <AvatarImage src={`https://picsum.photos/seed/${store.id}/200`} data-ai-hint="store logo" />
                <AvatarFallback className='rounded-lg text-3xl'>
                    {store.name.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className="mt-4 sm:mt-0">
                <div className='flex items-center gap-3'>
                    <h1 className="text-3xl font-bold font-headline">{store.name}</h1>
                    <Badge variant={store.isActive ? "default" : "destructive"} className={store.isActive ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20" : ""}>
                        {store.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                    {premium && <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20">Premium</Badge>}
                </div>
                <p className="text-muted-foreground mt-1">{store.description || 'Tidak ada deskripsi toko.'}</p>
            </div>
        </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><Building className="mr-2" /> Informasi Toko</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex items-start">
                    <MapPin className="mr-3 mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{store.address || 'Alamat tidak tersedia'}</span>
                </div>
                <div className="flex items-center">
                    <Wallet className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>Saldo Token: <strong>{formatNumber(store.pradanaTokenBalance)}</strong></span>
                </div>
                {store.premiumCatalogSubscriptionExpiry && (
                    <div className="flex items-center">
                        <CalendarClock className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span>Premium hingga: <strong>{format((store.premiumCatalogSubscriptionExpiry as Timestamp).toDate(), 'd MMMM yyyy')}</strong></span>
                    </div>
                )}
                 <div className="flex items-start">
                    <User className="mr-3 mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Pemilik: <strong>{store.ownerName}</strong></span>
                </div>
                <div className="flex items-center">
                    <Mail className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>{store.contactEmail || 'Email tidak tersedia'}</span>
                </div>
                <div className="flex items-center">
                    <Phone className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>{store.contactPhone || 'Telepon tidak tersedia'}</span>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-headline text-lg flex items-center"><UserCog className="mr-2" /> Admin Toko</CardTitle>
                <Button variant="outline" size="sm">Kelola Admin</Button>
            </CardHeader>
            <CardContent>
                {(!store.adminUids || store.adminUids.length === 0) ? (
                    <div className='text-sm text-muted-foreground py-4 text-center'>Belum ada admin yang ditugaskan.</div>
                ) : (
                    <ul className='space-y-3 text-sm pt-2'>
                        {store.adminUids.map(uid => (
                            <li key={uid} className="flex items-center">
                                <Shield className="mr-3 h-4 w-4 text-muted-foreground" />
                                <span className='font-mono text-xs'>{uid}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    