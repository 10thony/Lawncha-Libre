import { useState } from "react";
import { useUser } from "@clerk/react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import {
  PROJECT_VARIANT_LINKS,
  TASK_STATUS_OPTIONS,
  canManageTasks,
  formatShortDate,
  getProjectsWithMockData,
  getProjectProgress,
  getStatusLabel,
  getTaskName,
  getTaskStatus,
} from "./projects-variant-utils";
import { ProjectCrudOverlay } from "./project-crud-overlay";

const transitCss = `
  @import url('https://fonts.googleapis.com/css2?family=Chivo:wght@400;500;700;800&family=Chivo+Mono:wght@400;500;700&display=swap');

  .transit-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #0e1518 0%, #121f24 100%);
    color: #f3e8c6;
    font-family: 'Chivo', sans-serif;
  }
  .transit-shell {
    max-width: 1440px;
    margin: 0 auto;
    padding: 22px;
  }
  .transit-topbar,
  .transit-hero,
  .transit-board,
  .transit-row,
  .transit-detail {
    border: 1px solid #39484c;
    background: #172126;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  .transit-topbar {
    border-radius: 24px;
    padding: 14px 18px;
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: center;
  }
  .transit-mark {
    font-family: 'Chivo Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.24em;
    color: #e6b64b;
    font-weight: 700;
  }
  .transit-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }
  .transit-nav button {
    border: 1px solid #4a5e63;
    background: #121b1f;
    color: #d5caab;
    padding: 7px 12px;
    border-radius: 999px;
    font: inherit;
    cursor: pointer;
  }
  .transit-nav button.active {
    background: #e6b64b;
    color: #101517;
    border-color: #e6b64b;
    font-weight: 700;
  }
  .transit-hero {
    margin-top: 18px;
    border-radius: 28px;
    padding: 22px;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.7fr);
    gap: 20px;
  }
  .transit-title {
    margin: 12px 0 0;
    font-size: clamp(2.6rem, 5vw, 4.6rem);
    line-height: 0.95;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: -0.04em;
  }
  .transit-copy {
    max-width: 50rem;
    margin-top: 16px;
    line-height: 1.7;
    color: #b6b79f;
  }
  .transit-clock {
    border-radius: 22px;
    border: 1px solid #39484c;
    background: #121b1f;
    padding: 20px;
    display: grid;
    align-content: center;
    gap: 8px;
  }
  .transit-clock strong {
    font-family: 'Chivo Mono', monospace;
    font-size: clamp(2rem, 5vw, 3rem);
    color: #e6b64b;
  }
  .transit-clock span {
    color: #b6b79f;
  }
  .transit-board {
    margin-top: 18px;
    border-radius: 28px;
    overflow: hidden;
  }
  .transit-head,
  .transit-row summary {
    display: grid;
    grid-template-columns: 110px 1.4fr 1fr 0.8fr 0.8fr 1fr;
    gap: 0;
    align-items: stretch;
  }
  .transit-head {
    background: #11181c;
    font-family: 'Chivo Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #8d998e;
  }
  .transit-head div,
  .transit-row summary > div {
    padding: 16px 18px;
    border-right: 1px solid #39484c;
  }
  .transit-head div:last-child,
  .transit-row summary > div:last-child {
    border-right: none;
  }
  .transit-row {
    border-top: 1px solid #2a363a;
  }
  .transit-row summary {
    list-style: none;
    cursor: pointer;
    background:
      linear-gradient(180deg, #182329 0%, #141d22 100%);
    font-family: 'Chivo Mono', monospace;
  }
  .transit-row summary::-webkit-details-marker {
    display: none;
  }
  .transit-platform {
    color: #e6b64b;
    font-weight: 700;
  }
  .transit-destination strong {
    display: block;
    font-family: 'Chivo', sans-serif;
    font-size: 1rem;
    color: #f3e8c6;
  }
  .transit-destination span,
  .transit-dim {
    color: #9daa95;
    line-height: 1.5;
  }
  .transit-led {
    display: inline-flex;
    padding: 6px 8px;
    border-radius: 8px;
    background: #0f1417;
    border: 1px solid currentColor;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.08em;
    font-weight: 700;
  }
  .transit-detail {
    padding: 18px;
    background: #121b1f;
  }
  .transit-detail-grid {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 16px;
  }
  .transit-card {
    border: 1px solid #39484c;
    background: #172126;
    padding: 16px;
  }
  .transit-card small {
    display: block;
    font-family: 'Chivo Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #8d998e;
    margin-bottom: 10px;
  }
  .transit-progress {
    height: 10px;
    border-radius: 999px;
    background: #0f1417;
    overflow: hidden;
    border: 1px solid #39484c;
  }
  .transit-progress i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #7ad7e0 0%, #e6b64b 100%);
  }
  .transit-task-list {
    display: grid;
    gap: 10px;
  }
  .transit-task {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 12px 14px;
    border: 1px solid #39484c;
    background: #172126;
  }
  .transit-task strong {
    display: block;
    color: #f3e8c6;
  }
  .transit-task span {
    display: block;
    color: #9daa95;
    margin-top: 4px;
    font-family: 'Chivo Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
  }
  .transit-task select {
    min-width: 145px;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid #4a5e63;
    background: #101517;
    color: #f3e8c6;
    font: inherit;
  }
  .transit-empty {
    margin-top: 18px;
    padding: 82px 20px;
    text-align: center;
    border-radius: 28px;
    border: 1px dashed #4a5e63;
    color: #b6b79f;
    background: rgba(23, 33, 38, 0.65);
  }
  @media (max-width: 1040px) {
    .transit-hero,
    .transit-head,
    .transit-row summary,
    .transit-detail-grid {
      grid-template-columns: 1fr;
    }
    .transit-head {
      display: none;
    }
    .transit-row summary > div {
      border-right: none;
      border-bottom: 1px solid #263137;
    }
  }
  @media (max-width: 720px) {
    .transit-shell {
      padding: 14px;
    }
    .transit-task {
      grid-template-columns: 1fr;
    }
  }
`;

