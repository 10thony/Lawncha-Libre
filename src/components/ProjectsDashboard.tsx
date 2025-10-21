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
import { Building2, Calendar, Clock, User, Plus, Edit, CheckCircle, Play, Circle, Check, X, Image as ImageIcon } from "lucide-react";
import { uploadImagesWithUploadThing } from "@/lib/uploadthing";

interface ProjectsDashboardProps {
  profile: any;
}

export function ProjectsDashboard({ profile }: ProjectsDashboardProps) {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const myProjects = useQuery(api.projects.getMyProjects);
  const clients = useQuery(api.projects.getClients);
  const clientsWithApprovedAppointments = useQuery(api.projects.getClientsWithApprovedAppointments);
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);
  const approveProject = useMutation(api.projects.approveProject);
  const rejectProject = useMutation(api.projects.rejectProject);

  return (
    <div className="space-y-6">
      {profile.userType === "business" && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">Projects</h2>
          <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <CreateProjectForm 
                clients={clientsWithApprovedAppointments || []}
                onSuccess={() => setShowCreateProject(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid gap-6">
        {myProjects?.map((project: any) => (
          <ProjectCard 
            key={project._id} 
            project={project} 
            userType={profile.userType}
            onEdit={setEditingProject}
          />
        ))}
        {!myProjects?.length && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No projects yet</p>
          </div>
        )}
      </div>

      {/* Edit Project Dialog */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <EditProjectForm 
              project={editingProject}
              onSuccess={() => setEditingProject(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function TaskItem({ task, index, projectId, userType }: any) {
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);

  // Handle backward compatibility - task might be a string or an object
  const taskName = typeof task === 'string' ? task : task.name;
  const taskStatus = typeof task === 'string' ? 'queued' : (task.status || 'queued');

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "queued": return <Circle className="h-4 w-4 text-gray-400" />;
      case "in_progress": return <Play className="h-4 w-4 text-blue-500" />;
      case "done": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "queued": return "bg-gray-100 text-gray-700 border-gray-200";
      case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "done": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTaskStatus({
        projectId: projectId,
        taskIndex: index,
        status: newStatus as any
      });
      toast.success("Task status updated!");
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg ${getTaskStatusColor(taskStatus)}`}>
      <div className="flex items-center gap-3">
        {getTaskStatusIcon(taskStatus)}
        <span className="font-medium">{taskName}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-white/50">
          {taskStatus.replace('_', ' ')}
        </span>
      </div>
      
      {userType === "business" && (
        <Select value={taskStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function ProjectCard({ project, userType, onEdit }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalStatusColor = (approvalStatus: string) => {
    switch (approvalStatus) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{project.projectName}</h3>
          <p className="text-gray-600 dark:text-gray-400">{project.projectType}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
          {project.approvalStatus && (
            <span className={`px-3 py-1 rounded-full text-sm ${getApprovalStatusColor(project.approvalStatus)}`}>
              {project.approvalStatus}
            </span>
          )}
          {userType === "business" && (
            <Button size="sm" variant="outline" onClick={() => onEdit(project)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <User className="h-4 w-4" />
          <span>
            {userType === "business" 
              ? `Client ID: ${project.clientClerkId}`
              : `Business ID: ${project.businessOwnerClerkId}`
            }
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{project.estimatedLength} days estimated</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>Start: {formatDate(project.estimatedStartDateTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>End: {formatDate(project.estimatedEndDateTime)}</span>
        </div>
      </div>

      {project.projectTasks.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Tasks:</h4>
          <div className="space-y-2">
            {project.projectTasks.map((task: any, index: number) => (
              <TaskItem 
                key={index}
                task={task}
                index={index}
                projectId={project._id}
                userType={userType}
              />
            ))}
          </div>
        </div>
      )}

      {project.notes && (
        <div>
          <h4 className="font-medium mb-2">Notes:</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{project.notes}</p>
        </div>
      )}

      {project.approvalStatus === "rejected" && project.rejectionReason && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-1">Rejection Reason:</h4>
          <p className="text-red-700 text-sm">{project.rejectionReason}</p>
        </div>
      )}

      {userType === "client" && project.approvalStatus === "pending" && (
        <ProjectApprovalButtons project={project} />
      )}
    </div>
  );
}

function CreateProjectForm({ clients, onSuccess }: any) {
  const [projectData, setProjectData] = useState({
    clientClerkId: "",
    projectType: "",
    projectName: "",
    projectTasks: [] as string[],
    imageUrls: [] as string[],
    estimatedLength: 1,
    estimatedStartDateTime: new Date().toISOString().split('T')[0],
    estimatedEndDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [taskInput, setTaskInput] = useState("");

  const createProject = useMutation(api.projects.createProject);

  const addTask = () => {
    if (taskInput.trim() && !projectData.projectTasks.includes(taskInput.trim())) {
      setProjectData(prev => ({
        ...prev,
        projectTasks: [...prev.projectTasks, taskInput.trim()]
      }));
      setTaskInput("");
    }
  };

  const removeTask = (task: string) => {
    setProjectData(prev => ({
      ...prev,
      projectTasks: prev.projectTasks.filter((t: string) => t !== task)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If there are any pending local files not yet uploaded, upload them now
      let newlyUploaded: string[] = [];
      if (selectedFiles.length) {
        setUploading(true);
        newlyUploaded = await uploadImagesWithUploadThing(selectedFiles);
        setSelectedFiles([]);
        setUploading(false);
      }
      const allImageUrls = [...projectData.imageUrls, ...newlyUploaded];

      await createProject({
        clientClerkId: projectData.clientClerkId,
        projectType: projectData.projectType,
        projectName: projectData.projectName,
        projectTasks: projectData.projectTasks,
        imageUrls: allImageUrls,
        estimatedLength: projectData.estimatedLength,
        estimatedStartDateTime: new Date(projectData.estimatedStartDateTime).getTime(),
        estimatedEndDateTime: new Date(projectData.estimatedEndDateTime).getTime(),
        notes: projectData.notes,
      });
      toast.success("Project created successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="client">Client</Label>
        <Select value={projectData.clientClerkId} onValueChange={(value) => setProjectData(prev => ({ ...prev, clientClerkId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client: any) => (
              <SelectItem key={client.clerkUserId} value={client.clerkUserId}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectType">Project Type</Label>
          <Input
            id="projectType"
            value={projectData.projectType}
            onChange={(e) => setProjectData(prev => ({ ...prev, projectType: e.target.value }))}
            placeholder="e.g., Garden Design, Lawn Installation"
            required
          />
        </div>
        <div>
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            value={projectData.projectName}
            onChange={(e) => setProjectData(prev => ({ ...prev, projectName: e.target.value }))}
            placeholder="e.g., Backyard Renovation"
            required
          />
        </div>
      </div>

      <div>
        <Label>Images</Label>
        <div className="flex items-center gap-2 mb-2">
          <input
            id="project-images"
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
            onClick={() => document.getElementById("project-images")?.click()}
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
                setProjectData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }));
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
        {(projectData.imageUrls.length > 0 || selectedFiles.length > 0) && (
          <div className="grid grid-cols-4 gap-2">
            {projectData.imageUrls.map((url) => (
              <img key={url} src={url} alt="uploaded" className="h-20 w-full object-cover rounded border" />
            ))}
            {selectedFiles.map((f, idx) => (
              <img key={idx} src={URL.createObjectURL(f)} alt={f.name} className="h-20 w-full object-cover rounded border" />
            ))}
          </div>
        )}
      </div>

      <div>
        <Label>Project Tasks</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Add a task..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
          />
          <Button type="button" onClick={addTask}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {projectData.projectTasks.map((task: string) => (
            <span
              key={task}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {task}
              <button
                type="button"
                onClick={() => removeTask(task)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="estimatedLength">Estimated Length (days)</Label>
          <Input
            id="estimatedLength"
            type="number"
            min="1"
            value={projectData.estimatedLength}
            onChange={(e) => setProjectData(prev => ({ ...prev, estimatedLength: parseInt(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={projectData.estimatedStartDateTime}
            onChange={(e) => setProjectData(prev => ({ ...prev, estimatedStartDateTime: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={projectData.estimatedEndDateTime}
            onChange={(e) => setProjectData(prev => ({ ...prev, estimatedEndDateTime: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="projectNotes">Notes</Label>
        <Textarea
          id="projectNotes"
          value={projectData.notes}
          onChange={(e) => setProjectData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional project details..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">
          Create Project
        </Button>
      </div>
    </form>
  );
}

function EditProjectForm({ project, onSuccess }: any) {
  const [projectData, setProjectData] = useState({
    projectType: project.projectType,
    projectName: project.projectName,
    projectTasks: project.projectTasks, // This is now an array of objects with name and status
    imageUrls: project.imageUrls || [] as string[],
    estimatedLength: project.estimatedLength,
    estimatedStartDateTime: new Date(project.estimatedStartDateTime).toISOString().split('T')[0],
    estimatedEndDateTime: new Date(project.estimatedEndDateTime).toISOString().split('T')[0],
    actualStartDateTime: project.actualStartDateTime ? new Date(project.actualStartDateTime).toISOString().split('T')[0] : "",
    actualEndDateTime: project.actualEndDateTime ? new Date(project.actualEndDateTime).toISOString().split('T')[0] : "",
    status: project.status,
    notes: project.notes || "",
  });
  const [taskInput, setTaskInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const updateProject = useMutation(api.projects.updateProject);

  const addTask = () => {
    if (taskInput.trim() && !projectData.projectTasks.some((t: any) => t.name === taskInput.trim())) {
      setProjectData(prev => ({
        ...prev,
        projectTasks: [...prev.projectTasks, { name: taskInput.trim(), status: "queued" }]
      }));
      setTaskInput("");
    }
  };

  const removeTask = (taskName: string) => {
    setProjectData(prev => ({
      ...prev,
      projectTasks: prev.projectTasks.filter((t: any) => t.name !== taskName)
    }));
  };

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
      const allImageUrls = [...projectData.imageUrls, ...newlyUploaded];

      const updates: any = {
        projectId: project._id,
        projectType: projectData.projectType,
        projectName: projectData.projectName,
        projectTasks: projectData.projectTasks,
        imageUrls: allImageUrls,
        estimatedLength: projectData.estimatedLength,
        estimatedStartDateTime: new Date(projectData.estimatedStartDateTime).getTime(),
        estimatedEndDateTime: new Date(projectData.estimatedEndDateTime).getTime(),
        status: projectData.status as any,
        notes: projectData.notes,
      };

      if (projectData.actualStartDateTime) {
        updates.actualStartDateTime = new Date(projectData.actualStartDateTime).getTime();
      }
      if (projectData.actualEndDateTime) {
        updates.actualEndDateTime = new Date(projectData.actualEndDateTime).getTime();
      }

      await updateProject(updates);
      toast.success("Project updated successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update project");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Images</Label>
        <div className="flex items-center gap-2 mb-2">
          <input
            id="edit-project-images"
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
            onClick={() => document.getElementById("edit-project-images")?.click()}
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
                setProjectData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }));
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
        {(projectData.imageUrls.length > 0 || selectedFiles.length > 0) && (
          <div className="grid grid-cols-4 gap-2">
            {projectData.imageUrls.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="uploaded" className="h-20 w-full object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => setProjectData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter(u => u !== url) }))}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {selectedFiles.map((f, idx) => (
              <img key={idx} src={URL.createObjectURL(f)} alt={f.name} className="h-20 w-full object-cover rounded border" />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectType">Project Type</Label>
          <Input
            id="projectType"
            value={projectData.projectType}
            onChange={(e) => setProjectData(prev => ({ ...prev, projectType: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            value={projectData.projectName}
            onChange={(e) => setProjectData(prev => ({ ...prev, projectName: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={projectData.status} onValueChange={(value) => setProjectData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Project Tasks</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Add a task..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
          />
          <Button type="button" onClick={addTask}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {projectData.projectTasks.map((task: any) => (
            <span
              key={task.name}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {task.name}
              <button
                type="button"
                onClick={() => removeTask(task.name)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estimatedLength">Estimated Length (days)</Label>
          <Input
            id="estimatedLength"
            type="number"
            min="1"
            value={projectData.estimatedLength}
            onChange={(e) => setProjectData(prev => ({ ...prev, estimatedLength: parseInt(e.target.value) }))}
            required
          />
        </div>
        <div></div>
        <div>
          <Label htmlFor="startDate">Estimated Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={projectData.estimatedStartDateTime}
            onChange={(e) => setProjectData(prev => ({ ...prev, estimatedStartDateTime: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">Estimated End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={projectData.estimatedEndDateTime}
            onChange={(e) => setProjectData(prev => ({ ...prev, estimatedEndDateTime: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="actualStartDate">Actual Start Date</Label>
          <Input
            id="actualStartDate"
            type="date"
            value={projectData.actualStartDateTime}
            onChange={(e) => setProjectData(prev => ({ ...prev, actualStartDateTime: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="actualEndDate">Actual End Date</Label>
          <Input
            id="actualEndDate"
            type="date"
            value={projectData.actualEndDateTime}
            onChange={(e) => setProjectData(prev => ({ ...prev, actualEndDateTime: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="projectNotes">Notes</Label>
        <Textarea
          id="projectNotes"
          value={projectData.notes}
          onChange={(e) => setProjectData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional project details..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">
          Update Project
        </Button>
      </div>
    </form>
  );
}

function ProjectApprovalButtons({ project }: any) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const approveProject = useMutation(api.projects.approveProject);
  const rejectProject = useMutation(api.projects.rejectProject);

  const handleApprove = async () => {
    try {
      await approveProject({ projectId: project._id });
      toast.success("Project approved!");
    } catch (error) {
      toast.error("Failed to approve project");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await rejectProject({ 
        projectId: project._id, 
        rejectionReason: rejectionReason.trim() 
      });
      toast.success("Project rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject project");
    }
  };

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="font-medium text-yellow-800 mb-3">Project Approval Required</h4>
      <p className="text-yellow-700 text-sm mb-3">
        Please review and approve or reject this project proposal.
      </p>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={handleApprove}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason">Reason for rejection (required)</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why you're rejecting this project..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
