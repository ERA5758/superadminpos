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
          <CardTitle className="font-headline">Platform Fees</CardTitle>
          <CardDescription>
            Manage transaction fees for the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-fee">Transaction Fee (%)</Label>
              <Input
                id="transaction-fee"
                type="number"
                defaultValue="2.5"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdrawal-fee">Withdrawal Fee (Fixed)</Label>
              <Input id="withdrawal-fee" type="number" defaultValue="1.00" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Bank Account Information</CardTitle>
          <CardDescription>
            This account will be used for store top-ups.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input id="bank-name" defaultValue="Global Bank Inc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-holder">Account Holder Name</Label>
              <Input id="account-holder" defaultValue="Chika POS Global" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input id="account-number" defaultValue="123-456-7890" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Promotions</CardTitle>
          <CardDescription>
            Manage promotional content on the login page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promo-title">Promotion Title</Label>
              <Input id="promo-title" defaultValue="Special Offer!" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-description">Description</Label>
              <Input id="promo-description" defaultValue="Get 50% off on your first transaction fee." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-image-url">Image URL</Label>
              <Input id="promo-image-url" defaultValue="https://example.com/promo.png" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
