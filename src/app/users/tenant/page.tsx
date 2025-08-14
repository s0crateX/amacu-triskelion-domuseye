"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Home,
  MapPin,
  PhilippinePeso,
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
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import MaintenanceRequestDialog from "./widgets/home-widgets/maintenance-request-dialog";
import OnlinePaymentDialog from "./widgets/home-widgets/online-payment-dialog";

// Sample data - commented out as unused
// const currentRental = {
//   id: 1,
//   title: "Modern 2BR Apartment in Makati",
//   location: "Makati City, Metro Manila",
//   monthlyRent: "₱35,000",
//   leaseStart: "January 15, 2024",
//   leaseEnd: "January 14, 2025",
//   bedrooms: 2,
//   bathrooms: 2,
//   area: "75 sqm",
//   floor: "12th Floor",
//   unitNumber: "Unit 1205",
//   image: "/assets/images/property1.jpg",
//   amenities: ["WiFi", "AC", "Parking", "Security", "Gym", "Pool"],
//   landlord: {
//     name: "Maria Santos",
//     phone: "+63 917 123 4567",
//     email: "maria.santos@email.com",
//   },
// };

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

// const maintenanceRequests = [
//   {
//     id: 1,
//     type: "AC Repair",
//     status: "In Progress",
//     priority: "high",
//     date: "Dec 18, 2024",
//   },
//   {
//     id: 2,
//     type: "Plumbing Issue",
//     status: "Pending",
//     priority: "medium",
//     date: "Dec 20, 2024",
//   },
// ];

interface TenantApplication {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  email: string;
  message: string;
  status: string;
  appliedAt: string;
  updatedAt?: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  address: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  images: string[];
  amenities: string[];
  landlordName: string;
  landlordId: string;
  landlordEmail?: string;
  landlordPhone?: string;
  description: string;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  description: string;
  location: string;
  createdAt: Date | string | { seconds: number; nanoseconds: number };
  requesterName: string;
  propertyTitle: string;
}

interface CommunityPost {
  id: string;
  propertyId: string;
  propertyTitle: string;
  title: string;
  content: string;
  type: "update" | "news" | "announcement" | "maintenance";
  landlordId: string;
  landlordName: string;
  createdAt: Date | string | { seconds: number; nanoseconds: number };
  updatedAt: Date | string | { seconds: number; nanoseconds: number };
}

