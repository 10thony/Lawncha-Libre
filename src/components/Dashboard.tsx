import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProjectsDashboard } from "./ProjectsDashboard";
import { AppointmentBooking } from "./AppointmentBooking";
import { TestimonialsDashboard } from "./TestimonialsDashboard";
import { RequestedQuotes } from "./RequestedQuotes";
import { ClientIntakeForms } from "./ClientIntakeForms";
import { VideoUploadDemo } from "./VideoUploadDemo";
import { SocialConnections } from "./SocialConnections";
import { SocialFeed } from "./SocialFeed";
import { SocialMediaManagement } from "./SocialMediaManagement";
import { 
  Calendar, 
  FolderOpen, 
  Star, 
  User, 
  Building2, 
  Phone, 
  Mail,
  MapPin,
  Settings,
  Quote,
  FileVideo,
  Link,
  Instagram,
  Facebook
} from "lucide-react";

interface DashboardProps {
  profile: any;
}

export function Dashboard({ profile }: DashboardProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch real data from Convex
  const myAppointments = useQuery(api.appointments.getMyAppointments);
  const myProjects = useQuery(api.projects.getMyProjects);
  const myTestimonials = useQuery(api.testimonials.getTestimonials, 
    profile.userType === "business" ? { businessOwnerClerkId: profile.clerkUserId } : {}
  );

  // Calculate stats
  const totalAppointments = myAppointments?.length || 0;
  const activeProjects = myProjects?.filter(p => p.status === "in_progress").length || 0;
  const totalProjects = myProjects?.length || 0;
  const totalReviews = myTestimonials?.length || 0;
  const averageRating = myTestimonials?.length > 0 
    ? (myTestimonials.reduce((sum, t) => sum + t.rating, 0) / myTestimonials.length).toFixed(1)
    : "0.0";

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "testimonials", label: "Reviews", icon: Star },
  ];

  // Add quotes tab for business owners, intake forms tab for clients
  if (profile.userType === "business") {
    tabs.splice(3, 0, { id: "quotes", label: "Quote Requests", icon: Quote });
  } else {
    tabs.splice(3, 0, { id: "intake", label: "My Requests", icon: Quote });
  }
  
  // Add social media tabs
  tabs.push({ id: "social-feed", label: "Social Feed", icon: Instagram });
  tabs.push({ id: "social-settings", label: "Social Settings", icon: Link });
  tabs.push({ id: "social-management", label: "Social Management", icon: Settings });
  
  // Add video upload demo tab for testing
  tabs.push({ id: "video-demo", label: "Video Upload Demo", icon: FileVideo });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={profile.userType === "business" ? "default" : "secondary"}>
                  {profile.userType === "business" ? "Business Owner" : "Client"}
                </Badge>
                {profile.businessName && (
                  <span className="text-gray-600">• {profile.businessName}</span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid gap-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-gray-900">{user?.fullName || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">{user?.emailAddresses[0]?.emailAddress}</p>
                        </div>
                      </div>
                      {profile.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p className="text-gray-900">{profile.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {profile.userType === "business" && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Business Name</label>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <p className="text-gray-900">{profile.businessName || "Not provided"}</p>
                            </div>
                          </div>
                          {profile.businessDescription && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Description</label>
                              <p className="text-gray-900">{profile.businessDescription}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {profile.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Address</label>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <p className="text-gray-900">{profile.address}</p>
                          </div>
                        </div>
                      )}
                      
                      {profile.services && profile.services.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Services</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.services.map((service: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {profile.userType === "business" ? "Total Appointments" : "My Bookings"}
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalAppointments}</div>
                    <p className="text-xs text-gray-500">
                      {myAppointments?.filter(a => a.status === "booked").length || 0} booked
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {profile.userType === "business" ? "Active Projects" : "My Projects"}
                    </CardTitle>
                    <FolderOpen className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalProjects}</div>
                    <p className="text-xs text-gray-500">
                      {activeProjects} in progress
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {profile.userType === "business" ? "Customer Reviews" : "Reviews Given"}
                    </CardTitle>
                    <Star className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalReviews}</div>
                    <p className="text-xs text-gray-500">
                      {averageRating} average rating
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <AppointmentBooking profile={profile} />
          )}

          {activeTab === "projects" && (
            <ProjectsDashboard profile={profile} />
          )}

          {activeTab === "quotes" && profile.userType === "business" && (
            <RequestedQuotes profile={profile} />
          )}

          {activeTab === "intake" && profile.userType === "client" && (
            <ClientIntakeForms profile={profile} />
          )}

          {activeTab === "testimonials" && (
            <TestimonialsDashboard profile={profile} />
          )}

          {activeTab === "social-feed" && (
            <SocialFeed />
          )}

          {activeTab === "social-settings" && (
            <SocialConnections />
          )}

          {activeTab === "social-management" && (
            <SocialMediaManagement />
          )}

          {activeTab === "video-demo" && (
            <VideoUploadDemo />
          )}
        </div>
      </div>
    </div>
  );
}
