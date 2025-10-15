import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Biaya Platform & Langganan</CardTitle>
          <CardDescription>
            Kelola biaya transaksi, AI, dan langganan untuk platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee-percentage">Persentase Biaya (%)</Label>
                <Input id="fee-percentage" type="number" defaultValue="1.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-fee">Biaya Minimum (Rp)</Label>
                <Input id="min-fee" type="number" defaultValue="500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-usage-fee">Biaya Penggunaan AI (per request)</Label>
              <Input id="ai-usage-fee" type="number" defaultValue="100" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="new-store-bonus">Bonus Token Toko Baru</Label>
              <Input id="new-store-bonus" type="number" defaultValue="10000" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
               <div className="space-y-2">
                <Label htmlFor="catalog-monthly">Langganan 1 Bulan (Rp)</Label>
                <Input id="catalog-monthly" type="number" defaultValue="50000" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="catalog-six-month">Langganan 6 Bulan (Rp)</Label>
                <Input id="catalog-six-month" type="number" defaultValue="250000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catalog-yearly">Langganan 1 Tahun (Rp)</Label>
                <Input id="catalog-yearly" type="number" defaultValue="450000" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Simpan Perubahan</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Informasi Rekening Bank</CardTitle>
          <CardDescription>
            Akun ini akan ditampilkan kepada toko untuk tujuan top-up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank-name">Nama Bank</Label>
              <Input id="bank-name" defaultValue="BCA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-holder">Nama Pemegang Rekening</Label>
              <Input id="account-holder" defaultValue="PT Chika Sejahtera" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Nomor Rekening</Label>
              <Input id="account-number" defaultValue="8881234567" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Simpan Perubahan</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Konfigurasi Notifikasi</CardTitle>
          <CardDescription>
            Kelola konfigurasi untuk notifikasi, mis. WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wa-device-id">Device ID WhatsApp</Label>
              <Input id="wa-device-id" defaultValue="device_12345" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa-admin-group">Grup Admin WhatsApp</Label>
              <Input id="wa-admin-group" defaultValue="admin_group_xyz" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Simpan Perubahan</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

