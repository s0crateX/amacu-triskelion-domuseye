"use client"

import { useState, useEffect } from "react";
import { 
  Building, 
  Plus, 
  Search, 
  Bed, 
  Bath, 
  Car, 
  Wifi, 
  Tv, 
  AirVent, 
  Utensils, 
  Dumbbell, 
  Shield, 
  Edit, 
  Eye, 
  Trash2, 
  Star,
  Users,
  Calendar,
  Phone,
  Loader2,
  MessageSquare,
  MapPin,
  Home
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import AddPropertyForm from '../widgets/my-properties-widgets/add-property-form';

// Firebase imports
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Auth and types
import { useAuth } from '@/lib/auth/auth-context';
import { Property } from '@/types/property';

// Amenities list for displaying property features
const amenitiesList = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "ac", label: "Air Conditioning", icon: AirVent },
  { id: "kitchen", label: "Kitchen", icon: Utensils },
  { id: "tv", label: "Cable TV", icon: Tv },
  { id: "gym", label: "Gym", icon: Dumbbell },
  { id: "security", label: "24/7 Security", icon: Shield },
];

export default function MyPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Fetch properties from Firebase
  useEffect(() => {
    if (!user) return;

    const propertiesQuery = query(
      collection(db, 'properties'),
      where('landlordId', '==', user.uid),
      orderBy('datePosted', 'desc')
    );

    const unsubscribe = onSnapshot(propertiesQuery, (snapshot) => {
      const propertiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      
      setProperties(propertiesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePropertyAdded = () => {
    // This will trigger a re-fetch through the onSnapshot listener
    // No additional action needed since we're using real-time updates
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowViewModal(true);
  };

  const handleEditProperty = (property: Property) => {
    setPropertyToEdit(property);
    setShowEditForm(true);
  };

  const handleDeleteProperty = (property: Property) => {
    setPropertyToDelete(property);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'properties', propertyToDelete.id));
      toast.success('Property deleted successfully');
      setShowDeleteConfirm(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "available" && property.status === "Available") ||
                         (filterStatus === "occupied" && property.status === "Occupied");
    return matchesSearch && matchesFilter;
  });

  if (loading && properties.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading properties...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-foreground">
            My Properties
          </h1>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
        
        {/* Add Property Form */}
        <AddPropertyForm 
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onPropertyAdded={handlePropertyAdded}
        />
        
        <p className="text-lg text-muted-foreground">
          Manage your property listings and track their performance
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow overflow-hidden max-w-sm">
            <div className="h-48 bg-muted relative">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge variant={property.available ? "default" : "secondary"} className="text-xs">
                  {property.available ? "Available" : "Occupied"}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-background/80 text-xs">
                  ₱{typeof property.price === 'string' ? property.price : Number(property.price).toLocaleString()}/mo
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-2 px-4 pt-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base line-clamp-1 mb-1">{property.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{property.address || property.location}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 px-4 pb-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  {property.beds}
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  {property.baths}
                </div>
                {property.parking > 0 && (
                  <div className="flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    {property.parking}
                  </div>
                )}
                {property.sqft && (
                  <div className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    {property.sqft}
                  </div>
                )}
              </div>
              
              {property.features && property.features.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {property.features.slice(0, 2).map((feature) => {
                    const amenity = amenitiesList.find(a => a.id === feature);
                    return amenity ? (
                      <Badge key={feature} variant="outline" className="text-xs py-0 px-1">
                        <amenity.icon className="h-2 w-2 mr-1" />
                        {amenity.label}
                      </Badge>
                    ) : null;
                  })}
                  {property.features.length > 2 && (
                    <Badge variant="outline" className="text-xs py-0 px-1">
                      +{property.features.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              
              {property.tenant && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="line-clamp-1">Tenant: {property.tenant}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {property.views || 0}
                  </div>
                  <div className="flex items-center gap-1">
                     <MessageSquare className="h-3 w-3" />
                     {property.inquiries || 0}
                   </div>
                 </div>
                 <div className="text-xs">
                   {property.datePosted}
                 </div>
              </div>
              
              <div className="flex gap-1 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-8 text-xs"
                  onClick={() => handleViewProperty(property)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-8 text-xs"
                  onClick={() => handleEditProperty(property)}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleDeleteProperty(property)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredProperties.length === 0 && (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Start by adding your first property listing"
                  }
                </p>
                {!searchTerm && filterStatus === "all" && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Property
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedProperty?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-6">
              {/* Property Images */}
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedProperty.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`${selectedProperty.title} - Image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            Main Photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Price:</span>
                      <span className="text-lg font-bold text-primary">
                        ₱{typeof selectedProperty.price === 'string' ? selectedProperty.price : Number(selectedProperty.price).toLocaleString()}/month
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge variant={selectedProperty.available ? "default" : "secondary"}>
                        {selectedProperty.available ? "Available" : "Occupied"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Property Type:</span>
                      <span>{selectedProperty.type || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Subtype:</span>
                      <span>{selectedProperty.subtype || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date Posted:</span>
                      <span>{selectedProperty.datePosted}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Property Specifications</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Bedrooms:</span>
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {selectedProperty.beds}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Bathrooms:</span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {selectedProperty.baths}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Parking Slots:</span>
                      <span className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        {selectedProperty.parking || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Floor Area:</span>
                      <span className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        {selectedProperty.sqft ? `${selectedProperty.sqft} sqft` : "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Kitchen Type:</span>
                      <span>{selectedProperty.kitchen || "Not specified"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedProperty.location}</p>
                    {selectedProperty.address && (
                      <p className="text-sm text-muted-foreground">{selectedProperty.address}</p>
                    )}
                    {selectedProperty.latitude && selectedProperty.longitude && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Coordinates: {selectedProperty.latitude.toFixed(6)}, {selectedProperty.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProperty.description && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProperty.description}
                  </p>
                </div>
              )}

              {/* Features & Amenities */}
              {selectedProperty.features && selectedProperty.features.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Features & Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedProperty.features.map((feature) => {
                      const amenity = amenitiesList.find(a => a.id === feature);
                      return amenity ? (
                        <div key={feature} className="flex items-center gap-2 p-2 border rounded-lg">
                          <amenity.icon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{amenity.label}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Tenant Information */}
              {selectedProperty.tenant && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Tenant Information</h3>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Current Tenant: {selectedProperty.tenant}</span>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Property Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{selectedProperty.views || 0}</p>
                    <p className="text-sm text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{selectedProperty.inquiries || 0}</p>
                    <p className="text-sm text-muted-foreground">Inquiries</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm font-bold">{selectedProperty.datePosted}</p>
                    <p className="text-sm text-muted-foreground">Posted</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">{selectedProperty.rating || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditProperty(selectedProperty);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Property
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowViewModal(false);
                    handleDeleteProperty(selectedProperty);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Property
                </Button>
                <Button onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Property Form */}
      <AddPropertyForm 
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setPropertyToEdit(null);
        }}
        onPropertyAdded={handlePropertyAdded}
        propertyToEdit={propertyToEdit}
        isEditMode={true}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Property
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Are you sure you want to delete this property? This action cannot be undone.
            </div>
          </DialogHeader>
          
          {propertyToDelete && (
            <div className="py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{propertyToDelete.title}</p>
                <p className="text-sm text-muted-foreground">{propertyToDelete.location}</p>
                <p className="text-sm text-muted-foreground">
                  ₱{typeof propertyToDelete.price === 'string' ? propertyToDelete.price : Number(propertyToDelete.price).toLocaleString()}/month
                </p>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirm(false);
                setPropertyToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteProperty}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Property
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}