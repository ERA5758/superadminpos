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
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Biaya Platform</CardTitle>
          <CardDescription>
            Kelola biaya transaksi untuk platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-fee">Biaya Transaksi (%)</Label>
              <Input
                id="transaction-fee"
                type="number"
                defaultValue="2.5"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdrawal-fee">Biaya Penarikan (Tetap)</Label>
              <Input id="withdrawal-fee" type="number" defaultValue="1.00" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Simpan</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Informasi Rekening Bank</CardTitle>
          <CardDescription>
            Akun ini akan digunakan untuk isi ulang saldo toko.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank-name">Nama Bank</Label>
              <Input id="bank-name" defaultValue="Global Bank Inc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-holder">Nama Pemegang Rekening</Label>
              <Input id="account-holder" defaultValue="Chika POS Global" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Nomor Rekening</Label>
              <Input id="account-number" defaultValue="123-456-7890" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Simpan</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Promosi</CardTitle>
          <CardDescription>
            Kelola konten promosi di halaman login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promo-title">Judul Promosi</Label>
              <Input id="promo-title" defaultValue="Penawaran Spesial!" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-description">Deskripsi</Label>
              <Input id="promo-description" defaultValue="Dapatkan diskon 50% untuk biaya transaksi pertamamu." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-image-url">URL Gambar</Label>
              <Input id="promo-image-url" defaultValue="https://example.com/promo.png" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Simpan</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
