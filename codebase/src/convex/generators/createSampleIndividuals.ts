import { internalMutation } from "../../convex/_generated/server";
import { v } from "convex/values";
import { Id } from "../../convex/_generated/dataModel";

export const createSampleIndividuals = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if individuals already exist
    const existingIndividuals = await ctx.db.query("individuals").collect();
    if (existingIndividuals.length > 0) {
      return existingIndividuals.map(individual => individual._id);
    }

    // Get Gaza region ID (from createSampleRegions)
    const gazaRegion = await ctx.db
      .query("regions")
      .filter(q => q.eq(q.field("name"), "Gaza Strip"))
      .unique();

    if (!gazaRegion) {
      throw new Error("Gaza Strip region not found. Please run createSampleRegions first.");
    }

    // Sample individual data
    const individuals = [
      {
        Name: "Christina Ward",
        Origin: "Mexico",
        Location_Type: "Urban",
        Location_Type_Num: 1,
        Economic_Loss_USD: 2231.75,
        Shelter_Status: "None",
        Shelter_Status_Num: 0,
        Food_Water_Access: "Partial",
        Food_Water_Access_Num: 1,
        Health_Risk: "No Risk",
        Health_Severity_Score: 0.0,
        Family_Size: 5,
        Time_Since_Displacement_Days: 190,
        Displacement_Start_Date: new Date("2024-10-18").toISOString(),
        Displacement_End_Date: new Date("2025-12-06").toISOString(),
        Age: 6,
        Age_Group: "Child (0-17)",
        Age_Group_Num: 0,
        Event_Severity: 66.38,
        Urgency_Score: 7.2,
        regionId: gazaRegion._id,
      },
      // Generate 49 more similar entries with varied data
      ...Array.from({ length: 49 }, (_, i) => {
        const locationType = ["Urban", "Rural", "Camp", "Temporary"][Math.floor(Math.random() * 4)];
        const shelterStatus = ["None", "Temporary", "Permanent", "Emergency"][Math.floor(Math.random() * 4)];
        const foodWaterAccess = ["None", "Partial", "Full", "Limited"][Math.floor(Math.random() * 4)];
        const healthRisk = ["No Risk", "Low", "Medium", "High"][Math.floor(Math.random() * 4)];
        const ageGroup = Math.random() > 0.7 ? "Child (0-17)" : Math.random() > 0.5 ? "Adult (18-64)" : "Senior (65+)";
        
        return {
          Name: `Individual ${i + 2}`,
          Origin: ["Mexico", "Syria", "Yemen", "Ukraine", "Sudan"][Math.floor(Math.random() * 5)],
          Location_Type: locationType,
          Location_Type_Num: ["Urban", "Rural", "Camp", "Temporary"].indexOf(locationType),
          Economic_Loss_USD: Math.round(Math.random() * 50000 * 100) / 100,
          Shelter_Status: shelterStatus,
          Shelter_Status_Num: ["None", "Temporary", "Permanent", "Emergency"].indexOf(shelterStatus),
          Food_Water_Access: foodWaterAccess,
          Food_Water_Access_Num: ["None", "Partial", "Full", "Limited"].indexOf(foodWaterAccess),
          Health_Risk: healthRisk,
          Health_Severity_Score: Math.round(Math.random() * 10 * 10) / 10,
          Family_Size: Math.floor(Math.random() * 8) + 1,
          Time_Since_Displacement_Days: Math.floor(Math.random() * 365),
          Displacement_Start_Date: new Date(Date.now() - (Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)).toISOString(),
          Displacement_End_Date: Math.random() > 0.5 ? new Date(Date.now() + (Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)).toISOString() : "",
          Age: Math.floor(Math.random() * 80),
          Age_Group: ageGroup,
          Age_Group_Num: ["Child (0-17)", "Adult (18-64)", "Senior (65+)"].indexOf(ageGroup),
          Event_Severity: Math.round(Math.random() * 100 * 100) / 100,
          Urgency_Score: Math.round(Math.random() * 10 * 10) / 10,
          regionId: gazaRegion._id,
        };
      })
    ];

    // Insert all individuals
    const individualIds: Id<"individuals">[] = [];
    for (const individual of individuals) {
      const id = await ctx.db.insert("individuals", individual);
      individualIds.push(id);
    }

    return individualIds;
  },
});