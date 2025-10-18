import { action, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Meta Content Fetching Actions
 * 
 * This module handles fetching content from Facebook Pages and Instagram Business accounts
 * using the Meta Graph API.
 * 
 * Documentation references:
 * - Instagram Graph API: https://developers.facebook.com/docs/instagram-api/
 * - IG user media: https://developers.facebook.com/docs/instagram-api/reference/ig-user/media
 * - IG media fields: https://developers.facebook.com/docs/instagram-api/reference/ig-media
 * - Facebook Page feed: https://developers.facebook.com/docs/graph-api/reference/page/feed/
 */

// Fetch Instagram media for user
export const fetchInstagramMedia = action({
  args: {
    afterCursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const metaAccount: any = await ctx.runMutation(internal.metaAuth.getMetaAccountByUser, { userId });

    if (!metaAccount) {
      throw new Error("No Meta account found. Please connect Facebook first.");
    }

    if (!metaAccount.instagramBusinessAccountId) {
      throw new Error("No Instagram Business account found. Please ensure your Instagram is linked to a Facebook Page.");
    }

    const { longLivedUserToken, instagramBusinessAccountId } = metaAccount;
    const limit = args.limit || 25;

    // Fetch Instagram media
    // Documentation: https://developers.facebook.com/docs/instagram-api/reference/ig-user/media
    const mediaUrl = new URL(`https://graph.facebook.com/v19.0/${instagramBusinessAccountId}/media`);
    mediaUrl.searchParams.set("access_token", longLivedUserToken);
    mediaUrl.searchParams.set("fields", "id,caption,media_type,media_url,permalink,timestamp,children{media_type,media_url}");
    mediaUrl.searchParams.set("limit", limit.toString());
    
    if (args.afterCursor) {
      mediaUrl.searchParams.set("after", args.afterCursor);
    }

    const response = await fetch(mediaUrl.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(`Instagram API error: ${data.error.message}`);
    }

    const mediaItems = data.data || [];
    const nextCursor = data.paging?.cursors?.after;

    // Store media items in database
    const storedItems = [];
    for (const item of mediaItems) {
      try {
        const storedItem: any = await ctx.runMutation(internal.metaContent.storeInstagramMedia, {
          userId,
          pageId: metaAccount.connectedPages[0]?.pageId || "",
          mediaData: item,
        });
        storedItems.push(storedItem);
      } catch (error) {
        console.warn(`Failed to store Instagram media ${item.id}:`, error);
      }
    }

    return {
      media: storedItems,
      nextCursor,
      hasMore: !!nextCursor,
    };
  },
});

// Fetch Facebook posts for a specific page
export const fetchFacebookPosts = action({
  args: {
    pageId: v.string(),
    afterCursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const metaAccount: any = await ctx.runMutation(internal.metaAuth.getMetaAccountByUser, { userId });

    if (!metaAccount) {
      throw new Error("No Meta account found. Please connect Facebook first.");
    }

    // Find the page access token
    const page = metaAccount.connectedPages.find((p: any) => p.pageId === args.pageId);
    if (!page) {
      throw new Error("Page not found in connected pages");
    }

    const pageAccessToken = page.pageAccessToken || metaAccount.longLivedUserToken;
    const limit = args.limit || 25;

    // Fetch Facebook page posts
    // Documentation: https://developers.facebook.com/docs/graph-api/reference/page/feed/
    const postsUrl = new URL(`https://graph.facebook.com/v19.0/${args.pageId}/feed`);
    postsUrl.searchParams.set("access_token", pageAccessToken);
    postsUrl.searchParams.set("fields", "id,message,permalink_url,created_time,attachments{media_type,media_url}");
    postsUrl.searchParams.set("limit", limit.toString());
    
    if (args.afterCursor) {
      postsUrl.searchParams.set("after", args.afterCursor);
    }

    const response = await fetch(postsUrl.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(`Facebook API error: ${data.error.message}`);
    }

    const posts = data.data || [];
    const nextCursor = data.paging?.cursors?.after;

    // Store posts in database
    const storedPosts = [];
    for (const post of posts) {
      try {
        const storedPost: any = await ctx.runMutation(internal.metaContent.storeFacebookPost, {
          userId,
          pageId: args.pageId,
          postData: post,
        });
        storedPosts.push(storedPost);
      } catch (error) {
        console.warn(`Failed to store Facebook post ${post.id}:`, error);
      }
    }

    return {
      posts: storedPosts,
      nextCursor,
      hasMore: !!nextCursor,
    };
  },
});

// Store Instagram media in database
export const storeInstagramMedia = internalMutation({
  args: {
    userId: v.string(),
    pageId: v.string(),
    mediaData: v.object({
      id: v.string(),
      caption: v.optional(v.string()),
      media_type: v.string(),
      media_url: v.string(),
      permalink: v.string(),
      timestamp: v.string(),
      children: v.optional(v.object({
        data: v.array(v.object({
          media_type: v.string(),
          media_url: v.string(),
        })),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, pageId, mediaData } = args;
    const now = Date.now();

    // Check if media already exists
    const existing = await ctx.db
      .query("instagramMedia")
      .withIndex("by_media_id", (q: any) => q.eq("id", mediaData.id))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        caption: mediaData.caption,
        mediaUrl: mediaData.media_url,
        permalink: mediaData.permalink,
        fetchedAt: now,
        children: mediaData.children?.data?.map((child: any) => ({
          mediaType: child.media_type,
          mediaUrl: child.media_url,
        })) || undefined,
      });
      return existing;
    }

    // Create new record
    const children = mediaData.children?.data?.map((child: any) => ({
      mediaType: child.media_type,
      mediaUrl: child.media_url,
    })) || undefined;
    
    return await ctx.db.insert("instagramMedia", {
      id: mediaData.id,
      userId,
      pageId,
      caption: mediaData.caption,
      mediaType: mediaData.media_type,
      mediaUrl: mediaData.media_url,
      permalink: mediaData.permalink,
      timestamp: new Date(mediaData.timestamp).getTime(),
      children,
      createdAt: now,
      fetchedAt: now,
    });
  },
});

// Store Facebook post in database
export const storeFacebookPost = internalMutation({
  args: {
    userId: v.string(),
    pageId: v.string(),
    postData: v.object({
      id: v.string(),
      message: v.optional(v.string()),
      permalink_url: v.string(),
      created_time: v.string(),
      attachments: v.optional(v.object({
        data: v.array(v.object({
          media_type: v.string(),
          media_url: v.string(),
        })),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, pageId, postData } = args;
    const now = Date.now();

    // Check if post already exists
    const existing = await ctx.db
      .query("facebookPosts")
      .withIndex("by_post_id", (q: any) => q.eq("id", postData.id))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        message: postData.message,
        permalinkUrl: postData.permalink_url,
        fetchedAt: now,
        attachments: postData.attachments?.data?.map((attachment: any) => ({
          mediaType: attachment.media_type,
          mediaUrl: attachment.media_url,
        })) || undefined,
      });
      return existing;
    }

    // Create new record
    const attachments = postData.attachments?.data?.map((attachment: any) => ({
      mediaType: attachment.media_type,
      mediaUrl: attachment.media_url,
    })) || undefined;
    
    return await ctx.db.insert("facebookPosts", {
      id: postData.id,
      userId,
      pageId,
      message: postData.message,
      permalinkUrl: postData.permalink_url,
      createdTime: new Date(postData.created_time).getTime(),
      attachments,
      createdAt: now,
      fetchedAt: now,
    });
  },
});

// Refresh long-lived token if needed
export const refreshLongLivedTokenIfNeeded = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const metaAccount = await ctx.runMutation(internal.metaAuth.getMetaAccountByUser, { userId });

    if (!metaAccount) {
      return { refreshed: false, reason: "No Meta account found" };
    }

    // Check if token is close to expiry (within 7 days)
    const now = Date.now();
    const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
    
    if (!metaAccount.tokenExpiresAt || metaAccount.tokenExpiresAt > sevenDaysFromNow) {
      return { refreshed: false, reason: "Token not close to expiry" };
    }

    // Get user's Facebook app credentials
    const credentials = await ctx.runAction(internal.encryption.getActiveFacebookCredentials, { userId });
    
    if (!credentials) {
      throw new Error("No Facebook app credentials configured");
    }

    const { appId: fbAppId, appSecret: fbAppSecret } = credentials;

    // Attempt to refresh the token
    // Documentation: https://developers.facebook.com/docs/facebook-login/access-tokens/refreshing/
    const refreshUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    refreshUrl.searchParams.set("grant_type", "fb_exchange_token");
    refreshUrl.searchParams.set("client_id", fbAppId);
    refreshUrl.searchParams.set("client_secret", fbAppSecret);
    refreshUrl.searchParams.set("fb_exchange_token", metaAccount.longLivedUserToken);

    const response = await fetch(refreshUrl.toString());
    const data = await response.json();

    if (data.error) {
      return { refreshed: false, reason: `Refresh failed: ${data.error.message}` };
    }

    const newToken = data.access_token;
    const expiresIn = data.expires_in || 0;
    const newExpiresAt = expiresIn > 0 ? now + (expiresIn * 1000) : undefined;

    // Update the account with new token
    await ctx.runMutation(internal.metaAuth.updateMetaAccount, {
      accountId: metaAccount._id,
      userId: metaAccount.userId,
      longLivedUserToken: newToken,
      tokenExpiresAt: newExpiresAt,
      facebookUserId: metaAccount.facebookUserId,
      connectedPages: metaAccount.connectedPages,
      instagramBusinessAccountId: metaAccount.instagramBusinessAccountId,
      createdAt: metaAccount.createdAt,
      updatedAt: now,
    });

    return { refreshed: true, expiresAt: newExpiresAt };
  },
});

