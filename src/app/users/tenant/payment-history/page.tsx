"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Download, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock 
} from "lucide-react";

// Mock payment data
const paymentHistory = [
  {
    id: "PAY-001",
    date: "2024-01-15",
    amount: 1200.00,
    property: "Sunset Apartments - Unit 3B",
    method: "Credit Card",
    status: "completed",
    description: "Monthly Rent - January 2024",
    transactionId: "TXN-789456123"
  },
  {
    id: "PAY-002",
    date: "2023-12-15",
    amount: 1200.00,
    property: "Sunset Apartments - Unit 3B",
    method: "Bank Transfer",
    status: "completed",
    description: "Monthly Rent - December 2023",
    transactionId: "TXN-789456122"
  },
  {
    id: "PAY-003",
    date: "2023-11-15",
    amount: 1200.00,
    property: "Sunset Apartments - Unit 3B",
    method: "Credit Card",
    status: "completed",
    description: "Monthly Rent - November 2023",
    transactionId: "TXN-789456121"
  },
  {
    id: "PAY-004",
    date: "2023-10-15",
    amount: 1200.00,
    property: "Sunset Apartments - Unit 3B",
    method: "Credit Card",
    status: "failed",
    description: "Monthly Rent - October 2023",
    transactionId: "TXN-789456120"
  },
  {
    id: "PAY-005",
    date: "2023-10-18",
    amount: 1200.00,
    property: "Sunset Apartments - Unit 3B",
    method: "Bank Transfer",
    status: "completed",
    description: "Monthly Rent - October 2023 (Retry)",
    transactionId: "TXN-789456119"
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Completed</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "pending":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Pending</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default function PaymentHistoryPage() {
  const totalPaid = paymentHistory
    .filter(payment => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleDownloadReceipt = (paymentId: string) => {
    // In a real app, this would download the actual receipt
    console.log(`Downloading receipt for payment ${paymentId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment History</h1>
        <p className="text-muted-foreground">
          View and manage your rental payment history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jan 15, 2024</div>
            <p className="text-xs text-muted-foreground">
              $1,200.00 - Completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Up to Date</div>
            <p className="text-xs text-muted-foreground">
              No outstanding payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            A complete record of all your rental payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {new Date(payment.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {payment.property}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {payment.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        {payment.method}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        {getStatusBadge(payment.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Payment Methods</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Credit/Debit Cards (Visa, MasterCard, Amex)</li>
                <li>• Bank Transfer (ACH)</li>
                <li>• Online Banking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Payment Schedule</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Monthly rent due on the 15th</li>
                <li>• Late fees apply after 5-day grace period</li>
                <li>• Automatic payments available</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}