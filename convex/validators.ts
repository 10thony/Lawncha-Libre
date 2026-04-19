import { v } from "convex/values";

/** Facebook Page connected to a Meta user — shared by schema and mutations. */
export const vConnectedPage = v.object({
  pageId: v.string(),
  name: v.string(),
  pageAccessToken: v.optional(v.string()),
});

/** Stored nested media row (Instagram carousel child or Facebook attachment). */
export const vNestedMedia = v.object({
  mediaType: v.string(),
  mediaUrl: v.string(),
});
