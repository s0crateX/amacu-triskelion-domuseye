"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth/auth-context";
import { updateUserData } from "@/lib/auth/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { IKUpload } from "imagekitio-react";
import { getImageKitClientConfig } from "@/lib/imagekit";

// Dynamic import to prevent SSR issues with Leaflet
const LocationMapModal = dynamic(
  () => import("@/components/location-map-modal"),
  {
    ssr: false,
  }
);
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
  Map,
} from "lucide-react";

// Define types for user data updates
interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  currentAddress?: string;
  businessAddress?: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  profilePicture?: string;
}

interface ImageKitResponse {
  url: string;
  fileId: string;
  name: string;
}

interface UserDataWithDateOfBirth {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  userType?: string;
  currentAddress?: string;
  businessAddress?: string;
  location_address?: string;
  dateOfBirth?: string;
}

export default function ProfilePage() {
  const { user, userData, loading, refreshUserData } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });

  // ImageKit configuration
  const imageKitConfig = getImageKitClientConfig();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/dashboard/login");
        return;
      }

      if (userData) {
        // Get the appropriate address field based on user type
        const getAddressField = () => {
          if (userData.userType === "tenant") {
            return userData.currentAddress || "";
          } else if (userData.userType === "landlord") {
            return userData.businessAddress || "";
          }
          return userData.location_address || "";
        };

        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || user.email || "",
          phone: userData.phone || "",
          address: getAddressField(),
          dateOfBirth: (userData as UserDataWithDateOfBirth).dateOfBirth || "",
        });
      }
    }
  }, [user, userData, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (user) {
        // Prepare update data with correct address field based on user type
        const updateData: UserUpdateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
        };

        // Set the appropriate address field based on user type
        if (userData?.userType === "tenant") {
          updateData.currentAddress = formData.address;
        } else if (userData?.userType === "landlord") {
          updateData.businessAddress = formData.address;
        } else {
          updateData.location_address = formData.address;
        }

        await updateUserData(user.uid, updateData);

        // Refresh user data to get updated information
        await refreshUserData();
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (userData) {
      // Get the appropriate address field based on user type
      const getAddressField = () => {
        if (userData.userType === "tenant") {
          return userData.currentAddress || "";
        } else if (userData.userType === "landlord") {
          return userData.businessAddress || "";
        }
        return userData.location_address || "";
      };

      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || user?.email || "",
        phone: userData.phone || "",
        address: getAddressField(),
        dateOfBirth: (userData as UserDataWithDateOfBirth).dateOfBirth || "",
      });
    }
    setIsEditing(false);
  };

  // Handle location map modal
  const handleOpenMapModal = () => {
    setIsMapModalOpen(true);
  };

  const handleCloseMapModal = () => {
    setIsMapModalOpen(false);
  };

  const handleSaveLocation = async (locationData: {
    latitude: number;
    longitude: number;
    location_address: string;
    currentAddress: string;
  }) => {
    try {
      // Update the form data with the new address
      setFormData((prev) => ({
        ...prev,
        address: locationData.currentAddress || locationData.location_address,
      }));

      // If we're in editing mode, also update the user data
      if (isEditing) {
        const updateData: UserUpdateData = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          location_address: locationData.location_address,
        };

        // Set the appropriate address field based on user type
        if (userData?.userType === "tenant") {
          updateData.currentAddress =
            locationData.currentAddress || locationData.location_address;
        } else if (userData?.userType === "landlord") {
          updateData.businessAddress =
            locationData.currentAddress || locationData.location_address;
        } else {
          updateData.location_address =
            locationData.currentAddress || locationData.location_address;
        }

        if (user) {
          await updateUserData(user.uid, updateData);
        }
        await refreshUserData();
        toast.success("Location updated successfully!");
      }

      setIsMapModalOpen(false);
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location. Please try again.");
    }
  };

  // Profile picture upload handlers
  const handleProfilePictureClick = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
    }
  };

  const onUploadStart = () => {
    setIsUploadingImage(true);
    toast.info("Uploading profile picture...");
  };

  const onUploadSuccess = async (response: ImageKitResponse) => {
    try {
      if (user && response.url) {
        // Update user data with new profile picture URL
        await updateUserData(user.uid, {
          profilePicture: response.url,
        });

        // Refresh user data to show new profile picture
        await refreshUserData();
        setIsUploadingImage(false);
        toast.success("Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setIsUploadingImage(false);
      toast.error("Failed to update profile picture");
    }
  };

  const onUploadError = (error: Error) => {
    console.error("Upload error:", error);
    setIsUploadingImage(false);
    toast.error("Failed to upload profile picture");
  };

  // Get authentication parameters for ImageKit
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

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  // Loading state is now handled by loading.tsx

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden ImageKit Upload Component */}
      <IKUpload
        ref={uploadRef}
        publicKey={imageKitConfig.publicKey}
        urlEndpoint={imageKitConfig.urlEndpoint}
        authenticator={authenticator}
        fileName={`profile-${user.uid}-${Date.now()}`}
        folder="/Profile-Pictures"
        onUploadStart={onUploadStart}
        onUploadProgress={(progress: number) => {
          console.log("Upload progress:", progress);
        }}
        onSuccess={onUploadSuccess}
        onError={onUploadError}
        accept="image/*"
        style={{ display: "none" }}
        transformation={{
          pre: "w-400,h-400,c-maintain_ratio",
          post: [
            {
              type: "transformation",
              value: "w-200,h-200,c-maintain_ratio",
            },
          ],
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            {/* Mobile Layout - Stacked */}
            <div className="flex flex-col space-y-4 sm:hidden">
              {/* Avatar and Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                    <AvatarImage
                      src={userData.profilePicture || user.photoURL || ""}
                      alt={`${userData.firstName} ${userData.lastName}`}
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials(userData.firstName, userData.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Camera Button */}
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    onClick={handleProfilePictureClick}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl sm:text-2xl truncate">
                    {userData.firstName} {userData.lastName}
                  </CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize w-fit">
                      {userData.userType}
                    </Badge>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Member since{" "}
                      {new Date(userData.createdAt || Date.now()).getFullYear()}
                    </span>
                  </CardDescription>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop Layout - Side by Side */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={userData.profilePicture || user.photoURL || ""}
                      alt={`${userData.firstName} ${userData.lastName}`}
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials(userData.firstName, userData.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Camera Button */}
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    onClick={handleProfilePictureClick}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {userData.firstName} {userData.lastName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {userData.userType}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Member since{" "}
                      {new Date(userData.createdAt || Date.now()).getFullYear()}
                    </span>
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>

            <Separator className="my-4 sm:my-6" />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`${!isEditing ? "bg-muted" : ""} flex-1`}
                    placeholder="Enter your address"
                  />
                  {userData.userType === "tenant" && isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleOpenMapModal}
                      className="flex-shrink-0"
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dateOfBirth"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>

            {/* Mobile Action Buttons at Bottom */}
            {isEditing && (
              <div className="flex gap-2 pt-4 sm:hidden">
                <Button onClick={handleSave} size="sm" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location Map Modal */}
      <LocationMapModal
        isOpen={isMapModalOpen}
        onClose={handleCloseMapModal}
        onSave={handleSaveLocation}
        initialLocation={
          userData.latitude && userData.longitude
            ? {
                latitude: userData.latitude,
                longitude: userData.longitude,
                location_address: userData.location_address || "",
                currentAddress:
                  userData.userType === "tenant"
                    ? userData.currentAddress || ""
                    : userData.userType === "landlord"
                    ? userData.businessAddress || ""
                    : userData.location_address || "",
              }
            : null
        }
      />
    </div>
  );
}