export default function ModernTenantDashboard() {
  const { user } = useAuth();
  const [confirmedProperties, setConfirmedProperties] = useState<Property[]>(
    []
  );
  const [maintenanceRequestsData, setMaintenanceRequestsData] = useState<
    MaintenanceRequest[]
  >([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic quick stats based on real data
  const getQuickStats = () => {
    const activeRequests = maintenanceRequestsData.filter(
      (req) => req.status === "pending" || req.status === "in_progress"
    ).length;

    return [
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
        value: activeRequests > 0 ? `${activeRequests}  Active` : "None Active",
        icon: Settings,
        trend: "neutral",
      },
    ];
  };

  useEffect(() => {
    if (user) {
      fetchConfirmedProperties();
    }
  }, [user]);

  const fetchCommunityPosts = useCallback(async (properties: Property[]) => {
    try {
      const allPosts: CommunityPost[] = [];

      for (const property of properties) {
        const postsQuery = query(
          collection(db, "properties", property.id, "community-board"),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
          const propertyPosts = snapshot.docs.map((doc) => ({
            id: doc.id,
            propertyTitle: property.title,
            ...doc.data(),
          })) as CommunityPost[];

          // Update posts for this property
          setCommunityPosts((prevPosts) => {
            const otherPropertyPosts = prevPosts.filter(
              (post) => post.propertyId !== property.id
            );
            return [...otherPropertyPosts, ...propertyPosts]
              .sort((a, b) => {
                const getTimestamp = (
                  createdAt:
                    | Date
                    | string
                    | { seconds: number; nanoseconds: number }
                ) => {
                  if (!createdAt) return 0;
                  if (typeof createdAt === "object" && "seconds" in createdAt) {
                    return createdAt.seconds;
                  }
                  if (createdAt instanceof Date) {
                    return Math.floor(createdAt.getTime() / 1000);
                  }
                  return 0;
                };
                return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
              })
              .slice(0, 3); // Show only latest 3 posts
          });
        });

        // Store unsubscribe function for cleanup
        return unsubscribe;
      }
    } catch (error) {
      console.error("Error fetching community posts:", error);
    }
  }, []);

  const fetchMaintenanceRequests = useCallback(
    async (properties: Property[]) => {
      try {
        const allRequests: MaintenanceRequest[] = [];

        for (const property of properties) {
          const requestsQuery = query(
            collection(db, "properties", property.id, "requests"),
            where("requesterId", "==", user?.uid || "")
          );
          const requestsSnapshot = await getDocs(requestsQuery);

          requestsSnapshot.forEach((doc) => {
            const data = doc.data();
            allRequests.push({
              id: doc.id,
              title: data.title || "",
              category: data.category || "",
              priority: data.priority || "medium",
              status: data.status || "pending",
              description: data.description || "",
              location: data.location || "",
              createdAt: data.createdAt,
              requesterName: data.requesterName || "",
              propertyTitle: property.title,
            });
          });
        }

        // Sort by creation date (newest first) and limit to 10
        const sortedRequests = allRequests
          .sort((a, b) => {
            const getTimestamp = (
              createdAt:
                | Date
                | string
                | { seconds: number; nanoseconds: number }
                | undefined
            ) => {
              if (!createdAt) return 0;
              if (typeof createdAt === "object" && "seconds" in createdAt) {
                return createdAt.seconds;
              }
              if (createdAt instanceof Date) {
                return Math.floor(createdAt.getTime() / 1000);
              }
              if (typeof createdAt === "string") {
                return Math.floor(new Date(createdAt).getTime() / 1000);
              }
              return 0;
            };

            const aTime = getTimestamp(a.createdAt);
            const bTime = getTimestamp(b.createdAt);
            return bTime - aTime;
          })
          .slice(0, 10);

        setMaintenanceRequestsData(sortedRequests);
      } catch (error) {
        console.error("Error fetching maintenance requests:", error);
      }
    },
    [user]
  );

  const fetchConfirmedProperties = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get confirmed applications from tenant's subcollection
      const applicationsQuery = query(
        collection(db, "users", user.uid, "applications"),
        where("status", "==", "confirmed")
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);

      const properties: Property[] = [];

      // Fetch property details for each confirmed application
      for (const applicationDoc of applicationsSnapshot.docs) {
        const applicationData = applicationDoc.data() as TenantApplication;
        if (applicationData.propertyId) {
          const propertyRef = doc(db, "properties", applicationData.propertyId);
          const propertySnapshot = await getDoc(propertyRef);

          if (propertySnapshot.exists()) {
            const propertyData = propertySnapshot.data();

            // Fetch landlord contact information
            let landlordEmail = "";
            let landlordPhone = "";

            if (propertyData.landlordId) {
              try {
                const landlordRef = doc(db, "users", propertyData.landlordId);
                const landlordSnapshot = await getDoc(landlordRef);

                if (landlordSnapshot.exists()) {
                  const landlordData = landlordSnapshot.data();
                  landlordEmail = landlordData.email || "";
                  landlordPhone =
                    landlordData.phone || landlordData.phoneNumber || "";
                }
              } catch (error) {
                console.error("Error fetching landlord contact info:", error);
              }
            }

            properties.push({
              id: propertySnapshot.id,
              title: propertyData.title || "",
              location: propertyData.location || "",
              address: propertyData.address || "",
              price: propertyData.price || "",
              beds: propertyData.beds || 0,
              baths: propertyData.baths || 0,
              sqft: propertyData.sqft || 0,
              images: propertyData.images || [],
              amenities: propertyData.amenities || [],
              landlordName: propertyData.landlordName || "",
              landlordId: propertyData.landlordId || "",
              landlordEmail: landlordEmail,
              landlordPhone: landlordPhone,
              description: propertyData.description || "",
            });
          }
        }
      }

      setConfirmedProperties(properties);

      // Fetch maintenance requests and community posts for confirmed properties
      if (properties.length > 0) {
        await fetchMaintenanceRequests(properties);
        await fetchCommunityPosts(properties);
      }
    } catch (error) {
      console.error("Error fetching confirmed properties:", error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchMaintenanceRequests, fetchCommunityPosts]);

  const handleMaintenanceSubmit = async (formData: {
    title: string;
    category: string;
    priority: string;
    description: string;
    location: string;
    preferredTime: string;
    contactMethod: string;
    images: File[];
  }) => {
    if (!user || confirmedProperties.length === 0) {
      alert("No confirmed property found. Please contact your landlord.");
      return;
    }

    try {
      // Get the first confirmed property (assuming tenant has one active property)
      const property = confirmedProperties[0];

      // Create maintenance request data
      const maintenanceRequestData = {
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        location: formData.location,
        preferredTime: formData.preferredTime,
        contactMethod: formData.contactMethod,
        status: "pending" as const,
        requesterId: user.uid,
        requesterName: user.displayName || user.email || "Unknown Tenant",
        requesterEmail: user.email,
        propertyId: property.id,
        propertyTitle: property.title,
        landlordId: property.landlordId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Note: Images handling would require additional implementation for file upload
        // For now, we'll store the count of images
        imageCount: formData.images.length,
      };

      // Save to Firebase subcollection: properties/{propertyId}/requests
      const requestsCollectionRef = collection(
        db,
        "properties",
        property.id,
        "requests"
      );
      await addDoc(requestsCollectionRef, maintenanceRequestData);

      console.log(
        "Maintenance request submitted successfully:",
        maintenanceRequestData
      );
      alert(
        "Maintenance request submitted successfully! Your landlord will be notified."
      );

      // Refresh maintenance requests to show the new request
      await fetchMaintenanceRequests(confirmedProperties);
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      alert("Failed to submit maintenance request. Please try again.");
    }
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
    console.log("Payment submitted:", data);
    // Handle payment submission
  };

  // Map bill types from tenant page to payment dialog format
  const mapBillType = (billType: string): string => {
    const mapping: { [key: string]: string } = {
      "Monthly Rent": "monthly-rent",
      Electricity: "electricity",
      Water: "water",
      Internet: "internet",
      "Maintenance Fee": "maintenance-fee",
      "Security Deposit": "security-deposit",
    };
    return mapping[billType] || "other";
  };

  const totalOutstanding = outstandingDues.reduce((sum, due) => {
    return sum + parseFloat(due.amount.replace("₱", "").replace(",", ""));
  }, 0);

  // Helper functions for community posts
  const getPostTypeInfo = (type: string) => {
    const postTypes = [
      {
        value: "update",
        label: "Property Update",
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      },
      {
        value: "news",
        label: "News",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      },
      {
        value: "announcement",
        label: "Announcement",
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      },
      {
        value: "maintenance",
        label: "Maintenance Notice",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      },
    ];
    return postTypes.find((pt) => pt.value === type) || postTypes[0];
  };

  const formatPostDate = (
    timestamp:
      | Date
      | string
      | { seconds: number; nanoseconds: number }
      | { toDate: () => Date }
  ) => {
    if (!timestamp) return "Unknown date";

    let date;
    if (
      typeof timestamp === "object" &&
      timestamp !== null &&
      "toDate" in timestamp &&
      typeof timestamp.toDate === "function"
    ) {
      date = timestamp.toDate();
    } else if (
      typeof timestamp === "object" &&
      timestamp !== null &&
      "seconds" in timestamp
    ) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp as string | Date);
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Unable to load user data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  // Note: User type checking would need to be implemented based on your auth system
  // For now, we'll assume all users accessing this page are tenants
  // if (user.userType !== 'tenant') {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <p className="text-muted-foreground">Access denied. This page is only available for tenants.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Welcome home, {user?.displayName || user?.email || "Tenant"}! 👋
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Here&apos;s everything you need to know about your rental
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {getQuickStats().map((stat, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center">
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Property Overview */}
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                    Your Current Property
                  </CardTitle>
                  {confirmedProperties.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary text-xs sm:text-sm"
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
                    <span className="ml-2 text-sm sm:text-base text-muted-foreground">
                      Loading your property...
                    </span>
                  </div>
                ) : confirmedProperties.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Home className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                    <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                      No Current Property
                    </h4>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-4">
                      You don&apos;t have any confirmed rental applications yet.
                    </p>
                    <Button variant="default" className="text-sm sm:text-base">
                      Browse Properties
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {confirmedProperties.map((property, index) => (
                      <div
                        key={property.id}
                        className="flex flex-col lg:flex-row gap-4 sm:gap-6"
                      >
                        {/* Property Image */}
                        <div className="lg:w-1/3">
                          <div className="aspect-video lg:aspect-square bg-muted rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden relative">
                            {property.images && property.images.length > 0 ? (
                              <Image
                                src={property.images[0]}
                                alt={property.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Home className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        <div className="lg:w-2/3 space-y-3 sm:space-y-4">
                          <div>
                            <h4 className="text-lg sm:text-xl font-semibold text-foreground">
                              {property.title}
                            </h4>
                            <div className="flex items-center text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="text-sm sm:text-base">
                                {property.location}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              {property.address}
                            </p>
                          </div>

                          {/* Property Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                            <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                              <Bed className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                              <p className="text-xs sm:text-sm font-medium text-foreground">
                                {property.beds}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Bedrooms
                              </p>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                              <Bath className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                              <p className="text-xs sm:text-sm font-medium text-foreground">
                                {property.baths}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Bathrooms
                              </p>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                              <Home className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                              <p className="text-xs sm:text-sm font-medium text-foreground">
                                {property.sqft} sqft
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Area
                              </p>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                              <PhilippinePeso className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                              <p className="text-xs sm:text-sm font-medium text-foreground">
                                {property.price}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Monthly
                              </p>
                            </div>
                          </div>

                          {/* Amenities */}
                          {property.amenities &&
                            property.amenities.length > 0 && (
                              <div>
                                <h5 className="text-sm sm:text-base font-medium text-foreground mb-2">
                                  Amenities
                                </h5>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  {property.amenities.map(
                                    (amenity, amenityIndex) => (
                                      <Badge
                                        key={amenityIndex}
                                        variant="secondary"
                                        className="text-xs sm:text-sm px-2 py-1"
                                      >
                                        {amenity}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Landlord Contact Info */}
                          <div className="pt-3 sm:pt-4 border-t">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div className="mb-3 sm:mb-0">
                                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                                  Landlord Contact
                                </p>
                                <p className="text-sm sm:text-base font-medium text-foreground">
                                  {property.landlordName}
                                </p>
                                {property.landlordEmail && (
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    {property.landlordEmail}
                                  </p>
                                )}
                                {property.landlordPhone && (
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    {property.landlordPhone}
                                  </p>
                                )}
                                {!property.landlordEmail &&
                                  !property.landlordPhone && (
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                      Contact information not available
                                    </p>
                                  )}
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 sm:flex-none text-xs sm:text-sm text-green-600 border-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!property.landlordPhone}
                                  onClick={() =>
                                    property.landlordPhone &&
                                    window.open(`tel:${property.landlordPhone}`)
                                  }
                                >
                                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  Call
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 sm:flex-none text-xs sm:text-sm text-blue-600 border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!property.landlordEmail}
                                  onClick={() =>
                                    property.landlordEmail &&
                                    window.open(
                                      `mailto:${property.landlordEmail}`
                                    )
                                  }
                                >
                                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  Email
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {index < confirmedProperties.length - 1 && (
                          <hr className="my-6" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Board */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                    Community Updates
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary text-xs sm:text-sm"
                    onClick={() =>
                      (window.location.href = "/users/tenant/community-board")
                    }
                  >
                    View All
                  </Button>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Latest updates from your landlord
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {communityPosts.length > 0 ? (
                    communityPosts.map((post) => {
                      const typeInfo = getPostTypeInfo(post.type);
                      return (
                        <div
                          key={post.id}
                          className="p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors border-l-4 border-primary/20"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-medium text-foreground truncate">
                                {post.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatPostDate(post.createdAt)} • by{" "}
                                {post.landlordName}
                              </p>
                            </div>
                            <Badge
                              className={`${typeInfo.color} text-xs ml-2 flex-shrink-0`}
                            >
                              {typeInfo.label}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No community updates yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your landlord will post updates here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Requests */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                    Maintenance Requests
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary text-xs sm:text-sm"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {maintenanceRequestsData.length > 0 ? (
                    maintenanceRequestsData.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              request.status === "completed"
                                ? "bg-green-500"
                                : request.status === "in_progress"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                          ></div>
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base font-medium text-foreground truncate">
                              {request.title}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {request.createdAt
                                ? (() => {
                                    if (
                                      typeof request.createdAt === "object" &&
                                      "seconds" in request.createdAt
                                    ) {
                                      return new Date(
                                        request.createdAt.seconds * 1000
                                      ).toLocaleDateString();
                                    }
                                    if (request.createdAt instanceof Date) {
                                      return request.createdAt.toLocaleDateString();
                                    }
                                    if (typeof request.createdAt === "string") {
                                      return new Date(
                                        request.createdAt
                                      ).toLocaleDateString();
                                    }
                                    return "Recent";
                                  })()
                                : "Recent"}{" "}
                              • {request.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          <Badge
                            variant={
                              request.priority === "high"
                                ? "destructive"
                                : request.priority === "medium"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs px-1 sm:px-2"
                          >
                            {request.priority}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs px-1 sm:px-2 ${
                              request.status === "completed"
                                ? "text-green-600 border-green-200"
                                : request.status === "in_progress"
                                ? "text-yellow-600 border-yellow-200"
                                : "text-blue-600 border-blue-200"
                            }`}
                          >
                            {request.status.replace("_", " ")}
                          </Badge>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Settings className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No maintenance requests yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submit a request below to get started
                      </p>
                    </div>
                  )}
                </div>

                {/* New Maintenance Request Dialog */}
                <MaintenanceRequestDialog onSubmit={handleMaintenanceSubmit} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Outstanding Dues */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b p-4 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-500" />
                  Outstanding Dues
                </CardTitle>
                <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-2">
                  ₱{totalOutstanding.toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {outstandingDues.map((due) => (
                    <div
                      key={due.id}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                        due.status === "overdue"
                          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
                          : due.status === "pending"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800"
                          : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm truncate">
                            {due.type}
                          </p>
                          <p className="text-xs opacity-75">
                            Due: {due.dueDate}
                          </p>
                        </div>
                        <p className="font-bold text-sm sm:text-base ml-2 flex-shrink-0">
                          {due.amount}
                        </p>
                      </div>
                      {due.status === "overdue" && (
                        <p className="text-xs font-medium mb-2">
                          ⚠️ {due.daysOverdue} days overdue
                        </p>
                      )}
                      <OnlinePaymentDialog
                        onSubmit={handlePaymentSubmit}
                        defaultAmount={due.amount
                          .replace("₱", "")
                          .replace(",", "")}
                        billType={mapBillType(due.type)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b p-4 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950/20 dark:border-green-800"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm text-green-900 dark:text-green-400 truncate">
                          {payment.type}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-500">
                          {payment.date}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-bold text-xs sm:text-sm text-green-900 dark:text-green-400">
                          {payment.amount}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                        >
                          ✓ Paid
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-3 sm:mt-4 text-xs sm:text-sm text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/20"
                >
                  View Payment History
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b p-4 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  <OnlinePaymentDialog onSubmit={handlePaymentSubmit} />
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2 sm:p-3 h-auto text-xs sm:text-sm"
                  >
                    <div className="flex items-center">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-primary" />
                      <span className="font-medium">Download Receipt</span>
                    </div>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2 sm:p-3 h-auto text-xs sm:text-sm"
                  >
                    <div className="flex items-center">
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-primary" />
                      <span className="font-medium">Report Issue</span>
                    </div>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
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
