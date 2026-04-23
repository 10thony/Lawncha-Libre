import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PROJECT_VARIANT_LINKS, getProjectsWithMockData } from "./projects-variant-utils";
import { ProjectCrudOverlay } from "./project-crud-overlay";

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#e5e5e5",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: 13,
    lineHeight: 1.55,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 24px",
    borderBottom: "1px solid #292524",
    background: "#0f0f0f",
  },
  callsign: {
    fontSize: 11,
    letterSpacing: 4,
    textTransform: "uppercase" as const,
    color: "#f59e0b",
    fontWeight: 700,
  },
  clock: {
    fontSize: 11,
    color: "#78716c",
    letterSpacing: 2,
  },
  backBtn: {
    background: "none",
    border: "1px solid #292524",
    color: "#a8a29e",
    padding: "4px 12px",
    fontSize: 11,
    cursor: "pointer",
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  gridHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 0,
    borderBottom: "1px solid #1c1917",
    background: "#0d0d0d",
  },
  gridHeaderCell: {
    padding: "10px 20px",
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: 3,
    color: "#78716c",
    borderRight: "1px solid #1c1917",
  },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 0,
    borderBottom: "2px solid #f59e0b",
  },
  statCell: {
    padding: "16px 20px",
    borderRight: "1px solid #1c1917",
    background: "#0d0d0d",
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#fbbf24",
    fontVariantNumeric: "tabular-nums",
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: 3,
    color: "#57534e",
    marginTop: 4,
  },
  content: {
    padding: "0",
  },
  opCard: {
    borderBottom: "1px solid #1c1917",
    padding: "20px 24px",
    display: "grid",
    gridTemplateColumns: "240px 1fr 200px",
    gap: 24,
    transition: "background 0.15s",
  },
  opCardHover: {
    background: "#111010",
  },
  opId: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#f59e0b",
    textTransform: "uppercase" as const,
    marginBottom: 6,
  },
  opName: {
    fontSize: 16,
    fontWeight: 600,
    color: "#fafaf9",
    marginBottom: 4,
  },
  opType: {
    fontSize: 12,
    color: "#78716c",
  },
  opMeta: {
    fontSize: 11,
    color: "#57534e",
    marginTop: 8,
    display: "flex",
    gap: 16,
  },
  taskRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 0",
    borderBottom: "1px solid #1a1918",
    fontSize: 12,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  taskName: {
    flex: 1,
    color: "#d6d3d1",
  },
  taskBadge: {
    fontSize: 10,
    padding: "2px 8px",
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    fontWeight: 600,
  },
  gauge: {
    height: 6,
    background: "#1c1917",
    borderRadius: 0,
    overflow: "hidden",
    marginTop: 8,
  },
  gaugeFill: {
    height: "100%",
    transition: "width 0.6s ease",
  },
  statusPanel: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    padding: "4px 10px",
    border: "1px solid",
  },
  approvalBadge: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    padding: "3px 8px",
    marginTop: 6,
  },
  dates: {
    fontSize: 10,
    color: "#57534e",
    textAlign: "right" as const,
    marginTop: "auto",
    fontVariantNumeric: "tabular-nums",
  },
  empty: {
    padding: "80px 24px",
    textAlign: "center" as const,
    color: "#57534e",
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  selectTrigger: {
    background: "#1c1917",
    border: "1px solid #292524",
    color: "#d6d3d1",
    padding: "3px 8px",
    fontSize: 10,
    fontFamily: "inherit",
    letterSpacing: 1,
    cursor: "pointer",
    textTransform: "uppercase" as const,
  },
  navLinks: {
    display: "flex",
    gap: 4,
    alignItems: "center",
  },
  navDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
    background: "#f59e0b",
  },
};

function getStatusStyle(status: string) {
  switch (status) {
    case "planned": return { color: "#60a5fa", borderColor: "#1e3a5f" };
    case "in_progress": return { color: "#fbbf24", borderColor: "#78350f" };
    case "completed": return { color: "#34d399", borderColor: "#064e3b" };
    case "cancelled": return { color: "#f87171", borderColor: "#7f1d1d" };
    default: return { color: "#78716c", borderColor: "#292524" };
  }
}

function getApprovalStyle(status: string) {
  switch (status) {
    case "pending": return { color: "#0a0a0a", background: "#fbbf24" };
    case "approved": return { color: "#0a0a0a", background: "#34d399" };
    case "rejected": return { color: "#fafaf9", background: "#dc2626" };
    default: return { color: "#78716c", background: "#292524" };
  }
}

