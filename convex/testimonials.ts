import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTestimonials = query({
  args: {
    businessOwnerId: v.optional(v.id("users")),
    highlightedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let testimonials;

    if (args.businessOwnerId) {
      testimonials = await ctx.db
        .query("testimonials")
        .withIndex("by_business", (q) => 
          q.eq("businessOwnerId", args.businessOwnerId!)
        )
        .collect();
    } else {
      testimonials = await ctx.db.query("testimonials").collect();
    }

    if (args.highlightedOnly) {
      testimonials = testimonials.filter(t => t.isHighlighted);
    }

    // Get client and business info
    const testimonialsWithDetails = await Promise.all(
      testimonials.map(async (testimonial) => {
        const client = await ctx.db.get(testimonial.clientId);
        const business = await ctx.db.get(testimonial.businessOwnerId);
        const project = testimonial.projectId ? 
          await ctx.db.get(testimonial.projectId) : null;
        
        return { ...testimonial, client, business, project };
      })
    );

    return testimonialsWithDetails;
  },
});

export const createTestimonial = mutation({
  args: {
    businessOwnerId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.userType !== "client") {
      throw new Error("Only clients can create testimonials");
    }

    return await ctx.db.insert("testimonials", {
      clientId: userId,
      isHighlighted: false,
      ...args,
    });
  },
});

export const toggleHighlight = mutation({
  args: {
    testimonialId: v.id("testimonials"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const testimonial = await ctx.db.get(args.testimonialId);
    if (!testimonial) throw new Error("Testimonial not found");

    if (testimonial.businessOwnerId !== userId) {
      throw new Error("Only the business owner can highlight testimonials");
    }

    await ctx.db.patch(args.testimonialId, {
      isHighlighted: !testimonial.isHighlighted,
    });
  },
});
