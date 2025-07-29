import { Metadata } from "next";
import { FileText, Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Applications | DomusEye",
  description: "Review and manage tenant applications for your properties",
};

// Mock data for applications
const applications = [
  {
    id: 1,
    applicantName: "John Smith",
    propertyTitle: "Modern Downtown Apartment",
    applicationDate: "2024-01-15",
    status: "pending",
    monthlyIncome: "$5,000",
    creditScore: 750,
  },
  {
    id: 2,
    applicantName: "Sarah Johnson",
    propertyTitle: "Luxury Family Home",
    applicationDate: "2024-01-14",
    status: "approved",
    monthlyIncome: "$8,500",
    creditScore: 820,
  },
  {
    id: 3,
    applicantName: "Mike Davis",
    propertyTitle: "Cozy Studio Loft",
    applicationDate: "2024-01-13",
    status: "rejected",
    monthlyIncome: "$3,200",
    creditScore: 650,
  },
];

export default function ApplicationsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Applications
        </h1>
        <p className="text-lg text-muted-foreground">
          Review and manage tenant applications for your properties
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            className="w-full pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {applications.map((application) => (
          <Card key={application.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(application.status)}
                  <div>
                    <CardTitle className="text-xl">{application.applicantName}</CardTitle>
                    <CardDescription>{application.propertyTitle}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(application.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Application Date</p>
                  <p className="font-medium">{application.applicationDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Income</p>
                  <p className="font-medium">{application.monthlyIncome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credit Score</p>
                  <p className="font-medium">{application.creditScore}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                {application.status === "pending" && (
                  <>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}