import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const projectValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  businessOwnerClerkId: v.string(),
  clientClerkId: v.string(),
  projectType: v.string(),
  projectName: v.string(),
  projectTasks: v.array(v.string()),
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
    projectTasks: v.array(v.string()),
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

    return await ctx.db.insert("projects", {
      businessOwnerClerkId: clerkUserId,
      status: "planned",
      ...args,
    });
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    projectType: v.optional(v.string()),
    projectName: v.optional(v.string()),
    projectTasks: v.optional(v.array(v.string())),
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
