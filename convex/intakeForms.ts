import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createIntakeForm = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    projectDescription: v.string(),
    imageUrls: v.optional(v.array(v.string())),
    videoUrls: v.optional(v.array(v.string())),
  },
  returns: v.id("intakeForms"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("intakeForms", {
      ...args,
      status: "submitted",
      submittedAt: Date.now(),
    });
  },
});

export const getAllIntakeForms = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("intakeForms"),
      _creationTime: v.number(),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      projectDescription: v.string(),
      imageUrls: v.optional(v.array(v.string())),
      videoUrls: v.optional(v.array(v.string())),
      status: v.union(
        v.literal("submitted"),
        v.literal("claimed"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      businessOwnerClerkId: v.optional(v.string()),
      clientClerkId: v.optional(v.string()),
      submittedAt: v.number(),
      claimedAt: v.optional(v.number()),
      linkedAt: v.optional(v.number()),
      businessNotes: v.optional(v.string()),
      estimatedQuote: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("intakeForms").collect();
  },
});

export const getIntakeFormsByStatus = query({
  args: {
    status: v.union(
      v.literal("submitted"),
      v.literal("claimed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("intakeForms"),
      _creationTime: v.number(),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      projectDescription: v.string(),
      imageUrls: v.optional(v.array(v.string())),
      videoUrls: v.optional(v.array(v.string())),
      status: v.union(
        v.literal("submitted"),
        v.literal("claimed"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      businessOwnerClerkId: v.optional(v.string()),
      clientClerkId: v.optional(v.string()),
      submittedAt: v.number(),
      claimedAt: v.optional(v.number()),
      linkedAt: v.optional(v.number()),
      businessNotes: v.optional(v.string()),
      estimatedQuote: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("intakeForms")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const getIntakeFormById = query({
  args: {
    id: v.id("intakeForms"),
  },
  returns: v.union(
    v.object({
      _id: v.id("intakeForms"),
      _creationTime: v.number(),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      projectDescription: v.string(),
      imageUrls: v.optional(v.array(v.string())),
      videoUrls: v.optional(v.array(v.string())),
      status: v.union(
        v.literal("submitted"),
        v.literal("claimed"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      businessOwnerClerkId: v.optional(v.string()),
      clientClerkId: v.optional(v.string()),
      submittedAt: v.number(),
      claimedAt: v.optional(v.number()),
      linkedAt: v.optional(v.number()),
      businessNotes: v.optional(v.string()),
      estimatedQuote: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getIntakeFormsByBusinessOwner = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("intakeForms"),
      _creationTime: v.number(),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      projectDescription: v.string(),
      imageUrls: v.optional(v.array(v.string())),
      videoUrls: v.optional(v.array(v.string())),
      status: v.union(
        v.literal("submitted"),
        v.literal("claimed"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      businessOwnerClerkId: v.optional(v.string()),
      clientClerkId: v.optional(v.string()),
      submittedAt: v.number(),
      claimedAt: v.optional(v.number()),
      linkedAt: v.optional(v.number()),
      businessNotes: v.optional(v.string()),
      estimatedQuote: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("intakeForms")
      .withIndex("by_business_owner", (q) => q.eq("businessOwnerClerkId", identity.subject))
      .collect();
  },
});

export const getIntakeFormsByClient = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("intakeForms"),
      _creationTime: v.number(),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      projectDescription: v.string(),
      imageUrls: v.optional(v.array(v.string())),
      videoUrls: v.optional(v.array(v.string())),
      status: v.union(
        v.literal("submitted"),
        v.literal("claimed"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      businessOwnerClerkId: v.optional(v.string()),
      clientClerkId: v.optional(v.string()),
      submittedAt: v.number(),
      claimedAt: v.optional(v.number()),
      linkedAt: v.optional(v.number()),
      businessNotes: v.optional(v.string()),
      estimatedQuote: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("intakeForms")
      .withIndex("by_client", (q) => q.eq("clientClerkId", identity.subject))
      .collect();
  },
});

export const claimIntakeForm = mutation({
  args: {
    intakeFormId: v.id("intakeForms"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const intakeForm = await ctx.db.get(args.intakeFormId);
    if (!intakeForm) throw new Error("Intake form not found");
    
    if (intakeForm.status !== "submitted") {
      throw new Error("Intake form has already been claimed");
    }

    await ctx.db.patch(args.intakeFormId, {
      status: "claimed",
      businessOwnerClerkId: identity.subject,
      claimedAt: Date.now(),
    });
  },
});

export const linkIntakeFormToClient = mutation({
  args: {
    intakeFormId: v.id("intakeForms"),
    clientClerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const intakeForm = await ctx.db.get(args.intakeFormId);
    if (!intakeForm) throw new Error("Intake form not found");

    await ctx.db.patch(args.intakeFormId, {
      clientClerkId: args.clientClerkId,
      linkedAt: Date.now(),
    });
  },
});

export const updateIntakeFormStatus = mutation({
  args: {
    intakeFormId: v.id("intakeForms"),
    status: v.union(
      v.literal("submitted"),
      v.literal("claimed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    businessNotes: v.optional(v.string()),
    estimatedQuote: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const intakeForm = await ctx.db.get(args.intakeFormId);
    if (!intakeForm) throw new Error("Intake form not found");
    
    // Only business owner who claimed it can update status
    if (intakeForm.businessOwnerClerkId !== identity.subject) {
      throw new Error("Only the business owner who claimed this form can update it");
    }

    const updateData: any = {
      status: args.status,
    };

    if (args.businessNotes !== undefined) {
      updateData.businessNotes = args.businessNotes;
    }

    if (args.estimatedQuote !== undefined) {
      updateData.estimatedQuote = args.estimatedQuote;
    }

    await ctx.db.patch(args.intakeFormId, updateData);
  },
});

export const searchIntakeFormsByEmail = query({
  args: {
    email: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("intakeForms"),
      _creationTime: v.number(),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      projectDescription: v.string(),
      imageUrls: v.optional(v.array(v.string())),
      videoUrls: v.optional(v.array(v.string())),
      status: v.union(
        v.literal("submitted"),
        v.literal("claimed"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      businessOwnerClerkId: v.optional(v.string()),
      clientClerkId: v.optional(v.string()),
      submittedAt: v.number(),
      claimedAt: v.optional(v.number()),
      linkedAt: v.optional(v.number()),
      businessNotes: v.optional(v.string()),
      estimatedQuote: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const allForms = await ctx.db.query("intakeForms").collect();
    return allForms.filter(form => form.email.toLowerCase() === args.email.toLowerCase());
  },
});
