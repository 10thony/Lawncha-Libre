import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  Quote, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Eye,
  CheckCircle,
  AlertCircle,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Video,
  Plus,
  Search
} from "lucide-react";
import { toast } from "sonner";

interface RequestedQuotesProps {
  profile: any;
}

interface IntakeFormDetails {
  _id: Id<"intakeForms">;
  _creationTime: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectDescription: string;
  imageUrls?: string[];
  videoUrls?: string[];
  status: "submitted" | "claimed" | "in_progress" | "completed" | "cancelled";
  businessOwnerClerkId?: string;
  clientClerkId?: string;
  submittedAt: number;
  claimedAt?: number;
  linkedAt?: number;
  businessNotes?: string;
  estimatedQuote?: number;
}

export function RequestedQuotes({ profile }: RequestedQuotesProps) {
  const [selectedForm, setSelectedForm] = useState<IntakeFormDetails | null>(null);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [businessNotes, setBusinessNotes] = useState("");
  const [estimatedQuote, setEstimatedQuote] = useState("");
  
  // Project creation form state
  const [projectForm, setProjectForm] = useState({
    projectType: "",
    projectName: "",
    tasks: [""],
    estimatedLength: "",
    estimatedStartDate: "",
    estimatedEndDate: "",
    notes: "",
  });

  // Fetch intake forms
  const allIntakeForms = useQuery(api.intakeForms.getAllIntakeForms);
  const myIntakeForms = useQuery(api.intakeForms.getIntakeFormsByBusinessOwner);

  // Mutations
  const claimIntakeForm = useMutation(api.intakeForms.claimIntakeForm);
  const updateIntakeFormStatus = useMutation(api.intakeForms.updateIntakeFormStatus);
  const createProjectFromIntakeForm = useMutation(api.projects.createProjectFromIntakeForm);

  // Filter forms based on search
  const filteredForms = allIntakeForms?.filter(form => 
    form.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.projectDescription.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Separate forms by status
  const submittedForms = filteredForms.filter(form => form.status === "submitted");
  const claimedForms = filteredForms.filter(form => 
    form.status === "claimed" && form.businessOwnerClerkId === profile.clerkUserId
  );
  const inProgressForms = filteredForms.filter(form => 
    form.status === "in_progress" && form.businessOwnerClerkId === profile.clerkUserId
  );

  const handleClaimForm = async (formId: Id<"intakeForms">) => {
    try {
      await claimIntakeForm({ intakeFormId: formId });
      toast.success("Quote request claimed successfully!");
      setShowClaimDialog(false);
      setSelectedForm(null);
    } catch (error) {
      console.error("Error claiming form:", error);
      toast.error("Failed to claim quote request. Please try again.");
    }
  };

  const handleUpdateStatus = async (formId: Id<"intakeForms">, status: string) => {
    try {
      await updateIntakeFormStatus({
        intakeFormId: formId,
        status: status as any,
        businessNotes: businessNotes || undefined,
        estimatedQuote: estimatedQuote ? parseFloat(estimatedQuote) : undefined,
      });
      toast.success("Quote request updated successfully!");
      setBusinessNotes("");
      setEstimatedQuote("");
      setSelectedForm(null);
    } catch (error) {
      console.error("Error updating form:", error);
      toast.error("Failed to update quote request. Please try again.");
    }
  };

  const handleCreateProject = async (intakeFormId: Id<"intakeForms">) => {
    try {
      // Validate form
      if (!projectForm.projectType || !projectForm.projectName || !projectForm.estimatedLength || 
          !projectForm.estimatedStartDate || !projectForm.estimatedEndDate) {
        toast.error("Please fill in all required fields");
        return;
      }

      const tasks = projectForm.tasks.filter(task => task.trim() !== "");
      if (tasks.length === 0) {
        toast.error("Please add at least one task");
        return;
      }

      const startDate = new Date(projectForm.estimatedStartDate);
      const endDate = new Date(projectForm.estimatedEndDate);
      
      if (startDate >= endDate) {
        toast.error("End date must be after start date");
        return;
      }

      await createProjectFromIntakeForm({
        intakeFormId,
        projectType: projectForm.projectType,
        projectName: projectForm.projectName,
        projectTasks: tasks,
        estimatedLength: parseInt(projectForm.estimatedLength),
        estimatedStartDateTime: startDate.getTime(),
        estimatedEndDateTime: endDate.getTime(),
        notes: projectForm.notes || undefined,
      });

      toast.success("Project created successfully!");
      
      // Reset form
      setProjectForm({
        projectType: "",
        projectName: "",
        tasks: [""],
        estimatedLength: "",
        estimatedStartDate: "",
        estimatedEndDate: "",
        notes: "",
      });
      
      setShowCreateProjectDialog(false);
      setSelectedForm(null);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    }
  };

  const addTask = () => {
    setProjectForm(prev => ({
      ...prev,
      tasks: [...prev.tasks, ""]
    }));
  };

  const removeTask = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const updateTask = (index: number, value: string) => {
    setProjectForm(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => i === index ? value : task)
    }));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-100 text-blue-800";
      case "claimed": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const IntakeFormCard = ({ form }: { form: IntakeFormDetails }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{form.firstName} {form.lastName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-3 w-3" />
              {form.email}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(form.status)}>
            {form.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            {form.phone}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            Submitted {formatDate(form.submittedAt)}
          </div>

          <p className="text-sm text-gray-700 line-clamp-2">
            {form.projectDescription}
          </p>

          {(form.imageUrls?.length || form.videoUrls?.length) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {form.imageUrls?.length && (
                <div className="flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  {form.imageUrls.length} image{form.imageUrls.length > 1 ? 's' : ''}
                </div>
              )}
              {form.videoUrls?.length && (
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  {form.videoUrls.length} video{form.videoUrls.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedForm(form)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Quote Request Details</DialogTitle>
                  <DialogDescription>
                    Review the project details and claim this quote request
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold mb-3">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{form.firstName} {form.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{form.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{form.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{formatDate(form.submittedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div>
                    <h3 className="font-semibold mb-3">Project Description</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{form.projectDescription}</p>
                    </div>
                  </div>

                  {/* Media Files */}
                  {(form.imageUrls?.length || form.videoUrls?.length) && (
                    <div>
                      <h3 className="font-semibold mb-3">Project Media</h3>
                      <div className="space-y-2">
                        {form.imageUrls?.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <ImageIcon className="h-4 w-4" />
                            <span>Image {index + 1}</span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              View Image
                            </a>
                          </div>
                        ))}
                        {form.videoUrls?.map((url, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <Video className="h-4 w-4" />
                            <span>Video {index + 1}</span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              View Video
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Notes and Quote */}
                  {form.status !== "submitted" && (
                    <div>
                      <h3 className="font-semibold mb-3">Your Notes & Quote</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Business Notes</label>
                          <Textarea
                            value={businessNotes}
                            onChange={(e) => setBusinessNotes(e.target.value)}
                            placeholder="Add your notes about this project..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Estimated Quote ($)</label>
                          <Input
                            type="number"
                            value={estimatedQuote}
                            onChange={(e) => setEstimatedQuote(e.target.value)}
                            placeholder="Enter estimated quote amount"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {form.status === "submitted" && (
                      <Button
                        onClick={() => handleClaimForm(form._id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Claim This Request
                      </Button>
                    )}
                    
                    {form.status === "claimed" && form.businessOwnerClerkId === profile.clerkUserId && (
                      <>
                        <Button
                          onClick={() => handleUpdateStatus(form._id, "in_progress")}
                          variant="outline"
                          className="flex-1"
                        >
                          Mark as In Progress
                        </Button>
                        <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
                          <DialogTrigger asChild>
                            <Button className="flex-1">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Project
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Create Project from Quote Request</DialogTitle>
                              <DialogDescription>
                                Create a new project based on the quote request from {selectedForm?.firstName} {selectedForm?.lastName}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* Project Type */}
                              <div>
                                <Label htmlFor="projectType">Project Type *</Label>
                                <select
                                  id="projectType"
                                  value={projectForm.projectType}
                                  onChange={(e) => setProjectForm(prev => ({ ...prev, projectType: e.target.value }))}
                                  className="w-full p-2 border rounded-md"
                                >
                                  <option value="">Select project type</option>
                                  <option value="lawn-care">Lawn Care</option>
                                  <option value="landscaping">Landscaping</option>
                                  <option value="tree-services">Tree Services</option>
                                  <option value="garden-design">Garden Design</option>
                                  <option value="hardscaping">Hardscaping</option>
                                  <option value="maintenance">Maintenance</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>

                              {/* Project Name */}
                              <div>
                                <Label htmlFor="projectName">Project Name *</Label>
                                <Input
                                  id="projectName"
                                  value={projectForm.projectName}
                                  onChange={(e) => setProjectForm(prev => ({ ...prev, projectName: e.target.value }))}
                                  placeholder="Enter project name"
                                />
                              </div>

                              {/* Project Tasks */}
                              <div>
                                <Label>Project Tasks *</Label>
                                <div className="space-y-2">
                                  {projectForm.tasks.map((task, index) => (
                                    <div key={index} className="flex gap-2">
                                      <Input
                                        value={task}
                                        onChange={(e) => updateTask(index, e.target.value)}
                                        placeholder={`Task ${index + 1}`}
                                      />
                                      {projectForm.tasks.length > 1 && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeTask(index)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addTask}
                                    className="w-full"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Task
                                  </Button>
                                </div>
                              </div>

                              {/* Estimated Length */}
                              <div>
                                <Label htmlFor="estimatedLength">Estimated Length (days) *</Label>
                                <Input
                                  id="estimatedLength"
                                  type="number"
                                  value={projectForm.estimatedLength}
                                  onChange={(e) => setProjectForm(prev => ({ ...prev, estimatedLength: e.target.value }))}
                                  placeholder="Number of days"
                                />
                              </div>

                              {/* Start and End Dates */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="startDate">Start Date *</Label>
                                  <Input
                                    id="startDate"
                                    type="date"
                                    value={projectForm.estimatedStartDate}
                                    onChange={(e) => setProjectForm(prev => ({ ...prev, estimatedStartDate: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="endDate">End Date *</Label>
                                  <Input
                                    id="endDate"
                                    type="date"
                                    value={projectForm.estimatedEndDate}
                                    onChange={(e) => setProjectForm(prev => ({ ...prev, estimatedEndDate: e.target.value }))}
                                  />
                                </div>
                              </div>

                              {/* Notes */}
                              <div>
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={projectForm.notes}
                                  onChange={(e) => setProjectForm(prev => ({ ...prev, notes: e.target.value }))}
                                  placeholder="Any additional notes or requirements..."
                                  rows={3}
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex gap-3 pt-4">
                                <Button
                                  onClick={() => selectedForm && handleCreateProject(selectedForm._id)}
                                  className="flex-1"
                                >
                                  Create Project
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowCreateProjectDialog(false)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                    
                    {form.status === "in_progress" && form.businessOwnerClerkId === profile.clerkUserId && (
                      <>
                        <Button
                          onClick={() => handleUpdateStatus(form._id, "completed")}
                          variant="outline"
                          className="flex-1"
                        >
                          Mark as Completed
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(form._id, "cancelled")}
                          variant="destructive"
                          className="flex-1"
                        >
                          Cancel Project
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quote Requests</h2>
          <p className="text-gray-600">Manage incoming quote requests from potential clients</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
            <Quote className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{submittedForms.length}</div>
            <p className="text-xs text-gray-500">Awaiting claim</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claimed Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{claimedForms.length}</div>
            <p className="text-xs text-gray-500">Ready for quotes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inProgressForms.length}</div>
            <p className="text-xs text-gray-500">Active projects</p>
          </CardContent>
        </Card>
      </div>

      {/* New Quote Requests */}
      {submittedForms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            New Quote Requests ({submittedForms.length})
          </h3>
          <div className="grid gap-4">
            {submittedForms.map((form) => (
              <IntakeFormCard key={form._id} form={form} />
            ))}
          </div>
        </div>
      )}

      {/* Claimed Requests */}
      {claimedForms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-yellow-500" />
            Your Claimed Requests ({claimedForms.length})
          </h3>
          <div className="grid gap-4">
            {claimedForms.map((form) => (
              <IntakeFormCard key={form._id} form={form} />
            ))}
          </div>
        </div>
      )}

      {/* In Progress Requests */}
      {inProgressForms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-500" />
            Projects In Progress ({inProgressForms.length})
          </h3>
          <div className="grid gap-4">
            {inProgressForms.map((form) => (
              <IntakeFormCard key={form._id} form={form} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredForms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Quote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quote Requests Found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms." : "No quote requests have been submitted yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
