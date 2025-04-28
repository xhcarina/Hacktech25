import { query, action } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const listIndividuals = query({
  args: {
    paginationOpts: paginationOptsValidator,
    regionId: v.optional(v.id("regions")),
    sortBy: v.optional(v.union(
      v.literal("Event_Severity"),
      v.literal("Health_Severity_Score"), 
      v.literal("Economic_Loss_USD"),
      v.literal("Time_Since_Displacement_Days"),
      v.literal("Urgency_Score")
    )),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    minSeverity: v.optional(v.number()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all individuals first
    const individuals = await ctx.db.query("individuals").collect();
    
    // Apply filters in memory
    let filteredIndividuals = individuals;
    
    // Apply search filter
    if (args.searchQuery && args.searchQuery.length > 0) {
      filteredIndividuals = filteredIndividuals.filter(individual => 
        individual.Name.toLowerCase().includes(args.searchQuery!.toLowerCase())
      );
    }
    
    // Apply region filter
    if (args.regionId) {
      filteredIndividuals = filteredIndividuals.filter(individual => 
        individual.regionId === args.regionId
      );
    }
    
    // Apply severity filter
    if (typeof args.minSeverity === 'number') {
      filteredIndividuals = filteredIndividuals.filter(individual => 
        individual.Event_Severity >= args.minSeverity!
      );
    }

    // Apply pagination
    const start = args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) : 0;
    const end = start + (args.paginationOpts.numItems || 10);
    const page = filteredIndividuals.slice(start, end);

    // Add region names
    const individualsWithRegions = await Promise.all(
      page.map(async (individual) => {
        const region = await ctx.db.get(individual.regionId);
        return {
          ...individual,
          regionName: region?.name ?? "Unknown Region"
        };
      })
    );

    return {
      page: individualsWithRegions,
      isDone: end >= filteredIndividuals.length,
      continueCursor: end < filteredIndividuals.length ? end.toString() : null
    };
  },
});

export const getStatistics = query({
  args: {
    regionId: v.optional(v.id("regions"))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("individuals");

    if (args.regionId) {
      query = query.filter(q => q.eq(q.field("regionId"), args.regionId));
    }

    const individuals = await query.collect();

    const stats = individuals.reduce((acc, individual) => {
      acc.totalIndividuals++;
      acc.totalEconomicLoss += individual.Economic_Loss_USD;
      acc.totalFamilyMembers += individual.Family_Size;
      acc.averageHealthSeverity += individual.Health_Severity_Score;
      acc.averageEventSeverity += individual.Event_Severity;

      acc.shelterStatusCounts[individual.Shelter_Status] = 
        (acc.shelterStatusCounts[individual.Shelter_Status] || 0) + 1;

      acc.foodWaterAccessCounts[individual.Food_Water_Access] = 
        (acc.foodWaterAccessCounts[individual.Food_Water_Access] || 0) + 1;

      acc.healthRiskCounts[individual.Health_Risk] = 
        (acc.healthRiskCounts[individual.Health_Risk] || 0) + 1;

      return acc;
    }, {
      totalIndividuals: 0,
      totalEconomicLoss: 0,
      totalFamilyMembers: 0,
      averageHealthSeverity: 0,
      averageEventSeverity: 0,
      shelterStatusCounts: {} as Record<string, number>,
      foodWaterAccessCounts: {} as Record<string, number>,
      healthRiskCounts: {} as Record<string, number>
    });

    if (stats.totalIndividuals > 0) {
      stats.averageHealthSeverity /= stats.totalIndividuals;
      stats.averageEventSeverity /= stats.totalIndividuals;
    }

    return stats;
  }
});

export const generateCsvData = action({
  args: {
    regionId: v.optional(v.id("regions"))
  },
  handler: async (ctx, args): Promise<string> => {
    const individuals = await ctx.runQuery(api.predictions.listAllIndividuals, {
      regionId: args.regionId
    }) as Array<Doc<"individuals"> & { regionName: string }>;

    const headers = [
      "Name",
      "Origin",
      "Location Type",
      "Economic Loss (USD)",
      "Shelter Status",
      "Food/Water Access",
      "Health Risk",
      "Health Severity Score",
      "Family Size",
      "Time Since Displacement (Days)",
      "Displacement Start Date",
      "Displacement End Date",
      "Age",
      "Age Group",
      "EVENT SEVERITY (PREDICTED)",
      "URGENCY SCORE (PREDICTED)",
      "Region"
    ].join(",");

    const rows = individuals.map(individual => [
      `"${individual.Name}"`,
      `"${individual.Origin}"`,
      `"${individual.Location_Type}"`,
      individual.Economic_Loss_USD,
      `"${individual.Shelter_Status}"`,
      `"${individual.Food_Water_Access}"`,
      `"${individual.Health_Risk}"`,
      individual.Health_Severity_Score,
      individual.Family_Size,
      individual.Time_Since_Displacement_Days,
      new Date(individual.Displacement_Start_Date).toISOString(),
      individual.Displacement_End_Date ? new Date(individual.Displacement_End_Date).toISOString() : "",
      individual.Age,
      `"${individual.Age_Group}"`,
      individual.Event_Severity,
      individual.Urgency_Score,
      `"${individual.regionName}"`
    ].join(","));

    return [headers, ...rows].join("\n");
  }
});

export const listAllIndividuals = query({
  args: {
    regionId: v.optional(v.id("regions"))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("individuals");
    
    if (args.regionId) {
      query = query.filter(q => q.eq(q.field("regionId"), args.regionId));
    }

    const individuals = await query.collect();

    return await Promise.all(
      individuals.map(async (individual: Doc<"individuals">) => {
        const region = await ctx.db.get(individual.regionId);
        return {
          ...individual,
          regionName: region ? region.name || "Unknown Region" : "Unknown Region"
        };
      })
    );
  }
});