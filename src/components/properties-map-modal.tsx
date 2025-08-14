"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  MapPin,
  Crosshair,
  Home,
  Building,
  Bed,
  Bath,
  Car,
  Calendar,
  Eye,
  User,
  CheckCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Property } from "@/types/property";

// Create a dynamic import for the map component to avoid SSR issues
const DynamicMapWithProperties = dynamic(
  () => import("./map-with-properties"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

interface PropertiesMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
}

export default function PropertiesMapModal({
  isOpen,
  onClose,
  properties,
}: PropertiesMapModalProps) {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] =
    useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [detailsProperty, setDetailsProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mapRef = useRef<L.Map | null>(null);

  // Reverse geocoding function
  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      try {
        setIsLoadingAddress(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          {
            headers: {
              "User-Agent": "DomusEye/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch address");
        }

        const data = await response.json();
        return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } finally {
        setIsLoadingAddress(false);
      }
    },
    [setIsLoadingAddress]
  );

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Dynamic import of OpenStreetMapProvider
      const { OpenStreetMapProvider } = await import("leaflet-geosearch");
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: searchQuery });

      if (results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.y.toString());
        const lng = parseFloat(result.x.toString());

        // Move map to the searched location
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }

        const address = await reverseGeocode(lat, lng);
        setUserLocation({ lat, lng, address });
        toast.success("Location found!");
      } else {
        toast.error("No results found for this search");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Get current location using GPS
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Move map to current location
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 15);
          }

          const address = await reverseGeocode(lat, lng);
          setUserLocation({ lat, lng, address });
          toast.success("Current location found!");
        } catch (error) {
          console.error("Error processing current location:", error);
          toast.error("Failed to process current location");
        } finally {
          setIsGettingCurrentLocation(false);
        }
      },
      (error) => {
        let errorMessage = "Failed to get current location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationPermissionDenied(true);
            errorMessage =
              "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            console.error(
              "Geolocation error:",
              error.message || "Unknown error"
            );
            break;
        }

        toast.error(errorMessage);
        setIsGettingCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [setIsGettingCurrentLocation, mapRef, reverseGeocode, setUserLocation]);

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  // Handle property selection
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);

    // Move map to property location if coordinates exist
    if (property.latitude && property.longitude && mapRef.current) {
      mapRef.current.setView([property.latitude, property.longitude], 15);
    }
  };

  // Show property details
  const showPropertyDetailsModal = useCallback(
    (propertyId: string) => {
      const property = properties.find((p) => p.id === propertyId);
      if (property) {
        setDetailsProperty(property);
        setCurrentImageIndex(0);
        setShowPropertyDetails(true);
      }
    },
    [properties]
  );

  // Set up global function for map popup
  useEffect(() => {
    (
      window as Window & { showPropertyDetails?: (propertyId: string) => void }
    ).showPropertyDetails = showPropertyDetailsModal;
    return () => {
      delete (
        window as Window & {
          showPropertyDetails?: (propertyId: string) => void;
        }
      ).showPropertyDetails;
    };
  }, [showPropertyDetailsModal]);

  // Image navigation functions
  const nextImage = () => {
    if (detailsProperty?.images && detailsProperty.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === detailsProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (detailsProperty?.images && detailsProperty.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? detailsProperty.images.length - 1 : prev - 1
      );
    }
  };

  // Format price
  const formatPrice = (price: string) => {
    if (!price) return "Price not available";
    return price.includes("₱") ? price : `₱${price}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Default center coordinates (General Santos City, Philippines)
  const defaultCenter: [number, number] = [6.1164, 125.1716];
  const defaultZoom = 13;

  // Get properties with valid coordinates
  const propertiesWithCoordinates = properties.filter(
    (property) => property.latitude && property.longitude
  );

  // Get nearby properties if user location is available
  const nearbyProperties = userLocation
    ? propertiesWithCoordinates
        .map((property) => ({
          ...property,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            property.latitude || 0,
            property.longitude || 0
          ),
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    : propertiesWithCoordinates;

  // Auto-detect user location on first open (only if permission not denied)
  useEffect(() => {
    if (
      isOpen &&
      !userLocation &&
      !isGettingCurrentLocation &&
      !locationPermissionDenied
    ) {
      getCurrentLocation();
    }
  }, [
    isOpen,
    userLocation,
    isGettingCurrentLocation,
    locationPermissionDenied,
    getCurrentLocation,
  ]);

  // Reset location permission denied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLocationPermissionDenied(false);
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-4 sm:p-6">
          <DialogHeader className="space-y-1 sm:space-y-2">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              Properties Around You
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {propertiesWithCoordinates.length} properties available on the map
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 sm:space-y-4">
            {/* Search Bar */}
            <div className="flex gap-1 sm:gap-2">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search for an address
                </Label>
                <Input
                  id="search"
                  placeholder="Search address..."
                  className="text-sm sm:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                variant="outline"
                size="sm"
                className="px-2 sm:px-4 sm:h-10"
              >
                {isSearching ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
              <Button
                onClick={getCurrentLocation}
                disabled={isGettingCurrentLocation}
                variant="outline"
                size="sm"
                className="px-2 sm:px-4 sm:h-10"
                title="Get current location"
              >
                {isGettingCurrentLocation ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Crosshair className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>

            {/* User Location Display */}
            {userLocation && (
              <div className="p-2 sm:p-3 bg-muted/50 rounded-md">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium">
                      Your Location:
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {isLoadingAddress ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Loading address...
                        </span>
                      ) : (
                        userLocation.address
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Map Container */}
            <div className="h-48 sm:h-96 w-full rounded-md overflow-hidden border relative">
              <DynamicMapWithProperties
                center={
                  userLocation
                    ? [userLocation.lat, userLocation.lng]
                    : defaultCenter
                }
                zoom={userLocation ? 15 : defaultZoom}
                userLocation={userLocation}
                properties={propertiesWithCoordinates}
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertySelect}
                onMapReady={(map) => {
                  mapRef.current = map;
                }}
              />
            </div>

            {/* Nearby Properties List */}
            {userLocation && nearbyProperties.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Nearby Properties:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {nearbyProperties.slice(0, 6).map((property) => (
                    <Button
                      key={property.id}
                      variant="outline"
                      size="sm"
                      className={`flex items-start text-left h-auto py-2 ${
                        selectedProperty?.id === property.id
                          ? "border-primary"
                          : ""
                      }`}
                      onClick={() => handlePropertySelect(property)}
                    >
                      <Building className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">
                          {property.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {"distance" in property
                            ? `${(
                                property as Property & { distance: number }
                              ).distance.toFixed(1)} km away`
                            : "Distance unknown"}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Property Details Modal */}
      <Dialog open={showPropertyDetails} onOpenChange={setShowPropertyDetails}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden p-0 flex flex-col">
          {detailsProperty && (
            <>
              <DialogHeader className="p-6 pb-0 flex-shrink-0">
                <div className="flex-1">
                  <DialogTitle className="text-xl font-bold mb-2">
                    {detailsProperty.title || "Property Details"}
                  </DialogTitle>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">
                      {detailsProperty.address || detailsProperty.location}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(detailsProperty.price)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                {/* Image Gallery */}
                {detailsProperty.images &&
                  detailsProperty.images.length > 0 && (
                    <div className="relative h-64 bg-muted flex-shrink-0">
                      <Image
                        src={
                          detailsProperty.images[currentImageIndex] ||
                          detailsProperty.image ||
                          "/next.svg"
                        }
                        alt={detailsProperty.title || "Property image"}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/next.svg";
                        }}
                      />

                      {/* Image Navigation */}
                      {detailsProperty.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                          >
                            <ChevronRight size={20} />
                          </button>

                          {/* Image Indicators */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {detailsProperty.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                  index === currentImageIndex
                                    ? "bg-white"
                                    : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {detailsProperty.isNew && (
                          <Badge className="bg-green-600 text-white">NEW</Badge>
                        )}
                        {detailsProperty.isVerified && (
                          <Badge className="bg-blue-600 text-white">
                            <CheckCircle size={12} className="mr-1" />
                            VERIFIED
                          </Badge>
                        )}
                        {!detailsProperty.available && (
                          <Badge variant="destructive">OCCUPIED</Badge>
                        )}
                      </div>
                    </div>
                  )}

                <div className="p-6 space-y-6">
                  {/* Property Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Bed className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="font-semibold">
                        {detailsProperty.beds || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Bedrooms
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Bath className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="font-semibold">
                        {detailsProperty.baths || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Bathrooms
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Car className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="font-semibold">
                        {detailsProperty.parking || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Parking
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Home className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="font-semibold">
                        {detailsProperty.sqft || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Sq Ft</div>
                    </div>
                  </div>

                  {/* Property Type and Category */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">
                      {detailsProperty.type || "Property"}
                    </Badge>
                    {detailsProperty.category && (
                      <Badge variant="secondary">
                        {detailsProperty.category}
                      </Badge>
                    )}
                  </div>

                  {/* Amenities */}
                  {detailsProperty.amenities &&
                    detailsProperty.amenities.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Amenities</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {detailsProperty.amenities.map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle
                                size={16}
                                className="text-green-600 flex-shrink-0"
                              />
                              <span className="capitalize">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {detailsProperty.datePosted && (
                      <div className="flex items-center gap-2">
                        <Calendar
                          size={16}
                          className="text-muted-foreground flex-shrink-0"
                        />
                        <span>
                          Posted: {formatDate(detailsProperty.datePosted)}
                        </span>
                      </div>
                    )}
                    {detailsProperty.views && (
                      <div className="flex items-center gap-2">
                        <Eye
                          size={16}
                          className="text-muted-foreground flex-shrink-0"
                        />
                        <span>{detailsProperty.views} views</span>
                      </div>
                    )}
                    {detailsProperty.landlordName && (
                      <div className="flex items-center gap-2">
                        <User
                          size={16}
                          className="text-muted-foreground flex-shrink-0"
                        />
                        <span>Landlord: {detailsProperty.landlordName}</span>
                      </div>
                    )}
                    {detailsProperty.area && (
                      <div className="flex items-center gap-2">
                        <Home
                          size={16}
                          className="text-muted-foreground flex-shrink-0"
                        />
                        <span>Area: {detailsProperty.area} sq m</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background">
                    <Button className="flex-1 bg-[#1e40af] hover:bg-[#1e3a8a]">
                      Contact Landlord
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
