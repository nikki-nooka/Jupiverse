import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  portfolios: defineTable({
    userId: v.id("users"),
    walletAddress: v.string(),
    name: v.string(),
    totalValue: v.number(),
    riskScore: v.number(),
    riskLevel: v.string(), // "High-Stakes", "Moderate", "Low-Risk"
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),

  tokens: defineTable({
    portfolioId: v.id("portfolios"),
    mint: v.string(),
    symbol: v.string(),
    name: v.string(),
    balance: v.number(),
    value: v.number(),
    price: v.number(),
    logoUri: v.optional(v.string()),
    riskFlags: v.array(v.string()),
    safetyScore: v.number(),
  }).index("by_portfolio", ["portfolioId"]),

  swapRoutes: defineTable({
    userId: v.id("users"),
    inputMint: v.string(),
    outputMint: v.string(),
    amount: v.number(),
    routes: v.array(v.object({
      dex: v.string(),
      poolAddress: v.string(),
      fee: v.number(),
      liquidity: v.number(),
    })),
    bestRoute: v.object({
      outputAmount: v.number(),
      priceImpact: v.number(),
      fees: v.number(),
    }),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  dcaOrders: defineTable({
    userId: v.id("users"),
    inputMint: v.string(),
    outputMint: v.string(),
    amount: v.number(),
    frequency: v.string(), // "daily", "weekly", "monthly"
    isActive: v.boolean(),
    nextExecution: v.number(),
    totalExecutions: v.number(),
    averagePrice: v.number(),
  }).index("by_user", ["userId"]),

  limitOrders: defineTable({
    userId: v.id("users"),
    inputMint: v.string(),
    outputMint: v.string(),
    amount: v.number(),
    targetPrice: v.number(),
    isActive: v.boolean(),
    expiresAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  aiInsights: defineTable({
    userId: v.id("users"),
    type: v.string(), // "portfolio", "market", "risk"
    title: v.string(),
    content: v.string(),
    confidence: v.number(),
    actionable: v.boolean(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  // New tables for advanced features
  healthScores: defineTable({
    userId: v.id("users"),
    walletAddress: v.string(),
    diversificationScore: v.number(),
    securityScore: v.number(),
    governanceScore: v.number(),
    overallScore: v.number(),
    tier: v.string(), // "Bronze", "Silver", "Gold", "Platinum", "Diamond"
    lastCalculated: v.number(),
  }).index("by_user", ["userId"]),

  achievements: defineTable({
    userId: v.id("users"),
    achievementId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    unlockedAt: v.number(),
    badgeTokenId: v.optional(v.string()),
    transactionId: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  arbitrageOpportunities: defineTable({
    pair: v.string(),
    solPrice: v.number(),
    ethPrice: v.number(),
    bscPrice: v.number(),
    profitMargin: v.number(),
    volume24h: v.number(),
    gasCost: v.number(),
    riskLevel: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  arbitrageTrades: defineTable({
    userId: v.id("users"),
    pair: v.string(),
    amount: v.number(),
    fromChain: v.string(),
    toChain: v.string(),
    expectedProfit: v.number(),
    actualProfit: v.optional(v.number()),
    status: v.string(), // "pending", "completed", "failed"
    transactionId: v.string(),
    executedAt: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
