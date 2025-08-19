"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  ChevronDown,
  Shield,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/auth-context";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TenantApplication } from "@/types/property";
import { toast } from "sonner";

interface ApplicationWithId extends TenantApplication {
  id: string;
  propertyId: string;
  applicationDate: string;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationWithId | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showFullImageDialog, setShowFullImageDialog] = useState(false);
  const [fullSizeImage, setFullSizeImage] = useState<{
    url: string;
    index: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchApplications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First, get all properties owned by the current landlord
      const propertiesQuery = query(
        collection(db, "properties"),
        where("uid", "==", user.uid)
      );
      const propertiesSnapshot = await getDocs(propertiesQuery);

      // Then, get all applications for these properties
      const allApplications: ApplicationWithId[] = [];

      for (const propertyDoc of propertiesSnapshot.docs) {
        const propertyId = propertyDoc.id;
        const applicationsQuery = collection(
          db,
          "properties",
          propertyId,
          "applications"
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);

        applicationsSnapshot.forEach((appDoc) => {
          const appData = appDoc.data() as TenantApplication;
          const applicationDate =
            appData.appliedAt &&
            typeof appData.appliedAt === "object" &&
            "toDate" in appData.appliedAt
              ? (appData.appliedAt as Timestamp)
                  .toDate()
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0];

          allApplications.push({
            ...appData,
            id: appDoc.id,
            propertyId,
            applicationDate,
          });
        });
      }

      // Sort by application date (newest first)
      allApplications.sort(
        (a, b) =>
          new Date(b.applicationDate).getTime() -
          new Date(a.applicationDate).getTime()
      );

      setApplications(allApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleStatusUpdate = async (
    applicationId: string,
    propertyId: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      // Find the application to get tenant details
      const application = applications.find((app) => app.id === applicationId);
      if (!application) {
        toast.error("Application not found");
        return;
      }

      // Determine the actual status to set
      const actualStatus =
        newStatus === "approved" ? "awaiting_tenant_confirmation" : "rejected";

      // Update the application status in the property's applications subcollection
      await updateDoc(
        doc(db, "properties", propertyId, "applications", applicationId),
        { status: actualStatus }
      );

      // Create/update the application in the tenant's user subcollection
      await setDoc(
        doc(db, "users", application.tenantId, "applications", applicationId),
        {
          ...application,
          status: actualStatus,
          updatedAt: new Date().toISOString(),
        }
      );

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: actualStatus } : app
        )
      );

      if (newStatus === "approved") {
        toast.success("Application approved! Waiting for tenant confirmation.");
      } else {
        toast.success("Application rejected successfully!");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status");
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "awaiting_tenant_confirmation":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Awaiting Confirmation
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-800">completed</Badge>
        );
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "declined_by_tenant":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            Declined by Tenant
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tenant Applications</h1>
        <p className="text-muted-foreground">
          Review and manage applications from potential tenants
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by tenant name or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto hover:bg-muted/50 transition-colors duration-200"
            >
              <Filter className="h-4 w-4" />
              {statusFilter === "all"
                ? "All Status"
                : statusFilter === "pending"
                ? "Pending"
                : statusFilter === "approved"
                ? "Approved"
                : statusFilter === "awaiting_tenant_confirmation"
                ? "Awaiting Confirmation"
                : statusFilter === "completed"
                ? "Completed"
                : statusFilter === "rejected"
                ? "Rejected"
                : statusFilter === "declined_by_tenant"
                ? "Declined by Tenant"
                : "Unknown"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
              Approved
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("awaiting_tenant_confirmation")}
            >
              Awaiting Confirmation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
              Rejected
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("declined_by_tenant")}
            >
              Declined by Tenant
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">
              No applications found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search criteria or filter settings to find the applications you're looking for."
                : "You haven't received any tenant applications yet. Applications will appear here when tenants apply for your properties."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="outline"
                className="mt-4 hover:bg-primary/5 transition-colors duration-200"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredApplications.map((application) => (
              <Card
                key={application.id}
                className="hover:shadow-lg transition-all duration-200 shadow-sm border-0 overflow-hidden"
              >
                <CardHeader className="pb-6">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">
                        {application.tenantName}
                      </CardTitle>
                      <CardDescription className="mt-1.5 text-sm font-medium">
                        {application.propertyTitle}
                      </CardDescription>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Applied on {application.applicationDate}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full hover:bg-primary/5 transition-colors duration-200"
                      onClick={() => {
                        setSelectedApplication(application);
                        setSelectedImages(application.validationImages || []);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View All Details
                    </Button>

                    {application.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 hover:bg-primary/90 transition-colors duration-200"
                          onClick={() =>
                            handleStatusUpdate(
                              application.id,
                              application.propertyId,
                              "approved"
                            )
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 hover:bg-destructive/90 transition-colors duration-200"
                          onClick={() =>
                            handleStatusUpdate(
                              application.id,
                              application.propertyId,
                              "rejected"
                            )
                          }
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {application.status === "awaiting_tenant_confirmation" && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">
                          ⏳ Awaiting tenant confirmation. The tenant needs to
                          confirm this approved application.
                        </p>
                      </div>
                    )}

                    {application.status === "completed" && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✅ Application completed by tenant. This application
                          is now complete.
                        </p>
                      </div>
                    )}

                    {application.status === "declined_by_tenant" && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-700 font-medium">
                          ❌ Application declined by tenant after approval.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Application Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Application Details - {selectedApplication?.tenantName}
            </DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 mt-4">
              {/* Application Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-semibold text-foreground block mb-1">
                      Tenant Name
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.tenantName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block mb-1">
                      Email Address
                    </span>
                    <p className="text-sm text-muted-foreground break-words">
                      {selectedApplication.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block mb-1">
                      Property
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.propertyTitle}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block mb-1">
                      Application Date
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.applicationDate}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-semibold text-foreground block mb-2">
                    Application Message
                  </span>
                  <div className="text-sm text-muted-foreground bg-white p-3 rounded-lg leading-relaxed border">
                    {selectedApplication.message}
                  </div>
                </div>
              </div>

              {/* ID Verification Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  ID Verification Documents
                  {selectedImages.length > 0 && (
                    <span className="text-sm font-normal text-blue-600">
                      ({selectedImages.length} images)
                    </span>
                  )}
                </h3>

                {selectedImages.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {selectedImages.map((imageUrl, index) => (
                        <div key={index} className="space-y-2">
                          <div
                            className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
                            onClick={() => {
                              setFullSizeImage({ url: imageUrl, index });
                              setShowFullImageDialog(true);
                            }}
                          >
                            <Image
                              src={imageUrl}
                              alt={`ID verification ${index + 1}`}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-blue-700">
                              ID Document {index + 1}
                            </p>
                            <p className="text-xs text-blue-600">
                              Click to view full size
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-white border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Verification Guidelines:
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Check for clear, readable text and photos</li>
                        <li>
                          • Verify document authenticity and validity dates
                        </li>
                        <li>
                          • Ensure photos match the applicant&apos;s identity
                        </li>
                        <li>• Look for signs of tampering or forgery</li>
                        <li>
                          • Cross-reference information with application details
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      ⚠️ No ID verification images provided
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      This application was submitted without ID verification
                      images. Exercise caution when reviewing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Size Image Dialog */}
      <Dialog open={showFullImageDialog} onOpenChange={setShowFullImageDialog}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 bg-white z-10 p-4 md:p-6 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              ID Document {fullSizeImage ? fullSizeImage.index + 1 : ""} - Full
              Size View
            </DialogTitle>
          </DialogHeader>

          {fullSizeImage && (
            <div className="p-4 md:p-6 pt-2 space-y-4">
              <div className="relative w-full min-h-[50vh] md:min-h-[60vh] max-h-[80vh] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={fullSizeImage.url}
                  alt={`ID verification ${fullSizeImage.index + 1} - Full size`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">
                  Document Examination Tips:
                </h4>
                <ul className="text-xs md:text-sm text-blue-800 space-y-1">
                  <li>• Zoom in to check text clarity and photo quality</li>
                  <li>
                    • Look for security features like holograms or watermarks
                  </li>
                  <li>• Verify expiration dates and document validity</li>
                  <li>• Check for consistent fonts and formatting</li>
                  <li>• Compare photo with applicant if available</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                <div className="text-xs md:text-sm text-gray-600">
                  Document {fullSizeImage.index + 1} of {selectedImages.length}
                </div>
                <div className="flex flex-wrap gap-2">
                  {fullSizeImage.index > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFullSizeImage({
                          url: selectedImages[fullSizeImage.index - 1],
                          index: fullSizeImage.index - 1,
                        })
                      }
                      className="text-xs md:text-sm"
                    >
                      Previous
                    </Button>
                  )}
                  {fullSizeImage.index < selectedImages.length - 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFullSizeImage({
                          url: selectedImages[fullSizeImage.index + 1],
                          index: fullSizeImage.index + 1,
                        })
                      }
                      className="text-xs md:text-sm"
                    >
                      Next
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowFullImageDialog(false)}
                    className="flex items-center gap-2 text-xs md:text-sm"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
