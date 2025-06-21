"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

// Wallet-based portfolio simulation
const generatePortfolioFromWallet = (walletAddress: string) => {
  // Create a deterministic seed from wallet address
  const seed = walletAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use seed to generate consistent but varied portfolio data
  const random = (min: number, max: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  const tokenCount = Math.floor(random(3, 12));
  const categories = ["DeFi", "Gaming", "Infrastructure", "Meme", "NFT", "Layer1", "Layer2"];
  const selectedCategories = categories.slice(0, Math.floor(random(2, 6)));
  
  // Generate portfolio value based on wallet characteristics
  const baseValue = random(1000, 50000);
  const riskTokens = Math.floor(random(0, Math.max(1, tokenCount * 0.4)));
  const governanceParticipation = Math.floor(random(0, 15));
  const holdingPeriod = Math.floor(random(30, 365));

  return {
    totalValue: Math.round(baseValue),
    tokenCount,
    categories: selectedCategories,
    riskTokens,
    governanceParticipation,
    holdingPeriod,
    walletAge: Math.floor(random(30, 730)), // days
    transactionCount: Math.floor(random(50, 1000)),
    uniqueProtocols: Math.floor(random(2, 20)),
  };
};

export const calculateHealthScore = action({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Generate wallet-specific portfolio data
      const portfolioData = generatePortfolioFromWallet(args.walletAddress);

      // Calculate diversification score (0-100)
      const diversificationScore = Math.min(
        (portfolioData.categories.length * 15) + 
        (portfolioData.tokenCount * 3) + 
        (portfolioData.uniqueProtocols * 2), 
        100
      );

      // Calculate security score (0-100)
      const securityScore = Math.max(
        100 - (portfolioData.riskTokens * 20) - 
        (portfolioData.walletAge < 90 ? 15 : 0), // Penalty for new wallets
        0
      );

      // Calculate governance score (0-100)
      const governanceScore = Math.min(
        portfolioData.governanceParticipation * 7 + 
        (portfolioData.transactionCount > 200 ? 10 : 0), // Bonus for active users
        100
      );

      // Calculate experience score (0-100)
      const experienceScore = Math.min(
        (portfolioData.walletAge / 365 * 30) + // Age factor
        (portfolioData.transactionCount / 10) + // Activity factor
        (portfolioData.holdingPeriod / 30 * 5), // Holding period factor
        100
      );

      // Calculate overall score with weighted factors
      const overallScore = Math.round(
        (diversificationScore * 0.25) + 
        (securityScore * 0.30) + 
        (governanceScore * 0.20) +
        (experienceScore * 0.25)
      );

      // Determine tier based on overall score
      let tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
      if (overallScore >= 85) tier = "Diamond";
      else if (overallScore >= 75) tier = "Platinum";
      else if (overallScore >= 65) tier = "Gold";
      else if (overallScore >= 50) tier = "Silver";
      else tier = "Bronze";

      // Generate badges based on achievements
      const badges = [];
      if (portfolioData.categories.length >= 5) badges.push("Diversification Master");
      if (portfolioData.governanceParticipation >= 10) badges.push("DAO Participant");
      if (portfolioData.holdingPeriod >= 180) badges.push("Diamond Hands");
      if (portfolioData.walletAge >= 365) badges.push("Veteran Trader");
      if (portfolioData.uniqueProtocols >= 10) badges.push("DeFi Explorer");
      if (securityScore >= 90) badges.push("Security Expert");

      // Generate AI recommendations
      const recommendations = await generateHealthRecommendations({
        diversificationScore,
        securityScore,
        governanceScore,
        experienceScore,
        overallScore,
        portfolioData,
      });

      return {
        diversificationScore: Math.round(diversificationScore),
        securityScore: Math.round(securityScore),
        governanceScore: Math.round(governanceScore),
        experienceScore: Math.round(experienceScore),
        overallScore,
        tier,
        badges,
        recommendations,
        portfolioInsights: {
          totalValue: portfolioData.totalValue,
          tokenCount: portfolioData.tokenCount,
          categories: portfolioData.categories,
          walletAge: portfolioData.walletAge,
          transactionCount: portfolioData.transactionCount,
          uniqueProtocols: portfolioData.uniqueProtocols,
        },
      };
    } catch (error) {
      console.error("Error calculating health score:", error);
      throw new Error("Failed to calculate health score");
    }
  },
});

async function generateHealthRecommendations(scores: {
  diversificationScore: number;
  securityScore: number;
  governanceScore: number;
  experienceScore: number;
  overallScore: number;
  portfolioData: any;
}) {
  try {
    const prompt = `
      Analyze this DeFi portfolio health score and provide actionable recommendations:
      
      Scores:
      - Diversification: ${scores.diversificationScore}/100
      - Security: ${scores.securityScore}/100
      - Governance: ${scores.governanceScore}/100
      - Experience: ${scores.experienceScore}/100
      - Overall: ${scores.overallScore}/100
      
      Portfolio Details:
      - Total Value: $${scores.portfolioData.totalValue.toLocaleString()}
      - Token Count: ${scores.portfolioData.tokenCount}
      - Categories: ${scores.portfolioData.categories.join(', ')}
      - Wallet Age: ${scores.portfolioData.walletAge} days
      - Transactions: ${scores.portfolioData.transactionCount}
      - Protocols Used: ${scores.portfolioData.uniqueProtocols}
      
      Provide 3-4 specific, actionable recommendations to improve the portfolio health score.
      Focus on practical steps for DeFi users based on their current portfolio state.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
    });

    const content = response.choices[0].message.content || "";
    return content.split('\n').filter(line => line.trim().length > 0);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    
    // Fallback recommendations based on scores
    const recommendations = [];
    
    if (scores.diversificationScore < 70) {
      recommendations.push("Diversify across more token categories to reduce concentration risk");
    }
    if (scores.securityScore < 70) {
      recommendations.push("Review and remove high-risk tokens from your portfolio");
    }
    if (scores.governanceScore < 70) {
      recommendations.push("Participate in governance voting to improve your DAO engagement");
    }
    if (scores.experienceScore < 70) {
      recommendations.push("Consider longer holding periods and explore more DeFi protocols");
    }
    if (scores.portfolioData.uniqueProtocols < 5) {
      recommendations.push("Explore additional DeFi protocols to increase your ecosystem exposure");
    }
    
    return recommendations.slice(0, 4);
  }
}
