import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const testimonialValidator = v.object({
  _id: v.id("testimonials"),
  _creationTime: v.number(),
  clientClerkId: v.string(),
  businessOwnerClerkId: v.string(),
  projectId: v.optional(v.id("projects")),
  title: v.string(),
  description: v.string(),
  rating: v.number(),
  imageUrls: v.optional(v.array(v.string())),
  isHighlighted: v.boolean(),
});

export const getTestimonials = query({
  args: {
    businessOwnerClerkId: v.optional(v.string()),
    highlightedOnly: v.optional(v.boolean()),
  },
  returns: v.array(testimonialValidator),
  handler: async (ctx, args) => {
    let testimonials;

    if (args.businessOwnerClerkId) {
      testimonials = await ctx.db
        .query("testimonials")
        .withIndex("by_business", (q) => 
          q.eq("businessOwnerClerkId", args.businessOwnerClerkId!)
        )
        .collect();
    } else {
      testimonials = await ctx.db.query("testimonials").collect();
    }

    if (args.highlightedOnly) {
      testimonials = testimonials.filter(t => t.isHighlighted);
    }

    return testimonials;
  },
});

export const createTestimonial = mutation({
  args: {
    businessOwnerClerkId: v.string(),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.string(),
    rating: v.number(),
    imageUrls: v.optional(v.array(v.string())),
  },
  returns: v.id("testimonials"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!profile || profile.userType !== "client") {
      throw new Error("Only clients can create testimonials");
    }

    return await ctx.db.insert("testimonials", {
      clientClerkId: clerkUserId,
      isHighlighted: false,
      ...args,
    });
  },
});

export const toggleHighlight = mutation({
  args: {
    testimonialId: v.id("testimonials"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const testimonial = await ctx.db.get(args.testimonialId);
    if (!testimonial) throw new Error("Testimonial not found");

    if (testimonial.businessOwnerClerkId !== clerkUserId) {
      throw new Error("Only the business owner can highlight testimonials");
    }

    await ctx.db.patch(args.testimonialId, {
      isHighlighted: !testimonial.isHighlighted,
    });
  },
});

export const updateTestimonial = mutation({
  args: {
    testimonialId: v.id("testimonials"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    rating: v.optional(v.number()),
    imageUrls: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const { testimonialId, ...updates } = args;
    const testimonial = await ctx.db.get(testimonialId);
    if (!testimonial) throw new Error("Testimonial not found");

    if (testimonial.clientClerkId !== clerkUserId) {
      throw new Error("Only the author can update their testimonial");
    }

    // Simple rating bounds enforcement if provided
    if (updates.rating !== undefined) {
      const r = Math.max(1, Math.min(5, updates.rating));
      updates.rating = r;
    }

    await ctx.db.patch(testimonialId, updates);
  },
});
