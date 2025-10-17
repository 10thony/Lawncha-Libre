import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImagesWithUploadThing, uploadVideosWithUploadThing } from "../lib/uploadthing";

interface IntakeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function IntakeForm({ onSuccess, onCancel }: IntakeFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    projectDescription: "",
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const createIntakeForm = useMutation(api.intakeForms.createIntakeForm);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file types and sizes
      const validFiles = newFiles.filter(file => {
        const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isValidSize = file.size <= 32 * 1024 * 1024; // 32MB max
        
        if (!isValidType) {
          toast.error(`${file.name} is not a valid image or video file`);
        }
        if (!isValidSize) {
          toast.error(`${file.name} is too large. Maximum size is 32MB`);
        }
        
        return isValidType && isValidSize;
      });
      
      setFiles(prev => [...prev, ...validFiles].slice(0, 10)); // Limit to 10 files
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!formData.projectDescription.trim()) {
      toast.error("Project description is required");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setIsUploading(files.length > 0);

    try {
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];

      // Upload files if any are selected
      if (files.length > 0) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        const videoFiles = files.filter(file => file.type.startsWith('video/'));

        // Upload images and videos in parallel
        const uploadPromises = [];
        
        if (imageFiles.length > 0) {
          uploadPromises.push(
            uploadImagesWithUploadThing(imageFiles).then(urls => {
              imageUrls = urls;
            })
          );
        }
        
        if (videoFiles.length > 0) {
          uploadPromises.push(
            uploadVideosWithUploadThing(videoFiles).then(urls => {
              videoUrls = urls;
            })
          );
        }

        await Promise.all(uploadPromises);
        setIsUploading(false);
      }

      await createIntakeForm({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        projectDescription: formData.projectDescription.trim(),
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
      });

      setShowSuccess(true);
      toast.success("Quote request submitted successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting intake form:", error);
      toast.error("Failed to submit quote request. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      projectDescription: "",
    });
    setFiles([]);
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="w-full">
        <div className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest! We've received your quote request and will contact you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetForm} variant="outline">
              Submit Another Request
            </Button>
            {onCancel && (
              <Button onClick={onCancel}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Project Description */}
          <div>
            <Label htmlFor="projectDescription">Project Description *</Label>
            <Textarea
              id="projectDescription"
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleInputChange}
              required
              placeholder="Please describe your landscaping project in detail. Include the size of the area, type of work needed, timeline, and any specific requirements..."
              rows={6}
            />
          </div>

          {/* File Upload */}
          <div>
            <Label>Images or Videos (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload photos or videos of your project area
              </p>
              <p className="text-xs text-gray-500 mb-2">
                Supported formats: Images (JPG, PNG, GIF) and Videos (MP4, MOV, AVI)
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={files.length >= 10}
              >
                Choose Files
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Max 10 files, up to 32MB each (videos up to 32MB, images up to 4MB)
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        {file.name}
                        <span className="text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          file.type.startsWith('video/') 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {file.type.startsWith('video/') ? 'Video' : 'Image'}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading files...
                </>
              ) : isSubmitting ? (
                "Submitting..."
              ) : (
                "Submit Quote Request"
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• We'll review your request and match you with qualified landscapers</li>
                  <li>• You'll receive quotes from interested professionals within 24 hours</li>
                  <li>• Compare quotes and choose the best fit for your project</li>
                  <li>• Your information is secure and won't be shared without permission</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
    </div>
  );
}
