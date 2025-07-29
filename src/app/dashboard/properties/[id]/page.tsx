"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
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
} from "lucide-react";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
//import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

interface Property {
  datePosted: string;
  amenities: string[];
  type: string[];
  images: string[];
  beds: number;
  baths: number;
  sqft: number;
  features: string[];
  isNew?: boolean;
  isVerified?: boolean;
  title: string;
  location: string;
  price: string;
  image: string;
  description: string;
  landlord: string[]; // This will be an array containing [name, phone, email, etc.]
  uid: string; // Add landlord UID field
}

const PropertyDetailPage = () => {
  // All hooks must be called at the top level
  const { id } = useParams<{
    id: string;
  }>();
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showScheduleSuccess, setShowScheduleSuccess] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [landlordProfile, setLandlordProfile] = useState<{
    displayName?: string;
    profilePicture?: string;
    role?: string;
    phone?: string;
    email?: string;
  } | null>(null);

  // Function to fetch landlord profile data
  const fetchLandlordProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setLandlordProfile(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching landlord profile:", error);
    }
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
    async function fetchProperty() {
      try {
        const docRef = doc(db, "properties", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const propertyData = docSnap.data() as Property;

          setProperty(propertyData);

          // Fetch landlord profile if landlordUid exists
          if (propertyData.uid) {
            fetchLandlordProfile(propertyData.uid);
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
                "The property you're looking for doesn't exist or has been removed."}
            </p>

            {/* Back Button */}
            <button
              onClick={() => router.push("/dashboard/properties")}
              className="mt-6 px-6 py-3 bg-[#cdb323] text-white rounded-lg hover:bg-[#b8a01f] transition-colors duration-200 font-medium"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!propertyinfo) {
    return (
      <div className="container mx-auto py-12 px-4">Property not found</div>
    );
  }

  return (
    <div className="bg-background min-h-screen lg:mx-8 xl:mx-30">
      {/* Back button */}
      <div className="bg-background/30 shadow-sm">
        <div className="container px-4 py-4">
          <button
            onClick={() => router.push("/dashboard/properties")}
            className="flex items-center text-foreground hover:text-[#cdb323] transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Properties
          </button>
        </div>
      </div>
      {/* Property Images Gallery */}
      <div className="bg-background/30">
        <div className="container mx-auto">
          <div className="relative">
            {/* Main Image */}
            <div className="w-full h-[500px] relative bg-muted/30 border border-border/10 rounded-lg overflow-hidden">
              <div className="absolute inset-2 bg-background rounded-md shadow-sm">
                <Image
                  src={
                    (property.images && property.images.length > 0
                      ? property.images[activeImageIndex]
                      : null) ||
                    (propertyinfo.images && propertyinfo.images.length > 0
                      ? propertyinfo.images[activeImageIndex]
                      : null) ||
                    "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                  }
                  alt={property.title}
                  fill
                  className="w-full h-full object-contain rounded-md"
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
      <div className="container py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Property Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin size={18} className="mr-1" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.isNew && (
                      <span className="bg-[#cdb323] text-white px-2 py-1 text-xs font-bold rounded">
                        NEW
                      </span>
                    )}
                    {property.isVerified && (
                      <span className="bg-[#1e40af] text-white px-2 py-1 text-xs font-bold rounded flex items-center">
                        <CheckCircle size={12} className="mr-1" />
                        VERIFIED
                      </span>
                    )}
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-bold rounded">
                      {property.type}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#1e40af]">
                    {property.price}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Available from {propertyinfo.availableFrom}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mb-6 py-4 border-y border-gray-200">
                <div className="flex items-center">
                  <Bed size={20} className="mr-2 text-gray-600" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {property.beds}
                    </div>
                    <div className="text-sm text-slate-900">Bedrooms</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Bath size={20} className="mr-2 text-gray-600" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {property.baths}
                    </div>
                    <div className="text-sm text-slate-900">Bathrooms</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Home size={20} className="mr-2 text-slate-900" />
                  <div>
                    <div className="text-slate-900">{property.sqft}</div>
                    <div className="text-sm text-slate-900">Sq Ft</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar size={20} className="mr-2 text-gray-600" />
                  <div>
                    <div className="text-background">{property.datePosted}</div>
                    <div className="text-sm text-background">Year Built</div>
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-3 text-slate-900">
                Description
              </h2>
              <p className="text-gray-600 mb-6">{property.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h2 className="text-xl mb-3 text-slate-900">Features</h2>
                  <ul className="space-y-2">
                    {property.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-600"
                      >
                        <CheckCircle
                          size={16}
                          className="mr-2 text-[#1e40af]"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl mb-3 text-slate-900">Amenities</h2>
                  <ul className="space-y-2">
                    {property.amenities.map((amenity, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-600"
                      >
                        <CheckCircle
                          size={16}
                          className="mr-2 text-[#cdb323]"
                        />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* Location Section */}
            <div className="bg-background rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
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
              <h3 className="font-semibold mb-2">Nearby Places</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {propertyinfo.nearbyPlaces.map((place, index) => (
                  <div key={index} className="flex items-center">
                    <MapPin size={16} className="mr-2 text-gray-500" />
                    <div>
                      <div className="text-gray-700">{place.name}</div>
                      <div className="text-xs text-gray-500">
                        {place.distance}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900">
                Reviews
              </h2>
              {propertyinfo.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-200 pb-4 mb-4 last:border-0"
                >
                  <div className="flex justify-between mb-2">
                    <div className="font-medium text-slate-900">
                      {review.user}
                    </div>
                    <div className="text-sm text-gray-500">{review.date}</div>
                  </div>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? "text-[#cdb323] fill-[#cdb323]"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Right Column - Contact & Scheduling */}
          <div className="lg:col-span-1">
            {/* Schedule Viewing Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900">
                Schedule a Viewing
              </h2>
              {showScheduleSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                  Your viewing has been scheduled! We&apos;ll be in touch
                  shortly to confirm.
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
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
                          p-2 rounded-md text-center
                          ${
                            date.isAvailable
                              ? date.date === selectedDate
                                ? "bg-[#1e40af] text-white"
                                : "hover:bg-[#1e40af]/10 border border-gray-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
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
                      <h3 className="font-medium mb-2">
                        Available Time Slots:
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {propertyinfo.availableDates
                          .find((d) => d.date === selectedDate)
                          ?.timeSlots.map((time, index) => (
                            <button
                              key={index}
                              className="bg-gray-100 hover:bg-[#1e40af]/10 py-2 px-3 rounded-md text-gray-700"
                            >
                              {time}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleSubmitSchedule}
                    disabled={!selectedDate}
                    className={`
                      w-full py-3 rounded-md font-medium text-white
                      ${
                        selectedDate
                          ? "bg-[#1e40af] hover:bg-[#1e3a8a]"
                          : "bg-gray-300 cursor-not-allowed"
                      }
                    `}
                  >
                    Schedule Viewing
                  </button>
                </>
              )}
            </div>
            {/* Landlord Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900">
                Contact
              </h2>
              <div className="flex items-center mb-4">
                <Image
                  src={
                    landlordProfile?.profilePicture ||
                    "https://images.unsplash.com/photo-1567963070256-729fb28b079c?q=80&w=576&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  }
                  alt={
                    landlordProfile?.displayName ||
                    (property.landlord && property.landlord[0]) ||
                    "Property Manager"
                  }
                  className="w-16 h-16 rounded-full object-cover mr-4"
                  width={64}
                  height={64}
                />
                <div>
                  <div className="font-medium text-slate-900">
                    {landlordProfile?.displayName ||
                      (property.landlord && property.landlord[0]) ||
                      "Property Manager"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {landlordProfile?.role || "Property Manager"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center bg-[#1e40af] hover:bg-[#1e3a8a] text-white py-2 rounded-md font-medium">
                  <Phone size={16} className="mr-2" />
                  {landlordProfile?.phone ||
                    (property.landlord && property.landlord[1]) ||
                    "(555) 123-4567"}
                </button>
                <button className="w-full flex items-center justify-center border border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af]/5 py-2 rounded-md font-medium">
                  <Mail size={16} className="mr-2" />
                  {landlordProfile?.email ||
                    (property.landlord && property.landlord[2]) ||
                    "contact@example.com"}
                </button>
              </div>
            </div>
            {/* Actions Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between">
                <button className="flex items-center text-gray-600 hover:text-[#1e40af]">
                  <Share2 size={18} className="mr-2" />
                  Share
                </button>
                <button className="flex items-center text-gray-600 hover:text-[#1e40af]">
                  <Heart size={18} className="mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