// Internal mutation to get all Meta accounts
export const getAllMetaAccounts = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("metaAccounts").collect();
  },
});

// Scheduled job to refresh tokens and fetch new content
export const scheduledContentSync = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Starting scheduled content sync...");

    // Get all Meta accounts
    const accounts = await ctx.runMutation(internal.metaContent.getAllMetaAccounts, {});

    for (const account of accounts) {
      try {
        // Check if token needs refresh
        const refreshResult = await ctx.runAction(api.metaContent.refreshLongLivedTokenIfNeeded, {});
        
        if (refreshResult.refreshed) {
          console.log(`Refreshed token for user ${account.userId}`);
        }

        // Fetch latest Instagram media
        if (account.instagramBusinessAccountId) {
          try {
            await ctx.runAction(api.metaContent.fetchInstagramMedia, {
              limit: 10, // Fetch only recent posts in scheduled sync
            });
            console.log(`Synced Instagram content for user ${account.userId}`);
          } catch (error) {
            console.warn(`Failed to sync Instagram content for user ${account.userId}:`, error);
          }
        }

        // Fetch latest Facebook posts for each connected page
        for (const page of account.connectedPages) {
          try {
            await ctx.runAction(api.metaContent.fetchFacebookPosts, {
              pageId: page.pageId,
              limit: 10, // Fetch only recent posts in scheduled sync
            });
            console.log(`Synced Facebook content for page ${page.pageId}`);
          } catch (error) {
            console.warn(`Failed to sync Facebook content for page ${page.pageId}:`, error);
          }
        }
      } catch (error) {
        console.error(`Failed to sync content for user ${account.userId}:`, error);
      }
    }

    console.log("Completed scheduled content sync");
  },
});
