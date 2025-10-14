import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAvailableAppointments = query({
  args: {
    businessOwnerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let appointments;
    
    if (args.businessOwnerId) {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_business", (q) => 
          q.eq("businessOwnerId", args.businessOwnerId!)
        )
        .filter((q) => q.eq(q.field("status"), "available"))
        .filter((q) => q.gt(q.field("startDateTime"), Date.now()))
        .collect();
    } else {
      appointments = await ctx.db
        .query("appointments")
        .filter((q) => q.eq(q.field("status"), "available"))
        .filter((q) => q.gt(q.field("startDateTime"), Date.now()))
        .collect();
    }

    return appointments;

    return appointments;
  },
});

export const getMyAppointments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get profile to determine user type
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return [];

    let appointments;
    if (profile.userType === "business") {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_business", (q) => q.eq("businessOwnerId", userId))
        .collect();
    } else {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_client", (q) => q.eq("clientId", userId))
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
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.userType !== "business") {
      throw new Error("Only business owners can create appointment slots");
    }

    return await ctx.db.insert("appointments", {
      businessOwnerId: userId,
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
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.status !== "available") {
      throw new Error("Appointment is not available");
    }

    await ctx.db.patch(args.appointmentId, {
      clientId: userId,
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
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    // Check permissions
    if (appointment.businessOwnerId !== userId && appointment.clientId !== userId) {
      throw new Error("Not authorized to update this appointment");
    }

    const updates: any = { status: args.status };
    
    // If cancelling, remove client
    if (args.status === "cancelled" || args.status === "available") {
      updates.clientId = undefined;
      updates.notes = undefined;
    }

    await ctx.db.patch(args.appointmentId, updates);
  },
});
