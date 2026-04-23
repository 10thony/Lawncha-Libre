import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import { BrandIdentity } from "./BrandIdentity";
import { ProjectsDashboard } from "./ProjectsDashboard";
import { AppointmentBooking } from "./AppointmentBooking";
import { TestimonialsDashboard } from "./TestimonialsDashboard";
import { RequestedQuotes } from "./RequestedQuotes";
import { ClientIntakeForms } from "./ClientIntakeForms";
import { VideoUploadDemo } from "./VideoUploadDemo";
import { SocialConnections } from "./SocialConnections";
import { SocialFeed } from "./SocialFeed";
import { SocialMediaManagement } from "./SocialMediaManagement";
import { FacebookIntegrationHub } from "./FacebookIntegrationHub";
import { EmployeeManagement } from "./EmployeeManagement";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { BusinessManagement } from "./BusinessManagement";
import {
  Calendar,
  FolderOpen,
  Star,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  getSidebarSections,
  getTabLabel,
  type TabId,
} from "../config/toolbeltNav";

interface DashboardProps {
  profile: any;
}

export function Dashboard({ profile }: DashboardProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam as TabId);
    }
  }, []);

  if (profile.userType === "employee") {
    return <EmployeeDashboard profile={profile} />;
  }

  const navRole = profile.userType as "business" | "client";
  const sidebarSections = getSidebarSections(navRole, isSidebarCollapsed);

  const myAppointments = useQuery(api.appointments.getMyAppointments);
  const myProjects = useQuery(api.projects.getMyProjects);
  const myTestimonials = useQuery(
    api.testimonials.getTestimonials,
    profile.userType === "business"
      ? { businessOwnerClerkId: profile.clerkUserId }
      : {}
  );

  const totalAppointments = myAppointments?.length || 0;
  const activeProjects =
    myProjects?.filter((p) => p.status === "in_progress").length || 0;
  const totalProjects = myProjects?.length || 0;
  const totalReviews = myTestimonials?.length || 0;
  const averageRating =
    myTestimonials && myTestimonials.length > 0
      ? (
          myTestimonials.reduce((sum, t) => sum + t.rating, 0) /
          myTestimonials.length
        ).toFixed(1)
      : "0.0";

  const selectTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex">
      <MobileSidebarToggle
        isOpen={isMobileSidebarOpen}
        onToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div
        className={`
        ${isMobileSidebarOpen ? "fixed inset-0 z-40" : "hidden"}
        lg:!block lg:!relative lg:!z-auto
        ${isSidebarCollapsed ? "lg:w-16" : "lg:w-64"}
        transition-all duration-300 ease-in-out
      `}
      >
        <Sidebar
          className={`
          ${isMobileSidebarOpen ? "w-64" : ""}
          ${isSidebarCollapsed ? "lg:w-16" : "lg:w-64"}
          h-full
        `}
        >
          <SidebarContent>
            <SidebarHeader>
              <div className="flex items-center gap-3">
                {!isSidebarCollapsed && (
                  <BrandIdentity
                    logoClassName="h-10 w-10"
                    nameClassName="text-lg font-semibold text-primary"
                    showTagline
                  />
                )}
                {isSidebarCollapsed && (
                  <BrandIdentity
                    className="justify-center"
                    logoClassName="h-8 w-8"
                    showName={false}
                    showTagline={false}
                  />
                )}
              </div>
            </SidebarHeader>

            <SidebarGroup>
              {sidebarSections.map((section) => (
                <SidebarSection key={section.sectionId} title={section.title}>
                  {section.items.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <SidebarItem
                        key={tab.id}
                        isActive={activeTab === tab.id}
                        onClick={() => selectTab(tab.id)}
                        icon={<Icon className="h-4 w-4" />}
                        label={tab.label}
                        isCollapsed={isSidebarCollapsed}
                      />
                    );
                  })}
                </SidebarSection>
              ))}
            </SidebarGroup>

            <SidebarFooter>
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="h-8 w-8 bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.firstName ||
                          user?.emailAddresses[0]?.emailAddress}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.userType === "business"
                          ? "Business Owner"
                          : profile.userType === "employee"
                            ? "Employee"
                            : "Client"}
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

          <SidebarToggle
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </Sidebar>
      </div>

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 py-4 sm:px-6 lg:px-6">
          <div className="flex flex-col gap-3 pl-12 sm:pl-16 lg:pl-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-serif-display text-xl text-foreground sm:text-2xl break-words">
                {getTabLabel(activeTab)}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 truncate sm:whitespace-normal">
                Welcome back,{" "}
                {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Badge
                variant={
                  profile.userType === "business"
                    ? "default"
                    : profile.userType === "employee"
                      ? "secondary"
                      : "outline"
                }
              >
                {profile.userType === "business"
                  ? "Business Owner"
                  : profile.userType === "employee"
                    ? "Employee"
                    : "Client"}
              </Badge>
              {profile.businessName && (
                <span className="text-muted-foreground text-sm break-words">
                  • {profile.businessName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div
            className={
              activeTab === "projects"
                ? "w-full h-full"
                : "max-w-7xl mx-auto px-4 py-6 sm:px-6"
            }
          >
            <div className="space-y-6">
              {activeTab === "overview" && (
                <div className="grid gap-6">
                  {/* Profile Card */}
                  <Card variant="default" className="animate-fade-in">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <User className="h-5 w-5 text-primary" />
                        <span className="font-serif-display text-lg normal-case tracking-normal">Profile Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-[9px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                              Name
                            </label>
                            <p className="text-foreground font-serif-display text-base mt-0.5">
                              {user?.fullName || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                              Email
                            </label>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <p className="text-foreground break-all">
                                {user?.emailAddresses[0]?.emailAddress}
                              </p>
                            </div>
                          </div>
                          {profile.phone && (
                            <div>
                              <label className="text-[9px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                                Phone
                              </label>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <p className="text-foreground">
                                  {profile.phone}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {profile.userType === "business" && (
                            <>
                              <div>
                                <label className="text-[9px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                                  Business Name
                                </label>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-foreground break-words font-serif-display text-base">
                                    {profile.businessName || "Not provided"}
                                  </p>
                                </div>
                              </div>
                              {profile.businessDescription && (
                                <div>
                                  <label className="text-[9px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                                    Description
                                  </label>
                                  <p className="text-foreground mt-0.5">
                                    {profile.businessDescription}
                                  </p>
                                </div>
                              )}
                            </>
                          )}

                          {profile.userType === "employee" && profile.companyId && (
                            <div>
                              <label className="text-[9px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                                Company
                              </label>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <p className="text-foreground">
                                  Company Name
                                </p>
                              </div>
                            </div>
                          )}

                          {profile.address && (
                            <div>
                              <label className="text-[9px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                                Address
                              </label>
                              <div className="flex items-center gap-2 mt-0.5">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <p className="text-foreground">
                                  {profile.address}
                                </p>
                              </div>
                            </div>
                          )}

                          {profile.services && profile.services.length > 0 && (
                            <div>
                              <label className="text-[9px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                                Services
                              </label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {profile.services.map(
                                  (service: string, index: number) => (
                                    <Badge key={index} variant="outline">
                                      {service}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card
                      variant="elevated"
                      className="animate-fade-in"
                      style={{ animationDelay: "0.1s" }}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-secondary-foreground">
                          {profile.userType === "business"
                            ? "Total Appointments"
                            : "My Bookings"}
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="font-serif-display text-3xl text-foreground tabular-nums">
                          {totalAppointments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {myAppointments?.filter((a) => a.status === "booked")
                            .length || 0}{" "}
                          booked
                        </p>
                      </CardContent>
                    </Card>

                    <Card
                      variant="elevated"
                      className="animate-fade-in"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-secondary-foreground">
                          {profile.userType === "business"
                            ? "Active Projects"
                            : "My Projects"}
                        </CardTitle>
                        <FolderOpen className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="font-serif-display text-3xl text-foreground tabular-nums">
                          {totalProjects}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activeProjects} in progress
                        </p>
                      </CardContent>
                    </Card>

                    <Card
                      variant="elevated"
                      className="animate-fade-in"
                      style={{ animationDelay: "0.3s" }}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-secondary-foreground">
                          {profile.userType === "business"
                            ? "Customer Reviews"
                            : "Reviews Given"}
                        </CardTitle>
                        <Star className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="font-serif-display text-3xl text-foreground tabular-nums">
                          {totalReviews}
                        </div>
                        <p className="text-xs text-muted-foreground">
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

              {activeTab === "businesses" && profile.userType === "business" && (
                <BusinessManagement />
              )}

              {activeTab === "intake" && profile.userType === "client" && (
                <ClientIntakeForms profile={profile} />
              )}

              {activeTab === "testimonials" && (
                <TestimonialsDashboard profile={profile} />
              )}

              {activeTab === "social-feed" && <SocialFeed />}

              {activeTab === "social-settings" && <SocialConnections />}

              {activeTab === "social-management" && <SocialMediaManagement />}

              {activeTab === "facebook-integration" && (
                <FacebookIntegrationHub />
              )}

              {activeTab === "video-demo" && <VideoUploadDemo />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
