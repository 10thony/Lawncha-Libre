import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarToggle,
  SidebarItem,
  SidebarGroup,
  SidebarSection,
} from "./ui/sidebar";
import { MobileSidebarToggle } from "./ui/mobile-sidebar-toggle";
import { ThemeToggle } from "./ui/theme-toggle";
import { SignOutButton } from "../SignOutButton";
import { ProjectsDashboard } from "./ProjectsDashboard";
import { AppointmentBooking } from "./AppointmentBooking";
import { TestimonialsDashboard } from "./TestimonialsDashboard";
import { RequestedQuotes } from "./RequestedQuotes";
import { ClientIntakeForms } from "./ClientIntakeForms";
import { VideoUploadDemo } from "./VideoUploadDemo";
import { SocialConnections } from "./SocialConnections";
import { SocialFeed } from "./SocialFeed";
import { SocialMediaManagement } from "./SocialMediaManagement";
import { FacebookProjectPorting } from "./FacebookProjectPorting";
import { FacebookIntegrationHub } from "./FacebookIntegrationHub";
import { EmployeeManagement } from "./EmployeeManagement";
import { EmployeeDashboard } from "./EmployeeDashboard";
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
  Facebook,
  Users,
  LogOut
} from "lucide-react";

interface DashboardProps {
  profile: any;
}

