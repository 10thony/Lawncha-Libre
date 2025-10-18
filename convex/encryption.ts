import { internalAction, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Encryption Utilities for Facebook App Credentials
 * 
 * This module provides secure encryption/decryption functions for storing
 * Facebook app credentials per user. Uses AES-256-GCM encryption with
 * user-specific keys derived from Clerk user ID.
 * 
 * Security features:
 * - AES-256-GCM encryption for authenticated encryption
 * - User-specific encryption keys derived from Clerk user ID
 * - Random IV for each encryption operation
 * - Authentication tags to prevent tampering
 * 
 * Documentation references:
 * - Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
 * - AES-GCM: https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams
 */

// Get encryption key for a specific user
async function getUserEncryptionKey(userId: string): Promise<CryptoKey> {
  // Derive a user-specific key from the user ID and a master secret
  const masterSecret = process.env.ENCRYPTION_MASTER_SECRET;
  if (!masterSecret) {
    throw new Error("ENCRYPTION_MASTER_SECRET environment variable not set");
  }

  // Create a key material from user ID + master secret
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(userId + masterSecret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive the actual encryption key
  const salt = new TextEncoder().encode("facebook-credentials-salt");
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt a string value
export const encryptValue = internalAction({
  args: {
    userId: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const key = await getUserEncryptionKey(args.userId);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the value
      const encrypted = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        new TextEncoder().encode(args.value)
      );

      // Combine IV + encrypted data + auth tag
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Return base64 encoded result
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt value");
    }
  },
});

// Decrypt a string value
export const decryptValue = internalAction({
  args: {
    userId: v.string(),
    encryptedValue: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const key = await getUserEncryptionKey(args.userId);
      
      // Decode base64
      const combined = new Uint8Array(
        atob(args.encryptedValue)
          .split("")
          .map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      // Decrypt the value
      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encrypted
      );

      // Return decrypted string
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt value");
    }
  },
});

