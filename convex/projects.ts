import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const projectValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  businessOwnerClerkId: v.string(),
  clientClerkId: v.string(),
  projectType: v.string(),
  projectName: v.string(),
  projectTasks: v.array(v.object({
    name: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("in_progress"),
      v.literal("done")
    )
  })),
  estimatedLength: v.number(),
  estimatedStartDateTime: v.number(),
  estimatedEndDateTime: v.number(),
  actualStartDateTime: v.optional(v.number()),
  actualEndDateTime: v.optional(v.number()),
  status: v.union(
    v.literal("planned"),
    v.literal("in_progress"),
    v.literal("completed"),
    v.literal("cancelled")
  ),
  approvalStatus: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  ),
  rejectionReason: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export const getMyProjects = query({
  args: {},
  returns: v.array(projectValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const clerkUserId = identity.subject;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!profile) return [];

    let projects;
    if (profile.userType === "business") {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", clerkUserId))
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_client", (q) => q.eq("clientClerkId", clerkUserId))
        .collect();
    }

    return projects;
  },
});

export const createProject = mutation({
  args: {
    clientClerkId: v.string(),
    projectType: v.string(),
    projectName: v.string(),
    projectTasks: v.array(v.string()), // Still accept array of strings for backward compatibility
    estimatedLength: v.number(),
    estimatedStartDateTime: v.number(),
    estimatedEndDateTime: v.number(),
    notes: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!profile || profile.userType !== "business") {
      throw new Error("Only business owners can create projects");
    }

    // Convert array of strings to array of task objects with default "queued" status
    const tasksWithStatus = args.projectTasks.map(taskName => ({
      name: taskName,
      status: "queued" as const
    }));

    return await ctx.db.insert("projects", {
      businessOwnerClerkId: clerkUserId,
      status: "planned",
      approvalStatus: "pending",
      ...args,
      projectTasks: tasksWithStatus,
    });
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    projectType: v.optional(v.string()),
    projectName: v.optional(v.string()),
    projectTasks: v.optional(v.array(v.object({
      name: v.string(),
      status: v.union(
        v.literal("queued"),
        v.literal("in_progress"),
        v.literal("done")
      )
    }))),
    estimatedLength: v.optional(v.number()),
    estimatedStartDateTime: v.optional(v.number()),
    estimatedEndDateTime: v.optional(v.number()),
    actualStartDateTime: v.optional(v.number()),
    actualEndDateTime: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("planned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const { projectId, ...updates } = args;
    const project = await ctx.db.get(projectId);
    
    if (!project) throw new Error("Project not found");
    if (project.businessOwnerClerkId !== clerkUserId) {
      throw new Error("Not authorized to update this project");
    }

    await ctx.db.patch(projectId, updates);
  },
});

export const updateTaskStatus = mutation({
  args: {
    projectId: v.id("projects"),
    taskIndex: v.number(),
    status: v.union(
      v.literal("queued"),
      v.literal("in_progress"),
      v.literal("done")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const project = await ctx.db.get(args.projectId);
    
    if (!project) throw new Error("Project not found");
    if (project.businessOwnerClerkId !== clerkUserId) {
      throw new Error("Not authorized to update this project");
    }

    if (args.taskIndex < 0 || args.taskIndex >= project.projectTasks.length) {
      throw new Error("Invalid task index");
    }

    // Handle backward compatibility - convert old string tasks to new format if needed
    let updatedTasks = [...project.projectTasks];
    const currentTask = updatedTasks[args.taskIndex];
    
    // If the task is still a string (old format), convert it to the new format
    if (typeof currentTask === 'string') {
      updatedTasks = updatedTasks.map(task => 
        typeof task === 'string' 
          ? { name: task, status: 'queued' as const }
          : task
      );
    }

    // Update the specific task status
    updatedTasks[args.taskIndex] = {
      name: typeof currentTask === 'string' ? currentTask : currentTask.name,
      status: args.status
    };

    await ctx.db.patch(args.projectId, {
      projectTasks: updatedTasks
    });
  },
});

export const approveProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (project.clientClerkId !== clerkUserId) {
      throw new Error("Not authorized to approve this project");
    }

    if (project.approvalStatus !== "pending") {
      throw new Error("Project is not pending approval");
    }

    await ctx.db.patch(args.projectId, {
      approvalStatus: "approved",
      status: "planned"
    });
  },
});

export const rejectProject = mutation({
  args: {
    projectId: v.id("projects"),
    rejectionReason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (project.clientClerkId !== clerkUserId) {
      throw new Error("Not authorized to reject this project");
    }

    if (project.approvalStatus !== "pending") {
      throw new Error("Project is not pending approval");
    }

    await ctx.db.patch(args.projectId, {
      approvalStatus: "rejected",
      rejectionReason: args.rejectionReason,
      status: "cancelled"
    });
  },
});

export const getClientsWithApprovedAppointments = query({
  args: {},
  returns: v.array(v.object({
    clerkUserId: v.string(),
    name: v.string(),
  })),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const clerkUserId = identity.subject;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!profile || profile.userType !== "business") return [];

    // Get all clients who have completed appointments with this business
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", clerkUserId))
      .collect();

    const completedAppointments = appointments.filter(a => a.status === "completed");
    const clientIds = [...new Set(completedAppointments.map(a => a.clientClerkId).filter((id): id is string => Boolean(id)))];

    // Get client profiles for these IDs
    const clientProfiles = await Promise.all(
      clientIds.map(clientId => 
        ctx.db
          .query("profiles")
          .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clientId))
          .unique()
      )
    );

    return clientProfiles
      .filter(Boolean)
      .map(client => ({
        clerkUserId: client!.clerkUserId,
        name: client!.name,
      }));
  },
});

export const getClients = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const clerkUserId = identity.subject;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!profile || profile.userType !== "business") return [];

    // Get all clients who have projects with this business
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", clerkUserId))
      .collect();

    const clientIds = [...new Set(projects.map(p => p.clientClerkId))];
    
    return clientIds;
  },
});