export function Dashboard({ profile }: DashboardProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Read URL parameters to set initial tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // If user is an employee, show the employee dashboard
  if (profile.userType === "employee") {
    return <EmployeeDashboard profile={profile} />;
  }

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
    tabs.splice(4, 0, { id: "employees", label: "Employees", icon: Users });
  } else if (profile.userType === "client") {
    tabs.splice(3, 0, { id: "intake", label: "My Requests", icon: Quote });
  }
  // Employees don't get additional tabs beyond the basic ones
  
  // Add social media tabs
  tabs.push({ id: "facebook-integration", label: "Facebook Integration", icon: Facebook });
  tabs.push({ id: "social-feed", label: "Social Feed & Porting", icon: Instagram });
  
  // Add video upload demo tab for testing
  tabs.push({ id: "video-demo", label: "Video Upload Demo", icon: FileVideo });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex">
      {/* Mobile Sidebar Toggle */}
      <MobileSidebarToggle 
        isOpen={isMobileSidebarOpen} 
        onToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
      />

      {/* Sidebar */}
      <div className={`
        ${isMobileSidebarOpen ? 'fixed inset-0 z-40 lg:relative lg:z-auto' : 'hidden lg:block'}
        ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        transition-all duration-300 ease-in-out
      `}>
        <Sidebar className={`
          ${isMobileSidebarOpen ? 'w-64' : ''}
          ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
          h-full
        `}>
          <SidebarContent>
            <SidebarHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                {!isSidebarCollapsed && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      DoneRight TX
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Landscaping
                    </p>
                  </div>
                )}
              </div>
            </SidebarHeader>

            <SidebarGroup>
              <SidebarSection title={!isSidebarCollapsed ? "Main" : undefined}>
                {tabs.slice(0, 4).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <SidebarItem
                      key={tab.id}
                      isActive={activeTab === tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      icon={<Icon className="h-4 w-4" />}
                      label={tab.label}
                      isCollapsed={isSidebarCollapsed}
                    />
                  );
                })}
              </SidebarSection>

              {profile.userType === "business" && (
                <SidebarSection title={!isSidebarCollapsed ? "Business" : undefined}>
                  <SidebarItem
                    isActive={activeTab === "quotes"}
                    onClick={() => {
                      setActiveTab("quotes");
                      setIsMobileSidebarOpen(false);
                    }}
                    icon={<Quote className="h-4 w-4" />}
                    label="Quote Requests"
                    isCollapsed={isSidebarCollapsed}
                  />
                  <SidebarItem
                    isActive={activeTab === "employees"}
                    onClick={() => {
                      setActiveTab("employees");
                      setIsMobileSidebarOpen(false);
                    }}
                    icon={<Users className="h-4 w-4" />}
                    label="Employees"
                    isCollapsed={isSidebarCollapsed}
                  />
                </SidebarSection>
              )}

              {profile.userType === "client" && (
                <SidebarSection title={!isSidebarCollapsed ? "Requests" : undefined}>
                  <SidebarItem
                    isActive={activeTab === "intake"}
                    onClick={() => {
                      setActiveTab("intake");
                      setIsMobileSidebarOpen(false);
                    }}
                    icon={<Quote className="h-4 w-4" />}
                    label="My Requests"
                    isCollapsed={isSidebarCollapsed}
                  />
                </SidebarSection>
              )}

              <SidebarSection title={!isSidebarCollapsed ? "Social Media" : undefined}>
                <SidebarItem
                  isActive={activeTab === "social-feed"}
                  onClick={() => {
                    setActiveTab("social-feed");
                    setIsMobileSidebarOpen(false);
                  }}
                  icon={<Instagram className="h-4 w-4" />}
                  label="Social Feed"
                  isCollapsed={isSidebarCollapsed}
                />
                <SidebarItem
                  isActive={activeTab === "social-settings"}
                  onClick={() => {
                    setActiveTab("social-settings");
                    setIsMobileSidebarOpen(false);
                  }}
                  icon={<Link className="h-4 w-4" />}
                  label="Social Settings"
                  isCollapsed={isSidebarCollapsed}
                />
                <SidebarItem
                  isActive={activeTab === "social-management"}
                  onClick={() => {
                    setActiveTab("social-management");
                    setIsMobileSidebarOpen(false);
                  }}
                  icon={<Settings className="h-4 w-4" />}
                  label="Social Management"
                  isCollapsed={isSidebarCollapsed}
                />
              </SidebarSection>

              <SidebarSection title={!isSidebarCollapsed ? "Tools" : undefined}>
                <SidebarItem
                  isActive={activeTab === "video-demo"}
                  onClick={() => {
                    setActiveTab("video-demo");
                    setIsMobileSidebarOpen(false);
                  }}
                  icon={<FileVideo className="h-4 w-4" />}
                  label="Video Upload Demo"
                  isCollapsed={isSidebarCollapsed}
                />
              </SidebarSection>
            </SidebarGroup>

            <SidebarFooter>
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {profile.userType === "business" ? "Business Owner" : 
                         profile.userType === "employee" ? "Employee" : 
                         "Client"}
                      </p>
                    </div>
                  )}
                </div>
                
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-2 px-2">
                    <ThemeToggle />
                    <SignOutButton />
                  </div>
                )}
                
                {isSidebarCollapsed && (
                  <div className="flex flex-col items-center gap-2 px-2">
                    <ThemeToggle />
                    <SignOutButton />
                  </div>
                )}
              </div>
            </SidebarFooter>
          </SidebarContent>

          {/* Desktop Sidebar Toggle */}
          <SidebarToggle 
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </Sidebar>
      </div>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tabs.find(tab => tab.id === activeTab)?.label || "Dashboard"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={
                  profile.userType === "business" ? "default" : 
                  profile.userType === "employee" ? "secondary" : 
                  "outline"
                }>
                  {profile.userType === "business" ? "Business Owner" : 
                   profile.userType === "employee" ? "Employee" : 
                   "Client"}
                </Badge>
                {profile.businessName && (
                <span className="text-gray-600 dark:text-gray-400 text-sm">• {profile.businessName}</span>
                )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid gap-6">
              {/* Profile Card */}
              <Card variant="glass" className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <User className="h-5 w-5 text-primary" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                        <p className="text-gray-900 dark:text-gray-100">{user?.fullName || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <p className="text-gray-900 dark:text-gray-100">{user?.emailAddresses[0]?.emailAddress}</p>
                        </div>
                      </div>
                      {profile.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <p className="text-gray-900 dark:text-gray-100">{profile.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {profile.userType === "business" && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</label>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                              <p className="text-gray-900 dark:text-gray-100">{profile.businessName || "Not provided"}</p>
                            </div>
                          </div>
                          {profile.businessDescription && (
                            <div>
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                              <p className="text-gray-900 dark:text-gray-100">{profile.businessDescription}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {profile.userType === "employee" && profile.companyId && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</label>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <p className="text-gray-900 dark:text-gray-100">Company Name</p>
                          </div>
                        </div>
                      )}
                      
                      {profile.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <p className="text-gray-900 dark:text-gray-100">{profile.address}</p>
                          </div>
                        </div>
                      )}
                      
                      {profile.services && profile.services.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Services</label>
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
                <Card variant="elevated" className="animate-fade-in" style={{animationDelay: '0.1s'}}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {profile.userType === "business" ? "Total Appointments" : "My Bookings"}
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAppointments}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {myAppointments?.filter(a => a.status === "booked").length || 0} booked
                    </p>
                  </CardContent>
                </Card>
                
                <Card variant="elevated" className="animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {profile.userType === "business" ? "Active Projects" : "My Projects"}
                    </CardTitle>
                    <FolderOpen className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProjects}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activeProjects} in progress
                    </p>
                  </CardContent>
                </Card>
                
                <Card variant="elevated" className="animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {profile.userType === "business" ? "Customer Reviews" : "Reviews Given"}
                    </CardTitle>
                    <Star className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalReviews}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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

          {activeTab === "employees" && profile.userType === "business" && (
            <EmployeeManagement profile={profile} />
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

          {activeTab === "facebook-integration" && (
            <FacebookIntegrationHub />
          )}

          {activeTab === "video-demo" && (
            <VideoUploadDemo />
          )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
