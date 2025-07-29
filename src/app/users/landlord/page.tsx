"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Star,
  Search,
  ArrowUpRight,
  Wrench,
  CreditCard,
  MapPin,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/auth-context";

// Enhanced sample data
const dashboardStats = [
  {
    title: "Total Properties",
    value: "12",
    change: "+2 this month",
    percentage: "+16.7%",
    icon: Building,
    trend: "up",
  },
  {
    title: "Active Tenants",
    value: "28",
    change: "+5 this month",
    percentage: "+21.7%",
    icon: Users,
    trend: "up",
  },
  {
    title: "Monthly Revenue",
    value: "₱420,000",
    change: "+₱45,000 from last month",
    percentage: "+12.0%",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Maintenance Request",
    value: "5",
    change: "+2 this week",
    percentage: "+40%",
    icon: Wrench,
    trend: "up",
  },
];

const sampleProperties = [
  {
    id: 1,
    title: "Modern 2BR Apartment",
    location: "Makati City",
    rent: "₱35,000",
    tenant: "John Doe",
    tenantPhone: "+63 917 123 4567",
    tenantEmail: "john.doe@email.com",
    status: "occupied",
    occupancy: 100,
    nextPayment: "2024-02-01",
    rating: 4.8,
    maintenanceStatus: "good",
    leaseEnd: "2024-12-31",
  },
  {
    id: 2,
    title: "Cozy Studio Unit",
    location: "BGC, Taguig",
    rent: "₱28,000",
    tenant: "Jane Smith",
    tenantPhone: "+63 917 987 6543",
    tenantEmail: "jane.smith@email.com",
    status: "occupied",
    occupancy: 100,
    nextPayment: "2024-02-05",
    rating: 4.6,
    maintenanceStatus: "needs_attention",
    leaseEnd: "2024-10-15",
  },
  {
    id: 3,
    title: "Family House",
    location: "Quezon City",
    rent: "₱50,000",
    tenant: null,
    status: "vacant",
    occupancy: 0,
    nextPayment: null,
    rating: 4.9,
    maintenanceStatus: "excellent",
    leaseEnd: null,
  },
];

const recentApplications = [
  {
    id: 1,
    applicant: "Maria Garcia",
    property: "Family House",
    date: "2024-01-15",
    status: "pending",
    phone: "+63 917 111 2222",
    email: "maria.garcia@email.com",
  },
  {
    id: 2,
    applicant: "Robert Chen",
    property: "Modern 2BR Apartment",
    date: "2024-01-14",
    status: "approved",
    phone: "+63 917 333 4444",
    email: "robert.chen@email.com",
  },
  {
    id: 3,
    applicant: "Lisa Wong",
    property: "Cozy Studio Unit",
    date: "2024-01-13",
    status: "rejected",
    phone: "+63 917 555 6666",
    email: "lisa.wong@email.com",
  },
];

const upcomingTasks = [
  {
    id: 1,
    task: "Rent collection from John Doe",
    dueDate: "2024-02-01",
    priority: "high",
    type: "payment",
  },
  {
    id: 2,
    task: "Property inspection - Studio Unit",
    dueDate: "2024-02-03",
    priority: "medium",
    type: "inspection",
  },
  {
    id: 3,
    task: "Lease renewal discussion - Jane Smith",
    dueDate: "2024-02-15",
    priority: "high",
    type: "lease",
  },
  {
    id: 4,
    task: "Maintenance check - Family House",
    dueDate: "2024-02-10",
    priority: "low",
    type: "maintenance",
  },
];

const maintenanceRequests = [
  {
    id: 1,
    property: "Modern 2BR Apartment",
    tenant: "John Doe",
    issue: "Leaking faucet in kitchen",
    priority: "medium",
    status: "pending",
    dateReported: "2024-01-20",
  },
  {
    id: 2,
    property: "Cozy Studio Unit",
    tenant: "Jane Smith",
    issue: "Air conditioning not cooling",
    priority: "high",
    status: "in_progress",
    dateReported: "2024-01-22",
  },
];

export default function LandlordDashboard() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  const getPriorityColor = (priority: "high" | "medium" | "low"): string => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (
    status: "completed" | "in_progress" | "pending" | string
  ) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {userData.firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening with your properties today
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-600 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stat.percentage}
                  </span>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-12 mb-8">
          {/* Left Column - 8 cols */}
          <div className="lg:col-span-8 space-y-6">
            {/* Properties Overview with Search */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Your Properties</CardTitle>
                    <CardDescription>
                      Manage and monitor your rental properties
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search properties..."
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Property
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {sampleProperties.map((property) => (
                    <Card
                      key={property.id}
                      className="border hover:border-primary/50 transition-colors"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {property.title}
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-muted-foreground ml-1">
                                  {property.rating}
                                </span>
                              </div>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property.location}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              property.status === "occupied"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {property.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Monthly Rent
                            </span>
                            <p className="font-semibold text-lg">
                              {property.rent}
                            </p>
                          </div>
                          {property.tenant && (
                            <div>
                              <span className="text-muted-foreground">
                                Tenant
                              </span>
                              <p className="font-medium">{property.tenant}</p>
                            </div>
                          )}
                        </div>

                        {property.tenant && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted p-2 rounded">
                            <span>Next Payment: {property.nextPayment}</span>
                            <span>Lease ends: {property.leaseEnd}</span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="mr-2 h-3 w-3" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          {property.tenant && (
                            <Button variant="outline" size="sm">
                              <Phone className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Requests
                </CardTitle>
                <CardDescription>
                  Track and manage property maintenance issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                          <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium">{request.issue}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.property} • {request.tenant}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Reported: {request.dateReported}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            getPriorityColor(
                              request.priority as "high" | "medium" | "low"
                            ) as
                              | "default"
                              | "destructive"
                              | "outline"
                              | "secondary"
                          }
                        >
                          {request.priority}
                        </Badge>
                        {getStatusIcon(request.status)}
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 4 cols */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Tasks
                </CardTitle>
                <CardDescription>
                  Don&apos;t miss important deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.task}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.dueDate}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest rental applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {application.applicant}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {application.property}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {application.date}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "default"
                            : application.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start h-12">
                    <Plus className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Add New Property</div>
                      <div className="text-xs text-muted-foreground">
                        List a new rental
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-12">
                    <CreditCard className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Payment Tracking</div>
                      <div className="text-xs text-muted-foreground">
                        Monitor rent payments
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-12">
                    <BarChart3 className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Financial Reports</div>
                      <div className="text-xs text-muted-foreground">
                        View income & expenses
                      </div>
                    </div>
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
