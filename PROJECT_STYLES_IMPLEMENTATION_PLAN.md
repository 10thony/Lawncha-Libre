# Project Styles Functional Spec and Implementation Plan

## Goal

Add full project management interactions to all style variants while preserving each visual identity:

- Create new projects
- Update project-level fields (name, type, dates, notes, approval, status)
- Add, edit, remove, and reorder tasks
- Update individual task status
- Click a project to open full project details

Then reduce duplication by using one shared project domain/UI engine with style-specific renderers.

## Current State Snapshot

Across `style-poc-warroom.tsx`, `style-poc-dossier.tsx`, `style-poc-transit.tsx`, `style-poc-brutalist.tsx`, and `style-poc-cartography.tsx`:

- All variants already read projects via `api.projects.getMyProjects` and use `getProjectsWithMockData(...)`.
- All variants render project-level and task-level status data.
- All variants support task status updates with `api.projects.updateTaskStatus`.
- None of the variants expose full project create/update flows or project detail routes/modal panels.
- Some variants already have expandable detail (`Transit` uses `<details>`), but not a full edit surface.

## Required Functional Behavior

## 1) Create Project

Users with edit rights (`business` / `employee`) can:

- Open a style-themed "New Project" action
- Fill required fields:
  - `projectName`
  - `projectType`
  - `estimatedStartDateTime`
  - `estimatedEndDateTime` or `estimatedLength`
  - optional `notes`
- Add initial task list inline before save
- Submit and immediately see created record in current style list/grid

Users without edit rights (`client`) see read-only UI, no create action.

## 2) Update Existing Project

Within detail view (and optionally quick edit on card/row):

- Edit project basics (name/type/notes/dates)
- Change project status (`planned`, `in_progress`, `completed`, `cancelled`)
- Change approval status (`pending`, `approved`, `rejected`) where allowed
- Persist via mutation; optimistically update local state where safe

## 3) Task Management

For editable roles:

- Add task
- Rename task
- Change task status
- Delete task
- Reorder tasks (up/down control or drag)

For non-editable roles:

- View all tasks and statuses
- No task modification controls

## 4) Project Click -> Full Details

All styles should support a consistent interaction contract:

- Clicking the project shell opens a detail surface
- Detail includes:
  - full metadata
  - full task list with task operations
  - activity/status summary
  - save/cancel UX

Recommended detail form factors by breakpoint:

- Desktop: side panel/drawer or split pane
- Mobile: full-screen sheet/modal

## Implementation Architecture (Shared + Style-Specific)

## A) Introduce a Shared Projects Domain Layer

Create a reusable module (`src/components/projects-domain.ts` or similar):

- Shared types:
  - `ProjectViewModel`
  - `TaskViewModel`
  - `ProjectPatch`
  - `TaskPatch`
- Derived selectors:
  - progress percent, counts, readable labels
- Permission helpers:
  - `canCreateProject(userType)`
  - `canEditProject(userType)`
  - `canEditTask(userType)`
- Mutation wrappers (single place for toast/error handling):
  - `createProject`
  - `updateProject`
  - `addTask`
  - `updateTask`
  - `deleteTask`
  - `reorderTask`
  - existing `updateTaskStatus`

This prevents variant components from duplicating mutation logic.

## B) Create Headless Controller Hook

Create `useProjectsController(...)`:

- Inputs:
  - project source list
  - current user/profile
- Outputs:
  - `projects`
  - `selectedProjectId`
  - `selectProject(id)`
  - `isCreateOpen`, `openCreate()`, `closeCreate()`
  - `isDetailsOpen`, `openDetails(id)`, `closeDetails()`
  - action methods for create/update/tasks
  - loading/error flags

All style variants consume this same controller and only vary presentation.

## C) Introduce Style Renderer Pattern

Avoid one giant conditional component. Use composition:

- `ProjectsExperience` (shared orchestrator)
- `ProjectListRenderer` per style
- `ProjectCardRenderer` per style
- `ProjectDetailsRenderer` per style
- `ProjectCreateRenderer` per style

Contract example:

- each renderer receives same data/actions props
- style file remains owner of markup and class/style tokens
- behavior stays centralized

Result: one logic path, five visual skins.

## D) Optional Tokenization for Further Dedup

