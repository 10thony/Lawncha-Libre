import { query } from "./_generated/server";
import { v } from "convex/values";

export const loggedInUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.string(),
      _creationTime: v.number(),
      tokenIdentifier: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return {
      _id: identity.subject,
      _creationTime: Date.now(),
      tokenIdentifier: identity.tokenIdentifier,
    };
  },
});
