import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Star, Plus, Heart, MessageSquare } from "lucide-react";

interface TestimonialsDashboardProps {
  profile: any;
}

export function TestimonialsDashboard({ profile }: TestimonialsDashboardProps) {
  const [showCreateTestimonial, setShowCreateTestimonial] = useState(false);

  const testimonials = useQuery(api.testimonials.getTestimonials, 
    profile.userType === "business" ? { businessOwnerId: profile.userId } : {}
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
          <TestimonialCard 
            key={testimonial._id} 
            testimonial={testimonial} 
            userType={profile.userType}
          />
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
                ? `By: ${testimonial.client?.name || testimonial.client?.email}`
                : `For: ${testimonial.business?.name || testimonial.business?.email}`
              }
            </p>
            {testimonial.project && (
              <p>Project: {testimonial.project.projectName}</p>
            )}
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
    businessOwnerId: "",
    projectId: "",
    title: "",
    description: "",
    rating: 5,
  });

  const createTestimonial = useMutation(api.testimonials.createTestimonial);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        businessOwnerId: testimonialData.businessOwnerId as any,
        title: testimonialData.title,
        description: testimonialData.description,
        rating: testimonialData.rating,
      };

      if (testimonialData.projectId) {
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
        <Label htmlFor="business">Business</Label>
        <Select 
          value={testimonialData.businessOwnerId} 
          onValueChange={(value) => setTestimonialData(prev => ({ ...prev, businessOwnerId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a business" />
          </SelectTrigger>
          <SelectContent>
            {businessOwners.map((business: any) => (
              <SelectItem key={business.userId} value={business.userId}>
                {business.businessName || business.user?.name || business.user?.email}
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
            <SelectItem value="">No specific project</SelectItem>
            {projects
              .filter((project: any) => project.businessOwnerId === testimonialData.businessOwnerId)
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
