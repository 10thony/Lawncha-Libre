import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      clerkUserId: v.string(),
      userType: v.union(v.literal("client"), v.literal("business")),
      businessName: v.optional(v.string()),
      businessDescription: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      services: v.optional(v.array(v.string())),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    return profile;
  },
});

export const createProfile = mutation({
  args: {
    userType: v.union(v.literal("client"), v.literal("business")),
    businessName: v.optional(v.string()),
    businessDescription: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if profile already exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (existing) {
      throw new Error("Profile already exists");
    }

    return await ctx.db.insert("profiles", {
      clerkUserId: identity.subject,
      ...args,
    });
  },
});

export const getBusinessOwners = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      clerkUserId: v.string(),
      userType: v.union(v.literal("client"), v.literal("business")),
      businessName: v.optional(v.string()),
      businessDescription: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      services: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("profiles")
      .collect();

    return profiles.filter((profile) => profile.userType === "business");
  },
});
