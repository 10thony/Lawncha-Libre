import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles
  profiles: defineTable({
    clerkUserId: v.string(),
    name: v.string(),
    userType: v.union(v.literal("client"), v.literal("business"), v.literal("employee")),
    businessName: v.optional(v.string()),
    businessDescription: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
    // Employee-specific fields
    companyId: v.optional(v.id("profiles")), // Reference to the business owner's profile
    employeeStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
  }).index("by_clerk_user", ["clerkUserId"])
    .index("by_company", ["companyId"])
    .index("by_employee_status", ["employeeStatus"]),

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
    imageUrls: v.optional(v.array(v.string())),
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
    // Employee access
    assignedEmployees: v.optional(v.array(v.string())), // Array of employee clerk IDs
  })
    .index("by_business", ["businessOwnerClerkId"])
    .index("by_client", ["clientClerkId"])
    .index("by_approval_status", ["approvalStatus"])
    .index("by_employee", ["assignedEmployees"]),

  // Testimonials/Reviews
  testimonials: defineTable({
    clientClerkId: v.string(),
    businessOwnerClerkId: v.string(),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.string(),
    rating: v.number(), // 1-5 stars
    imageUrls: v.optional(v.array(v.string())),
    isHighlighted: v.boolean(),
  })
    .index("by_business", ["businessOwnerClerkId"])
    .index("by_client", ["clientClerkId"])
    .index("by_highlighted", ["isHighlighted"]),

  // Quote Intake Forms
  intakeForms: defineTable({
    // Contact Information
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    
    // Project Details
    projectDescription: v.string(),
    imageUrls: v.optional(v.array(v.string())),
    videoUrls: v.optional(v.array(v.string())),
    
    // Status and Linking
    status: v.union(
      v.literal("submitted"),
      v.literal("claimed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    
    // Linking to profiles (optional until claimed/linked)
    businessOwnerClerkId: v.optional(v.string()),
    clientClerkId: v.optional(v.string()),
    
    // Timestamps
    submittedAt: v.number(),
    claimedAt: v.optional(v.number()),
    linkedAt: v.optional(v.number()),
    
    // Additional notes from business owner
    businessNotes: v.optional(v.string()),
    estimatedQuote: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_business_owner", ["businessOwnerClerkId"])
    .index("by_client", ["clientClerkId"])
    .index("by_submitted_date", ["submittedAt"]),

  // Meta/Facebook Integration Tables
  
  // Meta accounts - stores user's Facebook OAuth tokens and connected pages/IG accounts
  metaAccounts: defineTable({
    userId: v.string(), // Clerk userId
    longLivedUserToken: v.string(),
    tokenExpiresAt: v.optional(v.number()), // epoch timestamp
    facebookUserId: v.string(),
    connectedPages: v.array(v.object({
      pageId: v.string(),
      name: v.string(),
      pageAccessToken: v.optional(v.string()),
    })),
    instagramBusinessAccountId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_facebook_user", ["facebookUserId"]),

  // Facebook app credentials - encrypted storage per user
  facebookAppCredentials: defineTable({
    userId: v.string(), // Clerk userId
    encryptedAppId: v.string(), // Encrypted Facebook App ID
    encryptedAppSecret: v.string(), // Encrypted Facebook App Secret
    encryptedRedirectUri: v.string(), // Encrypted redirect URI
    appName: v.optional(v.string()), // User-friendly app name
    isActive: v.boolean(), // Whether this credential set is active
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  // Instagram media posts
  instagramMedia: defineTable({
    id: v.string(), // Instagram media ID (unique)
    userId: v.string(), // Clerk userId
    pageId: v.string(), // Facebook page ID
    caption: v.optional(v.string()),
    mediaType: v.string(), // IMAGE, VIDEO, CAROUSEL_ALBUM
    mediaUrl: v.string(),
    permalink: v.string(),
    timestamp: v.number(),
    children: v.optional(v.array(v.object({
      mediaType: v.string(),
      mediaUrl: v.string(),
    }))),
    createdAt: v.number(),
    fetchedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_page", ["pageId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_media_id", ["id"]),

  // Facebook page posts
  facebookPosts: defineTable({
    id: v.string(), // Facebook post ID (unique)
    userId: v.string(), // Clerk userId
    pageId: v.string(), // Facebook page ID
    message: v.optional(v.string()),
    permalinkUrl: v.string(),
    createdTime: v.number(),
    attachments: v.optional(v.array(v.object({
      mediaType: v.string(),
      mediaUrl: v.string(),
    }))),
    createdAt: v.number(),
    fetchedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_page", ["pageId"])
    .index("by_created_time", ["createdTime"])
    .index("by_post_id", ["id"]),

  // OAuth state management for CSRF protection
  oauthStates: defineTable({
    state: v.string(),
    userId: v.string(), // Clerk userId
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_state", ["state"])
    .index("by_user", ["userId"]),

  // Employee requests
  employeeRequests: defineTable({
    employeeClerkId: v.string(),
    companyId: v.id("profiles"), // Reference to the business owner's profile
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    requestedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()), // Clerk ID of the reviewer
    rejectionReason: v.optional(v.string()),
  })
    .index("by_company", ["companyId"])
    .index("by_employee", ["employeeClerkId"])
    .index("by_status", ["status"])
    .index("by_requested_date", ["requestedAt"]),
});
