import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all donations for a user
export const listUserDonations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return donations;
  },
});

// Get all donations for a region
export const listRegionDonations = query({
  args: { regionId: v.id("regions") },
  handler: async (ctx, args) => {
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_region", (q) => q.eq("regionId", args.regionId))
      .order("desc")
      .collect();
    return donations;
  },
});

// Get donation statistics for a region
export const getRegionDonationStats = query({
  args: { regionId: v.id("regions") },
  handler: async (ctx, args) => {
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_region", (q) => q.eq("regionId", args.regionId))
      .collect();

    // Calculate statistics by donation type
    const stats = donations.reduce((acc, donation) => {
      acc.totalAmount += donation.amount;
      acc.byType[donation.type] = (acc.byType[donation.type] || 0) + donation.amount;
      return acc;
    }, {
      totalAmount: 0,
      byType: {} as Record<string, number>,
      totalDonations: donations.length
    });

    return stats;
  },
});

// Get recent donations with pagination
export const getRecentDonations = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.union(v.string(), v.null()))
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const donations = await ctx.db
      .query("donations")
      .withIndex("by_date")
      .order("desc")
      .paginate({ numItems: limit, cursor: args.cursor ?? null });

    return donations;
  },
});

// Create a new donation
export const createDonation = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Verify region exists
    const region = await ctx.db.get(args.regionId);
    if (!region) {
      throw new Error("Region not found");
    }

    // Verify organization if provided
    if (args.organizationId) {
      const organization = await ctx.db.get(args.organizationId);
      if (!organization) {
        throw new Error("Organization not found");
      }
    }

    // Create donation record
    const donationId = await ctx.db.insert("donations", {
      ...args,
      date: Date.now(),
    });

    return ctx.db.get(donationId);
  },
});

// Get donation statistics by date range
export const getDonationStatsByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_date")
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    // Calculate aggregate statistics
    const stats = donations.reduce((acc, donation) => {
      acc.totalAmount += donation.amount;
      acc.byType[donation.type] = {
        count: (acc.byType[donation.type]?.count || 0) + 1,
        amount: (acc.byType[donation.type]?.amount || 0) + donation.amount,
      };
      return acc;
    }, {
      totalAmount: 0,
      totalDonations: donations.length,
      byType: {} as Record<string, { count: number; amount: number }>,
    });

    return stats;
  },
});

// Get top donors for a region
export const getTopDonors = query({
  args: {
    regionId: v.id("regions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_region", (q) => q.eq("regionId", args.regionId))
      .collect();

    // Group donations by user and calculate totals
    const userTotals = donations.reduce((acc, donation) => {
      const userId = donation.userId.toString();
      acc[userId] = (acc[userId] || 0) + donation.amount;
      return acc;
    }, {} as Record<string, number>);

    // Sort users by total donation amount
    const sortedUsers = Object.entries(userTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    // Get user details for each top donor
    const topDonors = await Promise.all(
      sortedUsers.map(async ([userId, total]) => {
        const user = await ctx.db.get(userId as Id<"users">);
        return {
          user,
          totalDonated: total,
        };
      })
    );

    return topDonors;
  },
});