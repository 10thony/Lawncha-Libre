export type TaskStatus = "queued" | "in_progress" | "done";

export type ProjectTask = string | { name: string; status?: TaskStatus };

export const PROJECT_VARIANT_LINKS = [
  { path: "/1", label: "01" },
  { path: "/2", label: "02" },
  { path: "/5", label: "05" },
  { path: "/9", label: "09" },
  { path: "/10", label: "10" },
] as const;

export const TASK_STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: "queued", label: "Queued" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export function getTaskName(task: ProjectTask): string {
  return typeof task === "string" ? task : task.name;
}

export function getTaskStatus(task: ProjectTask): TaskStatus {
  if (typeof task === "string") return "queued";
  if (task.status === "done" || task.status === "in_progress") return task.status;
  return "queued";
}

export function getStatusLabel(value?: string): string {
  return (value || "unknown").replace(/_/g, " ");
}

export function formatShortDate(timestamp?: number): string {
  if (!timestamp) return "TBD";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(timestamp?: number): string {
  if (!timestamp) return "TBD";
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getProjectProgress(project: { projectTasks?: ProjectTask[] }) {
  const tasks = project.projectTasks || [];
  const total = tasks.length;
  const done = tasks.filter((task) => getTaskStatus(task) === "done").length;
  const inProgress = tasks.filter((task) => getTaskStatus(task) === "in_progress").length;
  const queued = Math.max(total - done - inProgress, 0);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return { total, done, inProgress, queued, percent };
}

export function canManageTasks(userType?: string): boolean {
  return userType === "business" || userType === "employee";
}

export function compactIdentifier(value?: string, fallback = "Historical"): string {
  if (!value) return fallback;
  if (value.length <= 22) return value;
  return `${value.slice(0, 12)}...${value.slice(-6)}`;
}

export const MOCK_PROJECTS = [
  {
    _id: "mock_project_01",
    _creationTime: Date.now() - 1000 * 60 * 60 * 24 * 20,
    projectName: "Kitchen + dining remodel",
    projectType: "Interior renovation",
    status: "in_progress",
    approvalStatus: "pending",
    estimatedLength: 35,
    estimatedStartDateTime: Date.now() - 1000 * 60 * 60 * 24 * 10,
    estimatedEndDateTime: Date.now() + 1000 * 60 * 60 * 24 * 25,
    actualStartDateTime: Date.now() - 1000 * 60 * 60 * 24 * 8,
    clientClerkId: "client_mock_alvarez_family",
    businessOwnerClerkId: "owner_mock_atheca",
    notes: "Electrical rough-in complete. Cabinet lead time is the pacing item.",
    projectTasks: [
      { name: "Site prep + protection", status: "done" },
      { name: "Demolition and debris haul", status: "done" },
      { name: "Electrical rough-in", status: "done" },
      { name: "Cabinet install", status: "in_progress" },
      { name: "Countertops + finish plumbing", status: "queued" },
    ],
  },
  {
    _id: "mock_project_02",
    _creationTime: Date.now() - 1000 * 60 * 60 * 24 * 45,
    projectName: "Roof replacement + gutters",
    projectType: "Exterior envelope",
    status: "planned",
    approvalStatus: "approved",
    estimatedLength: 12,
    estimatedStartDateTime: Date.now() + 1000 * 60 * 60 * 24 * 4,
    estimatedEndDateTime: Date.now() + 1000 * 60 * 60 * 24 * 16,
    actualStartDateTime: undefined,
    clientClerkId: "client_mock_metro_housing",
    businessOwnerClerkId: "owner_mock_atheca",
    notes: "Permit approved; staging and material drop confirmed.",
    projectTasks: [
      { name: "Permit finalization", status: "done" },
      { name: "Material delivery", status: "in_progress" },
      { name: "Tear-off + decking checks", status: "queued" },
      { name: "Shingle install + gutters", status: "queued" },
    ],
  },
  {
    _id: "mock_project_03",
    _creationTime: Date.now() - 1000 * 60 * 60 * 24 * 90,
    projectName: "Pool deck + landscape package",
    projectType: "Outdoor living",
    status: "completed",
    approvalStatus: "approved",
    estimatedLength: 28,
    estimatedStartDateTime: Date.now() - 1000 * 60 * 60 * 24 * 60,
    estimatedEndDateTime: Date.now() - 1000 * 60 * 60 * 24 * 32,
    actualStartDateTime: Date.now() - 1000 * 60 * 60 * 24 * 61,
    clientClerkId: "client_mock_hartwell_residence",
    businessOwnerClerkId: "owner_mock_atheca",
    notes: "Client sign-off received; final punch list is closed.",
    projectTasks: [
      { name: "Layout + drainage plan", status: "done" },
      { name: "Deck form and pour", status: "done" },
      { name: "Pergola + lighting", status: "done" },
      { name: "Irrigation tie-in", status: "done" },
      { name: "Final walkthrough", status: "done" },
    ],
  },
] as const;

export function getProjectsWithMockData<T>(projects?: T[]): T[] {
  if (projects && projects.length > 0) return projects;
  return [...(MOCK_PROJECTS as unknown as T[])];
}
