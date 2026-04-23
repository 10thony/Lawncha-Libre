import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import {
  PROJECT_VARIANT_LINKS,
  TASK_STATUS_OPTIONS,
  canManageTasks,
  compactIdentifier,
  formatShortDate,
  getProjectsWithMockData,
  getProjectProgress,
  getStatusLabel,
  getTaskName,
  getTaskStatus,
} from "./projects-variant-utils";
import { ProjectCrudOverlay } from "./project-crud-overlay";

const brutalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

  .brutal-page {
    min-height: 100vh;
    background: #f3efe3;
    color: #101010;
    font-family: 'IBM Plex Sans', sans-serif;
    background-image:
      linear-gradient(rgba(16, 16, 16, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(16, 16, 16, 0.03) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .brutal-shell {
    max-width: 1440px;
    margin: 0 auto;
    padding: 18px 18px 28px;
  }
  .brutal-bar,
  .brutal-hero,
  .brutal-stat,
  .brutal-card {
    border: 3px solid #101010;
    box-shadow: 10px 10px 0 #101010;
  }
  .brutal-bar {
    padding: 16px 18px;
    background: #f8f4ea;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }
  .brutal-kicker {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.26em;
    font-weight: 700;
  }
  .brutal-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }
  .brutal-nav button {
    border: 3px solid #101010;
    background: #fff;
    color: #101010;
    padding: 8px 11px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
  .brutal-nav button.active {
    background: #101010;
    color: #fff;
  }
  .brutal-hero {
    margin-top: 18px;
    padding: 22px;
    background: linear-gradient(135deg, #ffd400 0%, #ff8e3c 100%);
    position: relative;
    overflow: hidden;
  }
  .brutal-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        135deg,
        transparent 0 18px,
        rgba(16, 16, 16, 0.08) 18px 19px
      );
    pointer-events: none;
  }
  .brutal-title {
    margin: 14px 0 0;
    font-family: 'Archivo Black', sans-serif;
    font-size: clamp(2.6rem, 6vw, 5.5rem);
    line-height: 0.9;
    text-transform: uppercase;
    letter-spacing: -0.04em;
    max-width: 14ch;
  }
  .brutal-copy {
    max-width: 54rem;
    font-size: 1.02rem;
    line-height: 1.6;
    margin-top: 18px;
    position: relative;
    z-index: 1;
  }
  .brutal-stat-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
  }
  .brutal-stat {
    padding: 18px;
  }
  .brutal-stat:nth-child(1) { background: #00c2a8; }
  .brutal-stat:nth-child(2) { background: #f8f4ea; }
  .brutal-stat:nth-child(3) { background: #ff8fb1; }
  .brutal-stat:nth-child(4) { background: #8ec5ff; }
  .brutal-stat small {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-bottom: 8px;
    font-weight: 700;
  }
  .brutal-stat strong {
    display: block;
    font-family: 'Archivo Black', sans-serif;
    font-size: 2.4rem;
    line-height: 1;
  }
  .brutal-stat span {
    display: block;
    margin-top: 10px;
    line-height: 1.5;
  }
  .brutal-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 18px;
  }
  .brutal-card {
    padding: 20px;
    display: grid;
    gap: 18px;
    background: #fff;
    align-content: start;
  }
  .brutal-card:nth-child(4n + 1) { background: #fff7db; }
  .brutal-card:nth-child(4n + 2) { background: #dffbf6; }
  .brutal-card:nth-child(4n + 3) { background: #ffe3ec; }
  .brutal-card:nth-child(4n + 4) { background: #e1efff; }
  .brutal-card-top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 14px;
    align-items: start;
  }
  .brutal-card-copy {
    min-width: 0;
  }
  .brutal-card small {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .brutal-card h2 {
    margin: 0;
    font-family: 'Archivo Black', sans-serif;
    font-size: 1.65rem;
    line-height: 0.95;
    text-transform: uppercase;
    word-break: break-word;
  }
  .brutal-card p {
    margin: 8px 0 0;
    line-height: 1.5;
  }
  .brutal-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    max-width: 168px;
  }
  .brutal-tag {
    border: 3px solid #101010;
    padding: 6px 9px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
    background: #fff;
    box-shadow: 4px 4px 0 #101010;
  }
  .brutal-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 14px;
    padding: 14px;
    border: 3px solid #101010;
    background: rgba(255, 255, 255, 0.68);
  }
  .brutal-meta span {
    display: block;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-bottom: 5px;
    font-weight: 700;
  }
  .brutal-meta strong {
    display: block;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.96rem;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  .brutal-meta code {
    display: inline-block;
    max-width: 100%;
    font-size: 0.84rem;
    line-height: 1.35;
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 700;
    overflow-wrap: anywhere;
  }
  .brutal-track {
    border: 3px solid #101010;
    background: #f8f4ea;
    padding: 12px;
  }
  .brutal-track-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  .brutal-track strong {
    display: block;
    font-family: 'Archivo Black', sans-serif;
    font-size: 1.15rem;
    text-transform: uppercase;
  }
  .brutal-track-meta {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .brutal-barline {
    height: 16px;
    border: 3px solid #101010;
    margin-top: 10px;
    background: #fff;
  }
  .brutal-barline i {
    display: block;
    height: 100%;
    background: #101010;
  }
  .brutal-task-list {
    display: grid;
    gap: 12px;
  }
  .brutal-task {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    border: 3px solid #101010;
    background: rgba(255, 255, 255, 0.68);
    padding: 12px;
  }
  .brutal-task-copy {
    min-width: 0;
  }
  .brutal-task strong {
    display: block;
    text-transform: uppercase;
    line-height: 1.35;
    word-break: break-word;
  }
  .brutal-task span {
    display: block;
    margin-top: 5px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
  }
  .brutal-task select {
    min-width: 140px;
    width: 100%;
    max-width: 160px;
    border: 3px solid #101010;
    background: #fff;
    color: #101010;
    font: inherit;
    padding: 8px 10px;
  }
  .brutal-task-more {
    border: 3px dashed #101010;
    background: rgba(255, 255, 255, 0.4);
    padding: 12px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 700;
  }
  .brutal-empty {
    margin-top: 18px;
    border: 3px dashed #101010;
    background: #fff;
    padding: 80px 20px;
    text-align: center;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }
  @media (max-width: 980px) {
    .brutal-stat-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .brutal-card-top {
      grid-template-columns: 1fr;
    }
    .brutal-tags {
      max-width: none;
      justify-content: flex-start;
    }
  }
  @media (max-width: 720px) {
    .brutal-shell {
      padding: 12px;
    }
    .brutal-bar {
      align-items: flex-start;
    }
    .brutal-nav {
      justify-content: flex-start;
    }
    .brutal-stat-grid,
    .brutal-meta,
    .brutal-task {
      grid-template-columns: 1fr;
    }
    .brutal-stat-grid {
      gap: 14px;
    }
    .brutal-task select {
      max-width: none;
    }
  }
`;

const labelTone: Record<string, string> = {
  planned: "#8ec5ff",
  in_progress: "#ffd400",
  completed: "#00c2a8",
  cancelled: "#ff8fb1",
  pending: "#ffd400",
  approved: "#00c2a8",
  rejected: "#ff8fb1",
};

export function ProjectsBrutalist({ embedded = false }: { embedded?: boolean } = {}) {
  const navigate = useNavigate();
  const myProjects = useQuery(api.projects.getMyProjects);
  const profile = useQuery(api.profiles.getCurrentProfile);
  const projects = getProjectsWithMockData(myProjects);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const total = projects.length;
  const live = projects.filter((project) => project.status === "in_progress").length;
  const totalTasks =
    projects.reduce((sum, project) => sum + project.projectTasks.length, 0);
  const finishedTasks =
    projects.reduce((sum, project) => sum + getProjectProgress(project).done, 0);

  return (
    <div className="brutal-page">
      <style>{brutalCss}</style>
      <div className="brutal-shell">
        {!embedded && (
          <div className="brutal-bar">
            <div>
              <div className="brutal-kicker">Variant 09</div>
              <div style={{ marginTop: 6 }}>Raw structure, loud hierarchy, no polite dashboard chrome.</div>
            </div>
            <div className="brutal-nav">
              <button onClick={() => navigate("/")}>Home</button>
              <button onClick={() => setCreateOpen(true)}>NEW JOB</button>
              {PROJECT_VARIANT_LINKS.map((link) => (
                <button
                  key={link.path}
                  className={link.path === "/9" ? "active" : ""}
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <section className="brutal-hero">
          <div className="brutal-kicker">Brutalist PM</div>
          <h1 className="brutal-title">Projects should punch harder than generic SaaS cards.</h1>
          <p className="brutal-copy">
            This version trades polish for urgency. Heavy outlines, blunt status blocks, and
            compressed uppercase type make each project feel immediate and physical, like a wall of
            printed production notices pinned up in a shop.
          </p>
        </section>

        <section className="brutal-stat-grid">
          {[
            { label: "Projects", value: total, meta: "Total records on the wall." },
            { label: "Live Jobs", value: live, meta: "Projects actively moving." },
            { label: "Task Count", value: totalTasks, meta: "Every open line item in scope." },
            { label: "Done Tasks", value: finishedTasks, meta: "Work already knocked out." },
          ].map((item) => (
            <div key={item.label} className="brutal-stat">
              <small>{item.label}</small>
              <strong>{item.value}</strong>
              <span>{item.meta}</span>
            </div>
          ))}
        </section>

        {projects.length > 0 ? (
          <section className="brutal-grid">
            {projects.map((project) => (
              <BrutalistProjectCard key={project._id} project={project} onOpen={() => setSelectedProject(project)} />
            ))}
          </section>
        ) : (
          <div className="brutal-empty">No projects on the wall.</div>
        )}
        <ProjectCrudOverlay
          mode="create"
          open={createOpen}
          userType={profile?.userType}
          onClose={() => setCreateOpen(false)}
        />
        <ProjectCrudOverlay
          mode="details"
          open={Boolean(selectedProject)}
          project={selectedProject || undefined}
          userType={profile?.userType}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </div>
  );
}

function BrutalistProjectCard({ project, onOpen }: { project: any; onOpen: () => void }) {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);
  const progress = getProjectProgress(project);
  const editable = canManageTasks(profile?.userType);
  const visibleTasks = project.projectTasks.slice(0, 5);
  const hiddenTaskCount = Math.max(project.projectTasks.length - visibleTasks.length, 0);

  const handleStatusChange = async (taskIndex: number, status: string) => {
    try {
      await updateTaskStatus({ projectId: project._id, taskIndex, status: status as any });
      toast.success("Task status updated.");
    } catch {
      toast.error("Unable to update task status.");
    }
  };

  return (
    <article className="brutal-card" onClick={onOpen} style={{ cursor: "pointer" }}>
      <div className="brutal-card-top">
        <div className="brutal-card-copy">
          <small>Work order</small>
          <h2>{project.projectName}</h2>
          <p>{project.projectType}</p>
        </div>
        <div className="brutal-tags">
          <span className="brutal-tag" style={{ background: labelTone[project.status] || "#fff" }}>
            {getStatusLabel(project.status)}
          </span>
          {project.approvalStatus ? (
            <span
              className="brutal-tag"
              style={{ background: labelTone[project.approvalStatus] || "#fff" }}
            >
              {getStatusLabel(project.approvalStatus)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="brutal-meta">
        <div>
          <span>Start</span>
          <strong>{formatShortDate(project.estimatedStartDateTime)}</strong>
        </div>
        <div>
          <span>Finish</span>
          <strong>{formatShortDate(project.estimatedEndDateTime)}</strong>
        </div>
        <div>
          <span>Client</span>
          <code title={project.clientClerkId || "Historical project"}>
            {compactIdentifier(project.clientClerkId, "Historical project")}
          </code>
        </div>
        <div>
          <span>Owner</span>
          <code title={project.businessOwnerClerkId}>
            {compactIdentifier(project.businessOwnerClerkId)}
          </code>
        </div>
      </div>

      <div className="brutal-track">
        <div className="brutal-track-head">
          <strong>{progress.percent}% complete</strong>
          <div className="brutal-track-meta">{project.estimatedLength} day run</div>
        </div>
        <div className="brutal-barline">
          <i style={{ width: `${progress.percent}%` }} />
        </div>
        <div style={{ marginTop: 10, textTransform: "uppercase", fontWeight: 700, fontSize: 12 }}>
          {progress.done} done / {progress.inProgress} moving / {progress.queued} queued
        </div>
      </div>

      <div className="brutal-task-list">
        {project.projectTasks.length > 0 ? (
          visibleTasks.map((task: any, index: number) => (
            <div key={`${project._id}-${index}`} className="brutal-task">
              <div className="brutal-task-copy">
                <strong>{getTaskName(task)}</strong>
                <span>{getStatusLabel(getTaskStatus(task))}</span>
              </div>
              {editable ? (
                <select
                  aria-label={`Update status for ${getTaskName(task)}`}
                  value={getTaskStatus(task)}
                  onChange={(event) => handleStatusChange(index, event.target.value)}
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
          <div className="brutal-task">
            <div>
              <strong>No tasks yet</strong>
              <span>Scope missing</span>
            </div>
          </div>
        )}
        {hiddenTaskCount > 0 ? (
          <div className="brutal-task-more">+ {hiddenTaskCount} more line items off poster</div>
        ) : null}
      </div>
    </article>
  );
}
