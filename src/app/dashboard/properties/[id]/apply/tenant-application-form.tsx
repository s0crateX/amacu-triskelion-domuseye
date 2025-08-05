"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";

// Firebase imports
import { doc, setDoc, serverTimestamp, FieldValue } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Auth and types
import { useAuth } from "@/lib/auth/auth-context";
import { TenantApplication } from "@/types/property";

interface TenantApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

// Using the TenantApplication interface from types
type ApplicationData = Omit<TenantApplication, "id" | "propertyId">;

export default function TenantApplicationForm({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
}: TenantApplicationFormProps) {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !userData) {
      toast.error("You must be logged in to apply for a property");
      return;
    }

    if (userData.userType !== "tenant") {
      toast.error("Only tenants can apply for properties");
      return;
    }

    if (!message.trim()) {
      toast.error("Please provide a message with your application");
      return;
    }

    try {
      setLoading(true);

      const applicationData: Omit<ApplicationData, "appliedAt"> & {
        appliedAt: FieldValue;
      } = {
        tenantId: user.uid,
        tenantName: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        message: message.trim(),
        status: "pending",
        appliedAt: serverTimestamp(),
      };

      // Add application as subcollection of the property using user's UID as document ID
      await setDoc(
        doc(db, "properties", propertyId, "applications", user.uid),
        applicationData
      );

      toast.success("Application submitted successfully!");
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
            Apply for Property
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            Submit your application for &ldquo;{propertyTitle}&rdquo;. Your
            application will be reviewed by the landlord.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
        >
          {/* Tenant Information (Read-only) */}
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-base sm:text-lg font-semibold mb-1">
                Your Information
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                This information will be sent to the landlord
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="tenantName"
                  className="text-xs sm:text-sm font-medium"
                >
                  Full Name
                </Label>
                <Input
                  id="tenantName"
                  value={
                    userData ? `${userData.firstName} ${userData.lastName}` : ""
                  }
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs sm:text-sm font-medium"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={userData?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>

          {/* Application Message */}
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-base sm:text-lg font-semibold mb-1">
                Application Message
              </h3>
              <p className="text-sm text-muted-foreground">
                Tell the landlord why you&apos;re interested in this property
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="text-xs sm:text-sm font-medium flex items-center gap-1"
              >
                Message to Landlord
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I'm interested in renting this property, Please let me know if you need any additional information from me."
                rows={6}
                required
                className="resize-none"
              />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Include information about yourself, your rental history, income,
                and why you&apos;re interested in this property.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
