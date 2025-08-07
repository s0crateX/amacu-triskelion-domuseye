"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  orderBy,
} from "firebase/firestore";
import { PropertyTenant } from "@/types/property";

interface TenantApplication {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  email: string;
  message: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "awaiting_tenant_confirmation"
    | "confirmed"
    | "declined_by_tenant";
  appliedAt: string;
  updatedAt?: string;
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
} from "lucide-react";
import { toast } from "sonner";

export default function TenantApplicationPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApplications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const applicationsQuery = query(
        collection(db, "users", user.uid, "applications"),
        orderBy("appliedAt", "desc")
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);

      const applicationsData: TenantApplication[] = [];
      applicationsSnapshot.forEach((doc) => {
        const data = doc.data();
        applicationsData.push({
          id: doc.id,
          ...data,
        } as TenantApplication);
      });

      setApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  const handleTenantConfirmation = async (
    applicationId: string,
    confirm: boolean
  ) => {
    if (!user) return;

    try {
      const newStatus = confirm ? "confirmed" : "declined_by_tenant";

      // Find the application to get property details
      const application = applications.find((app) => app.id === applicationId);
      if (!application) {
        toast.error("Application not found");
        return;
      }

      // Update the application in the tenant's subcollection
      const tenantApplicationRef = doc(
        db,
        "users",
        user.uid,
        "applications",
        applicationId
      );
      await updateDoc(tenantApplicationRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Update the application in the property's subcollection
      const propertyApplicationRef = doc(
        db,
        "properties",
        application.propertyId,
        "applications",
        applicationId
      );
      await updateDoc(propertyApplicationRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // If confirmed, add tenant to property's tenants subcollection
      if (confirm) {
        const propertyTenantRef = doc(
          db,
          "properties",
          application.propertyId,
          "tenants",
          user.uid
        );
        const tenantData: PropertyTenant = {
          userId: user.uid,
          name: application.tenantName,
          email: application.email,
          balance: 0,
          joinedAt: new Date(),
        };
        await setDoc(propertyTenantRef, tenantData);
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: newStatus as TenantApplication["status"],
                updatedAt: new Date().toISOString(),
              }
            : app
        )
      );

      toast.success(
        confirm
          ? "Application confirmed successfully! You are now a tenant of this property."
          : "Application declined successfully!"
      );
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "awaiting_tenant_confirmation":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "declined_by_tenant":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "awaiting_tenant_confirmation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "declined_by_tenant":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "awaiting_tenant_confirmation":
        return "Awaiting Your Confirmation";
      case "confirmed":
        return "Confirmed";
      case "declined_by_tenant":
        return "Declined by You";
      default:
        return status;
    }
  };

  const filteredApplications = applications.filter((app) =>
    app.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Applications</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track the status of your property applications
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by property title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Applications Found
            </h3>
            <p className="text-muted-foreground text-center">
              {applications.length === 0
                ? "You haven&apos;t submitted any applications yet."
                : "No applications match your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card
              key={application.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <CardTitle className="text-lg">
                        {application.propertyTitle}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>Property ID: {application.propertyId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <Badge
                      variant="outline"
                      className={getStatusColor(application.status)}
                    >
                      {getStatusLabel(application.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Applied:</span>
                    <span>
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {application.updatedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated:</span>
                      <span>
                        {new Date(application.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span>{application.email}</span>
                  </div>
                </div>

                {application.message && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Message</h4>
                    <p className="text-sm text-muted-foreground">
                      {application.message}
                    </p>
                  </div>
                )}

                {application.status === "awaiting_tenant_confirmation" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        🎉 Congratulations! Your application has been approved
                        by the landlord.
                      </p>
                      <p className="text-sm text-blue-700">
                        Please confirm if you want to proceed with this property
                        or decline if you&apos;ve changed your mind.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() =>
                          handleTenantConfirmation(application.id, true)
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Application
                      </Button>
                      <Button
                        onClick={() =>
                          handleTenantConfirmation(application.id, false)
                        }
                        variant="outline"
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline Application
                      </Button>
                    </div>
                  </div>
                )}

                {application.status === "confirmed" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        ✅ Application Confirmed! You have successfully
                        confirmed this application.
                      </p>
                    </div>
                  </div>
                )}

                {application.status === "declined_by_tenant" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium">
                        ❌ Application Declined. You have declined this approved
                        application.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
