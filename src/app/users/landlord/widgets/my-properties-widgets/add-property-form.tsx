"use client";

import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Wifi,
  Tv,
  AirVent,
  Utensils,
  Dumbbell,
  Shield,
  Upload,
  X,
  Camera,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { IKUpload } from "imagekitio-react";
import Image from "next/image";
import LocationMapModal from "@/components/location-map-modal";
import DescriptionMaker from "./description-maker";

// Firebase imports
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getImageKitClientConfig } from "@/lib/imagekit";

// Auth and types
import { useAuth } from "@/lib/auth/auth-context";
import { Property, PropertyFormData } from "@/types/property";

const amenitiesList = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "ac", label: "Air Conditioning", icon: AirVent },
  { id: "kitchen", label: "Kitchen", icon: Utensils },
  { id: "tv", label: "Cable TV", icon: Tv },
  { id: "gym", label: "Gym", icon: Dumbbell },
  { id: "security", label: "24/7 Security", icon: Shield },
];

interface AddPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyAdded?: () => void;
  propertyToEdit?: Property | null;
  isEditMode?: boolean;
}

export default function AddPropertyForm({
  isOpen,
  onClose,
  onPropertyAdded,
  propertyToEdit,
  isEditMode = false,
}: AddPropertyFormProps) {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  // ImageKit configuration
  const imageKitConfig = getImageKitClientConfig();

  // Form state
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    location: "",
    address: "",
    price: "",
    beds: "",
    baths: "",
    parking: "",
    sqft: "",
    type: "",
    category: "",
    subtype: "",
    kitchen: "",
    features: [],
    images: [],
    latitude: 0,
    longitude: 0,
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && propertyToEdit) {
      setFormData({
        title: propertyToEdit.title || "",
        description: propertyToEdit.description || "",
        location: propertyToEdit.location || "",
        address: propertyToEdit.address || "",
        price: propertyToEdit.price || "",
        beds: propertyToEdit.beds?.toString() || "",
        baths: propertyToEdit.baths?.toString() || "",
        parking: propertyToEdit.parking?.toString() || "",
        sqft: propertyToEdit.sqft?.toString() || "",
        type: propertyToEdit.type || "",
        category: propertyToEdit.category || "",
        subtype: propertyToEdit.subtype || "",
        kitchen: propertyToEdit.kitchen || "",
        features: propertyToEdit.features || [],
        images: propertyToEdit.images || [],
        latitude: propertyToEdit.latitude || 0,
        longitude: propertyToEdit.longitude || 0,
      });
    } else if (!isEditMode) {
      resetForm();
    }
  }, [isEditMode, propertyToEdit]);

  const handleInputChange = (
    field: keyof PropertyFormData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureChange = (featureId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: checked
        ? [...prev.features, featureId]
        : prev.features.filter((id) => id !== featureId),
    }));
  };

  // ImageKit upload handlers
  const onUploadStart = () => {
    setUploadingImages(true);
    toast.info("Uploading images...");
  };

  const onUploadSuccess = (response: {
    url: string;
    [key: string]: unknown;
  }) => {
    const imageUrl = response.url;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrl],
    }));
    setUploadingImages(false);
    toast.success("Image uploaded successfully");
  };

  const onUploadError = (error: Error | unknown) => {
    console.error("Upload error:", error);
    setUploadingImages(false);
    toast.error("Failed to upload image");
  };

  const authenticator = async () => {
    try {
      const response = await fetch("/api/imagekit-auth", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to get authentication parameters");
      }

      return await response.json();
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Handle location selection from map modal
  const handleLocationSave = async (locationData: {
    latitude: number;
    longitude: number;
    location_address: string;
    currentAddress: string;
  }) => {
    // Extract city/area from the address (typically the last part before the country)
    const addressParts = locationData.location_address
      .split(",")
      .map((part) => part.trim());
    const extractedLocation =
      addressParts.length >= 2
        ? addressParts[addressParts.length - 2]
        : addressParts[0] || "General Santos City";

    setFormData((prev) => ({
      ...prev,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: locationData.location_address,
      location: extractedLocation,
    }));
    setShowLocationModal(false);
    toast.success("Location and address updated!");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      address: "",
      price: "",
      beds: "",
      baths: "",
      parking: "",
      sqft: "",
      type: "",
      category: "",
      subtype: "",
      kitchen: "",
      features: [],
      images: [],
      latitude: 0,
      longitude: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !userData) {
      toast.error(
        `You must be logged in to ${isEditMode ? "update" : "add"} a property`
      );
      return;
    }

    try {
      setLoading(true);

      // Extract location from address if not already set
      let propertyLocation = formData.location;
      if (!propertyLocation && formData.address) {
        const addressParts = formData.address
          .split(",")
          .map((part) => part.trim());
        propertyLocation =
          addressParts.length >= 2
            ? addressParts[addressParts.length - 2]
            : addressParts[0] || "General Santos City";
      } else if (!propertyLocation) {
        propertyLocation = "General Santos City"; // Default fallback
      }

      const propertyData: Omit<Property, "id"> = {
        // Required fields specification
        available: isEditMode ? propertyToEdit?.available ?? true : true,
        image: formData.images[0] || "",
        title: formData.title,
        price: formData.price,
        location: propertyLocation,
        beds: parseInt(formData.beds),
        baths: parseInt(formData.baths),
        sqft: parseInt(formData.sqft),
        features: formData.features,
        isNew: isEditMode ? propertyToEdit?.isNew ?? false : true,
        isVerified: isEditMode ? propertyToEdit?.isVerified ?? false : false,
        type: formData.type,
        uid: user.uid,
        category: formData.category,
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        address: formData.address,
        description: formData.description,
        images: formData.images,
        landlord: [userData.firstName + " " + userData.lastName],
        subtype: formData.subtype,
        kitchen: formData.kitchen,
        parking: parseInt(formData.parking) || 0,
        landlordId: user.uid,
        landlordName: userData.firstName + " " + userData.lastName,

        // Additional fields for internal use
        datePosted: isEditMode
          ? propertyToEdit?.datePosted ?? new Date().toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        views: isEditMode ? propertyToEdit?.views ?? 0 : 0,
        inquiries: isEditMode ? propertyToEdit?.inquiries ?? 0 : 0,
        tenant: isEditMode ? propertyToEdit?.tenant ?? null : null,
        status: isEditMode
          ? propertyToEdit?.status ?? "Available"
          : "Available",
        amenities: formData.features,
        area: parseInt(formData.sqft),
      };

      if (isEditMode && propertyToEdit?.id) {
        // Update existing property
        await updateDoc(doc(db, "properties", propertyToEdit.id), propertyData);
        toast.success("Property updated successfully!");
      } else {
        // Add new property
        await addDoc(collection(db, "properties"), propertyData);
        toast.success("Property added successfully!");
      }

      resetForm();
      onClose();
      onPropertyAdded?.();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} property:`,
        error
      );
      toast.error(`Failed to ${isEditMode ? "update" : "add"} property`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-semibold">
              {isEditMode ? "Edit Property" : "Add New Property"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {isEditMode
                ? "Update the details of your property. Fields marked with * are required."
                : "Fill in the details to list your property for rent. Fields marked with * are required."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-8 p-1">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
                  <TabsTrigger value="basic" className="text-sm font-medium">
                    Basic Information
                  </TabsTrigger>
                  <TabsTrigger value="details" className="text-sm font-medium">
                    Property Details
                  </TabsTrigger>
                  <TabsTrigger value="images" className="text-sm font-medium">
                    Photos & Media
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-8 mt-6">
                  {/* Property Overview Section */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-primary pl-4">
                      <h3 className="text-lg font-semibold mb-1">
                        Property Overview
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Basic information about your property
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="title"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          Property Title
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) =>
                            handleInputChange("title", e.target.value)
                          }
                          placeholder="e.g., Modern 2BR Apartment in Downtown"
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="type"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          Property Type
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            handleInputChange("type", value)
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="Condo">Condominium</SelectItem>
                            <SelectItem value="House">House</SelectItem>
                            <SelectItem value="Studio">Studio</SelectItem>
                            <SelectItem value="Townhouse">Townhouse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="category"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          Category
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            handleInputChange("category", value)
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Residential">
                              Residential
                            </SelectItem>
                            <SelectItem value="Commercial">
                              Commercial
                            </SelectItem>
                            <SelectItem value="Mixed-use">Mixed-use</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="subtype"
                          className="text-sm font-medium"
                        >
                          Subtype
                        </Label>
                        <Input
                          id="subtype"
                          value={formData.subtype}
                          onChange={(e) =>
                            handleInputChange("subtype", e.target.value)
                          }
                          placeholder="e.g., High-rise, Low-rise, Garden-style"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium flex items-center gap-1"
                      >
                        Property Description
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe your property, its features, neighborhood, and what makes it special. Include details about nearby amenities, transportation, and unique selling points..."
                        rows={5}
                        required
                        className="resize-none"
                      />
                    </div>

                    {/* AI Description Generator */}
                    <div className="mt-4">
                      <DescriptionMaker
                        onDescriptionGenerated={(description) => {
                          handleInputChange("description", description);
                          toast.success("Description applied successfully!");
                        }}
                      />
                    </div>
                  </div>

                  {/* Pricing & Location Section */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="text-lg font-semibold mb-1">
                        Pricing & Location
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Set your rental price and property location
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="price"
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          Monthly Rent (₱)
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          placeholder="35,000"
                          required
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="text-sm font-medium flex items-center gap-1"
                      >
                        Complete Address
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          placeholder="Street, Barangay, City, Province"
                          required
                          className="flex-1 h-11"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowLocationModal(true)}
                          className="h-11 px-4 whitespace-nowrap"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Pin Location
                        </Button>
                      </div>
                      {formData.latitude !== 0 && formData.longitude !== 0 && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-md">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <p className="text-xs text-green-700 dark:text-green-400">
                            Location pinned: {formData.latitude.toFixed(6)},{" "}
                            {formData.longitude.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-8 mt-6">
                  {/* Property Specifications */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-semibold mb-1">
                        Property Specifications
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Detailed information about rooms and space
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="beds"
                          className="text-xs font-medium flex items-center gap-1"
                        >
                          Bedrooms
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="beds"
                          type="number"
                          value={formData.beds}
                          onChange={(e) =>
                            handleInputChange("beds", e.target.value)
                          }
                          placeholder="2"
                          min="0"
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="baths"
                          className="text-xs font-medium flex items-center gap-1"
                        >
                          Bathrooms
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="baths"
                          type="number"
                          value={formData.baths}
                          onChange={(e) =>
                            handleInputChange("baths", e.target.value)
                          }
                          placeholder="2"
                          min="1"
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="parking"
                          className="text-xs font-medium"
                        >
                          Parking Slots
                        </Label>
                        <Input
                          id="parking"
                          type="number"
                          value={formData.parking}
                          onChange={(e) =>
                            handleInputChange("parking", e.target.value)
                          }
                          placeholder="1"
                          min="0"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sqft" className="text-xs font-medium">
                          Floor Area (sqft)
                        </Label>
                        <Input
                          id="sqft"
                          type="number"
                          value={formData.sqft}
                          onChange={(e) =>
                            handleInputChange("sqft", e.target.value)
                          }
                          placeholder="850"
                          min="1"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="kitchen"
                          className="text-sm font-medium"
                        >
                          Kitchen Type
                        </Label>
                        <Select
                          value={formData.kitchen}
                          onValueChange={(value) =>
                            handleInputChange("kitchen", value)
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select kitchen type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full Kitchen">
                              Full Kitchen
                            </SelectItem>
                            <SelectItem value="Kitchenette">
                              Kitchenette
                            </SelectItem>
                            <SelectItem value="No Kitchen">
                              No Kitchen
                            </SelectItem>
                            <SelectItem value="Shared Kitchen">
                              Shared Kitchen
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Features & Amenities */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="text-lg font-semibold mb-1">
                        Features & Amenities
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Select all amenities available in your property
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {amenitiesList.map((amenity) => (
                        <div
                          key={amenity.id}
                          className="flex items-center space-x-2 p-2.5 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={amenity.id}
                            checked={formData.features.includes(amenity.id)}
                            onCheckedChange={(checked) =>
                              handleFeatureChange(
                                amenity.id,
                                checked as boolean
                              )
                            }
                            className="flex-shrink-0"
                          />
                          <Label
                            htmlFor={amenity.id}
                            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                          >
                            <amenity.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs font-medium truncate">
                              {amenity.label}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-8 mt-6">
                  <div className="space-y-6">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h3 className="text-lg font-semibold mb-1">
                        Property Photos
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Upload high-quality images to showcase your property
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-muted-foreground/40 transition-colors">
                        <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-lg font-medium mb-1">
                              Upload Property Images
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Add photos of different rooms, exterior views, and
                              key features
                            </p>
                          </div>
                          <IKUpload
                            publicKey={imageKitConfig.publicKey}
                            urlEndpoint={imageKitConfig.urlEndpoint}
                            authenticator={authenticator}
                            fileName="property-image.jpg"
                            folder="/Properties-Pictures"
                            onUploadStart={onUploadStart}
                            onUploadProgress={() => {
                              // Upload progress tracking
                            }}
                            onSuccess={onUploadSuccess}
                            onError={onUploadError}
                            style={{ display: "none" }}
                            ref={uploadRef}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => uploadRef.current?.click()}
                            disabled={uploadingImages}
                            className="h-12 px-6"
                          >
                            {uploadingImages ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Uploading Image...
                              </>
                            ) : (
                              <>
                                <Upload className="h-5 w-5 mr-2" />
                                Choose Images
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {formData.images.length > 0 && (
                        <div>
                          <h4 className="text-base font-medium mb-4">
                            Uploaded Images ({formData.images.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <Image
                                  src={image}
                                  alt={`Property image ${index + 1}`}
                                  width={200}
                                  height={128}
                                  className="w-full h-32 object-cover rounded-lg border"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
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
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-between items-center gap-4 pt-6 border-t bg-background">
            <div className="text-sm text-muted-foreground">
              {formData.images.length > 0 && (
                <span>
                  {formData.images.length} image
                  {formData.images.length !== 1 ? "s" : ""} uploaded
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="h-11 px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating Property..." : "Adding Property..."}
                  </>
                ) : isEditMode ? (
                  "Update Property"
                ) : (
                  "List Property"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Map Modal */}
      <LocationMapModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSave={handleLocationSave}
        initialLocation={{
          latitude: formData.latitude || 6.1164,
          longitude: formData.longitude || 125.1716,
          location_address: formData.address,
          currentAddress: formData.address,
        }}
      />
    </>
  );
}