Define a `StyleTheme` object per variant:

- color tokens
- text labels
- spacing/shape settings
- status tone mapping

Renderers can use tokens to reduce repeated hardcoded mappings while preserving style identity.

## Variant-by-Variant Integration Plan

## 1) `style-poc-warroom.tsx`

Current strengths:

- clear row model with left/tasks/right structure
- task status mutation already wired

Additions:

- Top action strip button: `+ New Operation`
- Row click target opens `WarRoomProjectDetailsPanel`
- In panel:
  - editable project fields
  - full task editor
  - project status + approval controls
- Keep current tactical UI language ("operation", "task roster", "clearance")

Notes:

- Preserve existing monospace and dark command-center appearance.
- New controls should match current sharp-border, uppercase badge style.

## 2) `style-poc-dossier.tsx`

Current strengths:

- natural "file" metaphor fits editable details

Additions:

- "Open File" click affordance on dossier card header
- `DossierDetailSheet` styled like a full case file
- "New File" action in top bar for create
- Task edits as "Action Item Amendments"

Notes:

- Keep manila/paper visual treatment.
- Avoid modern UI chrome; use archival language.

## 3) `style-poc-transit.tsx`

Current strengths:

- rows already expandable via `<details>`

Additions:

- Expand row still shows quick details, but include explicit `Open Manifest` action
- Full edit surface in `TransitManifestPanel` (drawer/modal)
- Top-level `Add Departure` action for create
- Maintain arrival-board semantics for statuses and timestamps

Notes:

- Keep rounded LED-signage look and platform metaphors.

## 4) `style-poc-brutalist.tsx`

Current strengths:

- card grid already strong for click interactions

Additions:

- prominent `NEW JOB` button in hero/bar
- clicking card opens bold, poster-like detail editor
- task CRUD controls styled as outlined blocks
- keep simple, high-contrast action labels

Notes:

- Preserve chunky borders and high-urgency tone.

## 5) `style-poc-cartography.tsx`

Current strengths:

- region/waypoint model naturally maps to project/task hierarchy

Additions:

- `Plot Territory` create action
- clicking a region opens expanded "survey sheet" detail view
- task edits as waypoint management
- status edits as survey state controls

Notes:

- Keep map plate semantics (waypoints, coordinates, charted/surveying).

## Suggested File/Module Additions

- `src/components/projects-controller.ts` (headless state + actions)
- `src/components/projects-domain.ts` (types/selectors/permissions)
- `src/components/project-details-shared.tsx` (shared structural detail blocks, optional)
- `src/components/project-create-shared.tsx` (shared field logic/validation, optional)
- `src/components/project-style-renderers/` (renderer interfaces + per-style implementations)

If preferred, keep per-style files as-is and add thin imports from shared modules first, then progressively extract.

## Backend/Convex Requirements Check

Confirm these mutations exist (or add them):

- create project
- update project fields
- add task
- update task content (name/status)
- delete task
- reorder tasks

`updateTaskStatus` already exists and is used.

If only `updateTaskStatus` exists today, phase backend first before UI rollout.

## Rollout Plan (Low Risk)

1. Add shared controller/domain modules (no visual changes yet).
2. Migrate `warroom` first as reference implementation.
3. Reuse same controller/actions in `dossier`, `transit`, `brutalist`, `cartography`.
4. Add project detail surfaces per style.
5. Add create flow per style.
6. Add task CRUD/reorder in detail surfaces.
7. QA with role-based access (`client`, `employee`, `business`).

## QA Checklist

- Create project works and appears immediately in current style.
- Editing project metadata persists.
- Task add/edit/delete/reorder persists and re-renders correctly.
- Task status changes still work in quick list views.
- Clicking project always opens full details.
- Read-only users cannot mutate.
- Style identity remains unchanged except for new interaction affordances.
- Mobile detail/create flows are usable and do not break layout.

## Recommendation on "One Project Component"

Yes, but make it **one behavior component + multiple style renderers**, not one monolithic visual component.

Best approach:

- Single shared controller and domain logic
- Shared mutation/validation/permission pipeline
- Per-style presentational renderer components

This gives:

- no repeated business logic
- consistent capability set across all styles
- each style remains visually true to its original form

