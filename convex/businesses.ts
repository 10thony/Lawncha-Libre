import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

async function requireBusinessOwner(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (!profile || profile.userType !== "business") {
    throw new Error("Only business owners can manage businesses");
  }

  return { identity, profile };
}

export const listMyBusinesses = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("businesses"),
      _creationTime: v.number(),
      ownerProfileId: v.id("profiles"),
      ownerClerkUserId: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      services: v.optional(v.array(v.string())),
      isPrimary: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const { profile } = await requireBusinessOwner(ctx);

    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_owner_profile", (q) => q.eq("ownerProfileId", profile._id))
      .collect();

    return businesses.sort((a, b) => {
      if ((a.isPrimary ?? false) === (b.isPrimary ?? false)) {
        return b.updatedAt - a.updatedAt;
      }
      return (a.isPrimary ?? false) ? -1 : 1;
    });
  },
});

export const createBusiness = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
  },
  returns: v.id("businesses"),
  handler: async (ctx, args) => {
    const { identity, profile } = await requireBusinessOwner(ctx);

    const existing = await ctx.db
      .query("businesses")
      .withIndex("by_owner_profile", (q) => q.eq("ownerProfileId", profile._id))
      .collect();

    const now = Date.now();
    const businessId = await ctx.db.insert("businesses", {
      ownerProfileId: profile._id,
      ownerClerkUserId: identity.subject,
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      address: args.address?.trim() || undefined,
      services: args.services?.map((s) => s.trim()).filter(Boolean),
      isPrimary: existing.length === 0,
      createdAt: now,
      updatedAt: now,
    });

    // Keep legacy profile fields in sync for existing parts of the app.
    if (existing.length === 0) {
      await ctx.db.patch(profile._id, {
        businessName: args.name.trim(),
        businessDescription: args.description?.trim() || undefined,
        phone: args.phone?.trim() || undefined,
        address: args.address?.trim() || undefined,
        services: args.services?.map((s) => s.trim()).filter(Boolean),
      });
    }

    return businessId;
  },
});

export const createBusinessFromProfile = mutation({
  args: {},
  returns: v.id("businesses"),
  handler: async (ctx) => {
    const { identity, profile } = await requireBusinessOwner(ctx);

    const existing = await ctx.db
      .query("businesses")
      .withIndex("by_owner_profile", (q) => q.eq("ownerProfileId", profile._id))
      .collect();

    if (existing.length > 0) {
      throw new Error("Business entity already exists. Use Add Business instead.");
    }

    const fallbackName = profile.businessName?.trim() || `${profile.name}'s Business`;
    const now = Date.now();

    return await ctx.db.insert("businesses", {
      ownerProfileId: profile._id,
      ownerClerkUserId: identity.subject,
      name: fallbackName,
      description: profile.businessDescription?.trim() || undefined,
      phone: profile.phone?.trim() || undefined,
      address: profile.address?.trim() || undefined,
      services: profile.services?.map((s) => s.trim()).filter(Boolean),
      isPrimary: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateBusiness = mutation({
  args: {
    businessId: v.id("businesses"),
    name: v.string(),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
    isPrimary: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { identity, profile } = await requireBusinessOwner(ctx);

    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error("Business not found");
    }
    if (business.ownerClerkUserId !== identity.subject || business.ownerProfileId !== profile._id) {
      throw new Error("You can only edit your own businesses");
    }

    if (args.isPrimary === true) {
      const allBusinesses = await ctx.db
        .query("businesses")
        .withIndex("by_owner_profile", (q) => q.eq("ownerProfileId", profile._id))
        .collect();

      await Promise.all(
        allBusinesses
          .filter((item) => item._id !== args.businessId && item.isPrimary)
          .map((item) => ctx.db.patch(item._id, { isPrimary: false, updatedAt: Date.now() }))
      );
    }

    const normalizedName = args.name.trim();
    const normalizedDescription = args.description?.trim() || undefined;
    const normalizedPhone = args.phone?.trim() || undefined;
    const normalizedAddress = args.address?.trim() || undefined;
    const normalizedServices = args.services?.map((s) => s.trim()).filter(Boolean);

    await ctx.db.patch(args.businessId, {
      name: normalizedName,
      description: normalizedDescription,
      phone: normalizedPhone,
      address: normalizedAddress,
      services: normalizedServices,
      isPrimary: args.isPrimary,
      updatedAt: Date.now(),
    });

    if (business.isPrimary || args.isPrimary) {
      await ctx.db.patch(profile._id, {
        businessName: normalizedName,
        businessDescription: normalizedDescription,
        phone: normalizedPhone,
        address: normalizedAddress,
        services: normalizedServices,
      });
    }
  },
});
