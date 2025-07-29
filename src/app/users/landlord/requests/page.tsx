import { Metadata } from "next";
import { MessageSquare, Search, Filter, Clock, CheckCircle, AlertCircle, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Requests | DomusEye",
  description: "Manage maintenance requests and tenant communications",
};

// Mock data for requests
const requests = [
  {
    id: 1,
    tenantName: "John Smith",
    propertyTitle: "Modern Downtown Apartment",
    requestType: "Maintenance",
    subject: "Leaky faucet in kitchen",
    description: "The kitchen faucet has been dripping constantly for the past week. It's getting worse and needs immediate attention.",
    priority: "high",
    status: "pending",
    createdDate: "2024-01-15",
    tenantImage: "/assets/images/tenant-1.jpg",
  },
  {
    id: 2,
    tenantName: "Sarah Johnson",
    propertyTitle: "Luxury Family Home",
    requestType: "General Inquiry",
    subject: "Lease renewal question",
    description: "I would like to discuss the possibility of renewing my lease for another year. Could we schedule a meeting?",
    priority: "medium",
    status: "in-progress",
    createdDate: "2024-01-14",
    tenantImage: "/assets/images/tenant-2.jpg",
  },
  {
    id: 3,
    tenantName: "Mike Davis",
    propertyTitle: "Cozy Studio Loft",
    requestType: "Maintenance",
    subject: "Air conditioning not working",
    description: "The AC unit stopped working yesterday. The apartment is getting very hot and uncomfortable.",
    priority: "urgent",
    status: "completed",
    createdDate: "2024-01-13",
    tenantImage: "/assets/images/tenant-3.jpg",
  },
];

export default function RequestsPage() {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Requests
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage maintenance requests and communications from your tenants
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            className="w-full pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.tenantImage} alt={request.tenantName} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{request.subject}</CardTitle>
                      <CardDescription>
                        {request.tenantName} • {request.propertyTitle}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(request.priority)}
                  {getStatusBadge(request.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Type: {request.requestType}</span>
                  <span>•</span>
                  <span>Created: {request.createdDate}</span>
                </div>
                
                <p className="text-sm">{request.description}</p>
                
                <div className="flex gap-2">
                  <Button size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Respond
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {request.status === "pending" && (
                    <Button size="sm" variant="secondary">
                      Mark In Progress
                    </Button>
                  )}
                  {request.status === "in-progress" && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}