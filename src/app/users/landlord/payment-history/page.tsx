import { Metadata } from "next";
import { CreditCard, Search, Filter, Download, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Payment History | DomusEye",
  description: "Track rental payments and financial transactions",
};

// Mock data for payment history
const payments = [
  {
    id: 1,
    tenantName: "John Smith",
    propertyTitle: "Modern Downtown Apartment",
    amount: 2500,
    paymentDate: "2024-01-01",
    dueDate: "2024-01-01",
    status: "paid",
    paymentMethod: "Bank Transfer",
    transactionId: "TXN-2024-001",
  },
  {
    id: 2,
    tenantName: "Sarah Johnson",
    propertyTitle: "Luxury Family Home",
    amount: 4200,
    paymentDate: "2024-01-03",
    dueDate: "2024-01-01",
    status: "paid",
    paymentMethod: "Credit Card",
    transactionId: "TXN-2024-002",
  },
  {
    id: 3,
    tenantName: "Mike Davis",
    propertyTitle: "Cozy Studio Loft",
    amount: 1800,
    paymentDate: null,
    dueDate: "2024-01-01",
    status: "overdue",
    paymentMethod: null,
    transactionId: null,
  },
  {
    id: 4,
    tenantName: "Emily Wilson",
    propertyTitle: "Garden View Apartment",
    amount: 2200,
    paymentDate: "2023-12-28",
    dueDate: "2024-01-01",
    status: "paid",
    paymentMethod: "Bank Transfer",
    transactionId: "TXN-2023-156",
  },
];

// Mock summary data
const summary = {
  totalCollected: 10700,
  pendingAmount: 1800,
  totalProperties: 4,
  collectionRate: 85.6,
};

export default function PaymentHistoryPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-foreground">
            Payment History
          </h1>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
        <p className="text-lg text-muted-foreground">
          Track rental payments and monitor your property income
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalCollected)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProperties}</div>
            <p className="text-xs text-muted-foreground">Generating income</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.collectionRate}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="w-full pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Track all rental payments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.tenantName}</p>
                    <p className="text-sm text-muted-foreground">{payment.propertyTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {payment.dueDate}
                      {payment.paymentDate && ` • Paid: ${payment.paymentDate}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(payment.amount)}</p>
                    {payment.paymentMethod && (
                      <p className="text-xs text-muted-foreground">{payment.paymentMethod}</p>
                    )}
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}