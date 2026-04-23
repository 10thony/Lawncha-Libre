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

const cartographyCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Azeret+Mono:wght@400;500;600;700&display=swap');

  .carto-page {
    min-height: 100vh;
    background: #ede5d0;
    color: #1a2b2a;
    font-family: 'Azeret Mono', ui-monospace, monospace;
    font-size: 12px;
    line-height: 1.55;
    position: relative;
    overflow-x: hidden;
  }
  .carto-page::before {
    content: '';
    position: fixed; inset: 0;
    pointer-events: none; z-index: 0;
    background:
      radial-gradient(circle at 85% 15%, rgba(15,76,72,0.07) 0 2px, transparent 2px 4px),
      radial-gradient(circle at 85% 15%, transparent 80px, rgba(15,76,72,0.04) 81px 82px, transparent 82px 160px, rgba(15,76,72,0.05) 161px 162px, transparent 162px 240px, rgba(15,76,72,0.04) 241px 242px, transparent 242px),
      radial-gradient(circle at 14% 78%, transparent 60px, rgba(138,90,43,0.06) 61px 62px, transparent 62px 120px, rgba(138,90,43,0.05) 121px 122px, transparent 122px 180px, rgba(138,90,43,0.04) 181px 182px, transparent 182px 260px, rgba(138,90,43,0.04) 261px 262px, transparent 262px);
  }
  .carto-page::after {
    content: '';
    position: fixed; inset: 0;
    pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(to right, rgba(15,76,72,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(15,76,72,0.05) 1px, transparent 1px);
    background-size: 80px 80px;
  }
  .carto-shell {
    position: relative; z-index: 1;
    max-width: 1320px; margin: 0 auto;
    padding: 28px 40px 96px;
  }

  .carto-topbar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 14px;
    background: #1a2b2a;
    color: #ede5d0;
    border: 1px solid #0f1f1e;
    font-size: 11px; letter-spacing: 0.14em;
  }
  .carto-topbar-left { display: flex; gap: 0; align-items: center; }
  .carto-topbar-left button {
    font: inherit; background: transparent; color: #d6c89b;
    border: 1px solid transparent; padding: 3px 10px;
    text-transform: uppercase; cursor: pointer; letter-spacing: 0.18em;
  }
  .carto-topbar-left button:hover { color: #fff; background: rgba(255,255,255,0.05); }
  .carto-topbar-left button.active { background: #c89430; color: #1a2b2a; font-weight: 700; }
  .carto-topbar-title {
    text-transform: uppercase; letter-spacing: 0.32em; color: #c89430;
    font-weight: 700;
  }
  .carto-topbar-right {
    font-variant-numeric: tabular-nums;
    color: #d6c89b;
  }

  .carto-title-block {
    margin-top: 28px;
    display: grid; grid-template-columns: 1fr 260px; gap: 36px; align-items: end;
    padding: 36px 0 24px;
    border-bottom: 2px solid #1a2b2a;
    position: relative;
  }
  .carto-eyebrow {
    color: #8a5a2b; letter-spacing: 0.28em; text-transform: uppercase; font-size: 11px;
    margin-bottom: 16px; font-weight: 600;
  }
  .carto-eyebrow span { color: #1a2b2a; }
  .carto-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-weight: 400;
    font-size: clamp(48px, 7vw, 96px);
    line-height: 0.9;
    letter-spacing: -0.01em;
    color: #0f4c48;
  }
  .carto-title i { font-style: italic; color: #c89430; }
  .carto-sub {
    font-family: 'DM Serif Display', serif;
    font-style: italic; font-size: 17px;
    color: #4a5d5c; line-height: 1.4;
    margin-top: 14px;
    max-width: 580px;
  }

  .carto-compass {
    width: 240px; height: 240px; margin-left: auto;
    border: 1.5px solid #0f4c48;
    border-radius: 50%;
    position: relative;
    background: radial-gradient(circle, rgba(237,229,208,1) 60%, rgba(15,76,72,0.08) 60%, transparent 62%, rgba(237,229,208,1) 62%, rgba(237,229,208,1) 80%, rgba(15,76,72,0.06) 80%);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Serif Display', serif;
  }
  .carto-compass::before,
  .carto-compass::after {
    content: ''; position: absolute;
    background: #0f4c48;
  }
  .carto-compass::before { left: 50%; top: 0; bottom: 0; width: 1px; }
  .carto-compass::after { top: 50%; left: 0; right: 0; height: 1px; }
  .carto-compass-n,
  .carto-compass-s,
  .carto-compass-e,
  .carto-compass-w {
    position: absolute;
    font-family: 'DM Serif Display', serif;
    font-size: 18px; color: #0f4c48;
    font-style: italic;
  }
  .carto-compass-n { top: -2px; left: 50%; transform: translate(-50%, -100%); }
  .carto-compass-s { bottom: -2px; left: 50%; transform: translate(-50%, 100%); }
  .carto-compass-e { right: -2px; top: 50%; transform: translate(100%, -50%); }
  .carto-compass-w { left: -2px; top: 50%; transform: translate(-100%, -50%); }
  .carto-compass-needle {
    width: 2px; height: 80%;
    background: linear-gradient(to bottom, #8b1c1c 0%, #8b1c1c 50%, #1a2b2a 50%, #1a2b2a 100%);
    transform: rotate(32deg);
  }
  .carto-compass-label {
    position: absolute; bottom: -28px; left: 50%; transform: translateX(-50%);
    font-family: 'Azeret Mono', monospace;
    font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; color: #8a5a2b;
    white-space: nowrap;
  }

  .carto-legend {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
    margin-top: 24px;
    border: 1px solid #0f4c48;
    background: rgba(237,229,208,0.7);
  }
  .carto-legend-cell {
    padding: 12px 18px;
    border-right: 1px solid rgba(15,76,72,0.35);
    position: relative;
  }
  .carto-legend-cell:last-child { border-right: none; }
  .carto-legend-cell::before {
    content: ''; position: absolute; top: 8px; left: 18px;
    width: 8px; height: 8px;
  }
  .carto-legend-cell.open::before { background: #0f4c48; border-radius: 50%; }
  .carto-legend-cell.active::before { background: #c89430; border-radius: 2px; transform: rotate(45deg); }
  .carto-legend-cell.charted::before { background: #276749; }
  .carto-legend-cell.pending::before { background: #8a5a2b; border: 2px solid #8a5a2b; border-radius: 50%; background: transparent; }
  .carto-legend-fig {
    font-family: 'DM Serif Display', serif; font-size: 32px;
    padding-left: 18px; color: #1a2b2a; line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .carto-legend-fig.accent { color: #c89430; font-style: italic; }
  .carto-legend-key {
    padding-left: 18px;
    font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase;
    color: #4a5d5c; margin-top: 4px;
  }

  .carto-survey-title {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 40px 0 10px;
  }
  .carto-survey-title h2 {
    font-family: 'DM Serif Display', serif; font-size: 28px; font-style: italic;
    color: #1a2b2a;
  }
  .carto-survey-title span { font-size: 10px; letter-spacing: 0.26em; color: #8a5a2b; text-transform: uppercase; }

  .carto-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(540px, 1fr));
    gap: 20px;
  }

  .carto-region {
    background: #f5eedc;
    border: 1px solid #0f4c48;
    position: relative;
    overflow: hidden;
  }
  .carto-region-topo {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 180px 140px at 20% 60%, rgba(15,76,72,0.13) 0 1px, transparent 1px 26px, rgba(15,76,72,0.1) 26px 27px, transparent 27px 52px, rgba(15,76,72,0.08) 52px 53px, transparent 53px 78px, rgba(15,76,72,0.06) 78px 79px, transparent 79px),
      radial-gradient(ellipse 120px 90px at 78% 30%, rgba(200,148,48,0.18) 0 1px, transparent 1px 18px, rgba(200,148,48,0.13) 18px 19px, transparent 19px 36px, rgba(200,148,48,0.09) 36px 37px, transparent 37px);
    pointer-events: none;
  }
  .carto-region-corner {
    position: absolute; top: 0; left: 0;
    font-family: 'Azeret Mono', monospace; font-size: 9px;
    color: #0f4c48; letter-spacing: 0.22em;
    padding: 6px 8px;
    border-right: 1px solid rgba(15,76,72,0.3);
    border-bottom: 1px solid rgba(15,76,72,0.3);
    background: rgba(237,229,208,0.85);
    z-index: 2;
  }
  .carto-region-corner.tr { left: auto; right: 0; border-left: 1px solid rgba(15,76,72,0.3); border-right: none; text-align: right; }
  .carto-region-corner.bl { top: auto; bottom: 0; border-top: 1px solid rgba(15,76,72,0.3); border-bottom: none; }
  .carto-region-corner.br { top: auto; bottom: 0; left: auto; right: 0; border-left: 1px solid rgba(15,76,72,0.3); border-top: 1px solid rgba(15,76,72,0.3); border-right: none; border-bottom: none; text-align: right; }

  .carto-region-inner {
    position: relative; z-index: 1;
    padding: 28px 24px 20px;
  }
  .carto-region-cartouche {
    background: #ede5d0;
    border: 1.5px solid #0f4c48;
    padding: 14px 18px 12px;
    margin-bottom: 14px;
    display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: end;
  }
  .carto-region-name {
    font-family: 'DM Serif Display', serif;
    font-size: 30px; line-height: 1.05; color: #0f4c48;
    font-weight: 400;
  }
  .carto-region-type {
    font-family: 'DM Serif Display', serif; font-style: italic;
    color: #8a5a2b; font-size: 14px; margin-top: 2px;
  }
  .carto-region-status {
    display: inline-block;
    font-family: 'Azeret Mono', monospace;
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
    padding: 3px 9px; border: 1.5px solid currentColor;
    background: rgba(237,229,208,0.7);
    font-weight: 600;
    white-space: nowrap;
  }
  .carto-region-status.planned { color: #394b6b; }
  .carto-region-status.in_progress { color: #c89430; }
  .carto-region-status.completed { color: #276749; }
  .carto-region-status.cancelled { color: #8b1c1c; }

  .carto-region-meta {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
    border-top: 1px solid rgba(15,76,72,0.3);
    border-bottom: 1px solid rgba(15,76,72,0.3);
    margin: 10px 0 12px;
  }
  .carto-region-meta > div {
    padding: 8px 10px;
    border-right: 1px dotted rgba(15,76,72,0.3);
  }
  .carto-region-meta > div:last-child { border-right: none; }
  .carto-region-meta .k {
    font-family: 'Azeret Mono', monospace; font-size: 9px;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #4a5d5c;
  }
  .carto-region-meta .v {
    font-family: 'DM Serif Display', serif;
    font-size: 15px; color: #1a2b2a; margin-top: 3px;
    font-variant-numeric: tabular-nums lining-nums;
  }

  .carto-elevation {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    gap: 12px; align-items: center;
    margin: 10px 0 14px;
  }
  .carto-elevation-label {
    font-family: 'Azeret Mono', monospace;
    font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
    color: #8a5a2b;
  }
  .carto-elevation-bars {
    display: grid; grid-template-columns: repeat(10, 1fr);
    gap: 2px; align-items: end; height: 20px;
  }
  .carto-elevation-bar {
    height: 100%; background: rgba(15,76,72,0.1);
    border-right: 1px solid rgba(15,76,72,0.2);
  }
  .carto-elevation-bar.f1 { background: #a8c4b5; }
  .carto-elevation-bar.f2 { background: #7ea59b; }
  .carto-elevation-bar.f3 { background: #50867e; }
  .carto-elevation-bar.f4 { background: #276749; }
  .carto-elevation-pct {
    font-family: 'DM Serif Display', serif; font-style: italic;
    font-size: 22px; color: #0f4c48;
    font-variant-numeric: tabular-nums;
  }

  .carto-waypoints-head {
    font-family: 'Azeret Mono', monospace;
    font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
    color: #0f4c48; font-weight: 700;
    padding: 6px 0 6px;
    border-top: 1.5px solid #0f4c48;
    border-bottom: 1px solid rgba(15,76,72,0.3);
    display: grid; grid-template-columns: 70px 1fr auto auto; gap: 12px;
  }
  .carto-waypoint {
    display: grid;
    grid-template-columns: 70px 1fr auto auto;
    gap: 12px;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px dotted rgba(15,76,72,0.25);
  }
  .carto-waypoint-coord {
    font-family: 'Azeret Mono', monospace; font-size: 10px;
    color: #8a5a2b;
    font-variant-numeric: tabular-nums;
  }
  .carto-waypoint-name {
    font-family: 'DM Serif Display', serif;
    font-size: 14px; color: #1a2b2a;
  }
  .carto-waypoint-name.charted {
    color: #4a5d5c;
    text-decoration: line-through; text-decoration-color: #276749;
  }
  .carto-waypoint-head {
    font-family: 'Azeret Mono', monospace; font-size: 9px;
    letter-spacing: 0.12em; color: #4a5d5c;
    padding: 1px 6px; border: 1px solid rgba(15,76,72,0.3);
    font-variant-numeric: tabular-nums;
  }
  .carto-waypoint-head.done { color: #276749; border-color: #276749; background: rgba(39,103,73,0.08); }
  .carto-waypoint-head.active { color: #c89430; border-color: #c89430; background: rgba(200,148,48,0.1); }
  .carto-waypoint-select {
    font: inherit; font-family: 'Azeret Mono', monospace; font-size: 10px;
    background: transparent; color: #1a2b2a;
    border: 1px solid rgba(15,76,72,0.35);
    padding: 1px 6px; cursor: pointer;
  }

  .carto-scale {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 14px;
    padding: 6px 0;
    border-top: 1px solid rgba(15,76,72,0.3);
    font-family: 'Azeret Mono', monospace;
    font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: #8a5a2b;
  }
  .carto-scale-bar {
    display: flex; gap: 0; width: 160px; height: 8px;
    border: 1px solid #0f4c48;
  }
  .carto-scale-bar div {
    flex: 1; border-right: 1px solid #0f4c48;
  }
  .carto-scale-bar div:last-child { border-right: none; }
  .carto-scale-bar div:nth-child(odd) { background: #0f4c48; }

  .carto-memo {
    margin-top: 12px;
    padding: 10px 14px;
    background: rgba(200,148,48,0.08);
    border-left: 3px solid #c89430;
    font-family: 'DM Serif Display', serif;
    font-style: italic; font-size: 14px; color: #1a2b2a;
  }
  .carto-memo-label {
    font-family: 'Azeret Mono', monospace; font-style: normal;
    font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
    color: #8a5a2b; display: block; margin-bottom: 4px; font-weight: 700;
  }

  .carto-empty { padding: 120px 0; text-align: center; }
  .carto-empty-mark {
    font-family: 'DM Serif Display', serif; font-size: 48px;
    font-style: italic; color: #0f4c48; letter-spacing: 0.04em;
  }
  .carto-empty-mark::before, .carto-empty-mark::after {
    content: '\\2715'; display: inline-block;
    color: #8b1c1c; font-style: normal; font-size: 28px;
    margin: 0 16px; vertical-align: 8px;
  }
  .carto-empty-line {
    font-family: 'Azeret Mono', monospace; margin-top: 14px;
    font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #8a5a2b;
  }

  @media (max-width: 960px) {
    .carto-shell { padding: 16px; }
    .carto-title-block { grid-template-columns: 1fr; }
    .carto-compass { margin: 16px auto 0; width: 180px; height: 180px; }
    .carto-legend { grid-template-columns: 1fr 1fr; }
    .carto-region-cartouche { grid-template-columns: 1fr; }
    .carto-region-meta { grid-template-columns: 1fr 1fr; }
  }
`;

function latLongFromId(id: string, idx: number) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const lat = ((hash % 75) + (idx * 7) % 10) - 37;
  const lon = ((hash >>> 7) % 140) - 70;
  const latH = lat >= 0 ? "N" : "S";
  const lonH = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toString().padStart(2, "0")}°${latH} ${Math.abs(lon).toString().padStart(3, "0")}°${lonH}`;
}

function headingFromIdx(idx: number) {
  const h = (idx * 47) % 360;
  const cardinal = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const bucket = Math.round(h / 22.5) % 16;
  return { deg: h, card: cardinal[bucket] };
}

export function ProjectsCartography() {
  const { user } = useUser();
  const myProjects = useQuery(api.projects.getMyProjects);
  const profile = useQuery(api.profiles.getCurrentProfile);
  const navigate = useNavigate();
  const projects = getProjectsWithMockData(myProjects);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const total = projects.length;
  const active = projects.filter((p) => p.status === "in_progress").length;
  const charted = projects.filter((p) => p.status === "completed").length;
  const pending = projects.filter((p) => p.approvalStatus === "pending").length;

  const today = new Date();
  const surveyNo = "S-" + String(today.getFullYear()) + "/" + String(today.getMonth() + 1).padStart(2, "0");

  return (
    <>
      <style>{cartographyCss}</style>
      <div className="carto-page">
        <div className="carto-shell">
          <header className="carto-topbar">
            <div className="carto-topbar-left">
              <button onClick={() => navigate("/")}>◀ Main</button>
              <button onClick={() => setCreateOpen(true)}>Plot Territory</button>
              {PROJECT_VARIANT_LINKS.map(link => (
                <button
                  key={link.path}
                  className={link.path === "/5" ? "active" : ""}
                  onClick={() => navigate(link.path)}
                >{link.label}</button>
              ))}
            </div>
            <div className="carto-topbar-title">Atheca Survey Plate</div>
            <div className="carto-topbar-right">
              SURVEYOR · {(user?.firstName || "Unnamed").toUpperCase()}<br />
              SHEET {surveyNo}
            </div>
          </header>

          <section className="carto-title-block">
            <div>
              <div className="carto-eyebrow">
                Sheet {surveyNo} <span>·</span> Scale 1 : 1 <span>·</span> Mercator projection
              </div>
              <h1 className="carto-title">
                Territories<br />
                <i>of Work</i>
              </h1>
              <div className="carto-sub">
                A plate charting every commission within the house survey —
                plotted by coordinate, shaded by elevation of progress, crossed
                with the day's waypoints and the operator's heading.
              </div>
            </div>
            <div className="carto-compass" aria-hidden="true">
              <div className="carto-compass-n">N</div>
              <div className="carto-compass-s">S</div>
              <div className="carto-compass-e">E</div>
              <div className="carto-compass-w">W</div>
              <div className="carto-compass-needle" />
              <div className="carto-compass-label">Decl. 32° · True north</div>
            </div>
          </section>

          <section className="carto-legend" aria-label="Legend">
            <div className="carto-legend-cell open">
              <div className="carto-legend-fig">{String(total).padStart(2, "0")}</div>
              <div className="carto-legend-key">Regions on plate</div>
            </div>
            <div className="carto-legend-cell active">
              <div className="carto-legend-fig accent">{String(active).padStart(2, "0")}</div>
              <div className="carto-legend-key">Under survey</div>
            </div>
            <div className="carto-legend-cell charted">
              <div className="carto-legend-fig" style={{ color: "#276749" }}>{String(charted).padStart(2, "0")}</div>
              <div className="carto-legend-key">Fully charted</div>
            </div>
            <div className="carto-legend-cell pending">
              <div className="carto-legend-fig" style={{ color: "#8a5a2b" }}>{String(pending).padStart(2, "0")}</div>
              <div className="carto-legend-key">Awaiting commission</div>
            </div>
          </section>

          <div className="carto-survey-title">
            <h2>Registered territories</h2>
            <span>Detail sheets · 1 : 1</span>
          </div>

          <div className="carto-grid">
            {projects.map((project, idx) => (
              <CartoRegion
                key={project._id}
                project={project}
                idx={idx}
                canManage={canManageTasks(profile?.userType)}
                onOpen={() => setSelectedProject(project)}
              />
            ))}

            {projects.length === 0 && (
              <div className="carto-empty" style={{ gridColumn: "1 / -1" }}>
                <div className="carto-empty-mark">Uncharted territory</div>
                <div className="carto-empty-line">No regions on file for this survey sheet.</div>
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
      </div>
    </>
  );
}

function CartoRegion({
  project,
  idx,
  canManage,
  onOpen,
}: {
  project: any;
  idx: number;
  canManage: boolean;
  onOpen: () => void;
}) {
  const updateTaskStatus = useMutation(api.projects.updateTaskStatus);
  const progress = getProjectProgress(project);
  const coord = latLongFromId(project._id, idx);
  const elevationSteps = Math.round((progress.percent / 100) * 10);
  const elevationFill = (i: number) => {
    if (i >= elevationSteps) return "";
    if (i < elevationSteps * 0.25) return "f1";
    if (i < elevationSteps * 0.5) return "f2";
    if (i < elevationSteps * 0.75) return "f3";
    return "f4";
  };

  const handleChange = async (taskIndex: number, status: string) => {
    try {
      await updateTaskStatus({
        projectId: project._id,
        taskIndex,
        status: status as any,
      });
      toast.success("Waypoint charted");
    } catch {
      toast.error("Waypoint lost");
    }
  };

  return (
    <article className="carto-region" onClick={onOpen} style={{ cursor: "pointer" }}>
      <div className="carto-region-topo" aria-hidden="true" />
      <div className="carto-region-corner">SHEET {String(idx + 1).padStart(2, "0")}</div>
      <div className="carto-region-corner tr">{coord}</div>
      <div className="carto-region-corner bl">EST. {project.estimatedLength}D</div>
      <div className="carto-region-corner br">REV {String(idx + 1).padStart(3, "0")}</div>

      <div className="carto-region-inner">
        <div className="carto-region-cartouche">
          <div>
            <div className="carto-region-name">{project.projectName}</div>
            <div className="carto-region-type">{project.projectType} · established {formatShortDate(project._creationTime)}</div>
          </div>
          <div className={`carto-region-status ${project.status}`}>
            {getStatusLabel(project.status)}
          </div>
        </div>

        <div className="carto-region-meta">
          <div>
            <div className="k">Coords</div>
            <div className="v">{coord}</div>
          </div>
          <div>
            <div className="k">Opens</div>
            <div className="v">{formatShortDate(project.estimatedStartDateTime)}</div>
          </div>
          <div>
            <div className="k">Closes</div>
            <div className="v">{formatShortDate(project.estimatedEndDateTime)}</div>
          </div>
          <div>
            <div className="k">Commission</div>
            <div className="v" style={{
              color: project.approvalStatus === "approved" ? "#276749"
                : project.approvalStatus === "pending" ? "#c89430"
                : "#8b1c1c"
            }}>
              {getStatusLabel(project.approvalStatus)}
            </div>
          </div>
        </div>

        <div className="carto-elevation">
          <div className="carto-elevation-label">Elev.</div>
          <div className="carto-elevation-bars">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`carto-elevation-bar ${elevationFill(i)}`} />
            ))}
          </div>
          <div className="carto-elevation-pct">{progress.percent}%</div>
        </div>

        {progress.total > 0 && (
          <>
            <div className="carto-waypoints-head">
              <div>Coord</div>
              <div>Waypoint</div>
              <div>Bearing</div>
              <div>State</div>
            </div>
            {project.projectTasks?.map((task: any, i: number) => {
              const status = getTaskStatus(task);
              const name = getTaskName(task);
              const h = headingFromIdx(idx * 31 + i);
              return (
                <div key={i} className="carto-waypoint">
                  <div className="carto-waypoint-coord">W-{String(i + 1).padStart(2, "0")}</div>
                  <div className={`carto-waypoint-name ${status === "done" ? "charted" : ""}`}>{name}</div>
                  <div className="carto-waypoint-head">{h.card} {String(h.deg).padStart(3, "0")}°</div>
                  {canManage ? (
                    <select
                      className="carto-waypoint-select"
                      value={status}
                      onChange={(e) => handleChange(i, e.target.value)}
                      aria-label={`Set state for ${name}`}
                    >
                      {TASK_STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={`carto-waypoint-head ${status === "done" ? "done" : status === "in_progress" ? "active" : ""}`}>
                      {status === "done" ? "CHARTED" : status === "in_progress" ? "SURVEYING" : "UNCHARTED"}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {project.notes && (
          <div className="carto-memo">
            <span className="carto-memo-label">Surveyor's note</span>
            {project.notes}
          </div>
        )}

        <div className="carto-scale">
          <span>0</span>
          <div className="carto-scale-bar" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} />)}
          </div>
          <span>{project.estimatedLength} days</span>
        </div>
      </div>
    </article>
  );
}
