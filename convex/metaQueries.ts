import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Meta Content Queries
 * 
 * This module provides query functions for retrieving Meta/Facebook content
 * and connection status from the database.
 */

// Get Meta content connection status
export const getMetaContentConnectionStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;
    const metaAccount = await ctx.db
      .query("metaAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!metaAccount) {
      return {
        connected: false,
        connectedPages: [],
        instagramBusinessAccountId: null,
        tokenExpiresAt: null,
      };
    }

    return {
      connected: true,
      connectedPages: metaAccount.connectedPages,
      instagramBusinessAccountId: metaAccount.instagramBusinessAccountId,
      tokenExpiresAt: metaAccount.tokenExpiresAt,
      facebookUserId: metaAccount.facebookUserId,
      lastUpdated: metaAccount.updatedAt,
    };
  },
});

// List Instagram media with pagination
export const listInstagramMedia = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { media: [], nextCursor: null };
    }

    const userId = identity.subject;
    const limit = args.limit || 25;

    // Get media ordered by timestamp (newest first)
    const media = await ctx.db
      .query("instagramMedia")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit + 1);

    const hasMore = media.length > limit;
    const mediaToReturn = hasMore ? media.slice(0, limit) : media;
    const nextCursor = hasMore ? media[limit - 1].timestamp.toString() : null;

    return {
      media: mediaToReturn,
      nextCursor,
      hasMore,
    };
  },
});

// List Facebook posts with pagination
export const listFacebookPosts = query({
  args: {
    pageId: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { posts: [], nextCursor: null };
    }

    const userId = identity.subject;
    const limit = args.limit || 25;

    let query = ctx.db
      .query("facebookPosts")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    // Filter by page if specified
    if (args.pageId) {
      query = ctx.db
        .query("facebookPosts")
        .withIndex("by_page", (q) => q.eq("pageId", args.pageId!))
        .filter((q) => q.eq(q.field("userId"), userId));
    }

    // Get posts ordered by creation time (newest first)
    const posts = await query
      .order("desc")
      .take(limit + 1);

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? posts[limit - 1].createdTime.toString() : null;

    return {
      posts: postsToReturn,
      nextCursor,
      hasMore,
    };
  },
});

// Get user's connected Facebook pages
export const getConnectedPages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const metaAccount = await ctx.db
      .query("metaAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return metaAccount?.connectedPages || [];
  },
});

// Get Instagram media count
export const getInstagramMediaCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const userId = identity.subject;
    const media = await ctx.db
      .query("instagramMedia")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return media.length;
  },
});

// Get Facebook posts count
export const getFacebookPostsCount = query({
  args: {
    pageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const userId = identity.subject;

    let query = ctx.db
      .query("facebookPosts")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    // Filter by page if specified
    if (args.pageId) {
      query = ctx.db
        .query("facebookPosts")
        .withIndex("by_page", (q) => q.eq("pageId", args.pageId!))
        .filter((q) => q.eq(q.field("userId"), userId));
    }

    const posts = await query.collect();
    return posts.length;
  },
});

// Get recent Instagram media (last 7 days)
export const getRecentInstagramMedia = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const days = args.days || 7;
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    const media = await ctx.db
      .query("instagramMedia")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .order("desc")
      .take(50);

    return media;
  },
});


// Get recent Facebook posts (last 7 days)
export const getRecentFacebookPosts = query({
  args: {
    pageId: v.optional(v.string()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const days = args.days || 7;
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    let query = ctx.db
      .query("facebookPosts")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    // Filter by page if specified
    if (args.pageId) {
      query = ctx.db
        .query("facebookPosts")
        .withIndex("by_page", (q) => q.eq("pageId", args.pageId!))
        .filter((q) => q.eq(q.field("userId"), userId));
    }

    const posts = await query
      .filter((q) => q.gte(q.field("createdTime"), cutoffTime))
      .order("desc")
      .take(50);

    return posts;
  },
});
