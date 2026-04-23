import { useState } from "react";
import { useUser } from "@clerk/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
} from "./ui/sidebar";
import { MobileSidebarToggle } from "./ui/mobile-sidebar-toggle";
import { ThemeToggle } from "./ui/theme-toggle";
import { BrandIdentity } from "./BrandIdentity";
import { SignOutButton } from "../SignOutButton";
import { 
  FolderOpen, 
  User, 
  Phone, 
  Mail,
  MapPin,
  Plus,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface EmployeeDashboardProps {
  profile: any;
}

export function EmployeeDashboard({ profile }: EmployeeDashboardProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const myProjects = useQuery(api.projects.getMyProjects);
  const addTask = useMutation(api.projects.addTaskToProject);
  const addImage = useMutation(api.projects.addImageToProject);
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);

  const handleAddTask = async (projectId: string) => {
    if (!newTaskName.trim()) {
      toast.error("Please enter a task name");
      return;
    }

    try {
      await addTask({
        projectId: projectId as any,
        taskName: newTaskName.trim()
      });
      toast.success("Task added successfully!");
      setNewTaskName("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add task");
    }
  };

  const handleAddImage = async (projectId: string) => {
    if (!newImageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    try {
      await addImage({
        projectId: projectId as any,
        imageUrl: newImageUrl.trim()
      });
      toast.success("Image added successfully!");
      setNewImageUrl("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add image");
    }
  };

  const handleTaskStatusChange = async (projectId: string, taskIndex: number, status: "queued" | "in_progress" | "done") => {
    try {
      await updateTaskStatus({
        projectId: projectId as any,
        taskIndex,
        status
      });
      toast.success("Task status updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update task status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "queued":
        return "bg-secondary text-primary";
      case "in_progress":
        return "bg-accent text-primary";
      case "done":
        return "bg-card text-[#276749] dark:text-emerald-400";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />;
      case "done":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "projects", label: "My Projects", icon: FolderOpen },
  ];

  const displayName =
    user?.firstName || user?.fullName || user?.emailAddresses[0]?.emailAddress || "Employee";
  const emailAddress = user?.emailAddresses[0]?.emailAddress || profile.email || "Not provided";

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex">
      <MobileSidebarToggle
        isOpen={isMobileSidebarOpen}
        onToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div
        className={`
          ${isMobileSidebarOpen ? "fixed inset-0 z-40" : "hidden"}
          lg:!block lg:!relative lg:!z-auto lg:w-64
          transition-all duration-300 ease-in-out
        `}
      >
        <Sidebar className={`${isMobileSidebarOpen ? "w-64" : ""} lg:w-64 h-full`}>
          <SidebarContent>
            <SidebarHeader>
              <BrandIdentity
                logoClassName="h-10 w-10"
                nameClassName="text-lg font-semibold text-primary"
                showTagline
              />
            </SidebarHeader>

            <SidebarGroup>
              <SidebarSection title="Main">
                {tabs.map((tab) => {
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
                    />
                  );
                })}
              </SidebarSection>
            </SidebarGroup>

            <SidebarFooter>
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="h-8 w-8 bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">Employee</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <ThemeToggle />
                  <SignOutButton />
                </div>
              </div>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
      </div>

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-card border-b border-border px-4 py-4 sm:px-6 lg:px-6">
          <div className="flex flex-col gap-3 pl-12 sm:pl-16 lg:pl-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-serif-display text-xl text-foreground sm:text-2xl break-words">
                {activeTab === "overview" ? "Employee Dashboard" : "My Projects"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 truncate sm:whitespace-normal">
                Welcome back, {displayName}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Badge variant="secondary">Employee</Badge>
              {profile.companyId && (
                <span className="text-muted-foreground text-sm break-words">
                  • Company Employee
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
            <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid gap-6">
              {/* Profile Card */}
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <User className="h-5 w-5 text-primary" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="text-foreground">{displayName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p className="text-foreground break-all">{emailAddress}</p>
                        </div>
                      </div>
                      {profile.phone && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p className="text-foreground">{profile.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {profile.address && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Address</label>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <p className="text-foreground">{profile.address}</p>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Employee Status</label>
                        <Badge className={getStatusColor(profile.employeeStatus || "approved")}>
                          {profile.employeeStatus || "approved"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card variant="elevated">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">Assigned Projects</CardTitle>
                    <FolderOpen className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{myProjects?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {myProjects?.filter(p => p.status === "in_progress").length || 0} in progress
                    </p>
                  </CardContent>
                </Card>
                
                <Card variant="elevated">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">Total Tasks</CardTitle>
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {myProjects?.reduce((sum, p) => sum + p.projectTasks.length, 0) || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {myProjects?.reduce((sum, p) => sum + p.projectTasks.filter(t => t.status === "done").length, 0) || 0} completed
                    </p>
                  </CardContent>
                </Card>
                
                <Card variant="elevated">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-secondary-foreground">Images Uploaded</CardTitle>
                    <Upload className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {myProjects?.reduce((sum, p) => sum + (p.imageUrls?.length || 0), 0) || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Across all projects</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              <h2 className="font-serif-display text-2xl text-foreground">My Assigned Projects</h2>
              
              {myProjects?.length === 0 ? (
                <Card variant="default">
                  <CardContent className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No projects assigned yet</p>
                    <p className="text-sm text-muted-foreground">Your business owner will assign projects to you</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {myProjects?.map((project) => (
                    <Card key={project._id} variant="default">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-foreground">{project.projectName}</CardTitle>
                            <CardDescription>{project.projectType}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Project Details */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                <strong>Estimated Duration:</strong> {project.estimatedLength} days
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Start Date:</strong> {formatDate(project.estimatedStartDateTime)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>End Date:</strong> {formatDate(project.estimatedEndDateTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                <strong>Approval Status:</strong> 
                                <Badge className="ml-2" variant={project.approvalStatus === "approved" ? "default" : "secondary"}>
                                  {project.approvalStatus}
                                </Badge>
                              </p>
                            </div>
                          </div>

                          {/* Tasks */}
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium">Tasks</h4>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Task
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add New Task</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Input
                                      placeholder="Enter task name"
                                      value={newTaskName}
                                      onChange={(e) => setNewTaskName(e.target.value)}
                                    />
                                    <Button
                                      onClick={() => handleAddTask(project._id)}
                                      className="w-full"
                                    >
                                      Add Task
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            <div className="space-y-2">
                              {project.projectTasks.map((task, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-secondary border border-border"
                                >
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(task.status)}
                                    <span className="font-medium text-foreground">{task.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(task.status)}>
                                      {task.status}
                                    </Badge>
                                    <select
                                      value={task.status}
                                      onChange={(e) => handleTaskStatusChange(project._id, index, e.target.value as any)}
                                      className="text-sm border px-2 py-1 bg-input border-border text-foreground"
                                    >
                                      <option value="queued">Queued</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="done">Done</option>
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Images */}
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium">Project Images</h4>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Add Image
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Project Image</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Input
                                      placeholder="Enter image URL"
                                      value={newImageUrl}
                                      onChange={(e) => setNewImageUrl(e.target.value)}
                                    />
                                    <Button
                                      onClick={() => handleAddImage(project._id)}
                                      className="w-full"
                                    >
                                      Add Image
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            {project.imageUrls && project.imageUrls.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {project.imageUrls.map((url, index) => (
                                  <div key={index} className="aspect-square bg-card overflow-hidden border border-border">
                                    <img
                                      src={url}
                                      alt={`Project image ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-sm">No images uploaded yet</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
