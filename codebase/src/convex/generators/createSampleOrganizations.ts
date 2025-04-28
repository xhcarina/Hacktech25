import { internalMutation } from "../../convex/_generated/server";
import { v } from "convex/values";
import { Id } from "../../convex/_generated/dataModel";

export const createSampleOrganizations = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if organizations already exist
    const existingOrganizations = await ctx.db.query("organizations").collect();
    if (existingOrganizations.length > 0) {
      return existingOrganizations.map(org => org._id);
    }

    // Get region IDs (from createSampleRegions)
    const regions = await ctx.db.query("regions").collect();
    if (regions.length === 0) {
      throw new Error("No regions found. Please run createSampleRegions first.");
    }

    // Sample organization data
    const organizations = [
      {
        NGO_Name: "Global Relief Initiative",
        Mission_Statement: "Providing emergency aid and long-term support to displaced populations in conflict zones.",
        Regions: [regions[0]._id, regions[1]._id], // Gaza and Ukraine
        Email: "contact@globalrelief.org",
        Emergency_Fund_USD: 5000000,
        Field_Hospitals_Setup: 3,
        Food_Stock_Tons: 1200,
        Medical_Supply_Units: 50000,
        Shelter_Capacity: 5000,
        Transport_Vehicles: 75,
        Volunteers_Available: 1200,
        Water_Stock_Liters: 500000,
        verified: true,
      },
      {
        NGO_Name: "Doctors Without Borders",
        Mission_Statement: "Delivering emergency medical care to those affected by conflict, epidemics, and disasters.",
        Regions: [regions[0]._id, regions[2]._id], // Gaza and Sudan
        Email: "info@doctorswithoutborders.org",
        Emergency_Fund_USD: 8000000,
        Field_Hospitals_Setup: 8,
        Food_Stock_Tons: 500,
        Medical_Supply_Units: 100000,
        Shelter_Capacity: 2000,
        Transport_Vehicles: 120,
        Volunteers_Available: 2500,
        Water_Stock_Liters: 300000,
        verified: true,
      },
      {
        NGO_Name: "Children's Hope Foundation",
        Mission_Statement: "Supporting children and families affected by humanitarian crises through education and care.",
        Regions: [regions[1]._id, regions[3]._id], // Ukraine and Yemen
        Email: "support@childrenshope.org",
        Emergency_Fund_USD: 2000000,
        Field_Hospitals_Setup: 2,
        Food_Stock_Tons: 800,
        Medical_Supply_Units: 25000,
        Shelter_Capacity: 1500,
        Transport_Vehicles: 45,
        Volunteers_Available: 800,
        Water_Stock_Liters: 200000,
        verified: true,
      },
      {
        NGO_Name: "Shelter Now",
        Mission_Statement: "Building temporary and permanent shelters for displaced communities worldwide.",
        Regions: [regions[2]._id, regions[4]._id], // Sudan and Syria
        Email: "info@shelternow.org",
        Emergency_Fund_USD: 3000000,
        Field_Hospitals_Setup: 1,
        Food_Stock_Tons: 300,
        Medical_Supply_Units: 10000,
        Shelter_Capacity: 8000,
        Transport_Vehicles: 90,
        Volunteers_Available: 1500,
        Water_Stock_Liters: 400000,
        verified: true,
      },
      {
        NGO_Name: "Water for Life",
        Mission_Statement: "Ensuring access to clean water and sanitation in crisis-affected regions.",
        Regions: [regions[3]._id, regions[4]._id], // Yemen and Syria
        Email: "contact@waterforlife.org",
        Emergency_Fund_USD: 1500000,
        Field_Hospitals_Setup: 0,
        Food_Stock_Tons: 100,
        Medical_Supply_Units: 5000,
        Shelter_Capacity: 500,
        Transport_Vehicles: 30,
        Volunteers_Available: 600,
        Water_Stock_Liters: 1000000,
        verified: false,
      },
      {
        NGO_Name: "Emergency Response Team",
        Mission_Statement: "Rapid deployment of emergency aid and medical assistance in conflict zones.",
        Regions: [regions[0]._id, regions[4]._id], // Gaza and Syria
        Email: "operations@emergencyresponse.org",
        Emergency_Fund_USD: 4000000,
        Field_Hospitals_Setup: 5,
        Food_Stock_Tons: 900,
        Medical_Supply_Units: 75000,
        Shelter_Capacity: 3000,
        Transport_Vehicles: 60,
        Volunteers_Available: 1800,
        Water_Stock_Liters: 350000,
        verified: false,
      },
      {
        NGO_Name: "Food Aid International",
        Mission_Statement: "Distributing food supplies and nutritional support to vulnerable populations.",
        Regions: [regions[1]._id, regions[2]._id], // Ukraine and Sudan
        Email: "help@foodaid.org",
        Emergency_Fund_USD: 2500000,
        Field_Hospitals_Setup: 0,
        Food_Stock_Tons: 2500,
        Medical_Supply_Units: 1000,
        Shelter_Capacity: 1000,
        Transport_Vehicles: 150,
        Volunteers_Available: 900,
        Water_Stock_Liters: 150000,
        verified: false,
      }
    ];

    // Insert all organizations
    const organizationIds: Id<"organizations">[] = [];
    for (const organization of organizations) {
      const id = await ctx.db.insert("organizations", {
        ...organization,
        name: organization.NGO_Name, // For backward compatibility
        description: organization.Mission_Statement, // For backward compatibility
      });
      organizationIds.push(id);
    }

    return organizationIds;
  },
});