import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Facebook Post to Project Porting System
 * 
 * This module handles converting Facebook posts into showcase projects
 * that can be displayed on the homepage for both registered and unregistered users.
 */

// Get all Facebook posts that haven't been ported to projects yet
export const getUnportedFacebookPosts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Get all Facebook posts for this user
    const facebookPosts = await ctx.db
      .query("facebookPosts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Get all existing projects that were ported from Facebook posts
    const existingProjects = await ctx.db
      .query("projects")
      .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", userId))
      .filter((q) => q.eq(q.field("isFromFacebookPost"), true))
      .collect();

    // Create a set of already ported Facebook post IDs
    const portedPostIds = new Set(
      existingProjects
        .map(p => p.facebookPostId)
        .filter(Boolean)
    );

    // Filter out posts that have already been ported
    const unportedPosts = facebookPosts.filter(post => !portedPostIds.has(post.id));

    return unportedPosts;
  },
});

// Get all showcase projects (for homepage display)
export const getShowcaseProjects = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get all projects marked for public showcase
    const showcaseProjects = await ctx.db
      .query("projects")
      .withIndex("by_public_showcase", (q) => q.eq("isPublicShowcase", true))
      .order("desc")
      .take(limit);

    // Get business owner profiles for these projects
    const projectsWithProfiles = await Promise.all(
      showcaseProjects.map(async (project) => {
        const businessProfile = await ctx.db
          .query("profiles")
          .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", project.businessOwnerClerkId))
          .first();

        return {
          ...project,
          businessProfile,
        };
      })
    );

    return projectsWithProfiles;
  },
});

// Port a Facebook post to a project
export const portFacebookPostToProject = mutation({
  args: {
    facebookPostId: v.string(),
    projectName: v.string(),
    projectType: v.string(),
    projectDescription: v.optional(v.string()),
    isPublicShowcase: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Get the Facebook post
    const facebookPost = await ctx.db
      .query("facebookPosts")
      .withIndex("by_post_id", (q) => q.eq("id", args.facebookPostId))
      .first();

    if (!facebookPost) {
      throw new Error("Facebook post not found");
    }

    // Check if this post has already been ported
    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_facebook_post", (q) => q.eq("facebookPostId", args.facebookPostId))
      .first();

    if (existingProject) {
      throw new Error("This Facebook post has already been ported to a project");
    }

    // Extract images from Facebook post attachments
    const imageUrls = facebookPost.attachments
      ?.filter(attachment => attachment.mediaType === "photo")
      .map(attachment => attachment.mediaUrl) || [];

    // Create the project
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      businessOwnerClerkId: userId,
      clientClerkId: userId, // For showcase projects, we can use the business owner as the client
      projectType: args.projectType,
      projectName: args.projectName,
      projectTasks: [
        {
          name: "Project showcase from Facebook post",
          status: "done"
        }
      ],
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      estimatedLength: 1, // Default to 1 day for showcase projects
      estimatedStartDateTime: facebookPost.createdTime,
      estimatedEndDateTime: facebookPost.createdTime + (24 * 60 * 60 * 1000), // 1 day later
      actualStartDateTime: facebookPost.createdTime,
      actualEndDateTime: facebookPost.createdTime + (24 * 60 * 60 * 1000),
      status: "completed",
      approvalStatus: "approved",
      notes: args.projectDescription || facebookPost.message || "Project showcased from Facebook post",
      isFromFacebookPost: true,
      facebookPostId: args.facebookPostId,
      facebookPostUrl: facebookPost.permalinkUrl,
      isPublicShowcase: args.isPublicShowcase ?? true,
      projectDescription: args.projectDescription || facebookPost.message,
    });

    return projectId;
  },
});

// Update a project's showcase status
export const updateProjectShowcaseStatus = mutation({
  args: {
    projectId: v.id("projects"),
    isPublicShowcase: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Verify the user owns this project
    const project = await ctx.db.get(args.projectId);
    if (!project || project.businessOwnerClerkId !== userId) {
      throw new Error("Project not found or access denied");
    }

    // Update the showcase status
    await ctx.db.patch(args.projectId, {
      isPublicShowcase: args.isPublicShowcase,
    });

    return { success: true };
  },
});

// Bulk port multiple Facebook posts to projects
export const bulkPortFacebookPostsToProjects = mutation({
  args: {
    posts: v.array(v.object({
      facebookPostId: v.string(),
      projectName: v.string(),
      projectType: v.string(),
      projectDescription: v.optional(v.string()),
      isPublicShowcase: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const results: any[] = [];
    
    for (const postData of args.posts) {
      try {
        const projectId: any = await ctx.runMutation(api.facebookProjectPort.portFacebookPostToProject, postData);
        results.push({
          facebookPostId: postData.facebookPostId,
          projectId,
          success: true,
        });
      } catch (error) {
        results.push({
          facebookPostId: postData.facebookPostId,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    return results;
  },
});

// Get project statistics for dashboard
export const getProjectPortStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Count total Facebook posts
    const totalFacebookPosts = await ctx.db
      .query("facebookPosts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Count ported projects
    const portedProjects = await ctx.db
      .query("projects")
      .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", userId))
      .filter((q) => q.eq(q.field("isFromFacebookPost"), true))
      .collect();

    // Count showcase projects
    const showcaseProjects = portedProjects.filter(p => p.isPublicShowcase);

    return {
      totalFacebookPosts: totalFacebookPosts.length,
      portedProjects: portedProjects.length,
      showcaseProjects: showcaseProjects.length,
      unportedPosts: totalFacebookPosts.length - portedProjects.length,
    };
  },
});
