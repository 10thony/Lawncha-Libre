import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      clerkUserId: v.string(),
      name: v.string(),
      userType: v.union(v.literal("client"), v.literal("business"), v.literal("employee")),
      businessName: v.optional(v.string()),
      businessDescription: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      services: v.optional(v.array(v.string())),
      companyId: v.optional(v.id("profiles")),
      employeeStatus: v.optional(v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )),
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
    name: v.string(),
    userType: v.union(v.literal("client"), v.literal("business"), v.literal("employee")),
    businessName: v.optional(v.string()),
    businessDescription: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
    companyId: v.optional(v.id("profiles")),
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
      employeeStatus: args.userType === "employee" ? "pending" : undefined,
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
      name: v.string(),
      userType: v.union(v.literal("client"), v.literal("business"), v.literal("employee")),
      businessName: v.optional(v.string()),
      businessDescription: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      services: v.optional(v.array(v.string())),
      companyId: v.optional(v.id("profiles")),
      employeeStatus: v.optional(v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )),
    })
  ),
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("profiles")
      .collect();

    return profiles.filter((profile) => profile.userType === "business");
  },
});

// Employee management functions
export const createEmployeeRequest = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    companyId: v.id("profiles"),
  },
  returns: v.id("employeeRequests"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if company exists and is a business
    const company = await ctx.db.get(args.companyId);
    if (!company || company.userType !== "business") {
      throw new Error("Invalid company selected");
    }

    // Check if employee request already exists for this user and company
    const existingRequest = await ctx.db
      .query("employeeRequests")
      .withIndex("by_employee", (q) => q.eq("employeeClerkId", identity.subject))
      .filter((q) => q.eq(q.field("companyId"), args.companyId))
      .first();

    if (existingRequest) {
      throw new Error("You have already submitted a request to join this company");
    }

    return await ctx.db.insert("employeeRequests", {
      employeeClerkId: identity.subject,
      requestedAt: Date.now(),
      status: "pending",
      ...args,
    });
  },
});

export const getEmployeeRequests = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("employeeRequests"),
      _creationTime: v.number(),
      employeeClerkId: v.string(),
      companyId: v.id("profiles"),
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
      reviewedBy: v.optional(v.string()),
      rejectionReason: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get current user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!profile || profile.userType !== "business") {
      return [];
    }

    // Get all employee requests for this business
    const requests = await ctx.db
      .query("employeeRequests")
      .withIndex("by_company", (q) => q.eq("companyId", profile._id))
      .collect();

    return requests;
  },
});

export const approveEmployeeRequest = mutation({
  args: {
    requestId: v.id("employeeRequests"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get current user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!profile || profile.userType !== "business") {
      throw new Error("Only business owners can approve employee requests");
    }

    // Get the employee request
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Employee request not found");

    if (request.companyId !== profile._id) {
      throw new Error("You can only approve requests for your own company");
    }

    if (request.status !== "pending") {
      throw new Error("Request has already been processed");
    }

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedAt: Date.now(),
      reviewedBy: identity.subject,
    });

    // Update the employee's profile
    const employeeProfile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", request.employeeClerkId))
      .unique();

    if (employeeProfile) {
      await ctx.db.patch(employeeProfile._id, {
        employeeStatus: "approved",
        companyId: profile._id,
      });
    }
  },
});

export const rejectEmployeeRequest = mutation({
  args: {
    requestId: v.id("employeeRequests"),
    rejectionReason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get current user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!profile || profile.userType !== "business") {
      throw new Error("Only business owners can reject employee requests");
    }

    // Get the employee request
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Employee request not found");

    if (request.companyId !== profile._id) {
      throw new Error("You can only reject requests for your own company");
    }

    if (request.status !== "pending") {
      throw new Error("Request has already been processed");
    }

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedAt: Date.now(),
      reviewedBy: identity.subject,
      rejectionReason: args.rejectionReason,
    });

    // Update the employee's profile
    const employeeProfile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", request.employeeClerkId))
      .unique();

    if (employeeProfile) {
      await ctx.db.patch(employeeProfile._id, {
        employeeStatus: "rejected",
      });
    }
  },
});

export const getCompanyEmployees = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      clerkUserId: v.string(),
      name: v.string(),
      userType: v.union(v.literal("client"), v.literal("business"), v.literal("employee")),
      businessName: v.optional(v.string()),
      businessDescription: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      services: v.optional(v.array(v.string())),
      companyId: v.optional(v.id("profiles")),
      employeeStatus: v.optional(v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get current user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!profile || profile.userType !== "business") {
      return [];
    }

    // Get all employees for this company
    const employees = await ctx.db
      .query("profiles")
      .withIndex("by_company", (q) => q.eq("companyId", profile._id))
      .collect();

    return employees.filter((employee) => employee.userType === "employee");
  },
});
