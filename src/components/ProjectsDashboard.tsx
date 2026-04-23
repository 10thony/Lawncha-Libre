import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const NO_CLIENT_SELECT_VALUE = "__no_client__";
import { Plus, Edit, Check, X, Image as ImageIcon } from "lucide-react";
import { uploadImagesWithUploadThing } from "@/lib/uploadthing";

/** Deterministic job reference (PO-style) for card chrome — not geographic data. */
function jobRefFromId(id: string, idx: number) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const n = (hash + idx * 17) & 0xffff;
  return `PO-${n.toString(16).toUpperCase().padStart(4, "0")}`;
}

/** Schedule / area readout for task rows (replaces bearing/course lingo). */
function schedulePhaseFromIdx(seed: number) {
  const areas = ["Site", "Shell", "MEP", "Interiors", "Closeout"];
  const w = 1 + (seed % 12);
  return `${areas[seed % areas.length]} · Wk ${w}`;
}

function getProgress(tasks: any[]) {
  const total = tasks.length;
  const done = tasks.filter((t: any) => typeof t !== "string" && t.status === "done").length;
  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

function formatShortDate(ts: number | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

const TOPO_BG = `radial-gradient(ellipse 180px 140px at 20% 60%, hsl(var(--border) / 0.08) 0 1px, transparent 1px 26px, hsl(var(--border) / 0.06) 26px 27px, transparent 27px 52px, hsl(var(--border) / 0.04) 52px 53px, transparent 53px), radial-gradient(ellipse 120px 90px at 78% 30%, hsl(var(--primary) / 0.12) 0 1px, transparent 1px 18px, hsl(var(--primary) / 0.08) 18px 19px, transparent 19px)`;

const ELEV_FILLS = ["bg-[#a8c4b5] dark:bg-emerald-900/60", "bg-[#7ea59b] dark:bg-emerald-800/60", "bg-[#50867e] dark:bg-emerald-700/70", "bg-[#276749] dark:bg-emerald-600/80"];

function elevationFill(i: number, steps: number) {
  if (i >= steps) return "";
  if (i < steps * 0.25) return ELEV_FILLS[0];
  if (i < steps * 0.5) return ELEV_FILLS[1];
  if (i < steps * 0.75) return ELEV_FILLS[2];
  return ELEV_FILLS[3];
}

interface ProjectsDashboardProps {
  profile: any;
}

export function ProjectsDashboard({ profile }: ProjectsDashboardProps) {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const myProjects = useQuery(api.projects.getMyProjects);
  const clients = useQuery(api.projects.getClients);
  const clientsWithApprovedAppointments = useQuery(api.projects.getClientsWithApprovedAppointments);

  const total = myProjects?.length || 0;
  const active = myProjects?.filter((p: any) => p.status === "in_progress").length || 0;
  const completed = myProjects?.filter((p: any) => p.status === "completed").length || 0;
  const pending = myProjects?.filter((p: any) => p.approvalStatus === "pending").length || 0;

  const today = new Date();
  const jobLogId = "JL-" + today.getFullYear() + "/" + String(today.getMonth() + 1).padStart(2, "0");

  return (
    <div>
      {/* ── Title block ── */}
      {profile.userType === "business" && (
        <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b-2 border-foreground mb-0">
          <div className="min-w-0">
            <div className="text-[11px] tracking-[0.28em] uppercase text-[#8a5a2b] dark:text-muted-foreground font-semibold font-mono mb-3">
              Job log {jobLogId} <span className="text-foreground">·</span> All scopes <span className="text-foreground">·</span> Active
            </div>
            <h2 className="font-display text-4xl text-accent-foreground leading-[0.95]">
              Projects
            </h2>
            <p className="font-sans italic text-[17px] text-muted-foreground mt-3 max-w-[580px] leading-relaxed">
              Active pipeline, approvals, and production tasks in one place.
            </p>
          </div>
          <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display normal-case tracking-normal text-xl">
                  New project
                </DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a project for a client or as a completed (historical) job.
                </DialogDescription>
              </DialogHeader>
              <CreateProjectForm
                clients={clientsWithApprovedAppointments || []}
                onSuccess={() => setShowCreateProject(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ── Legend stats ── */}
      <div className="grid grid-cols-4 border border-border bg-card/70 mt-6">
        <LegendCell
          figure={String(total).padStart(2, "0")}
          label="Total projects"
          dotClass="bg-accent-foreground rounded-full"
        />
        <LegendCell
          figure={String(active).padStart(2, "0")}
          label="In progress"
          figureClass="text-primary italic"
          dotClass="bg-primary rotate-45"
        />
        <LegendCell
          figure={String(completed).padStart(2, "0")}
          label="Closed out"
          figureClass="text-[#276749] dark:text-emerald-400"
          dotClass="bg-[#276749] dark:bg-emerald-400"
        />
        <LegendCell
          figure={String(pending).padStart(2, "0")}
          label="Pending approval"
          figureClass="text-[#8a5a2b] dark:text-muted-foreground"
          dotClass="border-2 border-[#8a5a2b] dark:border-muted-foreground rounded-full"
        />
      </div>

      {/* ── Section header ── */}
      <div className="flex justify-between items-baseline pt-10 pb-2.5">
        <h3 className="font-display text-[28px] italic text-foreground">
          All projects
        </h3>
        <span className="text-[10px] tracking-[0.26em] text-[#8a5a2b] dark:text-muted-foreground uppercase">
          Full list
        </span>
      </div>

      {/* ── Project grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[repeat(auto-fill,minmax(540px,1fr))] gap-5">
        {myProjects?.map((project: any, idx: number) => (
          <ProjectCard
            key={project._id}
            project={project}
            userType={profile.userType}
            onEdit={setEditingProject}
            idx={idx}
          />
        ))}

        {!myProjects?.length && (
          <div className="py-[120px] text-center" style={{ gridColumn: "1 / -1" }}>
            <div className="font-display text-5xl italic text-accent-foreground tracking-wide">
              <span className="text-destructive text-[28px] mx-4 not-italic">&#10005;</span>
              No projects yet
              <span className="text-destructive text-[28px] mx-4 not-italic">&#10005;</span>
            </div>
            <div className="mt-3.5 text-[11px] tracking-[0.22em] uppercase text-[#8a5a2b] dark:text-muted-foreground">
              Add a project to get started.
            </div>
          </div>
        )}
      </div>

      {/* ── Edit dialog ── */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display normal-case tracking-normal text-xl">
                Edit project
              </DialogTitle>
              <DialogDescription>Update project details, tasks, dates, and status.</DialogDescription>
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

/* ═══════════════════════════════════════════════════════════════
   Legend Cell
   ═══════════════════════════════════════════════════════════════ */

function LegendCell({ figure, label, figureClass = "", dotClass = "" }: {
  figure: string;
  label: string;
  figureClass?: string;
  dotClass?: string;
}) {
  return (
    <div className="p-3 px-[18px] border-r border-border/35 last:border-r-0 relative">
      {dotClass && (
        <div className={`absolute top-2 left-[18px] w-2 h-2 ${dotClass}`} />
      )}
      <div className={`font-mono text-[32px] font-semibold pl-[18px] text-foreground leading-none tabular-nums ${figureClass}`}>
        {figure}
      </div>
      <div className="pl-[18px] text-[10px] tracking-[0.24em] uppercase text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Project card
   ═══════════════════════════════════════════════════════════════ */

function ProjectCard({ project, userType, onEdit, idx }: {
  project: any;
  userType: string;
  onEdit: (p: any) => void;
  idx: number;
}) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);
  const canEditTask = userType === "business" || userType === "employee";

  const progress = getProgress(project.projectTasks);
  const jobRef = jobRefFromId(project._id, idx);
  const elevSteps = Math.round((progress.percent / 100) * 10);

  const statusStyle = (s: string) => {
    const base = "inline-block text-[10px] tracking-[0.18em] uppercase px-2.5 py-[3px] border-[1.5px] border-current bg-background/70 font-semibold whitespace-nowrap";
    switch (s) {
      case "planned": return `${base} text-[#394b6b] dark:text-blue-400`;
      case "in_progress": return `${base} text-primary`;
      case "completed": return `${base} text-[#276749] dark:text-emerald-400`;
      case "cancelled": return `${base} text-destructive`;
      default: return `${base} text-muted-foreground`;
    }
  };

  const approvalStyle = (s: string) => {
    switch (s) {
      case "pending": return "bg-primary text-primary-foreground";
      case "approved": return "bg-emerald-600 text-white";
      case "rejected": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  const handleTaskStatusChange = async (taskIndex: number, status: string) => {
    try {
      await updateTaskStatus({ projectId: project._id, taskIndex, status: status as any });
      toast.success("Task updated");
    } catch {
      toast.error("Could not update task");
    }
  };

  const handleTaskStatusChangeFromModal = async (newStatus: string) => {
    if (selectedTaskIndex === null) return;
    try {
      await updateTaskStatus({ projectId: project._id, taskIndex: selectedTaskIndex, status: newStatus as any });
      toast.success("Task updated");
      setSelectedTask((prev: any) => prev ? { ...prev, status: newStatus } : prev);
    } catch {
      toast.error("Could not update task");
    }
  };

  return (
    <>
      <article className="relative overflow-hidden border border-border bg-card">
        {/* Schematic background texture */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: TOPO_BG }} aria-hidden="true" />

        {/* Corner markers */}
        <div className="absolute top-0 left-0 text-[9px] font-mono text-accent-foreground tracking-[0.22em] px-2 py-1.5 border-r border-b border-border/30 bg-background/85 z-[2]">
          JOB {String(idx + 1).padStart(2, "0")}
        </div>
        <div className="absolute top-0 right-0 text-[9px] font-mono text-accent-foreground tracking-[0.22em] px-2 py-1.5 border-l border-b border-border/30 bg-background/85 z-[2] text-right">
          {jobRef}
        </div>
        <div className="absolute bottom-0 left-0 text-[9px] font-mono text-accent-foreground tracking-[0.22em] px-2 py-1.5 border-r border-t border-border/30 bg-background/85 z-[2]">
          DUR. {project.estimatedLength}D
        </div>
        <div className="absolute bottom-0 right-0 text-[9px] font-mono text-accent-foreground tracking-[0.22em] px-2 py-1.5 border-l border-t border-border/30 bg-background/85 z-[2] text-right">
          REV {String(idx + 1).padStart(3, "0")}
        </div>

        {/* Inner content */}
        <div className="relative z-[1] p-7 pb-5">
          {/* ── Project header block ── */}
          <div className="bg-background border-[1.5px] border-border p-3.5 px-[18px] mb-3.5 grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="min-w-0">
              <h3 className="font-display text-[28px] leading-tight text-accent-foreground font-normal break-words">
                {project.projectName}
              </h3>
              <p className="font-sans italic text-sm text-[#8a5a2b] dark:text-muted-foreground mt-0.5">
                {project.projectType} · added {formatShortDate(project._creationTime)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={statusStyle(project.status)}>
                {project.status.replace("_", " ")}
              </span>
              {project.approvalStatus && (
                <span className={`px-2.5 py-[3px] text-[10px] font-bold tracking-[0.12em] uppercase ${approvalStyle(project.approvalStatus)}`}>
                  {project.approvalStatus}
                </span>
              )}
              {userType === "business" && (
                <button
                  onClick={() => onEdit(project)}
                  className="p-1.5 border border-border/30 hover:border-border text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Edit project"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ── Meta grid ── */}
          <div className="grid grid-cols-4 border-y border-border/30 my-2.5 mb-3">
            <div className="p-2 px-2.5 border-r border-dotted border-border/30">
              <div className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground">Job ref</div>
              <div className="font-mono text-[15px] text-foreground mt-0.5 tabular-nums">{jobRef}</div>
            </div>
            <div className="p-2 px-2.5 border-r border-dotted border-border/30">
              <div className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground">Opens</div>
              <div className="font-mono text-[15px] text-foreground mt-0.5 tabular-nums">{formatShortDate(project.estimatedStartDateTime)}</div>
            </div>
            <div className="p-2 px-2.5 border-r border-dotted border-border/30">
              <div className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground">Closes</div>
              <div className="font-mono text-[15px] text-foreground mt-0.5 tabular-nums">{formatShortDate(project.estimatedEndDateTime)}</div>
            </div>
            <div className="p-2 px-2.5">
              <div className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground">Approval</div>
              <div className={`font-mono text-[15px] mt-0.5 ${
                project.approvalStatus === "approved" ? "text-[#276749] dark:text-emerald-400"
                  : project.approvalStatus === "pending" ? "text-primary"
                  : "text-destructive"
              }`}>
                {project.approvalStatus ? project.approvalStatus.charAt(0).toUpperCase() + project.approvalStatus.slice(1) : "—"}
              </div>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div className="grid grid-cols-[44px_1fr_auto] gap-3 items-center my-2.5 mb-3.5">
            <div className="text-[9px] tracking-[0.2em] uppercase text-[#8a5a2b] dark:text-muted-foreground">Prog.</div>
            <div className="grid grid-cols-[repeat(10,1fr)] gap-0.5 items-end h-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full bg-border/10 border-r border-border/20 ${elevationFill(i, elevSteps)}`}
                />
              ))}
            </div>
            <div className="font-mono not-italic text-[22px] text-accent-foreground tabular-nums">
              {progress.percent}%
            </div>
          </div>

          {/* ── Task list ── */}
          {project.projectTasks.length > 0 && (
            <>
              <div className="text-[10px] font-mono tracking-[0.14em] uppercase text-accent-foreground font-bold py-1.5 border-t-[1.5px] border-t-border border-b border-b-border/30 grid grid-cols-[70px_1fr_auto_auto] gap-3">
                <div>#</div>
                <div>Task</div>
                <div>Area / sched.</div>
                <div>Status</div>
              </div>
              {project.projectTasks.map((task: any, i: number) => {
                const taskName = typeof task === "string" ? task : task.name;
                const taskStatus = typeof task === "string" ? "queued" : (task.status || "queued");
                const sched = schedulePhaseFromIdx((idx + 1) * 100 + i * 7);
                const isDone = taskStatus === "done";
                const isActive = taskStatus === "in_progress";

                return (
                  <div key={i} className="grid grid-cols-[70px_1fr_auto_auto] gap-3 items-center py-1.5 border-b border-dotted border-border/25">
                    <div className="text-[10px] font-mono text-[#8a5a2b] dark:text-muted-foreground tabular-nums">
                      T-{String(i + 1).padStart(2, "0")}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTask(typeof task === "string" ? { name: task, status: "queued" } : task);
                        setSelectedTaskIndex(i);
                      }}
                      className={`font-sans text-sm text-left hover:underline decoration-border/50 underline-offset-2 ${
                        isDone ? "text-muted-foreground line-through decoration-[#276749] dark:decoration-emerald-400" : "text-foreground"
                      }`}
                    >
                      {taskName}
                    </button>
                    <div className="text-[9px] font-mono tracking-[0.04em] text-muted-foreground px-1.5 py-px border border-border/30 tabular-nums whitespace-nowrap max-w-[120px] truncate" title={sched}>
                      {sched}
                    </div>
                    {canEditTask ? (
                      <Select value={taskStatus} onValueChange={(v) => handleTaskStatusChange(i, v)}>
                        <SelectTrigger className="w-28 h-7 text-[9px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="queued">Queued</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className={`text-[9px] tracking-[0.12em] px-1.5 py-px border whitespace-nowrap ${
                        isDone ? "text-[#276749] dark:text-emerald-400 border-[#276749] dark:border-emerald-400 bg-[#276749]/[0.08] dark:bg-emerald-400/10"
                          : isActive ? "text-primary border-primary bg-primary/10"
                          : "text-muted-foreground border-border/30"
                      }`}>
                        {isDone ? "DONE" : isActive ? "ACTIVE" : "QUEUED"}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── Field / PM note ── */}
          {project.notes && (
            <div className="mt-3 p-2.5 px-3.5 bg-primary/[0.08] border-l-[3px] border-l-primary">
              <span className="block text-[9px] tracking-[0.22em] uppercase text-[#8a5a2b] dark:text-muted-foreground font-bold mb-1 not-italic">
                Field note
              </span>
              <span className="font-sans italic text-sm text-foreground">{project.notes}</span>
            </div>
          )}

          {/* ── Rejection reason ── */}
          {project.approvalStatus === "rejected" && project.rejectionReason && (
            <div className="mt-3 p-2.5 px-3.5 bg-destructive/[0.08] border-l-[3px] border-l-destructive">
              <span className="block text-[9px] tracking-[0.22em] uppercase text-destructive font-bold mb-1">
                Not approved
              </span>
              <span className="font-sans italic text-sm text-destructive">{project.rejectionReason}</span>
            </div>
          )}

          {/* ── Approval buttons (client only) ── */}
          {userType === "client" && project.approvalStatus === "pending" && (
            <ProjectApprovalButtons project={project} />
          )}

          {/* ── Duration scale footer ── */}
          <div className="flex justify-between items-center mt-3.5 pt-1.5 border-t border-border/30 text-[9px] tracking-[0.22em] uppercase text-[#8a5a2b] dark:text-muted-foreground">
            <span>0</span>
            <div className="flex w-40 h-2 border border-border" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 border-r border-border last:border-r-0 ${i % 2 === 0 ? "bg-border" : ""}`}
                />
              ))}
            </div>
            <span>{project.estimatedLength} days</span>
          </div>
        </div>
      </article>

      {/* ── Task details dialog ── */}
      <Dialog open={selectedTaskIndex !== null} onOpenChange={(open) => !open && setSelectedTaskIndex(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display normal-case tracking-normal text-xl">
              Task details
            </DialogTitle>
            <DialogDescription>
              {canEditTask
                ? "Review the task and update status as work progresses."
                : "Read-only. Task status can only be updated from a contractor or crew account."}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="border border-border bg-background p-4">
                <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Project</p>
                <p className="mt-1 font-display text-lg text-foreground">{project.projectName}</p>
                <p className="mt-3 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Task</p>
                <p className="mt-1 font-display text-xl text-foreground">{selectedTask.name}</p>
              </div>
              <div>
                <Label htmlFor={`task-status-${project._id}`}>Status</Label>
                {canEditTask ? (
                  <Select value={selectedTask.status} onValueChange={handleTaskStatusChangeFromModal}>
                    <SelectTrigger id={`task-status-${project._id}`} className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="queued">Queued</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`task-status-${project._id}`}
                    className="mt-2 capitalize"
                    value={selectedTask.status.replace("_", " ")}
                    readOnly
                  />
                )}
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={() => setSelectedTaskIndex(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Create Project Form
   ═══════════════════════════════════════════════════════════════ */

function CreateProjectForm({ clients, onSuccess }: any) {
  const [projectData, setProjectData] = useState({
    clientClerkId: "",
    projectType: "",
    projectName: "",
    projectTasks: [] as string[],
    imageUrls: [] as string[],
    estimatedLength: 1,
    estimatedStartDateTime: new Date().toISOString().split("T")[0],
    estimatedEndDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [taskInput, setTaskInput] = useState("");

  const createProject = useMutation(api.projects.createProject);

  const addTask = () => {
    if (taskInput.trim() && !projectData.projectTasks.includes(taskInput.trim())) {
      setProjectData((prev) => ({
        ...prev,
        projectTasks: [...prev.projectTasks, taskInput.trim()],
      }));
      setTaskInput("");
    }
  };

  const removeTask = (task: string) => {
    setProjectData((prev) => ({
      ...prev,
      projectTasks: prev.projectTasks.filter((t: string) => t !== task),
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
      toast.success("Project created");
      onSuccess();
    } catch {
      toast.error("Could not create project");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="client">Client</Label>
        <Select
          value={projectData.clientClerkId ? projectData.clientClerkId : NO_CLIENT_SELECT_VALUE}
          onValueChange={(value) =>
            setProjectData((prev) => ({
              ...prev,
              clientClerkId: value === NO_CLIENT_SELECT_VALUE ? "" : value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CLIENT_SELECT_VALUE}>No Client (Completed Project)</SelectItem>
            {clients.map((client: any) => (
              <SelectItem key={client.clerkUserId} value={client.clerkUserId}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground mt-1 tracking-wide">
          Select "No Client" for projects completed before using our system
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectType">Project type</Label>
          <Input
            id="projectType"
            value={projectData.projectType}
            onChange={(e) => setProjectData((prev) => ({ ...prev, projectType: e.target.value }))}
            placeholder="e.g., Remodeling, Electrical, Landscaping"
            required
          />
        </div>
        <div>
          <Label htmlFor="projectName">Project name</Label>
          <Input
            id="projectName"
            value={projectData.projectName}
            onChange={(e) => setProjectData((prev) => ({ ...prev, projectName: e.target.value }))}
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
                setProjectData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }));
                setSelectedFiles([]);
                toast.success("Images uploaded");
              } catch {
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
              <img key={url} src={url} alt="uploaded" className="h-20 w-full object-cover border border-border" />
            ))}
            {selectedFiles.map((f, idx) => (
              <img key={idx} src={URL.createObjectURL(f)} alt={f.name} className="h-20 w-full object-cover border border-border" />
            ))}
          </div>
        )}
      </div>

      <div>
        <Label>Tasks</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Add a task..."
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
          />
          <Button type="button" onClick={addTask}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {projectData.projectTasks.map((task: string) => (
            <span
              key={task}
              className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-primary border border-border text-sm"
            >
              {task}
              <button
                type="button"
                onClick={() => removeTask(task)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="estimatedLength">Duration (days)</Label>
          <Input
            id="estimatedLength"
            type="number"
            min="1"
            value={projectData.estimatedLength}
            onChange={(e) => setProjectData((prev) => ({ ...prev, estimatedLength: parseInt(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            type="date"
            value={projectData.estimatedStartDateTime}
            onChange={(e) => setProjectData((prev) => ({ ...prev, estimatedStartDateTime: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End date</Label>
          <Input
            id="endDate"
            type="date"
            value={projectData.estimatedEndDateTime}
            onChange={(e) => setProjectData((prev) => ({ ...prev, estimatedEndDateTime: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="projectNotes">Project notes</Label>
        <Textarea
          id="projectNotes"
          value={projectData.notes}
          onChange={(e) => setProjectData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Access, staging, special instructions, etc."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">
          Create project
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Edit Project Form
   ═══════════════════════════════════════════════════════════════ */

function EditProjectForm({ project, onSuccess }: any) {
  const [projectData, setProjectData] = useState({
    projectType: project.projectType,
    projectName: project.projectName,
    projectTasks: project.projectTasks,
    imageUrls: project.imageUrls || ([] as string[]),
    estimatedLength: project.estimatedLength,
    estimatedStartDateTime: new Date(project.estimatedStartDateTime).toISOString().split("T")[0],
    estimatedEndDateTime: new Date(project.estimatedEndDateTime).toISOString().split("T")[0],
    actualStartDateTime: project.actualStartDateTime
      ? new Date(project.actualStartDateTime).toISOString().split("T")[0]
      : "",
    actualEndDateTime: project.actualEndDateTime
      ? new Date(project.actualEndDateTime).toISOString().split("T")[0]
      : "",
    status: project.status,
    notes: project.notes || "",
  });
  const [taskInput, setTaskInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const updateProject = useMutation(api.projects.updateProject);

  const addTask = () => {
    if (taskInput.trim() && !projectData.projectTasks.some((t: any) => t.name === taskInput.trim())) {
      setProjectData((prev) => ({
        ...prev,
        projectTasks: [...prev.projectTasks, { name: taskInput.trim(), status: "queued" }],
      }));
      setTaskInput("");
    }
  };

  const removeTask = (taskName: string) => {
    setProjectData((prev) => ({
      ...prev,
      projectTasks: prev.projectTasks.filter((t: any) => t.name !== taskName),
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
      toast.success("Project saved");
      onSuccess();
    } catch {
      toast.error("Could not save project");
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
                setProjectData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }));
                setSelectedFiles([]);
                toast.success("Images uploaded");
              } catch {
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
            {projectData.imageUrls.map((url: string) => (
              <div key={url} className="relative">
                <img src={url} alt="uploaded" className="h-20 w-full object-cover border border-border" />
                <button
                  type="button"
                  onClick={() => setProjectData((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((u: string) => u !== url) }))}
                  className="absolute top-0 right-0 bg-destructive text-destructive-foreground w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {selectedFiles.map((f, idx) => (
              <img key={idx} src={URL.createObjectURL(f)} alt={f.name} className="h-20 w-full object-cover border border-border" />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectType">Project type</Label>
          <Input
            id="projectType"
            value={projectData.projectType}
            onChange={(e) => setProjectData((prev) => ({ ...prev, projectType: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="projectName">Project name</Label>
          <Input
            id="projectName"
            value={projectData.projectName}
            onChange={(e) => setProjectData((prev) => ({ ...prev, projectName: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Project status</Label>
        <Select value={projectData.status} onValueChange={(value) => setProjectData((prev) => ({ ...prev, status: value }))}>
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
        <Label>Tasks</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Add a task..."
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
          />
          <Button type="button" onClick={addTask}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {projectData.projectTasks.map((task: any) => (
            <span
              key={task.name}
              className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-primary border border-border text-sm"
            >
              {task.name}
              <button
                type="button"
                onClick={() => removeTask(task.name)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estimatedLength">Duration (days)</Label>
          <Input
            id="estimatedLength"
            type="number"
            min="1"
            value={projectData.estimatedLength}
            onChange={(e) => setProjectData((prev) => ({ ...prev, estimatedLength: parseInt(e.target.value) }))}
            required
          />
        </div>
        <div></div>
        <div>
          <Label htmlFor="startDate">Estimated start</Label>
          <Input
            id="startDate"
            type="date"
            value={projectData.estimatedStartDateTime}
            onChange={(e) => setProjectData((prev) => ({ ...prev, estimatedStartDateTime: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">Estimated end</Label>
          <Input
            id="endDate"
            type="date"
            value={projectData.estimatedEndDateTime}
            onChange={(e) => setProjectData((prev) => ({ ...prev, estimatedEndDateTime: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="actualStartDate">Actual start</Label>
          <Input
            id="actualStartDate"
            type="date"
            value={projectData.actualStartDateTime}
            onChange={(e) => setProjectData((prev) => ({ ...prev, actualStartDateTime: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="actualEndDate">Actual end</Label>
          <Input
            id="actualEndDate"
            type="date"
            value={projectData.actualEndDateTime}
            onChange={(e) => setProjectData((prev) => ({ ...prev, actualEndDateTime: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="projectNotes">Project notes</Label>
        <Textarea
          id="projectNotes"
          value={projectData.notes}
          onChange={(e) => setProjectData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Access, staging, special instructions, etc."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">
          Save changes
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Project Approval Buttons
   ═══════════════════════════════════════════════════════════════ */

function ProjectApprovalButtons({ project }: any) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const approveProject = useMutation(api.projects.approveProject);
  const rejectProject = useMutation(api.projects.rejectProject);

  const handleApprove = async () => {
    try {
      await approveProject({ projectId: project._id });
      toast.success("Project approved");
    } catch {
      toast.error("Could not approve");
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
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Request declined");
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch {
      toast.error("Could not record decline");
    }
  };

  return (
    <div className="mt-3 p-3.5 bg-primary/[0.06] border border-primary/30">
      <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-primary mb-2">
        Approval required
      </div>
      <p className="text-[11px] text-primary/80 mb-3">
        Please review and approve or decline this project.
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="border-destructive/50 text-destructive hover:bg-accent">
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display normal-case tracking-normal text-xl">
                Decline project
              </DialogTitle>
              <DialogDescription>
                Share a short reason so your contractor can adjust the scope.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason">Reason for rejection (required)</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for declining (required)"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive"
                >
                  Decline
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
