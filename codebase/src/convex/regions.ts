import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all regions ordered by severity level
export const listRegions = query({
  args: {},
  handler: async (ctx) => {
    const regions = await ctx.db
      .query("regions")
      .withIndex("by_severity")
      .order("desc")
      .collect();
    return regions;
  },
});

// Get a specific region by ID
export const getRegion = query({
  args: { regionId: v.id("regions") },
  handler: async (ctx, args) => {
    const region = await ctx.db.get(args.regionId);
    return region;
  },
});

// Get regions filtered by severity level
export const getRegionsBySeverity = query({
  args: { minSeverity: v.number() },
  handler: async (ctx, args) => {
    const regions = await ctx.db
      .query("regions")
      .withIndex("by_severity")
      .filter((q) => q.gte(q.field("severityLevel"), args.minSeverity))
      .order("desc")
      .collect();
    return regions;
  },
});

// Get total economic loss statistics across all regions
export const getEconomicStats = query({
  args: {},
  handler: async (ctx) => {
    const regions = await ctx.db.query("regions").collect();
    
    const stats = regions.reduce((acc, region) => {
      return {
        totalHousingLoss: acc.totalHousingLoss + region.economicLoss.housing,
        totalIncomeLoss: acc.totalIncomeLoss + region.economicLoss.income,
        totalAssetsLoss: acc.totalAssetsLoss + region.economicLoss.assets,
        totalLoss: acc.totalLoss + region.economicLoss.total,
        predictedTotalLoss: acc.predictedTotalLoss + region.predictedLoss,
      };
    }, {
      totalHousingLoss: 0,
      totalIncomeLoss: 0,
      totalAssetsLoss: 0,
      totalLoss: 0,
      predictedTotalLoss: 0,
    });

    return stats;
  },
});

// Update a region's data
export const updateRegion = mutation({
  args: {
    regionId: v.id("regions"),
    name: v.optional(v.string()),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    severityLevel: v.optional(v.number()),
    description: v.optional(v.string()),
    economicLoss: v.optional(v.object({
      housing: v.number(),
      income: v.number(),
      assets: v.number(),
      total: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const { regionId, ...updates } = args;
    
    // Verify region exists
    const existing = await ctx.db.get(regionId);
    if (!existing) {
      throw new Error("Region not found");
    }

    // Update lastUpdated timestamp
    const patch = {
      ...updates,
      lastUpdated: Date.now(),
    };

    await ctx.db.patch(regionId, patch);
    return ctx.db.get(regionId);
  },
});

// Update predicted economic loss for a region
export const updatePrediction = mutation({
  args: {
    regionId: v.id("regions"),
    predictedLoss: v.number(),
  },
  handler: async (ctx, args) => {
    const { regionId, predictedLoss } = args;
    
    // Verify region exists
    const existing = await ctx.db.get(regionId);
    if (!existing) {
      throw new Error("Region not found");
    }

    await ctx.db.patch(regionId, {
      predictedLoss,
      lastUpdated: Date.now(),
    });

    return ctx.db.get(regionId);
  },
});