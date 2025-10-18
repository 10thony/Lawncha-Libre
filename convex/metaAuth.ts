import { action, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Facebook OAuth and Meta Graph API Integration
 * 
 * This module handles:
 * - Facebook OAuth flow initiation and callback handling
 * - Token exchange and management
 * - Page discovery and Instagram Business account linking
 * - Content fetching from Facebook Pages and Instagram
 * 
 * Documentation references:
 * - Facebook Login Overview: https://developers.facebook.com/docs/facebook-login/
 * - Manual OAuth flow: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 * - Access Tokens: https://developers.facebook.com/docs/facebook-login/access-tokens/
 * - Graph API reference: https://developers.facebook.com/docs/graph-api/
 * - Instagram Graph API: https://developers.facebook.com/docs/instagram-api/
 */

// Generate OAuth state and return authorization URL
export const beginFacebookContentAuth = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    
    // Get user's Facebook app credentials
    const credentials = await ctx.runAction(internal.encryption.getActiveFacebookCredentials, { userId });
    
    if (!credentials) {
      throw new Error("No Facebook app credentials configured. Please set up your Facebook app credentials first.");
    }

    const { appId, redirectUri } = credentials;
    
    // Generate random state for CSRF protection
    const state = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + (10 * 60 * 1000); // 10 minutes

    // Store state in database
    await ctx.runMutation(internal.metaAuth.storeOAuthState, {
      state,
      userId,
      createdAt: now,
      expiresAt,
    });

    // Build Facebook OAuth URL
    // Documentation: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
    const scopes = [
      "public_profile",
      "pages_show_list", 
      "pages_read_engagement",
      "instagram_basic"
    ].join(",");

    const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("response_type", "code");

    return {
      authUrl: authUrl.toString(),
      state,
    };
  },
});

// Store OAuth state for CSRF protection
export const storeOAuthState = internalMutation({
  args: {
    state: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("oauthStates", {
      state: args.state,
      userId: args.userId,
      createdAt: args.createdAt,
      expiresAt: args.expiresAt,
    });
  },
});

// Handle Facebook OAuth callback
export const handleFacebookCallback = action({
  args: {
    code: v.string(),
    state: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Validate state
    const stateRecord = await ctx.runMutation(internal.metaAuth.validateOAuthState, {
      state: args.state,
      userId,
    });

    if (!stateRecord) {
      throw new Error("Invalid or expired OAuth state");
    }

    // Get user's Facebook app credentials
    const credentials = await ctx.runAction(internal.encryption.getActiveFacebookCredentials, { userId });
    
    if (!credentials) {
      throw new Error("No Facebook app credentials configured. Please set up your Facebook app credentials first.");
    }

    const { appId: fbAppId, appSecret: fbAppSecret, redirectUri } = credentials;

    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", fbAppId);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("client_secret", fbAppSecret);
    tokenUrl.searchParams.set("code", args.code);

    const tokenResponse = await fetch(tokenUrl.toString(), {
      method: "POST",
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`Facebook API error: ${tokenData.error.message}`);
    }

    const shortLivedToken = tokenData.access_token;

    // Exchange short-lived token for long-lived token
    // Documentation: https://developers.facebook.com/docs/facebook-login/access-tokens/
    const longLivedUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", fbAppId);
    longLivedUrl.searchParams.set("client_secret", fbAppSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());

    if (!longLivedResponse.ok) {
      const errorText = await longLivedResponse.text();
      throw new Error(`Long-lived token exchange failed: ${errorText}`);
    }

    const longLivedData = await longLivedResponse.json();
    
    if (longLivedData.error) {
      throw new Error(`Facebook API error: ${longLivedData.error.message}`);
    }

    const longLivedToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in || 0;
    const tokenExpiresAt = expiresIn > 0 ? Date.now() + (expiresIn * 1000) : undefined;

    // Get Facebook user info
    const userInfoUrl = new URL("https://graph.facebook.com/v19.0/me");
    userInfoUrl.searchParams.set("access_token", longLivedToken);
    userInfoUrl.searchParams.set("fields", "id,name");

    const userInfoResponse = await fetch(userInfoUrl.toString());
    const userInfo = await userInfoResponse.json();

    if (userInfo.error) {
      throw new Error(`Failed to get user info: ${userInfo.error.message}`);
    }

    // Store or update Meta account
    const existingAccount = await ctx.runMutation(internal.metaAuth.getMetaAccountByUser, { userId });
    
    const now = Date.now();
    const accountData = {
      userId,
      longLivedUserToken: longLivedToken,
      tokenExpiresAt,
      facebookUserId: userInfo.id,
      connectedPages: [],
      instagramBusinessAccountId: undefined,
      createdAt: existingAccount ? existingAccount.createdAt : now,
      updatedAt: now,
    };

    if (existingAccount) {
      await ctx.runMutation(internal.metaAuth.updateMetaAccount, {
        accountId: existingAccount._id,
        ...accountData,
      });
    } else {
      await ctx.runMutation(internal.metaAuth.createMetaAccount, accountData);
    }

    // Clean up OAuth state
    await ctx.runMutation(internal.metaAuth.cleanupOAuthState, { state: args.state });

    // Discover pages and Instagram account
    await ctx.runAction(api.metaAuth.discoverPagesAndIgAccount, {});

    return {
      success: true,
      facebookUserId: userInfo.id,
      facebookUserName: userInfo.name,
    };
  },
});

