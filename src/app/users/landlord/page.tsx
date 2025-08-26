"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  PiggyBank,
  Eye,
  Edit,
  Calendar,
  Building,
  Star,
  Search,
  ArrowUpRight,
  Wrench,
  MapPin,
  User,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DashboardStatSkeleton,
  PropertyCardSkeleton,
  ApplicationSkeleton,
  TaskSkeleton,
  LoadingGrid,
  LoadingList,
  StaggeredSkeleton,
} from "@/components/loadings/dashboard-skeletons";
import { useAuth } from "@/lib/auth/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Property } from "@/types/property";
import { toast } from "sonner";

// Interfaces for dynamic data
interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  priority: string;
  description: string;
  location: string;
  preferredTime: string;
  contactMethod: string;
  status: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  propertyId: string;
  propertyTitle: string;
  landlordId: string;
  createdAt: Date;
  updatedAt: Date;
  imageCount: number;
}

interface Application {
  id: string;
  applicant: string;
  property: string;
  date: string;
  status: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyTitle: string;
  applicantId: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

interface PropertyWithTenants extends Property {
  tenants?: PropertyTenant[];
}

interface PropertyTenant {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  leaseEnd?: string;
  balance: number;
  joinedAt: Date;
}

interface DashboardStats {
  title: string;
  value: string;
  change: string;
  percentage: string;
  icon: LucideIcon;
  trend: string;
}

// Static data removed - now using Firebase data

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

export default function LandlordDashboard() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // State for dynamic data
  const [properties, setProperties] = useState<PropertyWithTenants[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<
    MaintenanceRequest[]
  >([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyWithTenants | null>(null);
  const [showTenantsModal, setShowTenantsModal] = useState(false);

  // Pagination state for properties
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 2;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch landlord's properties
  const fetchProperties = useCallback(async () => {
    if (!user) return;

    try {
      setPropertiesLoading(true);
      const propertiesQuery = query(
        collection(db, "properties"),
        where("landlordId", "==", user.uid),
        orderBy("datePosted", "desc")
      );

      const unsubscribe = onSnapshot(propertiesQuery, async (snapshot) => {
        const propertiesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            area: data.area || 0,
            available: data.available ?? true,
            images: Array.isArray(data.images)
              ? data.images
              : data.image
              ? [data.image]
              : [],
            title: data.title || "",
            category: data.category || "",
            datePosted: data.datePosted || new Date().toISOString(),
            price: data.price || "",
            location: data.location || "",
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            beds: data.beds || 0,
            baths: data.baths || 0,
            sqft: data.sqft || 0,
            features: Array.isArray(data.features) ? data.features : [],
            isNew: data.isNew,
            isVerified: data.isVerified,
            type: data.type || "",
            uid: data.uid || "",
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            address: data.address || "",
            description: data.description || "",
            landlord: Array.isArray(data.landlord) ? data.landlord : [],
            subtype: data.subtype || "",
            kitchen: data.kitchen || "",
            parking: data.parking || 0,
            landlordId: data.landlordId || "",
            landlordName: data.landlordName || "",
            views: data.views || 0,
            image: data.image,
            inquiries: data.inquiries,
            tenant: data.tenant,
            status: data.status || "Available",
            rating: data.rating,
            tenants: [],
          } as PropertyWithTenants;
        });

        // Fetch tenants for each property
        const propertiesWithTenants = await Promise.all(
          propertiesData.map(async (property) => {
            try {
              const tenantsQuery = query(
                collection(db, "properties", property.id, "tenants")
              );
              const tenantsSnapshot = await getDocs(tenantsQuery);
              const tenants = tenantsSnapshot.docs.map((doc) => ({
                userId: doc.id,
                ...doc.data(),
              })) as PropertyTenant[];
              return { ...property, tenants };
            } catch (error) {
              console.error(
                `Error fetching tenants for property ${property.id}:`,
                error
              );
              return property;
            }
          })
        );

        setProperties(propertiesWithTenants);
        setPropertiesLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
      setPropertiesLoading(false);
    }
  }, [user]);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    if (!user) {
      console.log("No user found, skipping applications fetch");
      return;
    }

    try {
      setApplicationsLoading(true);
      console.log("Starting to fetch applications for user:", user.uid);
      const allApplications: Application[] = [];

      // Get all properties owned by the landlord
      const propertiesQuery = query(
        collection(db, "properties"),
        where("landlordId", "==", user.uid)
      );

      const propertiesSnapshot = await getDocs(propertiesQuery);
      console.log(
        `Found ${propertiesSnapshot.docs.length} properties for landlord`
      );

      // For each property, get its applications
      await Promise.all(
        propertiesSnapshot.docs.map(async (propertyDoc) => {
          try {
            console.log(
              `Checking applications for property: ${propertyDoc.id}`
            );
            const applicationsQuery = query(
              collection(db, "properties", propertyDoc.id, "applications")
            );

            const applicationsSnapshot = await getDocs(applicationsQuery);
            console.log(
              `Found ${applicationsSnapshot.docs.length} applications for property ${propertyDoc.id}`
            );

            const propertyData = propertyDoc.data();
            const propertyApplications = applicationsSnapshot.docs.map(
              (doc) => {
                const data = doc.data();
                console.log(`Processing application:`, doc.id, data);
                return {
                  id: doc.id,
                  applicant:
                    data.applicant ||
                    data.tenantName ||
                    data.fullName ||
                    "Unknown Applicant",
                  property: propertyData.title || "Unknown Property",
                  date:
                    data.createdAt?.toDate?.()?.toLocaleDateString() ||
                    (data.createdAt
                      ? new Date(data.createdAt).toLocaleDateString()
                      : new Date().toLocaleDateString()),
                  status: data.status || "pending",
                  phone:
                    data.phone || data.contactNumber || data.phoneNumber || "",
                  email: data.email || data.emailAddress || "",
                  propertyId: propertyDoc.id,
                  propertyTitle: propertyData.title || "Unknown Property",
                  applicantId:
                    data.applicantId || data.userId || data.uid || "",
                  createdAt: data.createdAt,
                  updatedAt: data.updatedAt,
                } as Application;
              }
            );

            allApplications.push(...propertyApplications);
          } catch (error) {
            console.error(
              `Error fetching applications for property ${propertyDoc.id}:`,
              error
            );
          }
        })
      );

      // Sort all applications by creation date
      allApplications.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });

      console.log(`Total applications found: ${allApplications.length}`);
      setApplications(allApplications);
      setApplicationsLoading(false);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplicationsLoading(false);
      toast.error("Failed to load applications");
    }
  }, [user]);

  // Fetch maintenance requests
  const fetchMaintenanceRequests = useCallback(async () => {
    if (!user) return;

    try {
      setMaintenanceLoading(true);
      const allRequests: MaintenanceRequest[] = [];

      // Get all properties owned by the landlord
      const propertiesQuery = query(
        collection(db, "properties"),
        where("landlordId", "==", user.uid)
      );

      const propertiesSnapshot = await getDocs(propertiesQuery);

      // For each property, get its maintenance requests
      await Promise.all(
        propertiesSnapshot.docs.map(async (propertyDoc) => {
          try {
            const requestsQuery = query(
              collection(db, "properties", propertyDoc.id, "requests"),
              orderBy("createdAt", "desc")
            );

            const requestsSnapshot = await getDocs(requestsQuery);
            const propertyRequests = requestsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as MaintenanceRequest[];

            allRequests.push(...propertyRequests);
          } catch (error) {
            console.error(
              `Error fetching requests for property ${propertyDoc.id}:`,
              error
            );
          }
        })
      );

      // Sort all requests by creation date
      allRequests.sort((a, b) => {
        const dateA =
          a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB =
          b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      setMaintenanceRequests(allRequests);
      setMaintenanceLoading(false);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      toast.error("Failed to load maintenance requests");
      setMaintenanceLoading(false);
    }
  }, [user]);

  // Calculate dashboard stats
  const calculateStats = useCallback(() => {
    const totalProperties = properties.length;
    const activeTenants = properties.reduce((count, property) => {
      return count + (property.tenants?.length || 0);
    }, 0);
    const monthlyRevenue = properties.reduce((total, property) => {
      if (property.status === "Occupied" && property.price) {
        const price = parseFloat(property.price.replace(/[^\d.-]/g, ""));
        return total + (isNaN(price) ? 0 : price);
      }
      return total;
    }, 0);
    const pendingRequests = maintenanceRequests.filter(
      (req) => req.status === "pending"
    ).length;

    const stats: DashboardStats[] = [
      {
        title: "Total Properties",
        value: totalProperties.toString(),
        change: `${totalProperties} properties`,
        percentage: "100%",
        icon: Building,
        trend: "up",
      },
      {
        title: "Active Tenants",
        value: activeTenants.toString(),
        change: `${activeTenants} tenants`,
        percentage: "100%",
        icon: Users,
        trend: "up",
      },
      {
        title: "Monthly Revenue",
        value: `₱${monthlyRevenue.toLocaleString()}`,
        change: `From ${
          properties.filter((p) => p.status === "Occupied").length
        } occupied units`,
        percentage: "100%",
        icon: PiggyBank,
        trend: "up",
      },
      {
        title: "Maintenances",
        value: pendingRequests.toString(),
        change: `${pendingRequests} pending`,
        percentage: "100%",
        icon: Wrench,
        trend: pendingRequests > 0 ? "up" : "neutral",
      },
    ];

    setDashboardStats(stats);
  }, [properties, maintenanceRequests]);

  // Load data when user is available
  useEffect(() => {
    if (user && !loading) {
      setDataLoading(true);
      Promise.all([
        fetchProperties(),
        fetchMaintenanceRequests(),
        fetchApplications(),
      ]).finally(() => setDataLoading(false));
    }
  }, [
    user,
    loading,
    fetchProperties,
    fetchMaintenanceRequests,
    fetchApplications,
  ]);

  // Recalculate stats when data changes
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Removed circular loading spinner - now using skeleton components for better UX

  if (!user || !userData) {
    return null;
  }

  // Filter properties based on search term
  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Handle view property with tenants
  const handleViewProperty = (property: PropertyWithTenants) => {
    setSelectedProperty(property);
    setShowTenantsModal(true);
  };

  const handleCloseModal = () => {
    setShowTenantsModal(false);
    setSelectedProperty(null);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header Section */}
      <div className="border-b border-border/40 bg-gradient-to-r from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 overflow-x-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">🏠</span>
                Welcome back, {userData.firstName}!
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Manage your properties with ease
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-x-hidden">
        {/* Enhanced Stats Cards - Mobile Optimized */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
          {dataLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <StaggeredSkeleton key={index} delay={index * 100}>
                  <DashboardStatSkeleton />
                </StaggeredSkeleton>
              ))
            : dashboardStats.map((stat, index) => (
                <Card
                  key={index}
                  className={`relative overflow-hidden ${
                    stat.title === "Maintenances"
                      ? "cursor-pointer hover:shadow-md transition-shadow"
                      : ""
                  }`}
                  onClick={
                    stat.title === "Maintenances"
                      ? () => router.push("/users/landlord/requests")
                      : undefined
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-1">
                      {stat.title}
                    </CardTitle>
                    <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                      <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-xs font-medium text-green-600 flex items-center">
                        <ArrowUpRight className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        {stat.percentage}
                      </span>
                      <p className="text-xs text-muted-foreground truncate">
                        {stat.change}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 mb-8">
          {/* Left Column - 8 cols */}
          <div className="col-span-1 lg:col-span-8 space-y-6">
            {/* Properties Overview with Search */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">
                      Your Properties
                    </CardTitle>
                    <CardDescription>
                      Manage and monitor your rental properties
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search properties..."
                        className="pl-10 w-full sm:w-48 lg:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      <span className="sm:inline">Add Property</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <LoadingGrid count={4} className="grid gap-4 md:grid-cols-2">
                    <StaggeredSkeleton>
                      <PropertyCardSkeleton />
                    </StaggeredSkeleton>
                  </LoadingGrid>
                ) : filteredProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No properties found matching your search."
                        : "No properties found. Add your first property to get started."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {currentProperties.map((property, index) => (
                        <Card
                          key={`property-${property.id}-${index}`}
                          className="border hover:border-primary/50 transition-colors"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {property.title}
                                  {property.rating && (
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                      <span className="text-sm text-muted-foreground ml-1">
                                        {property.rating}
                                      </span>
                                    </div>
                                  )}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {property.address || property.location}
                                </CardDescription>
                              </div>
                              <Badge
                                variant={
                                  property.status === "Occupied"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {property.status || "Available"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Monthly Rent
                                </span>
                                <p className="font-semibold text-lg">
                                  {property.price}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Tenants
                                </span>
                                <p className="font-medium">
                                  {property.tenants?.length || 0} tenant
                                  {property.tenants?.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                              <span>
                                {property.beds} bed
                                {property.beds !== 1 ? "s" : ""}
                              </span>
                              <span>
                                {property.baths} bath
                                {property.baths !== 1 ? "s" : ""}
                              </span>
                              <span>{property.sqft} sqft</span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleViewProperty(property)}
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
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing {startIndex + 1}-
                          {Math.min(endIndex, filteredProperties.length)} of{" "}
                          {filteredProperties.length} properties
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Previous</span>
                          </Button>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                className="w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Maintenance Requests Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    <CardTitle>Maintenance Overview</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/users/landlord/requests")}
                  >
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Quick overview of maintenance requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 border rounded"
                      >
                        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : maintenanceRequests.length === 0 ? (
                  <div className="text-center py-6">
                    <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No maintenance requests
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {maintenanceRequests.slice(0, 3).map((request, index) => (
                      <div
                        key={`${request.propertyId}-${request.id}-${index}`}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer min-w-0"
                        onClick={() => router.push("/users/landlord/requests")}
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex-shrink-0">
                          <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {request.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {request.propertyTitle}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.priority === "high" ||
                            request.priority === "emergency"
                              ? "destructive"
                              : request.priority === "medium"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {request.priority}
                        </Badge>
                      </div>
                    ))}
                    {maintenanceRequests.length > 3 && (
                      <div className="text-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() =>
                            router.push("/users/landlord/requests")
                          }
                        >
                          +{maintenanceRequests.length - 3} more requests
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 4 cols */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
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
                {dataLoading ? (
                  <LoadingList count={4}>
                    <StaggeredSkeleton>
                      <TaskSkeleton />
                    </StaggeredSkeleton>
                  </LoadingList>
                ) : (
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
                )}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest rental applications</CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <LoadingList count={5}>
                    <StaggeredSkeleton>
                      <ApplicationSkeleton />
                    </StaggeredSkeleton>
                  </LoadingList>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No applications received yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((application, index) => (
                      <div
                        key={`${application.propertyId}-${application.id}-${index}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg min-w-0"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
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
                        <div className="flex-shrink-0 self-start sm:self-center">
                          <Badge
                            variant={
                              application.status === "completed" ||
                              application.status === "approved"
                                ? "default"
                                : application.status === "pending" ||
                                  application.status ===
                                    "awaiting_tenant_confirmation"
                                ? "secondary"
                                : application.status === "rejected" ||
                                  application.status === "declined_by_tenant"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                              application.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : application.status === "approved"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                : application.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : application.status ===
                                  "awaiting_tenant_confirmation"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                : application.status === "rejected" ||
                                  application.status === "declined_by_tenant"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                : ""
                            }
                          >
                            {application.status
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Tenants Modal */}
      <Dialog
        open={showTenantsModal}
        onOpenChange={(open) => !open && handleCloseModal()}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tenants for {selectedProperty?.title}</DialogTitle>
          </DialogHeader>

          {selectedProperty?.tenants && selectedProperty.tenants.length > 0 ? (
            <div className="space-y-4">
              {selectedProperty.tenants.map((tenant, index) => (
                <div
                  key={`${selectedProperty.id}-${tenant.userId}-${index}`}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{tenant.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tenant.email}
                      </p>
                      {tenant.phone && (
                        <p className="text-sm text-muted-foreground">
                          {tenant.phone}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          tenant.status === "active" ? "default" : "secondary"
                        }
                      >
                        {tenant.status}
                      </Badge>
                      {tenant.leaseEnd && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Lease ends:{" "}
                          {new Date(tenant.leaseEnd).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No tenants currently assigned to this property.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
