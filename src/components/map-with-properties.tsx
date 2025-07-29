"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Property } from "@/types/property";
import { Bed, Bath, Car, Home } from "lucide-react";

// Extend Window interface for global functions
declare global {
  interface Window {
    showPropertyDetails?: (propertyId: string) => void;
  }
}

// Fix for default markers in react-leaflet
if (typeof window !== "undefined") {
  delete ((L.Icon.Default.prototype as unknown) as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface MapWithPropertiesProps {
  center: [number, number];
  zoom: number;
  userLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property) => void;
  onMapReady: (map: L.Map) => void;
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

export default function MapWithProperties({
  center,
  zoom,
  userLocation,
  properties,
  selectedProperty,
  onPropertySelect,
  onMapReady
}: MapWithPropertiesProps) {
  // Create user location icon
  const createUserIcon = (): L.DivIcon => {
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
        <!-- User icon container -->
        <div style="
          position: relative;
          z-index: 2;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          overflow: hidden;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-user-pin-marker',
      iconSize: [40, 50],
      iconAnchor: [20, 45],
      popupAnchor: [0, -40]
    });
  };

  // Create property icon with image and price
  const createPropertyIcon = (property: Property): L.DivIcon => {
    if (typeof window === "undefined") {
      // Return a dummy icon for SSR
      return L.divIcon({
        html: '',
        className: '',
        iconSize: [60, 80],
        iconAnchor: [30, 70],
        popupAnchor: [0, -70]
      });
    }

    const isSelected = selectedProperty?.id === property.id;
    const bgColor = isSelected ? '#cdb323' : '#1e40af';
    const firstImage = property.images && property.images.length > 0 ? property.images[0] : null;
    
    // Format price for display
    const formatPrice = (price: string) => {
      const numericPrice = price.replace(/[^0-9.]/g, '');
      const formattedPrice = parseFloat(numericPrice).toLocaleString('en-US', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
      });
      return formattedPrice.replace('PHP', '₱');
    };
    
    const iconHtml = `
      <div style="
        position: relative;
        width: 60px;
        height: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
      ">
        <!-- Price tag at the top -->
        <div style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          background: ${bgColor};
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 3;
        ">
          ${formatPrice(property.price)}
        </div>
        
        <!-- Map pin with image inside -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 50px;
          background: ${bgColor};
          border-radius: 50% 50% 50% 0;
          transform: translateX(-50%) rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 1;
          overflow: hidden;
        ">
          <!-- Image container inside the pin -->
           <div style="
             position: absolute;
             top: 50%;
             left: 50%;
             transform: translate(-50%, -50%) rotate(45deg);
             width: 40px;
             height: 40px;
             border-radius: 50%;
             overflow: hidden;
             background: white;
             border: 2px solid white;
           ">
             ${firstImage ? `
               <img 
                 src="${firstImage}" 
                 alt="${property.title}"
                 style="
                   width: 100%;
                   height: 100%;
                   object-fit: cover;
                   display: block;
                   border-radius: 50%;
                 "
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
               />
               <div style="
                 display: none;
                 width: 100%;
                 height: 100%;
                 align-items: center;
                 justify-content: center;
                 background: #f3f4f6;
                 border-radius: 50%;
               ">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${bgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                   <polyline points="9 22 9 12 15 12 15 22"></polyline>
                 </svg>
               </div>
             ` : `
               <div style="
                 width: 100%;
                 height: 100%;
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 background: #f3f4f6;
                 border-radius: 50%;
               ">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${bgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                   <polyline points="9 22 9 12 15 12 15 22"></polyline>
                 </svg>
               </div>
             `}
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-property-pin-marker',
      iconSize: [60, 80],
      iconAnchor: [30, 70],
      popupAnchor: [0, -70]
    });
  };

  const userIcon = createUserIcon();

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
      
      <MapController onMapReady={onMapReady} />
      
      {/* User location marker */}
      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]} 
          icon={userIcon}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-semibold">Your Location</p>
              <p className="text-muted-foreground">{userLocation.address}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Property markers */}
      {properties.map((property) => (
        property.latitude && property.longitude ? (
          <Marker 
            key={property.id}
            position={[property.latitude, property.longitude]} 
            icon={createPropertyIcon(property)}
            eventHandlers={{
              click: () => onPropertySelect(property)
            }}
          >
            <Popup>
              <div className="text-xs max-w-[250px]">
                <div className="font-semibold mb-1">{property.title}</div>
                <div className="text-muted-foreground mb-1">{property.address || property.location}</div>
                <div className="font-medium text-primary mb-2">
                  {property.price.replace(/[^0-9.]/g, '') ? 
                    `₱${parseFloat(property.price.replace(/[^0-9.]/g, '')).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : 
                    property.price
                  }
                </div>
                
                <div className="flex justify-between mb-3 text-[10px]">
                  <div className="flex items-center">
                    <Bed size={10} className="mr-1" />
                    <span>{property.beds}</span>
                  </div>
                  <div className="flex items-center">
                    <Bath size={10} className="mr-1" />
                    <span>{property.baths}</span>
                  </div>
                  <div className="flex items-center">
                    <Car size={10} className="mr-1" />
                    <span>{property.parking || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <Home size={10} className="mr-1" />
                    <span>{property.sqft}ft²</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.showPropertyDetails) {
                      window.showPropertyDetails(property.id);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: '#1e40af',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#1e3a8a'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#1e40af'}
                >
                  More Info
                </button>
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}