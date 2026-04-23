import { useUser } from "@clerk/react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import {
  PROJECT_VARIANT_LINKS,
  TASK_STATUS_OPTIONS,
  canManageTasks,
  formatLongDate,
  getProjectProgress,
  getStatusLabel,
  getTaskName,
  getTaskStatus,
} from "./projects-variant-utils";

const studioCss = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500;600;700&display=swap');

  .studio-page {
    min-height: 100vh;
    background: #f6f2eb;
    color: #1a1715;
    font-family: 'Inter Tight', -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    background-image: linear-gradient(to right, rgba(92,29,31,0.06) 1px, transparent 1px);
    background-size: calc(100% / 12) 100%;
  }
  .studio-shell { max-width: 1360px; margin: 0 auto; padding: 40px 64px 96px; }

  .studio-topbar {
    display: flex; justify-content: space-between; align-items: flex-end;
    padding-bottom: 24px; border-bottom: 1px solid #1a1715;
  }
  .studio-wordmark {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 44px; font-weight: 400; letter-spacing: -0.01em;
    color: #5c1d1f; font-style: italic; line-height: 1;
  }
  .studio-wordmark::after {
    content: ''; display: inline-block; width: 8px; height: 8px;
    background: #5c1d1f; border-radius: 50%;
    margin-left: 6px; vertical-align: 6px;
  }
  .studio-nav { display: flex; gap: 0; align-items: center; }
  .studio-nav button {
    background: none; border: none; color: #6b635c;
    font: inherit; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
    padding: 8px 14px; cursor: pointer; border-left: 1px solid #d8cfc2;
    transition: color 0.18s;
  }
  .studio-nav button:first-child { border-left: none; }
  .studio-nav button:hover { color: #1a1715; }
  .studio-nav button.active { color: #5c1d1f; }
  .studio-nav button.active::before {
    content: '●'; margin-right: 6px; font-size: 7px; vertical-align: 3px;
  }

  .studio-masthead {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 40px;
    align-items: end;
    padding: 72px 0 48px;
    border-bottom: 1px solid #1a1715;
  }
  .studio-issue-label {
    font-size: 10px; letter-spacing: 0.38em; text-transform: uppercase;
    color: #5c1d1f; margin-bottom: 20px;
    font-weight: 600;
  }
  .studio-masthead-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: clamp(64px, 9vw, 128px);
    line-height: 0.88;
    font-weight: 400;
    letter-spacing: -0.03em;
    color: #1a1715;
    margin: 0;
  }
  .studio-masthead-title em {
    font-style: italic; color: #5c1d1f;
  }
  .studio-deck {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic; font-size: 20px; color: #6b635c;
    max-width: 360px; line-height: 1.4;
    padding-bottom: 8px;
  }

  .studio-index-strip {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
    margin-top: 0;
    border-bottom: 1px solid #1a1715;
  }
  .studio-index-cell {
    padding: 28px 24px 24px;
    border-right: 1px solid #d8cfc2;
  }
  .studio-index-cell:last-child { border-right: none; }
  .studio-index-num {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 56px; font-weight: 400; line-height: 1;
    color: #1a1715; letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums lining-nums;
  }
  .studio-index-num.accent { color: #5c1d1f; font-style: italic; }
  .studio-index-label {
    font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
    color: #6b635c; margin-top: 8px;
  }

  .studio-works-header {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 56px 0 20px;
    border-bottom: 1px solid #d8cfc2;
  }
  .studio-works-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 32px; font-style: italic; color: #1a1715;
  }
  .studio-works-count {
    font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase; color: #6b635c;
  }

  .studio-works-list { display: flex; flex-direction: column; }

  .studio-work {
    display: grid;
    grid-template-columns: 100px 1fr 340px;
    gap: 48px;
    padding: 44px 0;
    border-bottom: 1px solid #d8cfc2;
    position: relative;
  }
  .studio-work:hover { background: rgba(92,29,31,0.02); }

  .studio-work-index {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 52px; line-height: 1; color: #c7b9ab;
    font-variant-numeric: tabular-nums lining-nums;
    padding-top: 4px;
  }

  .studio-work-main { min-width: 0; }
  .studio-work-eyebrow {
    font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
    color: #5c1d1f; margin-bottom: 12px;
  }
  .studio-work-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 42px; line-height: 1.02; font-weight: 400;
    letter-spacing: -0.015em; color: #1a1715;
    margin-bottom: 10px;
  }
  .studio-work-sub {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic; font-size: 17px; color: #6b635c;
    margin-bottom: 24px;
  }
  .studio-work-meta {
    display: grid; grid-template-columns: repeat(3, auto); gap: 0 36px;
    padding: 16px 0 20px;
    border-top: 1px solid #e8dfd1;
    border-bottom: 1px solid #e8dfd1;
  }
  .studio-meta-cell {}
  .studio-meta-label {
    font-size: 9px; letter-spacing: 0.34em; text-transform: uppercase;
    color: #9a8f83; margin-bottom: 4px;
  }
  .studio-meta-val {
    font-size: 13px; color: #1a1715;
    font-variant-numeric: tabular-nums;
  }

  .studio-progress {
    margin-top: 22px;
    display: flex; align-items: center; gap: 18px;
  }
  .studio-progress-track {
    flex: 1; height: 1px; background: #1a1715; position: relative;
  }
  .studio-progress-fill {
    position: absolute; left: 0; top: -1px; height: 3px; background: #5c1d1f;
    transition: width 0.6s ease;
  }
  .studio-progress-count {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 22px; font-style: italic; color: #1a1715;
    font-variant-numeric: tabular-nums lining-nums;
  }
  .studio-progress-count span {
    color: #9a8f83; font-style: normal; font-family: 'Inter Tight', sans-serif;
    font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase;
    margin-left: 8px;
  }

  .studio-catalog {
    margin-top: 26px;
    padding-top: 18px;
    border-top: 1px solid #e8dfd1;
  }
  .studio-catalog-title {
    font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
    color: #5c1d1f; margin-bottom: 10px;
  }
  .studio-catalog-row {
    display: grid;
    grid-template-columns: 36px 1fr auto auto;
    gap: 16px; align-items: baseline;
    padding: 10px 0;
    border-bottom: 1px dotted #c7b9ab;
  }
  .studio-catalog-row:last-child { border-bottom: none; }
  .studio-catalog-num {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 16px; font-style: italic; color: #9a8f83;
    font-variant-numeric: tabular-nums lining-nums;
  }
  .studio-catalog-name {
    font-size: 14px; color: #1a1715;
  }
  .studio-catalog-name.done {
    color: #9a8f83;
    text-decoration: line-through;
    text-decoration-color: #9a8f83;
    text-decoration-thickness: 1px;
  }
  .studio-catalog-chip {
    font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase;
    padding: 3px 9px; border: 1px solid; border-radius: 999px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .studio-catalog-chip.queued { color: #9a8f83; border-color: #c7b9ab; }
  .studio-catalog-chip.in_progress { color: #a0641c; border-color: #d4a775; background: #f7ecd8; }
  .studio-catalog-chip.done { color: #3a5a42; border-color: #9bb29f; background: #e6ede0; }
  .studio-catalog-select {
    font: inherit; font-size: 11px;
    background: transparent; color: #1a1715;
    border: 1px solid #c7b9ab;
    border-radius: 999px;
    padding: 3px 10px;
    cursor: pointer;
  }

  .studio-wall-label {
    background: #faf6ef;
    border: 1px solid #1a1715;
    padding: 20px 20px 18px;
    align-self: start;
    position: relative;
  }
  .studio-wall-label::before {
    content: ''; position: absolute;
    top: -8px; left: 50%; transform: translateX(-50%);
    width: 14px; height: 14px; border-radius: 50%;
    background: #1a1715;
    box-shadow: 0 1px 0 rgba(0,0,0,0.15);
  }
  .studio-wall-row {
    display: grid; grid-template-columns: 76px 1fr;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid #e8dfd1;
    font-size: 12px;
  }
  .studio-wall-row:last-of-type { border-bottom: none; }
  .studio-wall-key {
    font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase; color: #9a8f83;
    padding-top: 2px;
  }
  .studio-wall-val { color: #1a1715; font-variant-numeric: tabular-nums; }
  .studio-wall-val.italic {
    font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 15px;
  }
  .studio-wall-status {
    display: inline-block; padding: 2px 10px; font-size: 10px;
    letter-spacing: 0.18em; text-transform: uppercase;
    border: 1px solid currentColor; border-radius: 2px;
  }
  .studio-wall-status.planned { color: #2a4a5a; background: #e0ebf0; border-color: transparent; }
  .studio-wall-status.in_progress { color: #a0641c; background: #f7ecd8; border-color: transparent; }
  .studio-wall-status.completed { color: #3a5a42; background: #e6ede0; border-color: transparent; }
  .studio-wall-status.cancelled { color: #5c1d1f; background: #f4dedc; border-color: transparent; }
  .studio-wall-approval {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic; font-size: 13px;
  }
  .studio-wall-approval.pending { color: #a0641c; }
  .studio-wall-approval.approved { color: #3a5a42; }
  .studio-wall-approval.rejected { color: #5c1d1f; }

  .studio-pullquote {
    margin-top: 22px;
    padding: 14px 0 0 22px;
    border-left: 2px solid #5c1d1f;
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic;
    font-size: 17px; line-height: 1.5;
    color: #1a1715;
  }
  .studio-pullquote::before {
    content: '"'; font-size: 46px; line-height: 0;
    color: #5c1d1f; margin-right: 4px; vertical-align: -16px;
  }
  .studio-pullquote-label {
    margin-top: 10px; font-family: 'Inter Tight', sans-serif; font-style: normal;
    font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase; color: #6b635c;
  }

  .studio-empty {
    padding: 120px 0;
    text-align: center;
  }
  .studio-empty-mark {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 96px; font-style: italic; color: #c7b9ab;
    line-height: 1;
  }
  .studio-empty-line {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic; font-size: 22px; color: #6b635c;
    margin-top: 18px;
  }

  .studio-footer {
    margin-top: 72px;
    display: flex; justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid #1a1715;
    font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: #9a8f83;
  }

  @media (max-width: 960px) {
    .studio-shell { padding: 24px; }
    .studio-work { grid-template-columns: 1fr; gap: 20px; }
    .studio-work-index { font-size: 36px; }
    .studio-index-strip { grid-template-columns: repeat(2, 1fr); }
    .studio-index-cell:nth-child(2) { border-right: none; }
    .studio-index-cell:nth-child(-n+2) { border-bottom: 1px solid #d8cfc2; }
  }
`;

function romanize(num: number): string {
  if (num <= 0) return "—";
  const map: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  let n = num;
  for (const [v, s] of map) {
    while (n >= v) { result += s; n -= v; }
  }
  return result;
}

export function ProjectsStudio() {
  const { user } = useUser();
  const myProjects = useQuery(api.projects.getMyProjects);
  const profile = useQuery(api.profiles.getCurrentProfile);
  const navigate = useNavigate();

  const total = myProjects?.length ?? 0;
  const active = myProjects?.filter(p => p.status === "in_progress").length ?? 0;
  const completed = myProjects?.filter(p => p.status === "completed").length ?? 0;
  const awaiting = myProjects?.filter(p => p.approvalStatus === "pending").length ?? 0;

  const openingDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <style>{studioCss}</style>
      <div className="studio-page">
        <div className="studio-shell">
          <header className="studio-topbar">
            <div className="studio-wordmark">Atheca &amp; Co</div>
            <nav className="studio-nav" aria-label="Variants">
              <button onClick={() => navigate("/")}>Main</button>
              {PROJECT_VARIANT_LINKS.map(link => (
                <button
                  key={link.path}
                  className={link.path === "/3" ? "active" : ""}
                  onClick={() => navigate(link.path)}
                >{link.label}</button>
              ))}
            </nav>
          </header>

          <section className="studio-masthead">
            <div>
              <div className="studio-issue-label">
                No. {romanize(total || 1)} · Vol. {new Date().getFullYear()} · Curated by {user?.firstName || "Atheca"}
              </div>
              <h1 className="studio-masthead-title">
                The<br />
                <em>Production</em>
                <br />
                Catalogue.
              </h1>
            </div>
            <div className="studio-deck">
              A standing exhibition of commissions in progress —
              drafts, dispatches, and completed works, arranged by
              the hand of the house. Opening {openingDate}.
            </div>
          </section>

          <section className="studio-index-strip" aria-label="Index">
            <div className="studio-index-cell">
              <div className="studio-index-num">{String(total).padStart(2, "0")}</div>
              <div className="studio-index-label">Works on view</div>
            </div>
            <div className="studio-index-cell">
              <div className="studio-index-num accent">{String(active).padStart(2, "0")}</div>
              <div className="studio-index-label">In production</div>
            </div>
            <div className="studio-index-cell">
              <div className="studio-index-num">{String(completed).padStart(2, "0")}</div>
              <div className="studio-index-label">Permanent collection</div>
            </div>
            <div className="studio-index-cell">
              <div className="studio-index-num accent">{String(awaiting).padStart(2, "0")}</div>
              <div className="studio-index-label">Awaiting patronage</div>
            </div>
          </section>

          <div className="studio-works-header">
            <div className="studio-works-title">Selected works</div>
            <div className="studio-works-count">
              {total === 0 ? "No entries" : `${total} ${total === 1 ? "piece" : "pieces"} catalogued`}
            </div>
          </div>

          <div className="studio-works-list">
            {myProjects?.map((project, idx) => (
              <StudioWork
                key={project._id}
                project={project}
                idx={idx}
                canManage={canManageTasks(profile?.userType)}
              />
            ))}

            {myProjects && myProjects.length === 0 && (
              <div className="studio-empty">
                <div className="studio-empty-mark">—</div>
                <div className="studio-empty-line">No works currently exhibited.</div>
              </div>
            )}
          </div>

          <footer className="studio-footer">
            <span>Atheca Studio · Production Catalogue</span>
            <span>{openingDate}</span>
          </footer>
        </div>
      </div>
    </>
  );
}

function StudioWork({
  project,
  idx,
  canManage,
}: {
  project: any;
  idx: number;
  canManage: boolean;
}) {
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);
  const progress = getProjectProgress(project);

  const handleChange = async (taskIndex: number, status: string) => {
    try {
      await updateTaskStatus({
        projectId: project._id,
        taskIndex,
        status: status as any,
      });
      toast.success("Catalogue entry revised");
    } catch {
      toast.error("Unable to revise entry");
    }
  };

  return (
    <article className="studio-work">
      <div className="studio-work-index">{String(idx + 1).padStart(2, "0")}</div>

      <div className="studio-work-main">
        <div className="studio-work-eyebrow">
          Plate {romanize(idx + 1)} · {project.projectType}
        </div>
        <h2 className="studio-work-title">{project.projectName}</h2>
        <div className="studio-work-sub">
          Commissioned for {project.clientClerkId.slice(0, 10).replace(/_/g, " ")} ·
          {" "}Estimated run of {project.estimatedLength} days.
        </div>

        <div className="studio-work-meta">
          <div className="studio-meta-cell">
            <div className="studio-meta-label">Vernissage</div>
            <div className="studio-meta-val">{formatLongDate(project.estimatedStartDateTime)}</div>
          </div>
          <div className="studio-meta-cell">
            <div className="studio-meta-label">Closing</div>
            <div className="studio-meta-val">{formatLongDate(project.estimatedEndDateTime)}</div>
          </div>
          <div className="studio-meta-cell">
            <div className="studio-meta-label">Opened</div>
            <div className="studio-meta-val">
              {project.actualStartDateTime
                ? formatLongDate(project.actualStartDateTime)
                : "—"}
            </div>
          </div>
        </div>

        <div className="studio-progress">
          <div className="studio-progress-track">
            <div
              className="studio-progress-fill"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <div className="studio-progress-count">
            {romanize(progress.done) || "—"} / {romanize(progress.total) || "—"}
            <span>{progress.percent}% realised</span>
          </div>
        </div>

        {progress.total > 0 && (
          <div className="studio-catalog">
            <div className="studio-catalog-title">Catalogue of actions</div>
            {project.projectTasks?.map((task: any, i: number) => {
              const status = getTaskStatus(task);
              const name = getTaskName(task);
              return (
                <div key={i} className="studio-catalog-row">
                  <div className="studio-catalog-num">{romanize(i + 1)}.</div>
                  <div className={`studio-catalog-name ${status === "done" ? "done" : ""}`}>
                    {name}
                  </div>
                  <div className={`studio-catalog-chip ${status}`}>
                    {getStatusLabel(status)}
                  </div>
                  {canManage ? (
                    <select
                      className="studio-catalog-select"
                      value={status}
                      onChange={(e) => handleChange(i, e.target.value)}
                      aria-label={`Update status for ${name}`}
                    >
                      {TASK_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {project.notes && (
          <blockquote className="studio-pullquote">
            {project.notes}
            <div className="studio-pullquote-label">— Curator's note</div>
          </blockquote>
        )}
      </div>

      <aside className="studio-wall-label" aria-label="Wall label">
        <div className="studio-wall-row">
          <div className="studio-wall-key">Title</div>
          <div className="studio-wall-val italic">{project.projectName}</div>
        </div>
        <div className="studio-wall-row">
          <div className="studio-wall-key">Medium</div>
          <div className="studio-wall-val">{project.projectType}</div>
        </div>
        <div className="studio-wall-row">
          <div className="studio-wall-key">Run</div>
          <div className="studio-wall-val">{project.estimatedLength} days</div>
        </div>
        <div className="studio-wall-row">
          <div className="studio-wall-key">Status</div>
          <div className="studio-wall-val">
            <span className={`studio-wall-status ${project.status}`}>
              {getStatusLabel(project.status)}
            </span>
          </div>
        </div>
        <div className="studio-wall-row">
          <div className="studio-wall-key">Patron</div>
          <div className={`studio-wall-approval ${project.approvalStatus}`}>
            {project.approvalStatus === "approved"
              ? "Acquired"
              : project.approvalStatus === "pending"
              ? "In conversation"
              : "Declined"}
          </div>
        </div>
        <div className="studio-wall-row">
          <div className="studio-wall-key">Cat. №</div>
          <div className="studio-wall-val">
            AS—{new Date(project._creationTime).getFullYear()}.{String(idx + 1).padStart(3, "0")}
          </div>
        </div>
      </aside>
    </article>
  );
}
