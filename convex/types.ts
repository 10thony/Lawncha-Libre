/**
 * Application types aligned with `convex/schema.ts` and Convex-generated `Doc` / `Id`.
 * Use these (and `Doc<"tableName">`) in handlers instead of `any`.
 */
export type { Doc, Id, TableNames } from "./_generated/dataModel";

import type { Doc, Id } from "./_generated/dataModel";

/** Table document aliases */
export type ProfileDoc = Doc<"profiles">;
export type ProfileId = Id<"profiles">;
export type AppointmentDoc = Doc<"appointments">;
export type ProjectDoc = Doc<"projects">;
export type ProjectId = Id<"projects">;
export type IntakeFormDoc = Doc<"intakeForms">;
export type MetaAccountDoc = Doc<"metaAccounts">;
export type FacebookAppCredentialsDoc = Doc<"facebookAppCredentials">;
export type InstagramMediaDoc = Doc<"instagramMedia">;
export type FacebookPostDoc = Doc<"facebookPosts">;

/** Meta Graph API — IG user media carousel child (snake_case as returned by Graph) */
export type IgGraphCarouselChild = {
  media_type: string;
  media_url: string;
};

/** One IG media object from `/{ig-user-id}/media` (matches `storeInstagramMedia` args). */
export type IgGraphMediaItem = {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  children?: { data: IgGraphCarouselChild[] };
};

/** Meta Graph API — Facebook post attachment item */
export type FbGraphAttachment = {
  media_type: string;
  media_url: string;
};

/** One Page feed post (matches `storeFacebookPost` args). */
export type FbGraphFeedPost = {
  id: string;
  message?: string;
  permalink_url: string;
  created_time: string;
  attachments?: { data: FbGraphAttachment[] };
};

/** Result of decrypting active Facebook app credentials */
export type DecryptedFacebookAppCredentials = {
  appId: string;
  appSecret: string;
  redirectUri: string;
  appName: string | undefined;
  createdAt: number;
  updatedAt: number;
};

/** Outcome of validating Facebook app credentials via Graph */
export type FacebookCredentialValidationResult =
  | { valid: true; appId: string; appName: string }
  | { valid: false; error: string };

/** One row from `bulkPortFacebookPostsToProjects` */
export type BulkPortFacebookPostResult =
  | { facebookPostId: string; projectId: ProjectId; success: true }
  | { facebookPostId: string; error: string; success: false };
