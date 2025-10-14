import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles extending auth
  profiles: defineTable({
    userId: v.id("users"),
    userType: v.union(v.literal("client"), v.literal("business")),
    businessName: v.optional(v.string()),
    businessDescription: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),

  // Appointment slots and bookings
  appointments: defineTable({
    businessOwnerId: v.id("users"),
    clientId: v.optional(v.id("users")),
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
    .index("by_business", ["businessOwnerId"])
    .index("by_client", ["clientId"])
    .index("by_date", ["startDateTime"]),

  // Projects
  projects: defineTable({
    businessOwnerId: v.id("users"),
    clientId: v.id("users"),
    projectType: v.string(),
    projectName: v.string(),
    projectTasks: v.array(v.string()),
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
    notes: v.optional(v.string()),
  })
    .index("by_business", ["businessOwnerId"])
    .index("by_client", ["clientId"]),

  // Testimonials/Reviews
  testimonials: defineTable({
    clientId: v.id("users"),
    businessOwnerId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.string(),
    rating: v.number(), // 1-5 stars
    isHighlighted: v.boolean(),
  })
    .index("by_business", ["businessOwnerId"])
    .index("by_client", ["clientId"])
    .index("by_highlighted", ["isHighlighted"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
