import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { getTaskName, getTaskStatus, type TaskStatus } from "./projects-variant-utils";

type OverlayMode = "create" | "details";

type Props = {
  mode: OverlayMode;
  open: boolean;
  project?: any;
  userType?: string;
  defaultClientClerkId?: string;
  onClose: () => void;
};

const shell: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: 16,
};

const panel: React.CSSProperties = {
  width: "min(900px, 100%)",
  maxHeight: "90vh",
  overflow: "auto",
  background: "#111827",
  border: "1px solid #374151",
  color: "#f3f4f6",
  borderRadius: 8,
  padding: 16,
  fontFamily: "system-ui, sans-serif",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  background: "#0b1220",
  border: "1px solid #374151",
  color: "#f9fafb",
  borderRadius: 6,
  fontSize: 13,
};

const btn: React.CSSProperties = {
  border: "1px solid #4b5563",
  background: "#1f2937",
  color: "#f3f4f6",
  padding: "7px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
};

const section: React.CSSProperties = {
  border: "1px solid #374151",
  borderRadius: 6,
  padding: 12,
  marginTop: 12,
};

function canManage(userType?: string) {
  return userType === "business" || userType === "employee";
}

export function ProjectCrudOverlay({
  mode,
  open,
  project,
  userType,
  defaultClientClerkId,
  onClose,
}: Props) {
  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);
  const addTaskToProject = useMutation(api.projects.addTaskToProject);
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);
  const editable = canManage(userType);

  const [projectName, setProjectName] = useState(project?.projectName || "");
  const [projectType, setProjectType] = useState(project?.projectType || "");
  const [clientClerkId, setClientClerkId] = useState(project?.clientClerkId || defaultClientClerkId || "");
  const [estimatedLength, setEstimatedLength] = useState<number>(project?.estimatedLength || 14);
  const [estimatedStart, setEstimatedStart] = useState(() =>
    toDateInput(project?.estimatedStartDateTime || Date.now())
  );
  const [estimatedEnd, setEstimatedEnd] = useState(() =>
    toDateInput(project?.estimatedEndDateTime || Date.now() + 1000 * 60 * 60 * 24 * 14)
  );
  const [notes, setNotes] = useState(project?.notes || "");
  const [status, setStatus] = useState(project?.status || "planned");
  const [newTask, setNewTask] = useState("");
  const [saving, setSaving] = useState(false);

  const taskRows = useMemo(
    () => (project?.projectTasks || []).map((task: any) => ({ name: getTaskName(task), status: getTaskStatus(task) })),
    [project]
  );

  if (!open) return null;

  const saveNew = async () => {
    if (!editable) return;
    if (!projectName.trim() || !projectType.trim() || !clientClerkId.trim()) {
      toast.error("Name, type, and client ID are required.");
      return;
    }
    setSaving(true);
    try {
      await createProject({
        projectName: projectName.trim(),
        projectType: projectType.trim(),
        clientClerkId: clientClerkId.trim(),
        estimatedLength,
        estimatedStartDateTime: new Date(estimatedStart).getTime(),
        estimatedEndDateTime: new Date(estimatedEnd).getTime(),
        notes: notes.trim() || undefined,
        projectTasks: [],
      });
      toast.success("Project created.");
      onClose();
    } catch {
      toast.error("Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  const saveExisting = async () => {
    if (!editable || !project?._id) return;
    setSaving(true);
    try {
      await updateProject({
        projectId: project._id,
        projectName: projectName.trim() || project.projectName,
        projectType: projectType.trim() || project.projectType,
        estimatedLength,
        estimatedStartDateTime: new Date(estimatedStart).getTime(),
        estimatedEndDateTime: new Date(estimatedEnd).getTime(),
        notes: notes.trim() || undefined,
        status: status as any,
      });
      toast.success("Project updated.");
    } catch {
      toast.error("Failed to update project.");
    } finally {
      setSaving(false);
    }
  };

  const addTask = async () => {
    if (!editable || !project?._id || !newTask.trim()) return;
    try {
      await addTaskToProject({ projectId: project._id, taskName: newTask.trim() });
      toast.success("Task added.");
      setNewTask("");
    } catch {
      toast.error("Failed to add task.");
    }
  };

  const setTaskStatus = async (taskIndex: number, nextStatus: TaskStatus) => {
    if (!editable || !project?._id) return;
    try {
      await updateTaskStatus({ projectId: project._id, taskIndex, status: nextStatus });
      toast.success("Task updated.");
    } catch {
      toast.error("Failed to update task.");
    }
  };

  const renameTask = async (taskIndex: number, nextName: string) => {
    if (!editable || !project?._id || !nextName.trim()) return;
    const updated = taskRows.map((t, i) => (i === taskIndex ? { ...t, name: nextName.trim() } : t));
    try {
      await updateProject({ projectId: project._id, projectTasks: updated as any });
      toast.success("Task renamed.");
    } catch {
      toast.error("Failed to rename task.");
    }
  };

  const removeTask = async (taskIndex: number) => {
    if (!editable || !project?._id) return;
    const updated = taskRows.filter((_: any, i: number) => i !== taskIndex);
    try {
      await updateProject({ projectId: project._id, projectTasks: updated as any });
      toast.success("Task removed.");
    } catch {
      toast.error("Failed to remove task.");
    }
  };

  return (
    <div style={shell} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{mode === "create" ? "Create Project" : "Project Details"}</h3>
          <button style={btn} onClick={onClose}>Close</button>
        </div>

        <div style={section}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label>Project name</label>
              <input style={input} value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
            <div>
              <label>Project type</label>
              <input style={input} value={projectType} onChange={(e) => setProjectType(e.target.value)} />
            </div>
            <div>
              <label>Client ID</label>
              <input
                style={input}
                value={clientClerkId}
                onChange={(e) => setClientClerkId(e.target.value)}
                disabled={mode !== "create"}
              />
            </div>
            <div>
              <label>Estimated days</label>
              <input
                style={input}
                type="number"
                value={estimatedLength}
                onChange={(e) => setEstimatedLength(Number(e.target.value || 0))}
              />
            </div>
            <div>
              <label>Start date</label>
              <input style={input} type="date" value={estimatedStart} onChange={(e) => setEstimatedStart(e.target.value)} />
            </div>
            <div>
              <label>End date</label>
              <input style={input} type="date" value={estimatedEnd} onChange={(e) => setEstimatedEnd(e.target.value)} />
            </div>
            {mode === "details" && (
              <div>
                <label>Status</label>
                <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="planned">planned</option>
                  <option value="in_progress">in progress</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Notes</label>
            <textarea style={{ ...input, minHeight: 70 }} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div style={{ marginTop: 10 }}>
            {mode === "create" ? (
              <button style={btn} disabled={!editable || saving} onClick={saveNew}>Create Project</button>
            ) : (
              <button style={btn} disabled={!editable || saving} onClick={saveExisting}>Save Changes</button>
            )}
          </div>
        </div>

        {mode === "details" && (
          <div style={section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <strong>Tasks</strong>
              {editable && (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={{ ...input, width: 220 }}
                    placeholder="New task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                  />
                  <button style={btn} onClick={addTask}>Add task</button>
                </div>
              )}
            </div>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {taskRows.map((task, idx) => (
                <div key={`${task.name}-${idx}`} style={{ border: "1px solid #374151", padding: 8, borderRadius: 6 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center" }}>
                    <input
                      style={input}
                      defaultValue={task.name}
                      onBlur={(e) => renameTask(idx, e.target.value)}
                      disabled={!editable}
                    />
                    <select
                      style={{ ...input, width: 150 }}
                      value={task.status}
                      onChange={(e) => setTaskStatus(idx, e.target.value as TaskStatus)}
                      disabled={!editable}
                    >
                      <option value="queued">queued</option>
                      <option value="in_progress">in progress</option>
                      <option value="done">done</option>
                    </select>
                    {editable && <button style={btn} onClick={() => removeTask(idx)}>Delete</button>}
                  </div>
                </div>
              ))}
              {taskRows.length === 0 && <div style={{ color: "#9ca3af" }}>No tasks yet.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function toDateInput(value: number) {
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
