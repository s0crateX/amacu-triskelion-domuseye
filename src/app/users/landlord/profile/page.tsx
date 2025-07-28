"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { updateUserData } from "@/lib/auth/auth-utils";
import { toast } from "sonner";
import { IKUpload } from 'imagekitio-react';
import { getImageKitClientConfig } from '@/lib/imagekit';
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Leaflet
const LocationMapModal = dynamic(() => import("@/components/location-map-modal"), {
  ssr: false,
});
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Loader2,
  Building2,
  Camera,
  Map,
} from "lucide-react";

export default function LandlordProfilePage() {
  const { user, userData, loading: authLoading, refreshUserData } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [clientTimestamp, setClientTimestamp] = useState<string>("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const imageKitConfig = getImageKitClientConfig();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    profilePicture: "",
    // Landlord specific
    businessAddress: "",
    companyName: "",
  });

  // Redirect if not authenticated or not a landlord
  useEffect(() => {
    if (!authLoading && (!user || userData?.userType !== 'landlord')) {
      router.push("/");
    }
  }, [user, userData, authLoading, router]);

  // Initialize form data when userData is available
  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        profilePicture: userData.profilePicture || "",
        businessAddress: userData.businessAddress || "",
        companyName: userData.companyName || "",
      });
    }
  }, [userData]);

  // Generate timestamp on client side only to avoid hydration issues
  useEffect(() => {
    setClientTimestamp(Date.now().toString());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUploadStart = () => {
    setUploadingImage(true);
  };

  const handleImageUploadSuccess = async (response: { url: string; [key: string]: unknown }) => {
    try {
      const imageUrl = response.url;
      
      // Update form data with new profile picture URL
      setFormData(prev => ({
        ...prev,
        profilePicture: imageUrl
      }));

      // Update user data in Firebase immediately
      if (user) {
        await updateUserData(user.uid, { profilePicture: imageUrl });
        await refreshUserData();
        toast.success("Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUploadError = (error: Error | unknown) => {
    console.error("Image upload error:", error);
    toast.error("Failed to upload image. Please try again.");
    setUploadingImage(false);
  };

  const triggerImageUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };

  const handleLocationSave = async (locationData: {
    latitude: number;
    longitude: number;
    location_address: string;
    businessAddress?: string;
  }) => {
    if (!user) return;

    try {
      const updateData: Record<string, unknown> = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        location_address: locationData.location_address,
      };

      // Also update businessAddress for landlords
      if (userData?.userType === 'landlord' && locationData.businessAddress) {
        updateData.businessAddress = locationData.businessAddress;
      }

      await updateUserData(user.uid, updateData);

      await refreshUserData(); // Refresh the user data in context
      toast.success("Location and address saved successfully!");
    } catch (error) {
      console.error("Location save error:", error);
      toast.error("Failed to save location. Please try again.");
      throw error; // Re-throw to let the modal handle it
    }
  };

  const handleSave = async () => {
    if (!user || !userData) return;

    setLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        profilePicture: formData.profilePicture,
        businessAddress: formData.businessAddress,
        companyName: formData.companyName,
      };

      await updateUserData(user.uid, updateData);

      toast.success("Profile updated successfully!");
      await refreshUserData(); // Refresh the user data in context
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        profilePicture: userData.profilePicture || "",
        businessAddress: userData.businessAddress || "",
        companyName: userData.companyName || "",
      });
    }
    setIsEditing(false);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !userData || userData.userType !== 'landlord') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 p-4 pt-24">
      <div className="max-w-4xl mx-auto">

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Summary Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center mb-4">
                <div className="relative mb-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={formData.profilePicture || userData.profilePicture || user?.photoURL || ""}
                      alt={`${userData.firstName} ${userData.lastName}`}
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials(userData.firstName, userData.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Upload Button with Text - Show when editing OR when no image exists */}
                {(isEditing || !formData.profilePicture && !userData.profilePicture && !user?.photoURL) && (
                  <Button
                    onClick={triggerImageUpload}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                )}

                {/* Hidden ImageKit Upload Component */}
                <div className="hidden">
                  <IKUpload
                    ref={uploadRef}
                    publicKey={imageKitConfig.publicKey}
                    urlEndpoint={imageKitConfig.urlEndpoint}
                    authenticator={async () => {
                      try {
                        const response = await fetch('/api/imagekit-auth', {
                          method: 'POST',
                        });
                        if (!response.ok) {
                          throw new Error('Failed to authenticate');
                        }
                        return await response.json();
                      } catch (error) {
                        console.error('Authentication error:', error);
                        throw error;
                      }
                    }}
                    onUploadStart={handleImageUploadStart}
                    onSuccess={handleImageUploadSuccess}
                    onError={handleImageUploadError}
                    folder="/Profile-Pictures"
                    fileName={`profile-${user?.uid}-${clientTimestamp}`}
                    useUniqueFileName={true}
                    isPrivateFile={false}
                    accept="image/*"
                  />
                </div>
              </div>
              <CardTitle className="text-xl">
                {userData.firstName} {userData.lastName}
              </CardTitle>
              <CardDescription className="capitalize">
                {userData.userType}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.phone || userData.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{formData.companyName || userData.companyName || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{formData.businessAddress || userData.businessAddress || "Not provided"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal and business information
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      variant="outline"
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Business Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="businessAddress"
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your business address"
                        className="flex-1"
                      />
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setIsLocationModalOpen(true)}
                          title="Select location on map"
                        >
                          <Map className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Modal */}
        <LocationMapModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onSave={handleLocationSave}
          initialLocation={
            userData?.latitude && userData?.longitude && userData?.location_address
              ? {
                  latitude: userData.latitude,
                  longitude: userData.longitude,
                  location_address: userData.location_address,
                  currentAddress: userData.businessAddress || userData.location_address || "",
                }
              : null
          }
        />
      </div>
    </div>
  );
}