// Internal mutation to store encrypted credentials
export const storeEncryptedCredentials = internalMutation({
  args: {
    userId: v.string(),
    encryptedAppId: v.string(),
    encryptedAppSecret: v.string(),
    encryptedRedirectUri: v.string(),
    appName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Deactivate any existing credentials for this user
    const existingCredentials = await ctx.db
      .query("facebookAppCredentials")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();

    for (const cred of existingCredentials) {
      await ctx.db.patch(cred._id, { isActive: false });
    }

    // Store new credentials
    return await ctx.db.insert("facebookAppCredentials", {
      userId: args.userId,
      encryptedAppId: args.encryptedAppId,
      encryptedAppSecret: args.encryptedAppSecret,
      encryptedRedirectUri: args.encryptedRedirectUri,
      appName: args.appName || "Facebook App",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Store encrypted Facebook app credentials
export const storeFacebookCredentials = internalAction({
  args: {
    userId: v.string(),
    appId: v.string(),
    appSecret: v.string(),
    redirectUri: v.string(),
    appName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Validate inputs
    if (!args.appId || args.appId.length < 10) {
      throw new Error("Invalid Facebook App ID");
    }
    
    if (!args.appSecret || args.appSecret.length < 20) {
      throw new Error("Invalid Facebook App Secret");
    }
    
    if (!args.redirectUri || !args.redirectUri.startsWith('http')) {
      throw new Error("Invalid redirect URI. Must be a valid HTTP/HTTPS URL");
    }

    // Encrypt all sensitive values
    const encryptedAppId: string = await ctx.runAction(internal.encryption.encryptValue, {
      userId: args.userId,
      value: args.appId,
    });

    const encryptedAppSecret: string = await ctx.runAction(internal.encryption.encryptValue, {
      userId: args.userId,
      value: args.appSecret,
    });

    const encryptedRedirectUri: string = await ctx.runAction(internal.encryption.encryptValue, {
      userId: args.userId,
      value: args.redirectUri,
    });

    // Store encrypted credentials using mutation
    return await ctx.runMutation(internal.encryption.storeEncryptedCredentials, {
      userId: args.userId,
      encryptedAppId,
      encryptedAppSecret,
      encryptedRedirectUri,
      appName: args.appName,
    });
  },
});

// Internal mutation to get encrypted credentials
export const getEncryptedCredentials = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("facebookAppCredentials")
      .withIndex("by_user_active", (q: any) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();
  },
});

// Get active Facebook app credentials for a user
export const getActiveFacebookCredentials = internalAction({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const credentials: any = await ctx.runMutation(internal.encryption.getEncryptedCredentials, { userId: args.userId });

    if (!credentials) {
      return null;
    }

    // Decrypt the credentials
    const appId: string = await ctx.runAction(internal.encryption.decryptValue, {
      userId: args.userId,
      encryptedValue: credentials.encryptedAppId,
    });

    const appSecret: string = await ctx.runAction(internal.encryption.decryptValue, {
      userId: args.userId,
      encryptedValue: credentials.encryptedAppSecret,
    });

    const redirectUri: string = await ctx.runAction(internal.encryption.decryptValue, {
      userId: args.userId,
      encryptedValue: credentials.encryptedRedirectUri,
    });

    return {
      appId,
      appSecret,
      redirectUri,
      appName: credentials.appName,
      createdAt: credentials.createdAt,
      updatedAt: credentials.updatedAt,
    };
  },
});

// Internal mutation to get all user credentials
export const getAllUserCredentials = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("facebookAppCredentials")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get all Facebook app credentials for a user (without decryption)
export const getUserFacebookCredentials = internalAction({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runMutation(internal.encryption.getAllUserCredentials, { userId: args.userId });
  },
});

// Public query to get user's Facebook credentials (for client-side access)
export const getUserFacebookCredentialsQuery = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("facebookAppCredentials")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Internal mutation to delete credentials
export const deleteCredentials = internalMutation({
  args: {
    credentialId: v.id("facebookAppCredentials"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.credentialId);
  },
});

// Delete Facebook app credentials
export const deleteFacebookCredentials = internalAction({
  args: {
    credentialId: v.id("facebookAppCredentials"),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runMutation(internal.encryption.deleteCredentials, { credentialId: args.credentialId });
  },
});

// Internal mutation to update credentials
export const updateCredentials = internalMutation({
  args: {
    credentialId: v.id("facebookAppCredentials"),
    updateData: v.object({
      encryptedAppId: v.optional(v.string()),
      encryptedAppSecret: v.optional(v.string()),
      encryptedRedirectUri: v.optional(v.string()),
      appName: v.optional(v.string()),
      updatedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.credentialId, args.updateData);
  },
});

// Update Facebook app credentials
export const updateFacebookCredentials = internalAction({
  args: {
    credentialId: v.id("facebookAppCredentials"),
    userId: v.string(),
    appId: v.optional(v.string()),
    appSecret: v.optional(v.string()),
    redirectUri: v.optional(v.string()),
    appName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const { credentialId, userId, ...updates } = args;
    const now = Date.now();

    // Get existing credentials
    const existing = await ctx.runMutation(internal.encryption.getEncryptedCredentials, { userId });
    if (!existing) {
      throw new Error("Credentials not found");
    }

    const updateData: {
      encryptedAppId?: string;
      encryptedAppSecret?: string;
      encryptedRedirectUri?: string;
      appName?: string;
      updatedAt: number;
    } = {
      updatedAt: now,
    };

    // Encrypt updated values if provided
    if (updates.appId) {
      updateData.encryptedAppId = await ctx.runAction(internal.encryption.encryptValue, {
        userId,
        value: updates.appId,
      });
    }

    if (updates.appSecret) {
      updateData.encryptedAppSecret = await ctx.runAction(internal.encryption.encryptValue, {
        userId,
        value: updates.appSecret,
      });
    }

    if (updates.redirectUri) {
      updateData.encryptedRedirectUri = await ctx.runAction(internal.encryption.encryptValue, {
        userId,
        value: updates.redirectUri,
      });
    }

    if (updates.appName) {
      updateData.appName = updates.appName;
    }

    return await ctx.runMutation(internal.encryption.updateCredentials, {
      credentialId,
      updateData,
    });
  },
});

// Validate Facebook app credentials by making a test API call
export const validateFacebookCredentials = internalAction({
  args: {
    userId: v.string(),
    appId: v.string(),
    appSecret: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Test the credentials by making a simple API call
      const testUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
      testUrl.searchParams.set("client_id", args.appId);
      testUrl.searchParams.set("client_secret", args.appSecret);
      testUrl.searchParams.set("grant_type", "client_credentials");

      const response = await fetch(testUrl.toString(), {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          valid: false,
          error: errorData.error?.message || "Invalid credentials",
        };
      }

      const data = await response.json();
      
      if (data.error) {
        return {
          valid: false,
          error: data.error.message,
        };
      }

      return {
        valid: true,
        appId: args.appId,
        appName: "Facebook App", // We could fetch this from the API if needed
      };
    } catch (error) {
      console.error("Credential validation error:", error);
      return {
        valid: false,
        error: "Network error during validation",
      };
    }
  },
});
