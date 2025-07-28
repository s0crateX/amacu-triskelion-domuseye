"use client";

import {
  Home,
  MapPin,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Bed,
  Bath,
  MessageSquare,
  Phone,
  Settings,
  FileText,
  TrendingUp,
  Building,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import MaintenanceRequestDialog from "./widgets/home-widgets/maintenance-request-dialog";
import OnlinePaymentDialog from "./widgets/home-widgets/online-payment-dialog";

// Sample data
const currentRental = {
  id: 1,
  title: "Modern 2BR Apartment in Makati",
  location: "Makati City, Metro Manila",
  monthlyRent: "₱35,000",
  leaseStart: "January 15, 2024",
  leaseEnd: "January 14, 2025",
  bedrooms: 2,
  bathrooms: 2,
  area: "75 sqm",
  floor: "12th Floor",
  unitNumber: "Unit 1205",
  image: "/assets/images/property1.jpg",
  amenities: ["WiFi", "AC", "Parking", "Security", "Gym", "Pool"],
  landlord: {
    name: "Maria Santos",
    phone: "+63 917 123 4567",
    email: "maria.santos@email.com",
  },
};

const outstandingDues = [
  {
    id: 1,
    type: "Monthly Rent",
    amount: "₱35,000",
    dueDate: "December 15, 2024",
    status: "overdue",
    daysOverdue: 5,
  },
  {
    id: 2,
    type: "Electricity Bill",
    amount: "₱2,500",
    dueDate: "December 20, 2024",
    status: "pending",
    daysOverdue: 0,
  },
  {
    id: 3,
    type: "Water Bill",
    amount: "₱800",
    dueDate: "December 25, 2024",
    status: "pending",
    daysOverdue: 0,
  },
];

const recentPayments = [
  {
    id: 1,
    type: "Monthly Rent",
    amount: "₱35,000",
    date: "November 15, 2024",
    status: "paid",
  },
  {
    id: 2,
    type: "Electricity Bill",
    amount: "₱2,200",
    date: "November 18, 2024",
    status: "paid",
  },
];

const maintenanceRequests = [
  {
    id: 1,
    type: "AC Repair",
    status: "In Progress",
    priority: "high",
    date: "Dec 18, 2024",
  },
  {
    id: 2,
    type: "Plumbing Issue",
    status: "Pending",
    priority: "medium",
    date: "Dec 20, 2024",
  },
];

const quickStats = [
  {
    title: "Days Until Lease End",
    value: "28",
    icon: Calendar,
    trend: "neutral",
  },
  {
    title: "Payment History",
    value: "98%",
    icon: TrendingUp,
    trend: "positive",
  },
  {
    title: "Maintenance Requests",
    value: "2 Active",
    icon: Settings,
    trend: "neutral",
  },
];

export default function ModernTenantDashboard() {
  const { userData, loading } = useAuth();

  const handleMaintenanceSubmit = (formData: {
    title: string;
    category: string;
    priority: string;
    description: string;
    location: string;
    preferredTime: string;
    contactMethod: string;
    images: File[];
  }) => {
    // Here you would typically send the data to your backend
    console.log("Maintenance request submitted:", formData);
    
    // Show success message (you could use a toast notification here)
    alert("Maintenance request submitted successfully!");
  };

  const handlePaymentSubmit = (data: {
    paymentMethod: string;
    amount: string;
    billType: string;
    ewalletNumber?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  }) => {
    console.log('Payment submitted:', data);
    // Handle payment submission
  };

  // Map bill types from tenant page to payment dialog format
  const mapBillType = (billType: string): string => {
    const mapping: { [key: string]: string } = {
      'Monthly Rent': 'monthly-rent',
      'Electricity': 'electricity',
      'Water': 'water',
      'Internet': 'internet',
      'Maintenance Fee': 'maintenance-fee',
      'Security Deposit': 'security-deposit',
    };
    return mapping[billType] || 'other';
  };

  const totalOutstanding = outstandingDues.reduce((sum, due) => {
    return sum + parseFloat(due.amount.replace('₱', '').replace(',', ''));
  }, 0);

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show message if no user data is available
  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load user data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // Ensure user is a tenant
  if (userData.userType !== 'tenant') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Access denied. This page is only available for tenants.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Welcome home, {userData.firstName}! 👋
              </h2>
              <p className="text-muted-foreground">
                Here&apos;s everything you need to know about your rental
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Property Overview */}
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2 text-primary" />
                    Your Current Property
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                    View Details
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Property Image Placeholder */}
                  <div className="lg:w-1/3">
                    <div className="aspect-video lg:aspect-square bg-muted rounded-xl flex items-center justify-center">
                      <Home className="w-12 h-12 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="lg:w-2/3 space-y-4">
                    <div>
                      <h4 className="text-xl font-semibold text-foreground">{currentRental.title}</h4>
                      <div className="flex items-center text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{currentRental.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentRental.unitNumber}, {currentRental.floor}
                      </p>
                    </div>

                    {/* Property Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Bed className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-sm font-medium text-foreground">{currentRental.bedrooms}</p>
                        <p className="text-xs text-muted-foreground">Bedrooms</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Bath className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-sm font-medium text-foreground">{currentRental.bathrooms}</p>
                        <p className="text-xs text-muted-foreground">Bathrooms</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Home className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-sm font-medium text-foreground">{currentRental.area}</p>
                        <p className="text-xs text-muted-foreground">Area</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <p className="text-sm font-medium text-foreground">{currentRental.monthlyRent}</p>
                        <p className="text-xs text-muted-foreground">Monthly</p>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h5 className="font-medium text-foreground mb-2">Amenities</h5>
                      <div className="flex flex-wrap gap-2">
                        {currentRental.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Lease Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Lease Start</p>
                        <p className="font-medium text-foreground">{currentRental.leaseStart}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lease End</p>
                        <p className="font-medium text-foreground">{currentRental.leaseEnd}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Landlord Contact */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <CardTitle className="mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                  Landlord Contact
                </CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <p className="font-medium text-foreground">{currentRental.landlord.name}</p>
                    <p className="text-sm text-muted-foreground">{currentRental.landlord.email}</p>
                    <p className="text-sm text-muted-foreground">{currentRental.landlord.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" className="bg-green-600 hover:bg-green-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="default">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Requests */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-primary" />
                    Maintenance Requests
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-medium text-foreground">{request.type}</p>
                          <p className="text-sm text-muted-foreground">{request.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={request.priority === 'high' ? 'destructive' : request.priority === 'medium' ? 'default' : 'secondary'}>
                          {request.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{request.status}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* New Maintenance Request Dialog */}
                <MaintenanceRequestDialog onSubmit={handleMaintenanceSubmit} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Outstanding Dues */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                  Outstanding Dues
                </CardTitle>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  ₱{totalOutstanding.toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {outstandingDues.map((due) => (
                    <div key={due.id} className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      due.status === 'overdue' 
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800' 
                        : due.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">{due.type}</p>
                          <p className="text-xs opacity-75">Due: {due.dueDate}</p>
                        </div>
                        <p className="font-bold">{due.amount}</p>
                      </div>
                      {due.status === "overdue" && (
                        <p className="text-xs font-medium mb-2">
                          ⚠️ {due.daysOverdue} days overdue
                        </p>
                      )}
                      <OnlinePaymentDialog 
                        onSubmit={handlePaymentSubmit}
                        defaultAmount={due.amount.replace('₱', '').replace(',', '')}
                        billType={mapBillType(due.type)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950/20 dark:border-green-800">
                      <div>
                        <p className="font-medium text-sm text-green-900 dark:text-green-400">{payment.type}</p>
                        <p className="text-xs text-green-700 dark:text-green-500">{payment.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-green-900 dark:text-green-400">{payment.amount}</p>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                          ✓ Paid
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/20">
                  View Payment History
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <OnlinePaymentDialog onSubmit={handlePaymentSubmit} />
                  <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-3 text-primary" />
                      <span className="font-medium">Download Receipt</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-3 text-primary" />
                      <span className="font-medium">Report Issue</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}