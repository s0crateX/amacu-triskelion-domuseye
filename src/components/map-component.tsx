"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Fix for default markers in react-leaflet
if (typeof window !== "undefined") {
  delete ((L.Icon.Default.prototype as unknown) as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface ProfileIconData {
  html: string;
  className: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor: [number, number];
}

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  selectedLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  onLocationSelect: (lat: number, lng: number) => void;
  onMapReady: (map: L.Map) => void;
  profileIconData: ProfileIconData;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e: { latlng: { lat: number; lng: number } }) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to handle map reference and control
function MapController({ 
  onMapReady 
}: { 
  onMapReady: (map: L.Map) => void 
}) {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
}

export default function MapComponent({
  center,
  zoom,
  selectedLocation,
  onLocationSelect,
  onMapReady,
  profileIconData
}: MapComponentProps) {
  // Create the profile icon from the icon data
  const createProfileIcon = (iconData: ProfileIconData): L.DivIcon => {
    if (typeof window === "undefined") {
      // Return a dummy icon for SSR
      return L.divIcon({
        html: '',
        className: '',
        iconSize: [40, 50],
        iconAnchor: [20, 45],
        popupAnchor: [0, -40]
      });
    }

    return L.divIcon({
      html: iconData.html,
      className: iconData.className,
      iconSize: iconData.iconSize,
      iconAnchor: iconData.iconAnchor,
      popupAnchor: iconData.popupAnchor
    });
  };

  const profileIcon = createProfileIcon(profileIconData);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      
      <MapClickHandler onLocationSelect={onLocationSelect} />
      <MapController onMapReady={onMapReady} />
      
      {selectedLocation && (
        <Marker 
          position={[selectedLocation.lat, selectedLocation.lng]} 
          icon={profileIcon}
        />
      )}
    </MapContainer>
  );
}