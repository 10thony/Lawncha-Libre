import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

/**
 * Scheduled Jobs for Meta Content Sync
 * 
 * This module defines scheduled jobs for:
 * - Refreshing Facebook access tokens
 * - Syncing Instagram and Facebook content
 * 
 * Documentation references:
 * - Convex Scheduling: https://docs.convex.dev/scheduling
 * - Facebook Token Refresh: https://developers.facebook.com/docs/facebook-login/access-tokens/refreshing/
 */

const crons = cronJobs();

// Sync content every 6 hours
crons.daily(
  "sync social content",
  { hourUTC: 0, minuteUTC: 0 }, // Run at midnight UTC
  internal.metaContent.scheduledContentSync
);

// Also run every 6 hours throughout the day
crons.interval(
  "sync social content interval",
  { hours: 6 },
  internal.metaContent.scheduledContentSync
);

export default crons;
