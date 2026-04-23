/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as appointments from "../appointments.js";
import type * as auth from "../auth.js";
import type * as businesses from "../businesses.js";
import type * as crons from "../crons.js";
import type * as demoSeed from "../demoSeed.js";
import type * as encryption from "../encryption.js";
import type * as facebookProjectPort from "../facebookProjectPort.js";
import type * as http from "../http.js";
import type * as intakeForms from "../intakeForms.js";
import type * as metaAuth from "../metaAuth.js";
import type * as metaContent from "../metaContent.js";
import type * as metaQueries from "../metaQueries.js";
import type * as profiles from "../profiles.js";
import type * as projects from "../projects.js";
import type * as router from "../router.js";
import type * as testimonials from "../testimonials.js";
import type * as types from "../types.js";
import type * as validators from "../validators.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  appointments: typeof appointments;
  auth: typeof auth;
  businesses: typeof businesses;
  crons: typeof crons;
  demoSeed: typeof demoSeed;
  encryption: typeof encryption;
  facebookProjectPort: typeof facebookProjectPort;
  http: typeof http;
  intakeForms: typeof intakeForms;
  metaAuth: typeof metaAuth;
  metaContent: typeof metaContent;
  metaQueries: typeof metaQueries;
  profiles: typeof profiles;
  projects: typeof projects;
  router: typeof router;
  testimonials: typeof testimonials;
  types: typeof types;
  validators: typeof validators;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
