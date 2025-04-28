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
    .index("by_organization", ["organizationId"]),

  organizations: defineTable({
    NGO_Name: v.string(),
    Mission_Statement: v.string(),
    Regions: v.array(v.id("regions")), // Changed to array of region IDs
    Email: v.string(), // Added email field
    Emergency_Fund_USD: v.number(),
    Field_Hospitals_Setup: v.number(),
    Food_Stock_Tons: v.number(),
    Medical_Supply_Units: v.number(),
    Shelter_Capacity: v.number(),
    Transport_Vehicles: v.number(),
    Volunteers_Available: v.number(),
    Water_Stock_Liters: v.number(),
    verified: v.optional(v.boolean()),
    name: v.optional(v.string()), // Optional for backward compatibility
    description: v.optional(v.string()), // Optional for backward compatibility
  })
    .index("by_name", ["name"]) 
    .index("by_verified", ["verified"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["Email"],
    }),

  individuals: defineTable({
    Name: v.string(),
    Origin: v.string(),
    Location_Type: v.string(),
    Location_Type_Num: v.number(),
    Economic_Loss_USD: v.number(),
    Shelter_Status: v.string(),
    Shelter_Status_Num: v.number(),
    Food_Water_Access: v.string(),
    Food_Water_Access_Num: v.number(),
    Health_Risk: v.string(),
    Health_Severity_Score: v.number(),
    Family_Size: v.number(),
    Time_Since_Displacement_Days: v.number(),
    Displacement_Start_Date: v.string(),
    Displacement_End_Date: v.optional(v.string()), // Made optional
    Age: v.number(),
    Age_Group: v.string(),
    Age_Group_Num: v.number(),
    Event_Severity: v.number(),
    Urgency_Score: v.number(),
    regionId: v.id("regions"),
  })
    .index("by_urgency", ["Urgency_Score"])
    .index("by_severity", ["Event_Severity"])
    .index("by_age", ["Age"])
    .index("by_region", ["regionId"])
    .searchIndex("search_name", {
      searchField: "Name",
      filterFields: ["Origin", "Location_Type"],
    }),
},
{
  schemaValidation: false
});

export default schema;