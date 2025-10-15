"use client";

import type { TopUpRequest } from "@/lib/types";
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
import { CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function TopUpRequestsTable({ requests }: { requests: TopUpRequest[] }) {
    const { toast } = useToast();

    const handleAction = (request: TopUpRequest, action: 'approve' | 'reject') => {
        toast({
            title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
            description: `Top-up request for ${request.storeName} has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
        });
        // Here you would typically call a server action to update the request status
    };

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.storeName}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(request.amount)}
                </TableCell>
                <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.status === "approved"
                        ? "default"
                        : request.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                    className={cn(
                        request.status === "approved" && "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20",
                        request.status === "pending" && "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20",
                        request.status === "rejected" && "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20"
                    )}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {request.status === "pending" ? (
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100" onClick={() => handleAction(request, 'approve')}>
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="sr-only">Approve</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => handleAction(request, 'reject')}>
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Reject</span>
                      </Button>
                    </div>
                  ) : (
                     <div className="flex items-center justify-end text-muted-foreground">
                        {request.status === 'approved' ? <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" /> : <XCircle className="h-4 w-4 mr-2 text-destructive" />}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                     </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
