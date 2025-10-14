import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return [];

    let projects;
    if (profile.userType === "business") {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_business", (q) => q.eq("businessOwnerId", userId))
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_client", (q) => q.eq("clientId", userId))
        .collect();
    }

    // Get client/business info for each project
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const client = await ctx.db.get(project.clientId);
        const business = await ctx.db.get(project.businessOwnerId);
        return { ...project, client, business };
      })
    );

    return projectsWithDetails;
  },
});

export const createProject = mutation({
  args: {
    clientId: v.id("users"),
    projectType: v.string(),
    projectName: v.string(),
    projectTasks: v.array(v.string()),
    estimatedLength: v.number(),
    estimatedStartDateTime: v.number(),
    estimatedEndDateTime: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.userType !== "business") {
      throw new Error("Only business owners can create projects");
    }

    return await ctx.db.insert("projects", {
      businessOwnerId: userId,
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
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { projectId, ...updates } = args;
    const project = await ctx.db.get(projectId);
    
    if (!project) throw new Error("Project not found");
    if (project.businessOwnerId !== userId) {
      throw new Error("Not authorized to update this project");
    }

    await ctx.db.patch(projectId, updates);
  },
});

export const getClients = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.userType !== "business") return [];

    // Get all clients who have projects with this business
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_business", (q) => q.eq("businessOwnerId", userId))
      .collect();

    const clientIds = [...new Set(projects.map(p => p.clientId))];
    
    const clients = await Promise.all(
      clientIds.map(async (clientId) => {
        const user = await ctx.db.get(clientId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", clientId))
          .unique();
        return { user, profile };
      })
    );

    return clients.filter(c => c.user && c.profile);
  },
});
