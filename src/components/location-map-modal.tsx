"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, MapPin, Save, X, Crosshair } from "lucide-react";
import { toast } from "sonner";

// Create a dynamic import for the entire map component to avoid SSR issues
const DynamicMapComponent = dynamic(() => import('./map-component'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
});

interface LocationData {
  latitude: number;
  longitude: number;
  location_address: string;
  currentAddress: string;
}

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: LocationData) => Promise<void>;
  initialLocation?: LocationData | null;
}

export default function LocationMapModal({
  isOpen,
  onClose,
  onSave,
  initialLocation,
}: LocationMapModalProps) {
  const { user, userData } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Initialize with existing location if available
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation({
        lat: initialLocation.latitude,
        lng: initialLocation.longitude,
        address: initialLocation.location_address,
      });
    }
  }, [initialLocation]);

  // Create custom profile icon data for map marker (map pin style)
  const createProfileIconData = (
    profilePicture: string,
    firstName?: string,
    lastName?: string
  ) => {
    const initials = firstName && lastName 
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      : '?';

    const profileContent = profilePicture
      ? `<img 
          src="${profilePicture}" 
          style="
            width: 28px;
            height: 28px;
            object-fit: cover;
            border-radius: 50%;
          "
          alt="Profile"
        />`
      : `<span style="
          color: white;
          font-weight: bold;
          font-size: 12px;
          font-family: system-ui, -apple-system, sans-serif;
        ">${initials}</span>`;

    const iconHtml = `
      <div style="
        position: relative;
        width: 40px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Map pin background -->
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          top: 0;
          left: 0;
        "></div>
        <!-- Profile picture container -->
        <div style="
          position: relative;
          z-index: 2;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${profilePicture ? 'white' : 'linear-gradient(135deg, #1d4ed8, #2563eb)'};
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          overflow: hidden;
        ">
          ${profileContent}
        </div>
      </div>
    `;

    return {
      html: iconHtml,
      className: 'custom-profile-pin-marker',
      iconSize: [40, 50] as [number, number],
      iconAnchor: [20, 45] as [number, number],
      popupAnchor: [0, -40] as [number, number]
    };
  };

  // Create custom icon data for the current user
  const profileIconData = createProfileIconData(
    userData?.profilePicture || user?.photoURL || "",
    userData?.firstName,
    userData?.lastName
  );

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      setIsLoadingAddress(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'DomusEye/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Handle location selection from map click
  const handleLocationSelect = async (lat: number, lng: number) => {
    const address = await reverseGeocode(lat, lng);
    setSelectedLocation({ lat, lng, address });
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Dynamic import of OpenStreetMapProvider
      const { OpenStreetMapProvider } = await import('leaflet-geosearch');
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
        setSelectedLocation({ lat, lng, address });
        toast.success("Location found!");
      } else {
        toast.error("No results found for this search");
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Get current location using GPS
  const getCurrentLocation = () => {
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
          setSelectedLocation({ lat, lng, address });
          toast.success("Current location found!");
        } catch (error) {
          console.error('Error processing current location:', error);
          toast.error("Failed to process current location");
        } finally {
          setIsGettingCurrentLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = "Failed to get current location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast.error(errorMessage);
        setIsGettingCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle save button click - show confirmation
  const handleSaveClick = () => {
    if (!selectedLocation) {
      toast.error("Please select a location first");
      return;
    }
    setShowConfirmation(true);
  };

  // Handle confirmed save
  const handleConfirmedSave = async () => {
    if (!selectedLocation) return;

    setIsSaving(true);
    try {
      await onSave({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        location_address: selectedLocation.address,
        currentAddress: selectedLocation.address,
      });
      toast.success("Location and address updated successfully!");
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save location. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Default center coordinates (General Santos City, Philippines)
  const defaultCenter: [number, number] = initialLocation 
    ? [Number(initialLocation.latitude), Number(initialLocation.longitude)]
    : [6.1164, 125.1716];

  const defaultZoom = initialLocation ? 15 : 13;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl sm:max-w-4xl max-w-[95vw] max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-4 sm:p-6">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            Select Your Location
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Search for an address or click on the map to select your location
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="p-2 sm:p-3 bg-muted/50 rounded-md">
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium">Selected Location:</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    {isLoadingAddress ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading address...
                      </span>
                    ) : (
                      selectedLocation.address
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="h-48 sm:h-96 w-full rounded-md overflow-hidden border relative">
            <DynamicMapComponent
              center={defaultCenter}
              zoom={defaultZoom}
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
              profileIconData={profileIconData}
              onMapReady={(map) => {
                mapRef.current = map;
                setMapLoaded(true);
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 sm:pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isSaving}
              size="sm"
              className="w-full sm:w-auto sm:h-10"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveClick}
              disabled={!selectedLocation || isSaving || isLoadingAddress}
              size="sm"
              className="w-full sm:w-auto sm:h-10"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              )}
              Save Location
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Location Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update your location and current address to:
              <br />
              <br />
              <strong>{selectedLocation?.address}</strong>
              <br />
              <br />
              This will update both your location coordinates and your current address in your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm & Save"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}