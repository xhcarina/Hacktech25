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
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as donations from "../donations.js";
import type * as generators_addSampleIndividuals from "../generators/addSampleIndividuals.js";
import type * as generators_createSampleIndividuals from "../generators/createSampleIndividuals.js";
import type * as generators_createSampleOrganizations from "../generators/createSampleOrganizations.js";
import type * as generators_createSampleRegions from "../generators/createSampleRegions.js";
import type * as http from "../http.js";
import type * as organizations from "../organizations.js";
import type * as predictions from "../predictions.js";
import type * as recommendations from "../recommendations.js";
import type * as regions from "../regions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  donations: typeof donations;
  "generators/addSampleIndividuals": typeof generators_addSampleIndividuals;
  "generators/createSampleIndividuals": typeof generators_createSampleIndividuals;
  "generators/createSampleOrganizations": typeof generators_createSampleOrganizations;
  "generators/createSampleRegions": typeof generators_createSampleRegions;
  http: typeof http;
  organizations: typeof organizations;
  predictions: typeof predictions;
  recommendations: typeof recommendations;
  regions: typeof regions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
