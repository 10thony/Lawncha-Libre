import { useState } from "react";
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
  Calendar, 
  FolderOpen, 
  Star, 
  User, 
  Building2, 
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
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProject, setSelectedProject] = useState<any>(null);
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
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Employee Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">Employee</Badge>
                {profile.companyId && (
                  <span className="text-gray-600">• Company Employee</span>
                )}
              </div>
            </div>
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
                        <p className="text-gray-900">{profile.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">Employee Email</p>
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
                      {profile.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Address</label>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <p className="text-gray-900">{profile.address}</p>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Employee Status</label>
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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
                    <FolderOpen className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{myProjects?.length || 0}</div>
                    <p className="text-xs text-gray-500">
                      {myProjects?.filter(p => p.status === "in_progress").length || 0} in progress
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {myProjects?.reduce((sum, p) => sum + p.projectTasks.length, 0) || 0}
                    </div>
                    <p className="text-xs text-gray-500">
                      {myProjects?.reduce((sum, p) => sum + p.projectTasks.filter(t => t.status === "done").length, 0) || 0} completed
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Images Uploaded</CardTitle>
                    <Upload className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {myProjects?.reduce((sum, p) => sum + (p.imageUrls?.length || 0), 0) || 0}
                    </div>
                    <p className="text-xs text-gray-500">Across all projects</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">My Assigned Projects</h2>
              
              {myProjects?.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No projects assigned yet</p>
                    <p className="text-sm text-gray-400">Your business owner will assign projects to you</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {myProjects?.map((project) => (
                    <Card key={project._id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{project.projectName}</CardTitle>
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
                              <p className="text-sm text-gray-600">
                                <strong>Estimated Duration:</strong> {project.estimatedLength} days
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Start Date:</strong> {formatDate(project.estimatedStartDateTime)}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>End Date:</strong> {formatDate(project.estimatedEndDateTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
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
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(task.status)}
                                    <span className="font-medium">{task.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(task.status)}>
                                      {task.status}
                                    </Badge>
                                    <select
                                      value={task.status}
                                      onChange={(e) => handleTaskStatusChange(project._id, index, e.target.value as any)}
                                      className="text-sm border rounded px-2 py-1"
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
                                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                      src={url}
                                      alt={`Project image ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No images uploaded yet</p>
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
  );
}
