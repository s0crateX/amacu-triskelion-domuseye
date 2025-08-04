"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  DollarSign,
  Eye,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  FileText,
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

// Enhanced sample data for agent dashboard
const dashboardStats = [
  {
    title: "Pending Verifications",
    value: "12",
    change: "+3 this week",
    percentage: "+33.3%",
    icon: Clock,
    trend: "up",
  },
  {
    title: "Verified Properties",
    value: "156",
    change: "+24 this month",
    percentage: "+18.2%",
    icon: CheckCircle,
    trend: "up",
  },
  {
    title: "Active Landlords",
    value: "89",
    change: "+7 this month",
    percentage: "+8.5%",
    icon: Users,
    trend: "up",
  },
  {
    title: "Properties Rejected",
    value: "3",
    change: "-2 from last month",
    percentage: "-40%",
    icon: AlertTriangle,
    trend: "down",
  },
];

const sampleProperties = [
  {
    id: 1,
    title: "Luxury 3BR Condo",
    location: "BGC, Taguig",
    price: "₱45,000/month",
    status: "pending_verification",
    submittedDate: "2024-01-20",
    landlord: "Maria Santos",
    landlordPhone: "+63 917 123 4567",
    landlordEmail: "maria.santos@email.com",
    documents: ["Property Title", "Tax Declaration", "Photos"],
    priority: "high",
  },
  {
    id: 2,
    title: "Modern Townhouse",
    location: "Alabang, Muntinlupa",
    price: "₱8,500,000",
    status: "verified",
    submittedDate: "2024-01-15",
    verifiedDate: "2024-01-18",
    landlord: "John Rodriguez",
    landlordPhone: "+63 917 987 6543",
    landlordEmail: "john.rodriguez@email.com",
    documents: [
      "Property Title",
      "Tax Declaration",
      "Photos",
      "Building Permit",
    ],
    priority: "medium",
  },
  {
    id: 3,
    title: "Studio Apartment",
    location: "Makati City",
    price: "₱25,000/month",
    status: "needs_revision",
    submittedDate: "2024-01-18",
    landlord: "Lisa Chen",
    landlordPhone: "+63 917 555 7890",
    landlordEmail: "lisa.chen@email.com",
    documents: ["Property Title", "Photos"],
    priority: "low",
    rejectionReason: "Missing tax declaration and building permits",
  },
];

const recentInquiries = [
  {
    id: 1,
    client: "Robert Kim",
    property: "Luxury 3BR Condo",
    date: "2024-01-20",
    status: "new",
    phone: "+63 917 111 2222",
    email: "robert.kim@email.com",
    message: "Interested in scheduling a viewing this weekend.",
  },
  {
    id: 2,
    client: "Sarah Johnson",
    property: "Modern Townhouse",
    date: "2024-01-19",
    status: "responded",
    phone: "+63 917 333 4444",
    email: "sarah.johnson@email.com",
    message: "Looking for family home with good schools nearby.",
  },
  {
    id: 3,
    client: "Michael Wong",
    property: "Studio Apartment",
    date: "2024-01-18",
    status: "scheduled",
    phone: "+63 917 555 6666",
    email: "michael.wong@email.com",
    message: "Ready to make an offer if viewing goes well.",
  },
];

const upcomingTasks = [
  {
    id: 1,
    task: "Verify Luxury 3BR Condo documents",
    dueDate: "2024-01-22",
    priority: "high",
    type: "verification",
    landlord: "Maria Santos",
  },
  {
    id: 2,
    task: "Site inspection - Modern Townhouse",
    dueDate: "2024-01-23",
    priority: "high",
    type: "inspection",
    landlord: "John Rodriguez",
  },
  {
    id: 3,
    task: "Follow up with Lisa Chen on missing documents",
    dueDate: "2024-01-24",
    priority: "medium",
    type: "follow-up",
    landlord: "Lisa Chen",
  },
  {
    id: 4,
    task: "Review new landlord applications",
    dueDate: "2024-01-25",
    priority: "medium",
    type: "review",
  },
];

export default function AgentDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const { userData } = useAuth();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "needs_revision":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "new":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "responded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "scheduled":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredProperties = sampleProperties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {userData?.firstName || "Agent"}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage property verifications and landlord relationships.
              </p>
            </div>
            <Button
              onClick={() => router.push("#/users/agent/verifications")}
              className="w-fit"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify Properties
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <span className="text-green-600 font-medium">
                      {stat.percentage}
                    </span>
                    <span>{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Properties Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      My Properties
                    </CardTitle>
                    <CardDescription>
                      Manage and track your property listings
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {property.title}
                          </h3>
                          <Badge className={getStatusColor(property.status)}>
                            {property.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{property.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium text-foreground">
                              {property.price}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>Landlord: {property.landlord}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{property.documents.length} documents</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted: {property.submittedDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              property.priority === "high"
                                ? "border-red-200 text-red-700"
                                : property.priority === "medium"
                                ? "border-yellow-200 text-yellow-700"
                                : "border-green-200 text-green-700"
                            }`}
                          >
                            {property.priority} priority
                          </Badge>
                          {property.rejectionReason && (
                            <Badge variant="destructive" className="text-xs">
                              Needs revision
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        {property.status === "pending_verification" && (
                          <>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button variant="outline" size="sm">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {property.status === "verified" && (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        )}
                        {property.status === "needs_revision" && (
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-1" />
                            Contact Landlord
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/users/agent/verifications")}
                  >
                    View All Verifications
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Inquiries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Recent Inquiries
                </CardTitle>
                <CardDescription>
                  Latest client inquiries and messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">
                          {inquiry.client}
                        </h4>
                        <Badge
                          className={getStatusColor(inquiry.status)}
                          variant="secondary"
                        >
                          {inquiry.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {inquiry.property}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {inquiry.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{inquiry.date}</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Upcoming Tasks
                </CardTitle>
                <CardDescription>
                  Your schedule for the next few days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {task.task}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {task.dueDate}
                          </span>
                          <Badge
                            className={getPriorityColor(task.priority)}
                            variant="secondary"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-2">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/users/agent/my-properties")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Property
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/users/agent/profile")}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/users/agent/support")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
