import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Star, Plus, Heart, MessageSquare, Image as ImageIcon } from "lucide-react";
import { uploadImagesWithUploadThing } from "@/lib/uploadthing";

interface TestimonialsDashboardProps {
  profile: any;
}

export function TestimonialsDashboard({ profile }: TestimonialsDashboardProps) {
  const [showCreateTestimonial, setShowCreateTestimonial] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(null);

  const testimonials = useQuery(api.testimonials.getTestimonials, 
    profile.userType === "business" ? { businessOwnerClerkId: profile.clerkUserId } : {}
  );
  const businessOwners = useQuery(api.profiles.getBusinessOwners);
  const myProjects = useQuery(api.projects.getMyProjects);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          {profile.userType === "business" ? "Customer Reviews" : "My Reviews"}
        </h2>
        {profile.userType === "client" && (
          <Dialog open={showCreateTestimonial} onOpenChange={setShowCreateTestimonial}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience with a business you've worked with.
                </DialogDescription>
              </DialogHeader>
              <CreateTestimonialForm 
                businessOwners={businessOwners || []}
                projects={myProjects || []}
                onSuccess={() => setShowCreateTestimonial(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {testimonials?.map((testimonial) => (
          <button key={testimonial._id} onClick={() => setSelectedTestimonial(testimonial)} className="text-left">
            <TestimonialCard 
              testimonial={testimonial} 
              userType={profile.userType}
            />
          </button>
        ))}
        {!testimonials?.length && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {profile.userType === "business" 
                ? "No reviews yet" 
                : "You haven't written any reviews yet"
              }
            </p>
          </div>
        )}
      </div>

      {selectedTestimonial && (
        <ReviewDetailsDialog 
          testimonial={selectedTestimonial} 
          currentUserId={profile.clerkUserId}
          onClose={() => setSelectedTestimonial(null)}
        />
      )}
    </div>
  );
}

function TestimonialCard({ testimonial, userType }: any) {
  const toggleHighlight = useMutation(api.testimonials.toggleHighlight);

  const handleToggleHighlight = async () => {
    try {
      await toggleHighlight({ testimonialId: testimonial._id });
      toast.success(testimonial.isHighlighted ? "Review unhighlighted" : "Review highlighted");
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${
      testimonial.isHighlighted ? "ring-2 ring-yellow-400" : ""
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{testimonial.title}</h3>
            {testimonial.isHighlighted && (
              <Heart className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            {renderStars(testimonial.rating)}
            <span className="text-sm text-gray-600">({testimonial.rating}/5)</span>
          </div>
          <p className="text-gray-600 mb-3">{testimonial.description}</p>
          <div className="text-sm text-gray-500">
            <p>
              {userType === "business" 
                ? `Client ID: ${testimonial.clientClerkId}`
                : `Business ID: ${testimonial.businessOwnerClerkId}`
              }
            </p>
          </div>
        </div>
        {userType === "business" && (
          <Button
            size="sm"
            variant={testimonial.isHighlighted ? "default" : "outline"}
            onClick={handleToggleHighlight}
            className="ml-4"
          >
            {testimonial.isHighlighted ? "Unhighlight" : "Highlight"}
          </Button>
        )}
      </div>
    </div>
  );
}

function CreateTestimonialForm({ businessOwners, projects, onSuccess }: any) {
  const [testimonialData, setTestimonialData] = useState({
    businessOwnerClerkId: "",
    projectId: "",
    title: "",
    description: "",
    rating: 5,
    imageUrls: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const createTestimonial = useMutation(api.testimonials.createTestimonial);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let newlyUploaded: string[] = [];
      if (selectedFiles.length) {
        setUploading(true);
        newlyUploaded = await uploadImagesWithUploadThing(selectedFiles);
        setSelectedFiles([]);
        setUploading(false);
      }

      const data: any = {
        businessOwnerClerkId: testimonialData.businessOwnerClerkId,
        title: testimonialData.title,
        description: testimonialData.description,
        rating: testimonialData.rating,
        imageUrls: [...testimonialData.imageUrls, ...newlyUploaded],
      };

      if (testimonialData.projectId && testimonialData.projectId !== "none") {
        data.projectId = testimonialData.projectId as any;
      }

      await createTestimonial(data);
      toast.success("Review submitted successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setTestimonialData(prev => ({ ...prev, rating: i + 1 }))}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                i < testimonialData.rating 
                  ? "text-yellow-400 fill-current" 
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Images</Label>
        <div className="flex items-center gap-2 mb-2">
          <input
            id="review-images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setSelectedFiles(files);
            }}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("review-images")?.click()}
            disabled={uploading}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Select Images
          </Button>
          <Button
            type="button"
            onClick={async () => {
              if (!selectedFiles.length) return;
              try {
                setUploading(true);
                const urls = await uploadImagesWithUploadThing(selectedFiles);
                setTestimonialData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }));
                setSelectedFiles([]);
                toast.success("Images uploaded");
              } catch (err) {
                toast.error("Failed to upload images");
              } finally {
                setUploading(false);
              }
            }}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? "Uploading..." : `Upload ${selectedFiles.length || ""}`}
          </Button>
        </div>
        {(testimonialData.imageUrls.length > 0 || selectedFiles.length > 0) && (
          <div className="grid grid-cols-4 gap-2">
            {testimonialData.imageUrls.map((url) => (
              <img key={url} src={url} alt="uploaded" className="h-20 w-full object-cover rounded border" />
            ))}
            {selectedFiles.map((f, idx) => (
              <img key={idx} src={URL.createObjectURL(f)} alt={f.name} className="h-20 w-full object-cover rounded border" />
            ))}
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="business">Business</Label>
        <Select 
          value={testimonialData.businessOwnerClerkId} 
          onValueChange={(value) => setTestimonialData(prev => ({ ...prev, businessOwnerClerkId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a business" />
          </SelectTrigger>
          <SelectContent>
            {businessOwners.map((business: any) => (
              <SelectItem key={business.clerkUserId} value={business.clerkUserId}>
                {business.businessName || "Business Owner"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="project">Project (Optional)</Label>
        <Select 
          value={testimonialData.projectId} 
          onValueChange={(value) => setTestimonialData(prev => ({ ...prev, projectId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No specific project</SelectItem>
            {projects
              .filter((project: any) => project.businessOwnerClerkId === testimonialData.businessOwnerClerkId)
              .map((project: any) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.projectName}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title">Review Title</Label>
        <Input
          id="title"
          value={testimonialData.title}
          onChange={(e) => setTestimonialData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Excellent service and results"
          required
        />
      </div>

      <div>
        <Label>Rating</Label>
        <div className="flex items-center gap-2">
          {renderStarRating()}
          <span className="text-sm text-gray-600">({testimonialData.rating}/5)</span>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Review Description</Label>
        <Textarea
          id="description"
          value={testimonialData.description}
          onChange={(e) => setTestimonialData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Share your experience with this business..."
          rows={4}
          required
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">
          Submit Review
        </Button>
      </div>
    </form>
  );
}

function ReviewDetailsDialog({ testimonial, currentUserId, onClose }: { testimonial: any; currentUserId: string; onClose: () => void }) {
  const [open, setOpen] = useState(true);
  const isAuthor = testimonial.clientClerkId === currentUserId;
  const [draft, setDraft] = useState({
    title: testimonial.title,
    description: testimonial.description,
    rating: testimonial.rating,
  });
  const updateTestimonial = useMutation(api.testimonials.updateTestimonial);

  const save = async () => {
    if (!isAuthor) return;
    await updateTestimonial({
      testimonialId: testimonial._id,
      title: draft.title,
      description: draft.description,
      rating: draft.rating,
    });
    setOpen(false);
    onClose();
    toast.success("Review updated");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
          <DialogDescription>
            {isAuthor ? "You can edit your review." : "Read-only view."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            {isAuthor ? (
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            ) : (
              <div className="text-sm text-gray-900">{testimonial.title}</div>
            )}
          </div>
          <div>
            <Label>Rating</Label>
            {isAuthor ? (
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDraft({ ...draft, rating: i + 1 })}
                    className="focus:outline-none"
                  >
                    <Star className={`h-6 w-6 ${i < draft.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                  </button>
                ))}
                <span className="text-sm text-gray-600">({draft.rating}/5)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                ))}
                <span className="text-sm text-gray-600">({testimonial.rating}/5)</span>
              </div>
            )}
          </div>
          <div>
            <Label>Description</Label>
            {isAuthor ? (
              <Textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            ) : (
              <p className="text-sm text-gray-700">{testimonial.description}</p>
            )}
          </div>
          {!!testimonial.imageUrls?.length && (
            <div>
              <Label>Images</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {testimonial.imageUrls.map((url: string) => (
                  <img key={url} src={url} alt="review" className="h-20 w-full object-cover rounded border" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => { setOpen(false); onClose(); }}>Close</Button>
          {isAuthor && <Button onClick={save}>Save</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
