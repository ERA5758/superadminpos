"use client";

import { useState } from "react";
import type { Store } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Pencil, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";

export function StoresTable({ stores }: { stores: Store[] }) {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState(0);
    const { toast } = useToast();

    const handleOpenDialog = (store: Store) => {
        setSelectedStore(store);
        setOpenDialog(true);
    }

    const handleAdjustBalance = () => {
        if (!selectedStore) return;

        toast({
            title: "Balance Adjusted",
            description: `Successfully adjusted ${selectedStore.name}'s balance by ${adjustmentAmount}.`,
        });

        // Here you would call a server action to update the balance
        setOpenDialog(false);
        setAdjustmentAmount(0);
        setSelectedStore(null);
    }


  return (
    <>
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Token Balance</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">
                    <div>{store.name}</div>
                    <div className="text-xs text-muted-foreground">{store.owner}</div>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(store.tokenBalance)}
                </TableCell>
                <TableCell>
                    <div className="flex items-center">
                        <Switch id={`premium-${store.id}`} checked={store.isPremium} aria-label="Premium Subscription"/>
                        <Label htmlFor={`premium-${store.id}`} className="ml-2">{store.isPremium ? 'Yes' : 'No'}</Label>
                    </div>
                </TableCell>
                <TableCell>
                  <Badge variant={store.status === "active" ? "default" : "destructive"} className={store.status === "active" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20" : ""}>
                    {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenDialog(store)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Adjust Token Balance
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                {store.isPremium ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                {store.isPremium ? 'Unsubscribe Premium' : 'Upgrade to Premium'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className={store.status === 'active' ? 'text-destructive' : 'text-emerald-600'}>
                                {store.status === 'active' ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                {store.status === 'active' ? 'Deactivate' : 'Activate'} Store
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Adjust Token Balance</DialogTitle>
            <DialogDescription>
              Manually adjust the token balance for {selectedStore?.name}. Enter a positive value to add, or a negative value to subtract.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" onClick={handleAdjustBalance}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
