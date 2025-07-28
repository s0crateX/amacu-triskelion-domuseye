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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Edit3,
  Save,
  X,
  Loader2,
  Building2,
  Camera,
  Map,
} from "lucide-react";

export default function ProfilePage() {
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
    // Tenant specific
    currentAddress: "",
    employmentStatus: "",
    // Landlord specific
    businessAddress: "",
    companyName: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Initialize form data when userData is available
  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        profilePicture: userData.profilePicture || "",
        // Tenant specific
        currentAddress: userData.currentAddress || "",
        employmentStatus: userData.employmentStatus || "",
        // Landlord specific
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

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      employmentStatus: value,
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
    currentAddress?: string;
  }) => {
    if (!user) return;

    try {
      const updateData: Record<string, unknown> = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        location_address: locationData.location_address,
      };

      // Also update currentAddress for tenants
      if (userData?.userType === 'tenant' && locationData.currentAddress) {
        updateData.currentAddress = locationData.currentAddress;
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
      };

      // Add user type specific fields
      if (userData.userType === 'tenant') {
        updateData.currentAddress = formData.currentAddress;
        updateData.employmentStatus = formData.employmentStatus;
      } else if (userData.userType === 'landlord') {
        updateData.businessAddress = formData.businessAddress;
        updateData.companyName = formData.companyName;
      }

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
        // Tenant specific
        currentAddress: userData.currentAddress || "",
        employmentStatus: userData.employmentStatus || "",
        // Landlord specific
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

  if (!user || !userData) {
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
                  <span>{userData.phone || "Not provided"}</span>
                </div>
                {userData.userType === 'tenant' ? (
                  <>
                    {userData.currentAddress && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="break-words">
                          {userData.currentAddress}
                        </span>
                      </div>
                    )}
                    {userData.employmentStatus && (
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{userData.employmentStatus}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {userData.businessAddress && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="break-words">{userData.businessAddress}</span>
                      </div>
                    )}
                    {userData.companyName && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="break-words">{userData.companyName}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and preferences
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
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
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{userData.firstName || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{userData.lastName || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed from this page
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{userData.phone || "Not provided"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* User Type Specific Information */}
              {userData.userType === 'tenant' ? (
                <div>
                  <h3 className="text-lg font-medium mb-4">Tenant Information</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="currentAddress">Current Address</Label>
                        <Button
                          onClick={() => setIsLocationModalOpen(true)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Map className="h-4 w-4" />
                          {userData.latitude && userData.longitude ? 'Update Location' : 'Set Location'}
                        </Button>
                      </div>
                      {isEditing ? (
                        <Input
                          id="currentAddress"
                          name="currentAddress"
                          value={formData.currentAddress}
                          onChange={handleInputChange}
                          placeholder="Enter your current address"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{userData.currentAddress || "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employmentStatus">Employment Status</Label>
                      {isEditing ? (
                        <Select
                          value={formData.employmentStatus}
                          onValueChange={handleSelectChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="self-employed">Self-Employed</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">
                            {userData.employmentStatus || "Not provided"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium mb-4">Landlord Information</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      {isEditing ? (
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Enter your company name"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{userData.companyName || "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessAddress">Business Address</Label>
                      {isEditing ? (
                        <Input
                          id="businessAddress"
                          name="businessAddress"
                          value={formData.businessAddress}
                          onChange={handleInputChange}
                          placeholder="Enter your business address"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{userData.businessAddress || "Not provided"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Location Map Modal */}
        <LocationMapModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onSave={handleLocationSave}
          initialLocation={
            userData.latitude && userData.longitude && userData.location_address
              ? {
                  latitude: userData.latitude,
                  longitude: userData.longitude,
                  location_address: userData.location_address,
                  currentAddress: userData.currentAddress || userData.location_address || "",
                }
              : null
          }
        />
      </div>
    </div>
  );
}