// Validate OAuth state
export const validateOAuthState = internalMutation({
  args: {
    state: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const stateRecord = await ctx.db
      .query("oauthStates")
      .withIndex("by_state", (q: any) => q.eq("state", args.state))
      .first();

    if (!stateRecord) {
      return null;
    }

    // Check if state belongs to user and is not expired
    if (stateRecord.userId !== args.userId || stateRecord.expiresAt < Date.now()) {
      return null;
    }

    return stateRecord;
  },
});

// Create Meta account
export const createMetaAccount = internalMutation({
  args: {
    userId: v.string(),
    longLivedUserToken: v.string(),
    tokenExpiresAt: v.optional(v.number()),
    facebookUserId: v.string(),
    connectedPages: v.array(v.object({
      pageId: v.string(),
      name: v.string(),
      pageAccessToken: v.optional(v.string()),
    })),
    instagramBusinessAccountId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("metaAccounts", args);
  },
});

// Update Meta account
export const updateMetaAccount = internalMutation({
  args: {
    accountId: v.id("metaAccounts"),
    userId: v.string(),
    longLivedUserToken: v.string(),
    tokenExpiresAt: v.optional(v.number()),
    facebookUserId: v.string(),
    connectedPages: v.array(v.object({
      pageId: v.string(),
      name: v.string(),
      pageAccessToken: v.optional(v.string()),
    })),
    instagramBusinessAccountId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { accountId, ...updateData } = args;
    await ctx.db.patch(accountId, updateData);
  },
});

// Clean up OAuth state
export const cleanupOAuthState = internalMutation({
  args: {
    state: v.string(),
  },
  handler: async (ctx, args) => {
    const stateRecord = await ctx.db
      .query("oauthStates")
      .withIndex("by_state", (q: any) => q.eq("state", args.state))
      .first();

    if (stateRecord) {
      await ctx.db.delete(stateRecord._id);
    }
  },
});

// Get Meta account by user
export const getMetaAccountByUser = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("metaAccounts")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();
  },
});

// Discover connected pages and Instagram Business account
export const discoverPagesAndIgAccount = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const metaAccount = await ctx.runMutation(internal.metaAuth.getMetaAccountByUser, { userId });

    if (!metaAccount) {
      throw new Error("No Meta account found. Please connect Facebook first.");
    }

    const { longLivedUserToken } = metaAccount;

    // Get user's pages
    // Documentation: https://developers.facebook.com/docs/graph-api/reference/user/accounts/
    const pagesUrl = new URL("https://graph.facebook.com/v19.0/me/accounts");
    pagesUrl.searchParams.set("access_token", longLivedUserToken);
    pagesUrl.searchParams.set("fields", "id,name,access_token");

    const pagesResponse = await fetch(pagesUrl.toString());
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      throw new Error(`Failed to get pages: ${pagesData.error.message}`);
    }

    const connectedPages = pagesData.data || [];

    // Find Instagram Business account for each page
    let instagramBusinessAccountId: string | undefined;
    
    for (const page of connectedPages) {
      try {
        // Documentation: https://developers.facebook.com/docs/instagram-api/guides/business-discovery/
        const pageInfoUrl = new URL(`https://graph.facebook.com/v19.0/${page.id}`);
        pageInfoUrl.searchParams.set("access_token", longLivedUserToken);
        pageInfoUrl.searchParams.set("fields", "instagram_business_account");

        const pageInfoResponse = await fetch(pageInfoUrl.toString());
        const pageInfo = await pageInfoResponse.json();

        if (pageInfo.instagram_business_account?.id) {
          instagramBusinessAccountId = pageInfo.instagram_business_account.id;
          break; // Use the first IG Business account found
        }
      } catch (error) {
        console.warn(`Failed to get Instagram account for page ${page.id}:`, error);
      }
    }

    // Update Meta account with discovered pages and IG account
    await ctx.runMutation(internal.metaAuth.updateMetaAccount, {
      accountId: metaAccount._id,
      userId: metaAccount.userId,
      longLivedUserToken: metaAccount.longLivedUserToken,
      tokenExpiresAt: metaAccount.tokenExpiresAt,
      facebookUserId: metaAccount.facebookUserId,
      connectedPages,
      instagramBusinessAccountId,
      createdAt: metaAccount.createdAt,
      updatedAt: Date.now(),
    });

    return {
      connectedPages,
      instagramBusinessAccountId,
    };
  },
});

// Disconnect Meta account
export const disconnectMetaAccount = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const metaAccount = await ctx.runMutation(internal.metaAuth.getMetaAccountByUser, { userId });

    if (!metaAccount) {
      throw new Error("No Meta account found");
    }

    // Delete Meta account and associated data
    await ctx.runMutation(internal.metaAuth.deleteMetaAccount, { accountId: metaAccount._id });
    await ctx.runMutation(internal.metaAuth.deleteUserInstagramMedia, { userId });
    await ctx.runMutation(internal.metaAuth.deleteUserFacebookPosts, { userId });

    return { success: true };
  },
});

// Delete Meta account
export const deleteMetaAccount = internalMutation({
  args: {
    accountId: v.id("metaAccounts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.accountId);
  },
});

// Delete user's Instagram media
export const deleteUserInstagramMedia = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const media = await ctx.db
      .query("instagramMedia")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();

    for (const item of media) {
      await ctx.db.delete(item._id);
    }
  },
});

// Delete user's Facebook posts
export const deleteUserFacebookPosts = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("facebookPosts")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();

    for (const post of posts) {
      await ctx.db.delete(post._id);
    }
  },
});
