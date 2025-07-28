"use client";

import { useState } from "react";
import {
  Settings,
  Plus,
  X,
  Upload,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MaintenanceFormData {
  title: string;
  category: string;
  priority: string;
  description: string;
  location: string;
  preferredTime: string;
  contactMethod: string;
  images: File[];
}

interface MaintenanceRequestDialogProps {
  onSubmit?: (formData: MaintenanceFormData) => void;
  triggerClassName?: string;
}

export default function MaintenanceRequestDialog({ 
  onSubmit,
  triggerClassName = "w-full mt-4"
}: MaintenanceRequestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<MaintenanceFormData>({
    title: "",
    category: "",
    priority: "",
    description: "",
    location: "",
    preferredTime: "",
    contactMethod: "",
    images: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call the onSubmit callback if provided
    if (onSubmit) {
      onSubmit(formData);
    } else {
      // Default behavior - log to console and show alert
      console.log("Maintenance request submitted:", formData);
      alert("Maintenance request submitted successfully!");
    }
    
    // Reset form and close dialog
    setFormData({
      title: "",
      category: "",
      priority: "",
      description: "",
      location: "",
      preferredTime: "",
      contactMethod: "",
      images: []
    });
    setIsOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5) // Limit to 5 images
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const isFormValid = formData.title && formData.category && formData.priority && formData.location && formData.description;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>
          <Plus className="w-4 h-4 mr-2" />
          Submit New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl mx-auto my-4 max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 pt-6 pb-4 border-b border-border">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
              <span className="truncate">Submit Maintenance Request</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Fill out the form below to submit a maintenance request. Please provide as much detail as possible to help us resolve your issue quickly.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Request Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Request Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="h-10 sm:h-11"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-foreground">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto z-50 w-auto min-w-[280px] max-w-[calc(100vw-4rem)]" side="bottom" align="start" avoidCollisions={true} collisionPadding={16}>
                  <SelectItem value="plumbing">🔧 Plumbing</SelectItem>
                  <SelectItem value="electrical">⚡ Electrical</SelectItem>
                  <SelectItem value="hvac">❄️ HVAC/Air Conditioning</SelectItem>
                  <SelectItem value="appliances">🏠 Appliances</SelectItem>
                  <SelectItem value="doors-windows">🚪 Doors & Windows</SelectItem>
                  <SelectItem value="flooring">🏗️ Flooring</SelectItem>
                  <SelectItem value="painting">🎨 Painting</SelectItem>
                  <SelectItem value="pest-control">🐛 Pest Control</SelectItem>
                  <SelectItem value="security">🔒 Security</SelectItem>
                  <SelectItem value="other">📝 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium text-foreground">
                Priority <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto z-50 w-[var(--radix-select-trigger-width)] min-w-[200px]" side="bottom" align="center" avoidCollisions={true} collisionPadding={16}>
                  <SelectItem value="low">🟢 Low - Can wait a few days</SelectItem>
                  <SelectItem value="medium">🟡 Medium - Should be addressed soon</SelectItem>
                  <SelectItem value="high">🟠 High - Urgent, affects daily life</SelectItem>
                  <SelectItem value="emergency">🔴 Emergency - Immediate attention needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-foreground">
                Location in Unit <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g., Kitchen sink, Master bedroom, Living room"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="h-10 sm:h-11"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Detailed Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Please describe the issue in detail, including when it started, what you've tried, and any other relevant information..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[120px] sm:min-h-[140px] resize-none"
                required
              />
            </div>

            {/* Preferred Time for Access */}
            <div className="space-y-2">
              <Label htmlFor="preferredTime" className="text-sm font-medium text-foreground">
                Preferred Time for Access
              </Label>
              <Select value={formData.preferredTime} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredTime: value }))}>
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto z-50 w-auto min-w-[280px] max-w-[calc(100vw-4rem)]" side="bottom" align="start" avoidCollisions={true} collisionPadding={16}>
                  <SelectItem value="morning">🌅 Morning (8AM - 12PM)</SelectItem>
                  <SelectItem value="afternoon">☀️ Afternoon (12PM - 5PM)</SelectItem>
                  <SelectItem value="evening">🌆 Evening (5PM - 8PM)</SelectItem>
                  <SelectItem value="weekend">📅 Weekend</SelectItem>
                  <SelectItem value="anytime">⏰ Anytime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Contact Method */}
            <div className="space-y-2">
              <Label htmlFor="contactMethod" className="text-sm font-medium text-foreground">
                Preferred Contact Method
              </Label>
              <Select value={formData.contactMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, contactMethod: value }))}>
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="How should we contact you?" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto z-50 w-[var(--radix-select-trigger-width)] min-w-[200px]" side="bottom" align="center" avoidCollisions={true} collisionPadding={16}>
                  <SelectItem value="phone">📞 Phone Call</SelectItem>
                  <SelectItem value="sms">💬 Text Message</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="app">📱 App Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="images" className="text-sm font-medium text-foreground">
                Photos (Optional)
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 sm:p-8 bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Upload photos to help us understand the issue better
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Drag and drop your files here, or click to browse
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <div className="flex justify-center">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="pointer-events-none h-10 sm:h-11 px-4 sm:px-6">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Photos
                      </Button>
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Maximum 5 photos, up to 10MB each • JPG, PNG, GIF
                  </p>
                </div>
                
                {/* Display uploaded images */}
                {formData.images.length > 0 && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-muted-foreground/20">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-background border border-border rounded-lg flex items-center justify-center p-2 sm:p-3 shadow-sm">
                            <span className="text-xs text-muted-foreground text-center leading-tight break-all">
                              {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 px-4 sm:px-6 pb-6 pt-4 border-t border-border bg-background">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto h-10 sm:h-11 px-6 sm:px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full sm:flex-1 h-10 sm:h-11 px-6 sm:px-8 font-medium"
              disabled={!isFormValid}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}