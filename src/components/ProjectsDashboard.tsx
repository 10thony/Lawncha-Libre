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
import { Building2, Calendar, Clock, User, Plus, Edit } from "lucide-react";

interface ProjectsDashboardProps {
  profile: any;
}

export function ProjectsDashboard({ profile }: ProjectsDashboardProps) {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const myProjects = useQuery(api.projects.getMyProjects);
  const clients = useQuery(api.projects.getClients);

  return (
    <div className="space-y-6">
      {profile.userType === "business" && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Projects</h2>
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
                clients={clients || []}
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
            <p className="text-gray-500">No projects yet</p>
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{project.projectName}</h3>
          <p className="text-gray-600">{project.projectType}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
          {userType === "business" && (
            <Button size="sm" variant="outline" onClick={() => onEdit(project)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>
            {userType === "business" 
              ? `Client ID: ${project.clientClerkId}`
              : `Business ID: ${project.businessOwnerClerkId}`
            }
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{project.estimatedLength} days estimated</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Start: {formatDate(project.estimatedStartDateTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>End: {formatDate(project.estimatedEndDateTime)}</span>
        </div>
      </div>

      {project.projectTasks.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Tasks:</h4>
          <div className="flex flex-wrap gap-2">
            {project.projectTasks.map((task: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
              >
                {task}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.notes && (
        <div>
          <h4 className="font-medium mb-2">Notes:</h4>
          <p className="text-gray-600 text-sm">{project.notes}</p>
        </div>
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
    estimatedLength: 1,
    estimatedStartDateTime: new Date().toISOString().split('T')[0],
    estimatedEndDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
  });
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
      await createProject({
        clientClerkId: projectData.clientClerkId,
        projectType: projectData.projectType,
        projectName: projectData.projectName,
        projectTasks: projectData.projectTasks,
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
            {clients.map((clientClerkId: string) => (
              <SelectItem key={clientClerkId} value={clientClerkId}>
                Client: {clientClerkId}
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
    projectTasks: project.projectTasks,
    estimatedLength: project.estimatedLength,
    estimatedStartDateTime: new Date(project.estimatedStartDateTime).toISOString().split('T')[0],
    estimatedEndDateTime: new Date(project.estimatedEndDateTime).toISOString().split('T')[0],
    actualStartDateTime: project.actualStartDateTime ? new Date(project.actualStartDateTime).toISOString().split('T')[0] : "",
    actualEndDateTime: project.actualEndDateTime ? new Date(project.actualEndDateTime).toISOString().split('T')[0] : "",
    status: project.status,
    notes: project.notes || "",
  });
  const [taskInput, setTaskInput] = useState("");

  const updateProject = useMutation(api.projects.updateProject);

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
      const updates: any = {
        projectId: project._id,
        projectType: projectData.projectType,
        projectName: projectData.projectName,
        projectTasks: projectData.projectTasks,
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
