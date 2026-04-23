import { useState } from "react";
import { useUser } from "@clerk/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PROJECT_VARIANT_LINKS, getProjectsWithMockData } from "./projects-variant-utils";
import { ProjectCrudOverlay } from "./project-crud-overlay";

const d = {
  paper: "#f5f1ea",
  paperDark: "#e8e2d6",
  paperDarker: "#d8d0c0",
  manila: "#eee4c8",
  manilaEdge: "#c4b898",
  ink: "#1a1710",
  inkLight: "#4a4538",
  inkFaint: "#8a8272",
  inkGhost: "#b8b0a0",
  red: "#c0392b",
  redLight: "#e74c3c",
  redFaint: "#f5d0cc",
  blue: "#2c5282",
  blueFaint: "#bee3f8",
  green: "#276749",
  greenFaint: "#c6f6d5",
  stamp: "#c0392b",
  stampFade: "rgba(192,57,43,0.15)",
};

const dossierStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Special+Elite&family=Libre+Baskerville:wght@400;700&display=swap');

  .ds-page {
    min-height: 100vh;
    background: ${d.paperDark};
    color: ${d.ink};
    font-family: 'Courier Prime', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    padding: 0;
  }
  .ds-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background: ${d.ink};
    border-bottom: 4px solid ${d.red};
  }
  .ds-nav {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .ds-nav button {
    background: none;
    border: 1px solid #3a3628;
    color: #8a8272;
    padding: 4px 12px;
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .ds-nav button:hover {
    border-color: #6a6258;
    color: #c4b898;
  }
  .ds-nav button.active {
    background: ${d.red};
    border-color: ${d.red};
    color: #fff;
  }
  .ds-header-title {
    font-family: 'Special Elite', cursive;
    font-size: 14px;
    color: ${d.manilaEdge};
    letter-spacing: 3px;
    text-transform: uppercase;
  }
  .ds-header-right {
    font-size: 10px;
    color: #6a6258;
    text-align: right;
    letter-spacing: 1px;
  }
  .ds-summary-strip {
    display: flex;
    background: ${d.manila};
    border-bottom: 2px solid ${d.manilaEdge};
    padding: 0 24px;
  }
  .ds-summary-item {
    flex: 1;
    padding: 14px 16px;
    border-right: 1px solid ${d.manilaEdge};
    display: flex;
    flex-direction: column;
  }
  .ds-summary-item:last-child { border-right: none; }
  .ds-summary-val {
    font-family: 'Libre Baskerville', serif;
    font-size: 24px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .ds-summary-lbl {
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${d.inkFaint};
    margin-top: 2px;
  }
  .ds-body {
    max-width: 900px;
    margin: 24px auto;
    padding: 0 24px;
  }
  .ds-file {
    background: ${d.paper};
    border: 2px solid ${d.paperDarker};
    margin-bottom: 24px;
    position: relative;
    box-shadow: 2px 3px 8px rgba(0,0,0,0.08);
  }
  .ds-file-tab {
    position: absolute;
    top: -14px;
    left: 20px;
    background: ${d.manila};
    border: 1px solid ${d.manilaEdge};
    border-bottom: none;
    padding: 2px 16px;
    font-family: 'Special Elite', cursive;
    font-size: 12px;
    color: ${d.inkLight};
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .ds-file-header {
    padding: 20px 24px 12px;
    border-bottom: 1px solid ${d.paperDarker};
    position: relative;
  }
  .ds-file-stamp {
    position: absolute;
    top: 14px;
    right: 20px;
    font-family: 'Special Elite', cursive;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 3px;
    padding: 4px 12px;
    border: 3px solid;
    transform: rotate(-4deg);
    opacity: 0.8;
  }
  .ds-file-title {
    font-family: 'Libre Baskerville', serif;
    font-size: 20px;
    font-weight: 700;
    color: ${d.ink};
    margin-bottom: 4px;
    padding-right: 140px;
  }
  .ds-file-subtitle {
    font-size: 12px;
    color: ${d.inkFaint};
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  .ds-classification {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 2px 8px;
    margin-top: 8px;
  }
  .ds-file-body {
    padding: 16px 24px;
  }
  .ds-meta-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 12px;
  }
  .ds-meta-table td {
    padding: 4px 0;
    border-bottom: 1px dotted ${d.paperDarker};
    vertical-align: top;
  }
  .ds-meta-table td:first-child {
    color: ${d.inkFaint};
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 10px;
    width: 140px;
    padding-top: 6px;
  }
  .ds-meta-table td:last-child {
    color: ${d.ink};
    font-weight: 400;
  }
  .ds-progress-bar {
    height: 10px;
    background: ${d.paperDarker};
    position: relative;
    margin: 12px 0;
  }
  .ds-progress-fill {
    height: 100%;
    transition: width 0.5s ease;
  }
  .ds-progress-pct {
    position: absolute;
    right: 0;
    top: -16px;
    font-size: 11px;
    font-weight: 700;
    color: ${d.inkLight};
  }
  .ds-action-items {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid ${d.paperDarker};
  }
  .ds-action-title {
    font-family: 'Special Elite', cursive;
    font-size: 13px;
    color: ${d.inkFaint};
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .ds-action-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 0;
    font-size: 12px;
    border-bottom: 1px dotted ${d.paperDarker};
  }
  .ds-action-num {
    font-weight: 700;
    color: ${d.inkFaint};
    min-width: 24px;
    font-variant-numeric: tabular-nums;
  }
  .ds-action-name {
    flex: 1;
    color: ${d.ink};
  }
  .ds-action-name.struck {
    text-decoration: line-through;
    color: ${d.inkFaint};
  }
  .ds-action-status {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 1px 6px;
    border: 1px solid;
  }
  .ds-action-select {
    background: ${d.paper};
    border: 1px solid ${d.paperDarker};
    color: ${d.ink};
    font-family: 'Courier Prime', monospace;
    font-size: 10px;
    padding: 2px 4px;
    cursor: pointer;
  }
  .ds-notes-block {
    margin-top: 12px;
    padding: 10px 14px;
    background: ${d.stampFade};
    border-left: 3px solid ${d.red};
    font-size: 12px;
    color: ${d.inkLight};
    font-style: italic;
  }
  .ds-notes-label {
    font-style: normal;
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${d.red};
    margin-bottom: 4px;
  }
  .ds-file-footer {
    padding: 8px 24px;
    border-top: 1px solid ${d.paperDarker};
    font-size: 10px;
    color: ${d.inkGhost};
    display: flex;
    justify-content: space-between;
  }
  .ds-empty {
    text-align: center;
    padding: 64px 0;
  }
  .ds-empty-stamp {
    font-family: 'Special Elite', cursive;
    font-size: 28px;
    color: ${d.red};
    letter-spacing: 6px;
    text-transform: uppercase;
    border: 4px solid ${d.red};
    display: inline-block;
    padding: 12px 32px;
    transform: rotate(-2deg);
    opacity: 0.7;
  }
  .ds-empty-sub {
    margin-top: 16px;
    font-size: 13px;
    color: ${d.inkFaint};
  }
`;

export function ProjectsDossier({ embedded = false }: { embedded?: boolean } = {}) {
  const { user } = useUser();
  const myProjects = useQuery(api.projects.getMyProjects);
  const profile = useQuery(api.profiles.getCurrentProfile);
  const navigate = useNavigate();
  const projects = getProjectsWithMockData(myProjects);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const total = projects.length;
  const active = projects.filter((p) => p.status === "in_progress").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const pending = projects.filter((p) => p.approvalStatus === "pending").length;

  return (
    <>
      <style>{dossierStyle}</style>
      <div className="ds-page">
        {!embedded && (
          <div className="ds-topbar">
            <div className="ds-nav">
              <button onClick={() => navigate("/")}>&#8592; MAIN</button>
              <button onClick={() => setCreateOpen(true)}>+ NEW FILE</button>
              {PROJECT_VARIANT_LINKS.map((link) => (
                <button
                  key={link.path}
                  className={link.path === "/2" ? "active" : ""}
                  onClick={() => navigate(link.path)}
                >{link.label}</button>
              ))}
            </div>
            <span className="ds-header-title">Project Dossier</span>
            <span className="ds-header-right">
              AGENT: {user?.firstName?.toUpperCase() || "UNIDENTIFIED"}<br />
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}
            </span>
          </div>
        )}

        {/* SUMMARY STRIP */}
        <div className="ds-summary-strip">
          <div className="ds-summary-item">
            <div className="ds-summary-val" style={{ color: d.ink }}>{total}</div>
            <div className="ds-summary-lbl">Files on Record</div>
          </div>
          <div className="ds-summary-item">
            <div className="ds-summary-val" style={{ color: d.blue }}>{active}</div>
            <div className="ds-summary-lbl">Active Cases</div>
          </div>
          <div className="ds-summary-item">
            <div className="ds-summary-val" style={{ color: d.green }}>{completed}</div>
            <div className="ds-summary-lbl">Closed</div>
          </div>
          <div className="ds-summary-item">
            <div className="ds-summary-val" style={{ color: d.red }}>{pending}</div>
            <div className="ds-summary-lbl">Pending Review</div>
          </div>
        </div>

        {/* FILES */}
        <div className="ds-body">
          {projects.map((project: any, idx: number) => (
            <DossierFile
              key={project._id}
              project={project}
              idx={idx}
              userType={profile?.userType || "client"}
              onOpen={() => setSelectedProject(project)}
            />
          ))}

          {projects.length === 0 && (
            <div className="ds-empty">
              <div className="ds-empty-stamp">FILE ROOM EMPTY</div>
              <div className="ds-empty-sub">No project dossiers on file. All records cleared.</div>
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
    </>
  );
}

function DossierFile({
  project,
  idx,
  userType,
  onOpen,
}: {
  project: any;
  idx: number;
  userType: string;
  onOpen: () => void;
}) {
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);

  const doneTasks = project.projectTasks.filter((t: any) =>
    (typeof t === "string" ? "queued" : t.status) === "done"
  ).length;
  const totalTasks = project.projectTasks.length;
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", {
    year: "numeric", month: "2-digit", day: "2-digit"
  });

  const stampStyle = (() => {
    switch (project.status) {
      case "planned": return { color: d.blue, borderColor: d.blue, text: "PLANNED" };
      case "in_progress": return { color: "#b45309", borderColor: "#b45309", text: "IN PROGRESS" };
      case "completed": return { color: d.green, borderColor: d.green, text: "COMPLETED" };
      case "cancelled": return { color: d.red, borderColor: d.red, text: "CANCELLED" };
      default: return { color: d.inkFaint, borderColor: d.inkFaint, text: project.status };
    }
  })();

  const classificationStyle = (() => {
    switch (project.approvalStatus) {
      case "pending": return { bg: "#fef3c7", color: "#92400e", text: "PENDING APPROVAL" };
      case "approved": return { bg: d.greenFaint, color: d.green, text: "APPROVED" };
      case "rejected": return { bg: d.redFaint, color: d.red, text: "REJECTED" };
      default: return { bg: d.paperDarker, color: d.inkFaint, text: project.approvalStatus };
    }
  })();

  const progressColor = pct === 100 ? d.green : pct > 50 ? d.blue : "#b45309";

  const handleTaskChange = async (taskIndex: number, newStatus: string) => {
    try {
      await updateTaskStatus({ projectId: project._id, taskIndex, status: newStatus as any });
      toast.success("Action item updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const actionStatusStyle = (status: string) => {
    switch (status) {
      case "done": return { color: d.green, borderColor: d.green };
      case "in_progress": return { color: "#b45309", borderColor: "#b45309" };
      default: return { color: d.inkFaint, borderColor: d.paperDarker };
    }
  };

  return (
    <div className="ds-file" onClick={onOpen} style={{ cursor: "pointer" }}>
      <div className="ds-file-tab">FILE {String(idx + 1).padStart(3, "0")}</div>

      <div className="ds-file-header">
        <div className="ds-file-stamp" style={{
          color: stampStyle.color,
          borderColor: stampStyle.borderColor,
        }}>
          {stampStyle.text}
        </div>
        <div className="ds-file-title">{project.projectName}</div>
        <div className="ds-file-subtitle">{project.projectType}</div>
        <div className="ds-classification" style={{
          background: classificationStyle.bg,
          color: classificationStyle.color,
        }}>
          {classificationStyle.text}
        </div>
      </div>

      <div className="ds-file-body">
        <table className="ds-meta-table">
          <tbody>
            <tr>
              <td>Duration</td>
              <td>{project.estimatedLength} days</td>
            </tr>
            <tr>
              <td>Start Date</td>
              <td>{fmtDate(project.estimatedStartDateTime)}</td>
            </tr>
            <tr>
              <td>End Date</td>
              <td>{fmtDate(project.estimatedEndDateTime)}</td>
            </tr>
            {project.actualStartDateTime && (
              <tr>
                <td>Actual Start</td>
                <td>{fmtDate(project.actualStartDateTime)}</td>
              </tr>
            )}
            <tr>
              <td>Completion</td>
              <td>{doneTasks} of {totalTasks} items ({pct}%)</td>
            </tr>
          </tbody>
        </table>

        {/* Progress */}
        <div className="ds-progress-bar">
          <span className="ds-progress-pct">{pct}%</span>
          <div className="ds-progress-fill" style={{
            width: `${pct}%`,
            background: progressColor,
          }} />
        </div>

        {/* Action Items */}
        {totalTasks > 0 && (
          <div className="ds-action-items">
            <div className="ds-action-title">Action Items</div>
            {project.projectTasks.map((task: any, i: number) => {
              const name = typeof task === "string" ? task : task.name;
              const status = typeof task === "string" ? "queued" : task.status;
              const sStyle = actionStatusStyle(status);

              return (
                <div key={i} className="ds-action-item">
                  <span className="ds-action-num">{String(i + 1).padStart(2, "0")}.</span>
                  <span className={`ds-action-name ${status === "done" ? "struck" : ""}`}>{name}</span>
                  <span className="ds-action-status" style={sStyle}>
                    {status.replace("_", " ")}
                  </span>
                  {(userType === "business" || userType === "employee") && (
                    <select
                      value={status}
                      onChange={(e) => handleTaskChange(i, e.target.value)}
                      className="ds-action-select"
                    >
                      <option value="queued">Queued</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Notes */}
        {project.notes && (
          <div className="ds-notes-block">
            <div className="ds-notes-label">Addendum</div>
            {project.notes}
          </div>
        )}
      </div>

      <div className="ds-file-footer">
        <span>REF: PRJ-{String(idx + 1).padStart(4, "0")}</span>
        <span>FILED: {fmtDate(project._creationTime || Date.now())}</span>
      </div>
    </div>
  );
}
