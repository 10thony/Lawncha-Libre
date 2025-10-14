import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles
  profiles: defineTable({
    clerkUserId: v.string(),
    name: v.string(),
    userType: v.union(v.literal("client"), v.literal("business")),
    businessName: v.optional(v.string()),
    businessDescription: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
  }).index("by_clerk_user", ["clerkUserId"]),

  // Appointment slots and bookings
  appointments: defineTable({
    businessOwnerClerkId: v.string(),
    clientClerkId: v.optional(v.string()),
    startDateTime: v.number(),
    endDateTime: v.number(),
    status: v.union(
      v.literal("available"),
      v.literal("booked"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
  })
    .index("by_business", ["businessOwnerClerkId"])
    .index("by_client", ["clientClerkId"])
    .index("by_date", ["startDateTime"]),

  // Projects
  projects: defineTable({
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
    estimatedLength: v.number(), // in days
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
  })
    .index("by_business", ["businessOwnerClerkId"])
    .index("by_client", ["clientClerkId"])
    .index("by_approval_status", ["approvalStatus"]),

  // Testimonials/Reviews
  testimonials: defineTable({
    clientClerkId: v.string(),
    businessOwnerClerkId: v.string(),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.string(),
    rating: v.number(), // 1-5 stars
    isHighlighted: v.boolean(),
  })
    .index("by_business", ["businessOwnerClerkId"])
    .index("by_client", ["clientClerkId"])
    .index("by_highlighted", ["isHighlighted"]),
});
