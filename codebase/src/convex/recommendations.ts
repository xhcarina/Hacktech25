"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// Define the recommendation response type
type RecommendationResponse = {
  recommendation: string;
  suggestedAmount: number;
  urgencyLevel: "high" | "medium" | "low";
  donationType: "money" | "food" | "supplies" | "volunteers";
  reasoning: string;
};

export const getRecommendation = action({
  args: { 
    regionId: v.id("regions")
  },
  handler: async (ctx, args): Promise<RecommendationResponse> => {
    // Initialize OpenAI client with API key from environment
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get region data using internal query
    const region = await ctx.runQuery(internal.regions.getRegionInternal, {
      regionId: args.regionId,
    });

    if (!region) {
      throw new Error("Region not found");
    }

    // Get organizations using internal query
    const organizations = await ctx.runQuery(
      internal.organizations.getOrganizationsByRegionInternal,
      { regionId: args.regionId }
    );

    // Prepare context for OpenAI
    const context = {
      region: {
        name: region.name,
        severityLevel: region.severityLevel,
        economicLoss: region.economicLoss,
        predictedLoss: region.predictedLoss,
        description: region.description,
      },
      organizations: organizations.map((org: Doc<"organizations">) => ({
        name: org.NGO_Name,
        verified: org.verified,
        description: org.Mission_Statement,
      })),
    };

    // Generate recommendation using OpenAI
    const prompt = `
      As an AI donation advisor, analyze this conflict region and provide a donation recommendation:

      Region: ${context.region.name}
      Severity Level: ${context.region.severityLevel}/10
      Current Economic Loss: ${context.region.economicLoss.total}
      Predicted Loss: ${context.region.predictedLoss}
      Description: ${context.region.description}

      Organizations operating in region:
      ${context.organizations.map(org => 
        `- ${org.name} (${org.verified ? 'Verified' : 'Unverified'}): ${org.description}`
      ).join('\n')}

      Based on the severity level, economic impact, and available organizations, provide:
      1. A specific donation recommendation
      2. A suggested donation amount
      3. An urgency level (high/medium/low)
      4. The most effective type of donation (money/food/supplies/volunteers)
      5. Reasoning for the recommendation

      Format the response as a JSON object with the following keys:
      {
        "recommendation": "string",
        "suggestedAmount": number,
        "urgencyLevel": "high" | "medium" | "low",
        "donationType": "money" | "food" | "supplies" | "volunteers",
        "reasoning": "string"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI donation advisor specializing in humanitarian aid for conflict regions. Provide specific, actionable recommendations based on severity, economic impact, and organizational presence.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse and validate the response
    const response = JSON.parse(completion.choices[0].message.content || "{}");

    // Ensure the response matches our expected format
    if (!response.recommendation || !response.suggestedAmount || 
        !response.urgencyLevel || !response.donationType || !response.reasoning) {
      throw new Error("Invalid recommendation format from OpenAI");
    }

    // Validate urgency level
    if (!["high", "medium", "low"].includes(response.urgencyLevel)) {
      throw new Error("Invalid urgency level in recommendation");
    }

    // Validate donation type
    if (!["money", "food", "supplies", "volunteers"].includes(response.donationType)) {
      throw new Error("Invalid donation type in recommendation");
    }

    return {
      recommendation: response.recommendation,
      suggestedAmount: response.suggestedAmount,
      urgencyLevel: response.urgencyLevel as "high" | "medium" | "low",
      donationType: response.donationType as "money" | "food" | "supplies" | "volunteers",
      reasoning: response.reasoning,
    };
  },
});