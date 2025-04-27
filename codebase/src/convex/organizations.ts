import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all organizations with optional filters
export const listOrganizations = query({
  args: {
    verifiedOnly: v.optional(v.boolean()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If searching by name, use search index
    if (args.searchQuery) {
      return await ctx.db
        .query("organizations")
        .withSearchIndex("search_name", q => {
          if (args.verifiedOnly) {
            return q.search("name", args.searchQuery!).eq("verified", true);
          }
          return q.search("name", args.searchQuery!);
        })
        .collect();
    }

    // Otherwise use verified index if needed
    if (args.verifiedOnly) {
      return await ctx.db
        .query("organizations")
        .withIndex("by_verified", q => q.eq("verified", true))
        .collect();
    }

    // No filters, return all
    return await ctx.db.query("organizations").collect();
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
    // Since we can't query arrays directly, we need to fetch all and filter
    const organizations = await ctx.db
      .query("organizations")
      .collect();
    
    return organizations.filter(org => 
      org.regionIds.some(id => id === args.regionId)
    );
  },
});

// Create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    regionIds: v.array(v.id("regions")),
    website: v.optional(v.string()),
    contactEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify all regions exist
    for (const regionId of args.regionIds) {
      const region = await ctx.db.get(regionId);
      if (!region) {
        throw new Error(`Region ${regionId} not found`);
      }
    }

    // Create organization with verified set to false by default
    const organizationId = await ctx.db.insert("organizations", {
      ...args,
      verified: false,
    });

    return ctx.db.get(organizationId);
  },
});

// Update organization details
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    regionIds: v.optional(v.array(v.id("regions"))),
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...updates } = args;

    // Verify organization exists
    const existing = await ctx.db.get(organizationId);
    if (!existing) {
      throw new Error("Organization not found");
    }

    // Verify all regions exist if updating regions
    if (updates.regionIds) {
      for (const regionId of updates.regionIds) {
        const region = await ctx.db.get(regionId);
        if (!region) {
          throw new Error(`Region ${regionId} not found`);
        }
      }
    }

    // Update organization
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

    // Verify organization exists
    const existing = await ctx.db.get(organizationId);
    if (!existing) {
      throw new Error("Organization not found");
    }

    // Update verification status
    await ctx.db.patch(organizationId, { verified });
    return ctx.db.get(organizationId);
  },
});

// Get organization statistics
export const getOrganizationStats = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Get organization details
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Get all donations and filter by organization ID since we don't have an index
    const donations = await ctx.db
      .query("donations")
      .collect();
    
    const orgDonations = donations.filter(d => d.organizationId === args.organizationId);

    // Calculate statistics
    const stats = orgDonations.reduce((acc, donation) => {
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
      regionsServed: organization.regionIds.length,
      verified: organization.verified,
    });

    return stats;
  },
});