function getTaskColor(status: string) {
  switch (status) {
    case "queued": return "#57534e";
    case "in_progress": return "#f59e0b";
    case "done": return "#22c55e";
    default: return "#57534e";
  }
}

export function ProjectsWarRoom({ embedded = false }: { embedded?: boolean } = {}) {
  const { user } = useUser();
  const myProjects = useQuery(api.projects.getMyProjects);
  const profile = useQuery(api.profiles.getCurrentProfile);
  const navigate = useNavigate();
  const projects = getProjectsWithMockData(myProjects);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === "undefined" ? 1920 : window.innerWidth
  );
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const total = projects.length;
  const active = projects.filter((p) => p.status === "in_progress").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const pending = projects.filter((p) => p.approvalStatus === "pending").length;

  const now = new Date();
  const timestamp = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }).toUpperCase()
    + " " + now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
  const isTwoColumn = viewportWidth >= 1500;
  const isCompactLayout = viewportWidth < 1200;
  const contentStyle: React.CSSProperties = isTwoColumn
    ? {
      ...S.content,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
    }
    : S.content;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {!embedded && (
        <div style={S.topBar}>
          <div style={S.navLinks}>
            <button style={S.backBtn} onClick={() => navigate("/")}>&#9664; MAIN</button>
            <button style={S.backBtn} onClick={() => setCreateOpen(true)}>+ NEW</button>
            {PROJECT_VARIANT_LINKS.map((link) => (
              <button key={link.path} style={{
                ...S.backBtn,
                ...(link.path === "/1" ? { borderColor: "#f59e0b", color: "#f59e0b" } : {}),
              }} onClick={() => navigate(link.path)}>{link.label}</button>
            ))}
          </div>
          <span style={S.callsign}>OPERATION CENTER // PROJECTS</span>
          <span style={S.clock}>{timestamp} // {user?.firstName?.toUpperCase() || "OPERATOR"}</span>
        </div>
      )}

      {/* STATS BAR */}
      <div style={S.statsBar}>
        <div style={S.statCell}>
          <div style={S.statValue}>{total}</div>
          <div style={S.statLabel}>Total Operations</div>
        </div>
        <div style={S.statCell}>
          <div style={{ ...S.statValue, color: "#f59e0b" }}>{active}</div>
          <div style={S.statLabel}>Active</div>
        </div>
        <div style={S.statCell}>
          <div style={{ ...S.statValue, color: "#22c55e" }}>{completed}</div>
          <div style={S.statLabel}>Completed</div>
        </div>
        <div style={S.statCell}>
          <div style={{ ...S.statValue, color: pending > 0 ? "#ef4444" : "#57534e" }}>{pending}</div>
          <div style={S.statLabel}>Awaiting Clearance</div>
        </div>
      </div>

      {/* COLUMN HEADERS */}
      <div style={S.gridHeader}>
        <div style={S.gridHeaderCell}>Operation</div>
        <div style={{ ...S.gridHeaderCell, gridColumn: "2 / 4" }}>Task Roster</div>
        <div style={S.gridHeaderCell}>Status / Timeline</div>
      </div>

      {/* PROJECT ROWS */}
      <div style={contentStyle}>
        {projects.map((project: any, idx: number) => (
          <WarRoomProjectRow
            key={project._id}
            project={project}
            idx={idx}
            userType={profile?.userType || "client"}
            isCompactLayout={isCompactLayout}
            onOpen={() => setSelectedProject(project)}
          />
        ))}

        {projects.length === 0 && (
          <div style={S.empty}>
            No operations on file. Standing by.
          </div>
        )}
      </div>
      <ProjectCrudOverlay
        mode="create"
        open={createOpen}
        userType={profile?.userType}
        defaultClientClerkId={user?.id}
        onClose={() => setCreateOpen(false)}
      />
      <ProjectCrudOverlay
        mode="details"
        open={Boolean(selectedProject)}
        project={selectedProject || undefined}
        userType={profile?.userType}
        defaultClientClerkId={user?.id}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}

