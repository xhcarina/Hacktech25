import { internalMutation } from "../../convex/_generated/server";
import { v } from "convex/values";
import { Id } from "../../convex/_generated/dataModel";

export const createSampleRegions = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if regions already exist
    const existingRegions = await ctx.db.query("regions").collect();
    if (existingRegions.length > 0) {
      return existingRegions.map(region => region._id);
    }

    // Sample region data
    const regions = [
      {
        name: "Gaza Strip",
        coordinates: { lat: 31.3547, lng: 34.3088 },
        severityLevel: 9,
        economicLoss: {
          housing: 2500000000,
          income: 1800000000,
          assets: 3200000000,
          total: 7500000000,
        },
        predictedLoss: 9000000000,
        description: "Severe economic impact from ongoing conflict affecting infrastructure, housing, and civilian livelihoods.",
        lastUpdated: Date.now(),
      },
      {
        name: "Eastern Ukraine",
        coordinates: { lat: 48.3794, lng: 31.1656 },
        severityLevel: 8,
        economicLoss: {
          housing: 4200000000,
          income: 2900000000,
          assets: 3800000000,
          total: 10900000000,
        },
        predictedLoss: 12500000000,
        description: "Significant economic losses due to military operations and displacement of civilian population.",
        lastUpdated: Date.now(),
      },
      {
        name: "Sudan - Darfur",
        coordinates: { lat: 13.7483, lng: 25.3383 },
        severityLevel: 7,
        economicLoss: {
          housing: 1200000000,
          income: 900000000,
          assets: 1500000000,
          total: 3600000000,
        },
        predictedLoss: 4500000000,
        description: "Ongoing humanitarian crisis with substantial impact on local economy and infrastructure.",
        lastUpdated: Date.now(),
      },
      {
        name: "Yemen - Sana'a",
        coordinates: { lat: 15.3694, lng: 44.1910 },
        severityLevel: 8,
        economicLoss: {
          housing: 1800000000,
          income: 1500000000,
          assets: 2200000000,
          total: 5500000000,
        },
        predictedLoss: 6800000000,
        description: "Severe economic deterioration due to prolonged conflict affecting civilian infrastructure.",
        lastUpdated: Date.now(),
      },
      {
        name: "Syria - Aleppo",
        coordinates: { lat: 36.2021, lng: 37.1343 },
        severityLevel: 7,
        economicLoss: {
          housing: 3100000000,
          income: 2400000000,
          assets: 2800000000,
          total: 8300000000,
        },
        predictedLoss: 9500000000,
        description: "Significant economic impact from urban conflict and displacement of population.",
        lastUpdated: Date.now(),
      }
    ];

    // Insert all regions
    const regionIds: Id<"regions">[] = [];
    for (const region of regions) {
      const id = await ctx.db.insert("regions", region);
      regionIds.push(id);
    }

    return regionIds;
  },
});