import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// Jupiter API endpoints
const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6";
const JUPITER_TOKEN_API = "https://tokens.jup.ag";
const JUPITER_PRICE_API = "https://api.jup.ag/price/v2";

export const getTokenList = action({
  args: {},
  handler: async (ctx) => {
    try {
      const response = await fetch(`${JUPITER_TOKEN_API}/all`);
      const tokens = await response.json();
      return tokens;
    } catch (error) {
      console.error("Error fetching token list:", error);
      throw new Error("Failed to fetch token list");
    }
  },
});

export const getQuote = action({
  args: {
    inputMint: v.string(),
    outputMint: v.string(),
    amount: v.number(),
    slippageBps: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const params = new URLSearchParams({
        inputMint: args.inputMint,
        outputMint: args.outputMint,
        amount: args.amount.toString(),
        slippageBps: (args.slippageBps || 50).toString(),
      });

      const response = await fetch(`${JUPITER_QUOTE_API}/quote?${params}`);
      const quote = await response.json();
      
      return quote;
    } catch (error) {
      console.error("Error getting quote:", error);
      throw new Error("Failed to get quote");
    }
  },
});

export const getTokenPrices = action({
  args: {
    ids: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(`${JUPITER_PRICE_API}?ids=${args.ids.join(',')}`);
      const prices = await response.json();
      return prices;
    } catch (error) {
      console.error("Error fetching token prices:", error);
      throw new Error("Failed to fetch token prices");
    }
  },
});

export const analyzePortfolioRisk = action({
  args: {
    tokens: v.array(v.object({
      mint: v.string(),
      balance: v.number(),
      value: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    try {
      // Simulate risk analysis based on token composition
      let riskScore = 0;
      let riskFlags: string[] = [];

      for (const token of args.tokens) {
        // Check if token is in top 100 by market cap (safer)
        const isTopToken = await checkTokenSafety(token.mint);
        if (!isTopToken) {
          riskScore += 20;
          riskFlags.push("Low market cap token");
        }

        // Check concentration risk
        const concentration = token.value / args.tokens.reduce((sum, t) => sum + t.value, 0);
        if (concentration > 0.5) {
          riskScore += 30;
          riskFlags.push("High concentration risk");
        }
      }

      let riskLevel = "Low-Risk";
      if (riskScore > 60) riskLevel = "High-Stakes";
      else if (riskScore > 30) riskLevel = "Moderate";

      return {
        riskScore: Math.min(riskScore, 100),
        riskLevel,
        riskFlags,
      };
    } catch (error) {
      console.error("Error analyzing portfolio risk:", error);
      throw new Error("Failed to analyze portfolio risk");
    }
  },
});

async function checkTokenSafety(mint: string): Promise<boolean> {
  // Simplified safety check - in production, use Jupiter's Shield API
  const knownSafeTokens = [
    "So11111111111111111111111111111111111111112", // SOL
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  ];
  return knownSafeTokens.includes(mint);
}

export const savePortfolio = mutation({
  args: {
    walletAddress: v.string(),
    name: v.string(),
    tokens: v.array(v.object({
      mint: v.string(),
      symbol: v.string(),
      name: v.string(),
      balance: v.number(),
      value: v.number(),
      price: v.number(),
      logoUri: v.optional(v.string()),
    })),
    riskAnalysis: v.object({
      riskScore: v.number(),
      riskLevel: v.string(),
      riskFlags: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const totalValue = args.tokens.reduce((sum, token) => sum + token.value, 0);

    const portfolioId = await ctx.db.insert("portfolios", {
      userId,
      walletAddress: args.walletAddress,
      name: args.name,
      totalValue,
      riskScore: args.riskAnalysis.riskScore,
      riskLevel: args.riskAnalysis.riskLevel,
      lastUpdated: Date.now(),
    });

    for (const token of args.tokens) {
      await ctx.db.insert("tokens", {
        portfolioId,
        mint: token.mint,
        symbol: token.symbol,
        name: token.name,
        balance: token.balance,
        value: token.value,
        price: token.price,
        logoUri: token.logoUri,
        riskFlags: args.riskAnalysis.riskFlags,
        safetyScore: 100 - args.riskAnalysis.riskScore,
      });
    }

    return portfolioId;
  },
});

export const getUserPortfolios = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getUserHealthScore = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // In a real implementation, this would fetch the user's stored health score
    return null;
  },
});

export const mintAchievementBadge = mutation({
  args: {
    achievementId: v.string(),
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // In a real implementation, this would:
    // 1. Verify the achievement is unlocked
    // 2. Mint an NFT badge on-chain
    // 3. Store the badge information in the database
    
    console.log(`Minting badge ${args.achievementId} for wallet ${args.walletAddress}`);
    
    return {
      success: true,
      badgeId: `badge_${args.achievementId}_${Date.now()}`,
      transactionId: `mint_${Date.now()}`,
    };
  },
});

export const getPortfolioTokens = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tokens")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();
  },
});
