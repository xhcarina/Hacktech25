import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all organizations with optional filters
export const listOrganizations = query({
  args: {
    verifiedOnly: v.optional(v.boolean()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all organizations first
    const organizations = await ctx.db.query("organizations").collect();
    
    // Filter in memory
    return organizations.filter(org => {
      // Apply search filter if provided
      if (args.searchQuery && args.searchQuery.length > 0) {
        const searchLower = args.searchQuery.toLowerCase();
        const nameMatch = org.NGO_Name.toLowerCase().includes(searchLower);
        const missionMatch = org.Mission_Statement.toLowerCase().includes(searchLower);
        if (!nameMatch && !missionMatch) return false;
      }
      
      // Apply verified filter if needed
      if (args.verifiedOnly && !org.verified) {
        return false;
      }
      
      return true;
    });
  },
});

// Get a specific organization by ID
export const getOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    return organization;
  },
});

// Get organizations operating in a specific region
export const getOrganizationsByRegion = query({
  args: { regionId: v.id("regions") },
  handler: async (ctx, args) => {
    const region = await ctx.db.get(args.regionId);
    if (!region) {
      throw new Error("Region not found");
    }
    
    const organizations = await ctx.db
      .query("organizations")
      .collect();
      
    return organizations.filter(org => 
      org.Regions && org.Regions.includes(args.regionId)
    );
  },
});

// Internal version for use by other Convex functions
export const getOrganizationsByRegionInternal = internalQuery({
  args: { regionId: v.id("regions") },
  handler: async (ctx, args) => {
    const region = await ctx.db.get(args.regionId);
    if (!region) {
      throw new Error("Region not found");
    }
    
    const organizations = await ctx.db
      .query("organizations")
      .collect();
      
    return organizations.filter(org => 
      org.Regions && org.Regions.includes(args.regionId)
    );
  },
});

// Create a new organization
export const createOrganization = mutation({
  args: {
    NGO_Name: v.string(),
    Mission_Statement: v.string(),
    Regions: v.array(v.id("regions")),
    Email: v.string(),
    Emergency_Fund_USD: v.number(),
    Field_Hospitals_Setup: v.number(),
    Food_Stock_Tons: v.number(),
    Medical_Supply_Units: v.number(),
    Shelter_Capacity: v.number(),
    Transport_Vehicles: v.number(),
    Volunteers_Available: v.number(),
    Water_Stock_Liters: v.number(),
  },
  handler: async (ctx, args) => {
    const organizationId = await ctx.db.insert("organizations", {
      ...args,
      verified: false,
      name: args.NGO_Name, // For backward compatibility
      description: args.Mission_Statement, // For backward compatibility
    });

    return ctx.db.get(organizationId);
  },
});

// Update organization details
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    NGO_Name: v.optional(v.string()),
    Mission_Statement: v.optional(v.string()),
    Regions: v.optional(v.array(v.id("regions"))),
    Email: v.optional(v.string()),
    Emergency_Fund_USD: v.optional(v.number()),
    Field_Hospitals_Setup: v.optional(v.number()),
    Food_Stock_Tons: v.optional(v.number()),
    Medical_Supply_Units: v.optional(v.number()),
    Shelter_Capacity: v.optional(v.number()),
    Transport_Vehicles: v.optional(v.number()),
    Volunteers_Available: v.optional(v.number()),
    Water_Stock_Liters: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...updates } = args;

    const existing = await ctx.db.get(organizationId);
    if (!existing) {
      throw new Error("Organization not found");
    }

    await ctx.db.patch(organizationId, updates);
    return ctx.db.get(organizationId);
  },
});

// Update organization verification status
export const setOrganizationVerification = mutation({
  args: {
    organizationId: v.id("organizations"),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { organizationId, verified } = args;

    const existing = await ctx.db.get(organizationId);
    if (!existing) {
      throw new Error("Organization not found");
    }

    await ctx.db.patch(organizationId, { verified });
    return ctx.db.get(organizationId);
  },
});

// Get organization statistics
export const getOrganizationStats = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    const donations = await ctx.db
      .query("donations")
      .withIndex("by_organization", q => q.eq("organizationId", args.organizationId))
      .collect();

    const stats = donations.reduce((acc, donation) => {
      acc.totalDonations++;
      acc.totalAmount += donation.amount;
      acc.byType[donation.type] = {
        count: (acc.byType[donation.type]?.count || 0) + 1,
        amount: (acc.byType[donation.type]?.amount || 0) + donation.amount,
      };
      return acc;
    }, {
      totalDonations: 0,
      totalAmount: 0,
      byType: {} as Record<string, { count: number; amount: number }>,
      verified: organization.verified,
    });

    return stats;
  },
});