function WarRoomProjectRow({
  project,
  idx,
  userType,
  isCompactLayout,
  onOpen,
}: {
  project: any;
  idx: number;
  userType: string;
  isCompactLayout: boolean;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);

  const doneTasks = project.projectTasks.filter((t: any) =>
    (typeof t === "string" ? "queued" : t.status) === "done"
  ).length;
  const totalTasks = project.projectTasks.length;
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statusStyle = getStatusStyle(project.status);
  const approvalStyle = getApprovalStyle(project.approvalStatus);

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase();
  const opCardStyle: React.CSSProperties = {
    ...S.opCard,
    ...(isCompactLayout ? { gridTemplateColumns: "1fr", gap: 14, padding: "16px" } : {}),
    ...(hovered ? S.opCardHover : {}),
  };
  const opMetaStyle: React.CSSProperties = {
    ...S.opMeta,
    ...(isCompactLayout ? { flexWrap: "wrap", rowGap: 4 } : {}),
  };
  const statusPanelStyle: React.CSSProperties = {
    ...S.statusPanel,
    ...(isCompactLayout ? { alignItems: "flex-start", gap: 12 } : {}),
  };
  const datesStyle: React.CSSProperties = {
    ...S.dates,
    ...(isCompactLayout ? { textAlign: "left" } : {}),
  };

  const handleTaskStatusChange = async (taskIndex: number, newStatus: string) => {
    try {
      await updateTaskStatus({
        projectId: project._id,
        taskIndex,
        status: newStatus as any,
      });
      toast.success("Task status updated");
    } catch {
      toast.error("Failed to update task");
    }
  };

  return (
    <div
      style={opCardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
    >
      {/* LEFT: Operation Info */}
      <div>
        <div style={S.opId}>OP-{String(idx + 1).padStart(3, "0")}</div>
        <div style={S.opName}>{project.projectName}</div>
        <div style={S.opType}>{project.projectType}</div>
        <div style={opMetaStyle}>
          <span>{project.estimatedLength}d est.</span>
          <span>{fmtDate(project.estimatedStartDateTime)} — {fmtDate(project.estimatedEndDateTime)}</span>
        </div>
        {/* GAUGE */}
        <div style={S.gauge}>
          <div style={{
            ...S.gaugeFill,
            width: `${pct}%`,
            background: pct === 100 ? "#22c55e" : "#f59e0b",
          }} />
        </div>
        <div style={{ fontSize: 10, color: "#57534e", marginTop: 4 }}>
          {doneTasks}/{totalTasks} TASKS — {pct}%
        </div>
        {project.notes && (
          <div style={{ fontSize: 11, color: "#44403c", marginTop: 8, fontStyle: "italic" }}>
            {project.notes}
          </div>
        )}
      </div>

      {/* CENTER: Tasks */}
      <div>
        {project.projectTasks.map((task: any, i: number) => {
          const name = typeof task === "string" ? task : task.name;
          const status = typeof task === "string" ? "queued" : task.status;
          const dotColor = getTaskColor(status);

          return (
            <div key={i} style={S.taskRow}>
              <div style={{ ...S.taskDot, background: dotColor, boxShadow: status === "in_progress" ? `0 0 6px ${dotColor}` : "none" }} />
              <span style={S.taskName}>{name}</span>
              <span style={{
                ...S.taskBadge,
                color: dotColor,
              }}>
                {status.replace("_", " ")}
              </span>
              {(userType === "business" || userType === "employee") && (
                <select
                  value={status}
                  onChange={(e) => handleTaskStatusChange(i, e.target.value)}
                  style={S.selectTrigger}
                >
                  <option value="queued">QUEUED</option>
                  <option value="in_progress">IN PROGRESS</option>
                  <option value="done">DONE</option>
                </select>
              )}
            </div>
          );
        })}
        {project.projectTasks.length === 0 && (
          <div style={{ color: "#44403c", fontSize: 11 }}>No tasks assigned.</div>
        )}
      </div>

      {/* RIGHT: Status */}
      <div style={statusPanelStyle}>
        <div>
          <div style={{
            ...S.statusBadge,
            color: statusStyle.color,
            borderColor: statusStyle.borderColor,
          }}>
            {project.status.replace("_", " ")}
          </div>
          <div style={{ ...S.approvalBadge, ...approvalStyle }}>
            {project.approvalStatus}
          </div>
        </div>
        <div style={datesStyle}>
          <div>START {fmtDate(project.estimatedStartDateTime)}</div>
          <div>END {fmtDate(project.estimatedEndDateTime)}</div>
          {project.actualStartDateTime && (
            <div style={{ color: "#78716c" }}>ACTUAL {fmtDate(project.actualStartDateTime)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
