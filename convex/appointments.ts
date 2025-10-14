import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAvailableAppointments = query({
  args: {
    businessOwnerClerkId: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("appointments"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx, args) => {
    let appointments;
    
    if (args.businessOwnerClerkId) {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_business", (q) => 
          q.eq("businessOwnerClerkId", args.businessOwnerClerkId!)
        )
        .collect();
      
      appointments = appointments.filter(
        (a) => a.status === "available" && a.startDateTime > Date.now()
      );
    } else {
      appointments = await ctx.db
        .query("appointments")
        .collect();
      
      appointments = appointments.filter(
        (a) => a.status === "available" && a.startDateTime > Date.now()
      );
    }

    return appointments;
  },
});

export const getMyAppointments = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("appointments"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const clerkUserId = identity.subject;

    // Get profile to determine user type
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!profile) return [];

    let appointments;
    if (profile.userType === "business") {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", clerkUserId))
        .collect();
    } else {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_client", (q) => q.eq("clientClerkId", clerkUserId))
        .collect();
    }

    return appointments;
  },
});

export const createAppointmentSlot = mutation({
  args: {
    startDateTime: v.number(),
    endDateTime: v.number(),
  },
  returns: v.id("appointments"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!profile || profile.userType !== "business") {
      throw new Error("Only business owners can create appointment slots");
    }

    return await ctx.db.insert("appointments", {
      businessOwnerClerkId: clerkUserId,
      startDateTime: args.startDateTime,
      endDateTime: args.endDateTime,
      status: "available",
    });
  },
});

export const bookAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.status !== "available") {
      throw new Error("Appointment is not available");
    }

    await ctx.db.patch(args.appointmentId, {
      clientClerkId: clerkUserId,
      status: "booked",
      notes: args.notes,
    });
  },
});

export const updateAppointmentStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(
      v.literal("available"),
      v.literal("booked"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    // Check permissions
    if (appointment.businessOwnerClerkId !== clerkUserId && appointment.clientClerkId !== clerkUserId) {
      throw new Error("Not authorized to update this appointment");
    }

    const updates: any = { status: args.status };
    
    // If cancelling, remove client
    if (args.status === "cancelled" || args.status === "available") {
      updates.clientClerkId = undefined;
      updates.notes = undefined;
    }

    await ctx.db.patch(args.appointmentId, updates);
  },
});
