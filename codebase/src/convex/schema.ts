import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member"
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
)
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema({
  // default auth tables using convex auth.
  ...authTables, // do not remove or modify

  // the users table is the default users table that is brought in by the authTables
  users: defineTable({
    name: v.optional(v.string()), // name of the user. do not remove
    image: v.optional(v.string()), // image of the user. do not remove
    email: v.optional(v.string()), // email of the user. do not remove
    emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
    isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove
    
    role: v.optional(roleValidator), // role of the user. do not remove
  })
    .index("email", ["email"]), // index for the email. do not remove or modify

  regions: defineTable({
    name: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    severityLevel: v.number(), // 1-10 scale
    economicLoss: v.object({
      housing: v.number(),
      income: v.number(),
      assets: v.number(),
      total: v.number(),
    }),
    predictedLoss: v.number(),
    description: v.string(),
    lastUpdated: v.number(),
  })
    .index("by_severity", ["severityLevel"])
    .index("by_name", ["name"]),

  donations: defineTable({
    userId: v.id("users"),
    regionId: v.id("regions"),
    organizationId: v.optional(v.id("organizations")),
    type: v.union(
      v.literal("money"),
      v.literal("food"),
      v.literal("supplies"),
      v.literal("volunteers")
    ),
    amount: v.number(),
    description: v.optional(v.string()),
    date: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_region", ["regionId"])
    .index("by_date", ["date"])
    .index("by_organization", ["organizationId"]), // Add index for organization queries

  organizations: defineTable({
    name: v.string(),
    description: v.string(),
    regionIds: v.array(v.id("regions")),
    website: v.optional(v.string()),
    contactEmail: v.string(),
    verified: v.boolean(),
  })
    .index("by_name", ["name"])
    .index("by_verified", ["verified"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["verified"],
    }), // Add search index for name search
},
{
  schemaValidation: false
});

export default schema;