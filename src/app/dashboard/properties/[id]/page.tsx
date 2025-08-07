"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Bed,
  Bath,
  Home,
  CheckCircle,
  Calendar,
  Phone,
  Mail,
  Share2,
  Heart,
  Star,
  Snowflake,
  Wifi,
  Car,
  ChefHat,
  Hammer,
  WashingMachine,
  Utensils,
  Smartphone,
  Dumbbell,
  Waves,
  Building,
  Users,
  Package,
  PawPrint,
  Bike,
  Zap,
  FileText,
} from "lucide-react";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { Property } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import TenantApplicationForm from "@/app/dashboard/properties/[id]/apply/tenant-application-form";
//import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

const PropertyDetailPage = () => {
  // All hooks must be called at the top level
  const { id } = useParams<{
    id: string;
  }>();
  const router = useRouter();
  const { userData } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showScheduleSuccess, setShowScheduleSuccess] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [landlordProfile, setLandlordProfile] = useState<{
    displayName?: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    role?: string;
    phone?: string;
    email?: string;
  } | null>(null);

  // Icon mapping functions
  const getFeatureIcon = (feature: string) => {
    const featureMap: { [key: string]: React.ReactNode } = {
      "Air Conditioning": <Snowflake size={16} className="text-[#1e40af]" />,
      WiFi: <Wifi size={16} className="text-[#1e40af]" />,
      Parking: <Car size={16} className="text-[#1e40af]" />,
      "Stainless Steel Appliances": (
        <ChefHat size={16} className="text-[#1e40af]" />
      ),
      "Hardwood Floors": <Hammer size={16} className="text-[#1e40af]" />,
      "In-Unit Laundry": (
        <WashingMachine size={16} className="text-[#1e40af]" />
      ),
      Dishwasher: <Utensils size={16} className="text-[#1e40af]" />,
      "Smart Home Features": (
        <Smartphone size={16} className="text-[#1e40af]" />
      ),
    };
    return (
      featureMap[feature] || (
        <CheckCircle size={16} className="text-[#1e40af]" />
      )
    );
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityMap: { [key: string]: React.ReactNode } = {
      "Fitness Center": <Dumbbell size={16} className="text-[#cdb323]" />,
      "Swimming Pool": <Waves size={16} className="text-[#cdb323]" />,
      "Rooftop Deck": <Building size={16} className="text-[#cdb323]" />,
      "Concierge Service": <Users size={16} className="text-[#cdb323]" />,
      "Package Receiving": <Package size={16} className="text-[#cdb323]" />,
      "Pet Friendly": <PawPrint size={16} className="text-[#cdb323]" />,
      "Bike Storage": <Bike size={16} className="text-[#cdb323]" />,
      "EV Charging Stations": <Zap size={16} className="text-[#cdb323]" />,
    };
    return (
      amenityMap[amenity] || (
        <CheckCircle size={16} className="text-[#cdb323]" />
      )
    );
  };

  // Function to set up real-time landlord profile data listener
  const setupLandlordProfileListener = (uid: string) => {
    const userDocRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setLandlordProfile({
            displayName:
              userData.displayName ||
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            profilePicture: userData.profilePicture,
            role: userData.role || "Landlord",
            phone: userData.phone,
            email: userData.email,
          });
        }
      },
      (error) => {
        console.error("Error listening to landlord profile:", error);
      }
    );

    return unsubscribe;
  };

  // Mock property data
  const propertyinfo = {
    id: Number(id),
    features: [
      "Air Conditioning",
      "WiFi",
      "Parking",
      "Stainless Steel Appliances",
      "Hardwood Floors",
      "In-Unit Laundry",
      "Dishwasher",
      "Smart Home Features",
    ],
    amenities: [
      "Fitness Center",
      "Swimming Pool",
      "Rooftop Deck",
      "Concierge Service",
      "Package Receiving",
      "Pet Friendly",
      "Bike Storage",
      "EV Charging Stations",
    ],
    images: [
      id === "1"
        ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
        : id === "2"
        ? "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
        : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1774&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    ],
    type: id === "1" ? "apartment" : id === "2" ? "house" : "villa",
    yearBuilt: id === "1" ? 2018 : id === "2" ? 2005 : 2020,
    availableFrom: "2023-12-01",
    // landlord data now fetched from Firebase users collection
    availableDates: [
      {
        date: "2023-11-25",
        timeSlots: ["10:00 AM", "2:00 PM"],
      },
      {
        date: "2023-11-26",
        timeSlots: ["11:00 AM", "3:00 PM"],
      },
      {
        date: "2023-11-27",
        timeSlots: ["9:00 AM", "1:00 PM", "5:00 PM"],
      },
      {
        date: "2023-11-29",
        timeSlots: ["10:00 AM", "4:00 PM"],
      },
      {
        date: "2023-11-30",
        timeSlots: ["11:00 AM", "3:00 PM"],
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Sarah M.",
        rating: 5,
        date: "2023-10-15",
        comment:
          "Absolutely loved this property! The location is perfect and the amenities are top-notch.",
      },
      {
        id: 2,
        user: "Michael T.",
        rating: 4,
        date: "2023-09-22",
        comment:
          "Great place, very clean and well-maintained. The only downside is limited parking options.",
      },
    ],
    nearbyPlaces: [
      {
        name: "Central Park",
        distance: "0.5 miles",
      },
      {
        name: "Grocery Store",
        distance: "0.2 miles",
      },
      {
        name: "Shopping Mall",
        distance: "1.2 miles",
      },
      {
        name: "Hospital",
        distance: "2.0 miles",
      },
      {
        name: "School",
        distance: "0.8 miles",
      },
    ],
  };

  // Generate dates for next 2 weeks
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      const isAvailable = propertyinfo.availableDates.some(
        (availableDate) => availableDate.date === dateString
      );
      dates.push({
        date: dateString,
        day: date.getDate(),
        month: date.toLocaleString("default", {
          month: "short",
        }),
        isAvailable,
        isToday: i === 0,
      });
    }
    return dates;
  };
  const calendarDates = generateCalendarDates();

  // Function to format price with commas
  const formatPrice = (price: string) => {
    if (!price) return "Price not available";
    // Remove any non-numeric characters except decimal points
    const numericPrice = price.replace(/[^0-9.]/g, "");
    if (!numericPrice) return price;
    // Convert to number and format with commas
    const formattedNumber = parseFloat(numericPrice).toLocaleString("en-US", {
      maximumFractionDigits: 0,
    });
    return formattedNumber;
  };

  const handleImageChange = (index: number) => {
    setActiveImageIndex(index);
  };
  const handleScheduleViewing = (date: string) => {
    setSelectedDate(date);
  };
  const handleSubmitSchedule = () => {
    //this would send the scheduling request to the backend
    setShowScheduleSuccess(true);
    setTimeout(() => {
      setShowScheduleSuccess(false);
      setSelectedDate(null);
    }, 3000);
  };
  // Firebase data fetching effect
  useEffect(() => {
    let landlordUnsubscribe: (() => void) | null = null;

    async function fetchProperty() {
      try {
        const docRef = doc(db, "properties", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const propertyData: Property = {
            id: docSnap.id,
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
            status: data.status,
            rating: data.rating,
          };

          setProperty(propertyData);

          // Set up real-time landlord profile listener using property's uid (which is the landlord's uid)
          if (propertyData.uid) {
            landlordUnsubscribe = setupLandlordProfileListener(
              propertyData.uid
            );
          }
        } else {
          setError("Property not found.");
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Failed to load property.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProperty();

    // Cleanup function to unsubscribe from real-time listeners
    return () => {
      if (landlordUnsubscribe) {
        landlordUnsubscribe();
      }
    };
  }, [id]);

  // Early returns for loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          {/* Animated Loading Spinner */}
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#cdb323] rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#1e40af] rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Loading Property Details
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch the information...
            </p>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div
              className="w-2 h-2 bg-[#cdb323] rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#cdb323] rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#cdb323] rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Property Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error ||
                "The property you&apos;re looking for doesn&apos;t exist or has been removed."}
            </p>

            {/* Back Button */}
            <Button
              onClick={() => router.push("/dashboard/properties")}
              className="mt-6"
            >
              Back to Properties
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!propertyinfo) {
    return (
      <div className="container mx-auto py-12 px-4 lg:px-8 xl:px-16 2xl:px-24">
        Property not found
      </div>
    );
  }

  return (
    <>
      <div className="bg-background min-h-screen lg:mx-8 xl:mx-30">
        {/* Property Images Gallery */}
        <div className="bg-background/30">
          <div className="container mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24">
            <div className="relative">
              {/* Main Image */}
              <div className="w-full h-[300px] xl:h-[500px] relative bg-muted/30 border border-border/10 rounded-lg overflow-hidden">
                <div className="absolute inset-2 bg-background rounded-md shadow-sm">
                  <Image
                    src={
                      property?.images?.[activeImageIndex] ||
                      propertyinfo?.images?.[activeImageIndex] ||
                      "/assets/images/empty-profile.png"
                    }
                    alt={property.title}
                    fill
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              </div>
              {/* Image Navigation - Show up to 7 images */}
              {((property.images && property.images.length > 1) ||
                (propertyinfo.images && propertyinfo.images.length > 1)) && (
                <div className="absolute bottom-4 left-0 right-0">
                  <div className="flex justify-center space-x-2 px-4">
                    {(property.images || propertyinfo.images)
                      .slice(0, 7)
                      .map((images, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageChange(index)}
                          className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                            index === activeImageIndex
                              ? "border-[#cdb323]"
                              : "border-transparent"
                          }`}
                        >
                          <Image
                            src={images}
                            alt={`View ${index + 1}`}
                            className="w-full h-full object-cover"
                            width={64}
                            height={64}
                          />
                        </button>
                      ))}
                    {(property.images || propertyinfo.images).length > 7 && (
                      <div className="w-16 h-16 rounded-md bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                        +{(property.images || propertyinfo.images).length - 7}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Property Info */}
        <div className="container mx-auto py-8 px-4 lg:px-8 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Property Info */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {property.title}
                      </h1>
                      <div className="flex items-center text-muted-foreground mb-4">
                        <MapPin size={16} className="mr-1.5" />
                        <span className="text-sm sm:text-base">
                          {property.location}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {property.isNew && (
                          <Badge
                            variant="default"
                            className="bg-[#cdb323] hover:bg-[#cdb323]/90"
                          >
                            NEW
                          </Badge>
                        )}
                        {property.isVerified && (
                          <Badge
                            variant="default"
                            className="bg-[#1e40af] hover:bg-[#1e40af]/90"
                          >
                            <CheckCircle size={12} className="mr-1" />
                            VERIFIED
                          </Badge>
                        )}
                        <Badge variant="secondary">{property.type}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-row text-md sm:text-xl md:text-2xl font-bold text-primary">
                        <span>₱ </span>
                        {formatPrice(property.price)}
                      </div>
                      <div className="text-muted-foreground text-xs sm:text-sm">
                        {propertyinfo.availableFrom}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mb-6 py-4 border-y border-border">
                    <div className="flex items-center">
                      <Bed
                        size={16}
                        className="mr-2 text-muted-foreground sm:w-5 sm:h-5"
                      />
                      <div>
                        <div className="text-xs sm:text-sm md:text-base font-semibold text-foreground">
                          {property.beds}
                        </div>
                        <div className="text-xs text-muted-foreground sm:text-sm">
                          Bedrooms
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Bath
                        size={16}
                        className="mr-2 text-muted-foreground sm:w-5 sm:h-5"
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {property.baths}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Bathrooms
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Home
                        size={16}
                        className="mr-2 text-muted-foreground sm:w-5 sm:h-5"
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {property.sqft}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sq Ft
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar
                        size={16}
                        className="mr-2 text-muted-foreground sm:w-5 sm:h-5"
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {propertyinfo.yearBuilt}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Year Built
                        </div>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 text-foreground">
                    Description
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6">
                    {property.description}
                  </p>
                  <div className="mb-6">
                    <div className="mb-6">
                      <h2 className="text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-foreground">
                        Features
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {property.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors"
                          >
                            <div className="mr-2">
                              {getFeatureIcon(feature)}
                            </div>
                            <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl mb-3 text-foreground">
                        Amenities
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {propertyinfo.amenities.map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors"
                          >
                            <div className="mr-2">
                              {getAmenityIcon(amenity)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {amenity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Location Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden mb-4">
                    {/*
                  <LoadScript googleMapsApiKey="API">
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={property.coordinates}
                      zoom={15}
                    >
                      <Marker position={property.coordinates} />
                    </GoogleMap>
                  </LoadScript>*/}
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">
                    Nearby Places
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {propertyinfo.nearbyPlaces.map((place, index) => (
                      <div key={index} className="flex items-center">
                        <MapPin
                          size={16}
                          className="mr-2 text-muted-foreground"
                        />
                        <div>
                          <div className="text-foreground">{place.name}</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {place.distance}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {propertyinfo.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-border pb-4 mb-4 last:border-0"
                    >
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-foreground">
                          {review.user}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {review.date}
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < review.rating
                                ? "text-[#cdb323] fill-[#cdb323]"
                                : "text-muted-foreground"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            {/* Right Column - Contact & Scheduling */}
            <div className="lg:col-span-1">
              {/* Schedule Viewing Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Schedule a Viewing</CardTitle>
                </CardHeader>
                <CardContent>
                  {showScheduleSuccess ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md mb-4">
                      Your viewing has been scheduled! We&apos;ll be in touch
                      shortly to confirm.
                    </div>
                  ) : (
                    <>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4">
                        Select an available date to schedule a viewing of this
                        property:
                      </p>
                      <div className="grid grid-cols-7 gap-1 mb-6">
                        {calendarDates.map((date, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              date.isAvailable
                                ? handleScheduleViewing(date.date)
                                : null
                            }
                            disabled={!date.isAvailable}
                            className={`
                            p-2 rounded-md text-center transition-colors
                            ${
                              date.isAvailable
                                ? date.date === selectedDate
                                  ? "bg-[#1e40af] text-white"
                                  : "hover:bg-accent border border-border text-foreground"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                            }
                            ${date.isToday ? "border-2 border-[#cdb323]" : ""}
                          `}
                          >
                            <div className="text-xs">{date.month}</div>
                            <div className="font-medium">{date.day}</div>
                          </button>
                        ))}
                      </div>
                      {selectedDate && (
                        <div className="mb-6">
                          <h3 className="font-medium mb-2 text-foreground">
                            Available Time Slots:
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {propertyinfo.availableDates
                              .find((d) => d.date === selectedDate)
                              ?.timeSlots.map((time, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  className="py-2 px-3"
                                >
                                  {time}
                                </Button>
                              ))}
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={handleSubmitSchedule}
                        disabled={!selectedDate}
                        className="w-full"
                      >
                        Schedule Viewing
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
              {/* Landlord Contact Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Contact Landlord</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-4">
                      <Image
                        src={
                          landlordProfile?.profilePicture ||
                          "/assets/images/empty-profile.png"
                        }
                        alt={
                          landlordProfile?.displayName ||
                          (property.landlord && property.landlord[0]) ||
                          "Landlord"
                        }
                        className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-lg"
                        width={80}
                        height={80}
                      />
                      {/* Online status indicator */}
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1">
                        {landlordProfile?.displayName ||
                          (landlordProfile?.firstName &&
                          landlordProfile?.lastName
                            ? `${landlordProfile.firstName} ${landlordProfile.lastName}`
                            : landlordProfile?.firstName ||
                              landlordProfile?.lastName ||
                              "Landlord")}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {landlordProfile?.role || "Landlord"}
                      </p>
                      <div className="flex items-center justify-center text-[10px] sm:text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Available now
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full" variant="default">
                      <Phone size={16} className="mr-2" />
                      Call {landlordProfile?.phone || "(555) 123-4567"}
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Mail size={16} className="mr-2" />
                      {landlordProfile?.email || "Email"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Actions Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {/* Apply Now Button */}
                    <Button
                      className="w-full bg-[#1e40af] hover:bg-[#1e40af]/90 text-white"
                      onClick={() => {
                        if (!userData) {
                          router.push("/dashboard/login");
                        } else if (userData.userType === "tenant") {
                          // Open application form dialog
                          setShowApplicationForm(true);
                        } else {
                          // Non-tenant users cannot apply
                          alert("Only tenants can apply for properties.");
                        }
                      }}
                    >
                      <FileText size={18} className="mr-2 text-white" />
                      {!userData
                        ? "Login to Apply"
                        : userData.userType === "tenant"
                        ? "Apply Now"
                        : "Tenant Access Only"}
                    </Button>

                    {/* Share and Save buttons */}
                    <div className="flex justify-between">
                      <Button variant="ghost" className="flex items-center">
                        <Share2 size={18} className="mr-2" />
                        Share
                      </Button>
                      <Button variant="ghost" className="flex items-center">
                        <Heart size={18} className="mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Application Form Dialog */}
      <TenantApplicationForm
        isOpen={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
        propertyId={id}
        propertyTitle={property?.title || ""}
      />
    </>
  );
};

export default PropertyDetailPage;