const ledTone: Record<string, string> = {
  planned: "#7ad7e0",
  in_progress: "#e6b64b",
  completed: "#74d099",
  cancelled: "#f28b82",
  pending: "#e6b64b",
  approved: "#74d099",
  rejected: "#f28b82",
};

export function ProjectsTransit({ embedded = false }: { embedded?: boolean } = {}) {
  const { user } = useUser();
  const navigate = useNavigate();
  const myProjects = useQuery(api.projects.getMyProjects);
  const profile = useQuery(api.profiles.getCurrentProfile);
  const projects = getProjectsWithMockData(myProjects);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const now = new Date();
  const boardClock = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const active = projects.filter((project) => project.status === "in_progress").length;
  const total = projects.length;

  return (
    <div className="transit-page">
      <style>{transitCss}</style>
      <div className="transit-shell">
        {!embedded && (
          <div className="transit-topbar">
            <div>
              <div className="transit-mark">Variant 10</div>
              <div style={{ marginTop: 6, color: "#b6b79f" }}>
                Arrival-board scheduling for teams who live by sequence and timing.
              </div>
            </div>
            <div className="transit-nav">
              <button onClick={() => navigate("/")}>Home</button>
              <button onClick={() => setCreateOpen(true)}>Add Departure</button>
              {PROJECT_VARIANT_LINKS.map((link) => (
                <button
                  key={link.path}
                  className={link.path === "/10" ? "active" : ""}
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <section className="transit-hero">
          <div>
            <div className="transit-mark">Dispatch Board</div>
            <h1 className="transit-title">Projects listed like departures through the day.</h1>
            <p className="transit-copy">
              This direction reframes the work as sequencing and movement. It is built for teams who
              care less about cards and more about what is due next, what platform a task is on, and
              whether the job is on time.
            </p>
          </div>
          <aside className="transit-clock">
            <div className="transit-mark">Board time</div>
            <strong>{boardClock}</strong>
            <span>{user?.firstName || "Dispatcher"} monitoring {active} live projects across {total} routes.</span>
          </aside>
        </section>

        {projects.length > 0 ? (
          <section className="transit-board">
            <div className="transit-head">
              <div>Platform</div>
              <div>Destination</div>
              <div>Service</div>
              <div>Status</div>
              <div>ETA</div>
              <div>Manifest</div>
            </div>
            {projects.map((project, index) => (
              <TransitProjectRow
                key={project._id}
                project={project}
                index={index}
                onOpen={() => setSelectedProject(project)}
              />
            ))}
          </section>
        ) : (
          <div className="transit-empty">No departures scheduled. Add a project to light up the board.</div>
        )}
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
    </div>
  );
}

function TransitProjectRow({ project, index, onOpen }: { project: any; index: number; onOpen: () => void }) {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);
  const progress = getProjectProgress(project);
  const editable = canManageTasks(profile?.userType);

  const handleStatusChange = async (taskIndex: number, status: string) => {
    try {
      await updateTaskStatus({ projectId: project._id, taskIndex, status: status as any });
      toast.success("Task status updated.");
    } catch {
      toast.error("Unable to update task status.");
    }
  };

  return (
    <details className="transit-row">
      <summary>
        <div className="transit-platform">PF-{String(index + 1).padStart(2, "0")}</div>
        <div className="transit-destination">
          <strong>{project.projectName}</strong>
          <span>{project.clientClerkId || "Historical route"}</span>
        </div>
        <div className="transit-dim">{project.projectType}</div>
        <div>
          <span className="transit-led" style={{ color: ledTone[project.status] || "#e6b64b" }}>
            {getStatusLabel(project.status)}
          </span>
          {project.approvalStatus ? (
            <div style={{ marginTop: 8 }}>
              <span
                className="transit-led"
                style={{ color: ledTone[project.approvalStatus] || "#e6b64b" }}
              >
                {getStatusLabel(project.approvalStatus)}
              </span>
            </div>
          ) : null}
        </div>
        <div className="transit-dim">{formatShortDate(project.estimatedEndDateTime)}</div>
        <div className="transit-dim">
          {progress.done}/{progress.total} cleared
        </div>
      </summary>

      <div className="transit-detail">
        <div style={{ marginBottom: 12 }}>
          <button onClick={onOpen}>Open full details</button>
        </div>
        <div className="transit-detail-grid">
          <div className="transit-card">
            <small>Route summary</small>
            <div>Owner: {project.businessOwnerClerkId}</div>
            <div>Start: {formatShortDate(project.estimatedStartDateTime)}</div>
            <div>Duration: {project.estimatedLength} days</div>
            <div style={{ marginTop: 14 }}>{progress.percent}% complete</div>
            <div className="transit-progress" style={{ marginTop: 8 }}>
              <i style={{ width: `${progress.percent}%` }} />
            </div>
          </div>

          <div className="transit-task-list">
            {project.projectTasks.length > 0 ? (
              project.projectTasks.map((task: any, taskIndex: number) => (
                <div className="transit-task" key={`${project._id}-${taskIndex}`}>
                  <div>
                    <strong>{getTaskName(task)}</strong>
                    <span>{getStatusLabel(getTaskStatus(task))}</span>
                  </div>
                  {editable ? (
                    <select
                      aria-label={`Update status for ${getTaskName(task)}`}
                      value={getTaskStatus(task)}
                      onChange={(event) => handleStatusChange(taskIndex, event.target.value)}
                    >
                      {TASK_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="transit-task">
                <div>
                  <strong>No manifest loaded</strong>
                  <span>Waiting for tasks</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}
