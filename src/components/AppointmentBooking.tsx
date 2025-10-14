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
import { Calendar, Clock, User, MapPin } from "lucide-react";

interface AppointmentBookingProps {
  profile: any;
}

export function AppointmentBooking({ profile }: AppointmentBookingProps) {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(oneHourFromNow.toTimeString().slice(0, 5));
  const [endTime, setEndTime] = useState(twoHoursFromNow.toTimeString().slice(0, 5));
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const myAppointments = useQuery(api.appointments.getMyAppointments);
  const availableAppointments = useQuery(api.appointments.getAvailableAppointments, 
    selectedBusinessId ? { businessOwnerClerkId: selectedBusinessId } : {}
  );
  const businessOwners = useQuery(api.profiles.getBusinessOwners);

  const createAppointmentSlot = useMutation(api.appointments.createAppointmentSlot);
  const bookAppointment = useMutation(api.appointments.bookAppointment);
  const updateAppointmentStatus = useMutation(api.appointments.updateAppointmentStatus);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startDateTime = new Date(`${selectedDate}T${startTime}`).getTime();
      const endDateTime = new Date(`${selectedDate}T${endTime}`).getTime();
      const now = Date.now();
      
      if (startDateTime < now) {
        toast.error("Cannot create appointments in the past");
        return;
      }
      
      if (endDateTime <= startDateTime) {
        toast.error("End time must be after start time");
        return;
      }
      
      await createAppointmentSlot({ startDateTime, endDateTime });
      toast.success("Appointment slot created!");
      
      // Reset to intelligent defaults
      const resetNow = new Date();
      const oneHourFromNow = new Date(resetNow.getTime() + 60 * 60 * 1000);
      const twoHoursFromNow = new Date(resetNow.getTime() + 2 * 60 * 60 * 1000);
      setStartTime(oneHourFromNow.toTimeString().slice(0, 5));
      setEndTime(twoHoursFromNow.toTimeString().slice(0, 5));
    } catch (error) {
      toast.error("Failed to create appointment slot");
    }
  };

  const handleBookAppointment = async (appointmentId: string) => {
    try {
      await bookAppointment({ appointmentId: appointmentId as any, notes });
      toast.success("Appointment booked!");
      setNotes("");
    } catch (error) {
      toast.error("Failed to book appointment");
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    try {
      await updateAppointmentStatus({ 
        appointmentId: appointmentId as any, 
        status: status as any 
      });
      toast.success("Appointment updated!");
      
      if (status === "completed") {
        setSelectedAppointment(myAppointments?.find(apt => apt._id === appointmentId));
        setShowCreateProject(true);
      }
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "booked": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {profile.userType === "business" ? (
        // Business Owner View
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Create Appointment Slot
            </h2>
            <form onSubmit={handleCreateSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    // Auto-set end time to one hour after start time
                    const startTimeValue = e.target.value;
                    if (startTimeValue) {
                      const [hours, minutes] = startTimeValue.split(':').map(Number);
                      const startDate = new Date();
                      startDate.setHours(hours, minutes, 0, 0);
                      
                      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
                      const endTimeString = endDate.toTimeString().slice(0, 5);
                      setEndTime(endTimeString);
                    }
                  }}
                  min={selectedDate === new Date().toISOString().split('T')[0] ? new Date().toTimeString().slice(0, 5) : undefined}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={selectedDate === new Date().toISOString().split('T')[0] ? new Date().toTimeString().slice(0, 5) : undefined}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Create Slot
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
            <div className="space-y-3">
              {myAppointments?.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{formatDateTime(appointment.startDateTime)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {appointment.status === "booked" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(appointment._id, "completed")}
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === "available" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!myAppointments?.length && (
                <p className="text-gray-500 text-center py-8">No appointments yet</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Client View
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Book Appointment
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="business">Select Business</Label>
                <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a landscaper" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessOwners?.map((business) => (
                      <SelectItem key={business._id} value={business.clerkUserId}>
                        {business.businessName || "Business Owner"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBusinessId && (
                <div className="space-y-3">
                  <h3 className="font-medium">Available Appointments</h3>
                  {availableAppointments?.map((appointment: any) => (
                    <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{formatDateTime(appointment.startDateTime)}</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">Book</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Book Appointment</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="notes">Notes (optional)</Label>
                              <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any specific requirements or questions..."
                              />
                            </div>
                            <Button 
                              onClick={() => handleBookAppointment(appointment._id)}
                              className="w-full"
                            >
                              Confirm Booking
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                  {!availableAppointments?.length && (
                    <p className="text-gray-500 text-center py-4">No available appointments</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
            <div className="space-y-3">
              {myAppointments?.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{formatDateTime(appointment.startDateTime)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    )}
                  </div>
                  {appointment.status === "booked" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
              {!myAppointments?.length && (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Project Dialog */}
      {showCreateProject && selectedAppointment && (
        <CreateProjectDialog
          appointment={selectedAppointment}
          isOpen={showCreateProject}
          onClose={() => setShowCreateProject(false)}
        />
      )}
    </div>
  );
}

function CreateProjectDialog({ appointment, isOpen, onClose }: any) {
  const [projectData, setProjectData] = useState({
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
      projectTasks: prev.projectTasks.filter(t => t !== task)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject({
        clientClerkId: appointment.clientClerkId,
        projectType: projectData.projectType,
        projectName: projectData.projectName,
        projectTasks: projectData.projectTasks,
        estimatedLength: projectData.estimatedLength,
        estimatedStartDateTime: new Date(projectData.estimatedStartDateTime).getTime(),
        estimatedEndDateTime: new Date(projectData.estimatedEndDateTime).getTime(),
        notes: projectData.notes,
      });
      toast.success("Project created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              {projectData.projectTasks.map((task) => (
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
