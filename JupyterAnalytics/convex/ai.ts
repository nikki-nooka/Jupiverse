"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generatePortfolioInsights = action({
  args: {
    portfolio: v.object({
      totalValue: v.number(),
      riskScore: v.number(),
      riskLevel: v.string(),
      tokens: v.array(v.object({
        symbol: v.string(),
        value: v.number(),
        balance: v.number(),
      })),
    }),
  },
  handler: async (ctx, args) => {
    try {
      const prompt = `
        Analyze this DeFi portfolio and provide insights:
        
        Portfolio Value: $${args.portfolio.totalValue.toLocaleString()}
        Risk Score: ${args.portfolio.riskScore}/100
        Risk Level: ${args.portfolio.riskLevel}
        
        Token Holdings:
        ${args.portfolio.tokens.map(t => `- ${t.symbol}: ${t.balance} tokens ($${t.value.toLocaleString()})`).join('\n')}
        
        Provide 3-4 actionable insights about diversification, risk management, and optimization opportunities.
        Keep it concise and practical for DeFi users.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      });

      return response.choices[0].message.content || "Unable to generate insights at this time.";
    } catch (error) {
      console.error("Error generating portfolio insights:", error);
      return "Portfolio analysis shows good diversification. Consider rebalancing if any single token exceeds 40% of total value.";
    }
  },
});

export const generateSwapRecommendations = action({
  args: {
    inputToken: v.string(),
    outputToken: v.string(),
    amount: v.number(),
    routes: v.array(v.object({
      dex: v.string(),
      outputAmount: v.number(),
      priceImpact: v.number(),
      fees: v.number(),
      liquidity: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    try {
      const bestRoute = args.routes[0];
      const prompt = `
        Analyze these swap routes for ${args.amount} ${args.inputToken} to ${args.outputToken}:
        
        Best Route: ${bestRoute.dex}
        - Output: ${bestRoute.outputAmount.toFixed(4)} ${args.outputToken}
        - Price Impact: ${bestRoute.priceImpact.toFixed(2)}%
        - Fees: $${bestRoute.fees.toFixed(2)}
        - Liquidity: $${bestRoute.liquidity.toLocaleString()}
        
        Other routes available: ${args.routes.slice(1).map(r => r.dex).join(', ')}
        
        Provide a brief recommendation about which route to use and why, considering price impact, fees, and liquidity.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      });

      return response.choices[0].message.content || "The best route offers optimal balance of output amount and low price impact.";
    } catch (error) {
      console.error("Error generating swap recommendations:", error);
      return "Consider using the route with the highest output amount while keeping price impact below 1% for optimal results.";
    }
  },
});

export const chatWithDeFiBot = action({
  args: {
    message: v.string(),
    conversationHistory: v.array(v.object({
      id: v.string(),
      type: v.string(),
      content: v.string(),
      timestamp: v.number(),
      data: v.optional(v.any()),
    })),
    userPortfolios: v.optional(v.array(v.object({
      _id: v.id("portfolios"),
      name: v.string(),
      totalValue: v.number(),
      riskLevel: v.string(),
      riskScore: v.number(),
      walletAddress: v.string(),
      lastUpdated: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    // Analyze user intent and extract relevant information
    const intent = analyzeUserIntent(args.message);
    
    try {
      // Build context from conversation history and user data
      const context = buildContext(args.conversationHistory, args.userPortfolios || []);
      
      let responseData: any = null;
      let systemPrompt = `
        You are a DeFi Analytics Assistant for Solana. You help with:
        - Portfolio risk analysis and optimization
        - Swap routes (Jupiter, Raydium, Orca) and DEX comparisons  
        - DeFi health scores and tier improvements
        - Arbitrage opportunities across DEXs
        - DCA strategy setup and automation
        - Limit orders and advanced trading
        
        User Context:
        ${context}
        
        Be conversational and provide actionable advice with specific data.
        Explain DeFi concepts clearly and mention risks/best practices.
        Ask for wallet addresses or amounts when needed for analysis.
        Keep responses informative but concise (2-4 sentences per point).
      `;

      // Handle specific intents with mock data
      if (intent.type === "portfolio_analysis") {
        responseData = generateMockPortfolioData(intent.walletAddress || undefined);
        systemPrompt += `\n\nUser wants portfolio analysis. ${responseData ? 'Use mock data for specific insights about composition, risk, and optimization.' : 'Ask for wallet address for detailed analysis.'}`;
      } else if (intent.type === "swap_routes") {
        responseData = generateMockSwapData(intent.inputToken || "SOL", intent.outputToken || "USDC", intent.amount || 1);
        systemPrompt += `\n\nUser wants swap routes. Use mock data to compare DEXs, explain price impact, and recommend best route.`;
      } else if (intent.type === "health_score") {
        responseData = generateMockHealthData(intent.walletAddress || undefined);
        systemPrompt += `\n\nUser wants health score. ${responseData ? 'Use mock data to explain tier, scores, and improvement tips.' : 'Ask for wallet address to calculate score.'}`;
      } else if (intent.type === "arbitrage") {
        systemPrompt += `\n\nUser interested in arbitrage. Explain cross-DEX arbitrage on Solana, Jupiter aggregation, risks/rewards.`;
      } else if (intent.type === "dca_strategy") {
        systemPrompt += `\n\nUser wants DCA help. Explain benefits, suggest frequency, mention automation options.`;
      } else if (intent.type === "limit_order") {
        systemPrompt += `\n\nUser asking about limit orders. Explain how they work, when to use vs market orders.`;
      }

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...args.conversationHistory.slice(-5).map(msg => ({
          role: msg.type === "user" ? "user" as const : "assistant" as const,
          content: msg.content,
        })),
        { role: "user" as const, content: args.message },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages,
        max_tokens: 500,
      });

      const aiMessage = response.choices[0].message.content;
      let finalMessage = aiMessage || "I'm here to help with your DeFi analytics needs!";
      
      return {
        message: finalMessage,
        data: responseData,
      };
    } catch (error) {
      console.error("Error in DeFi chat bot:", error);
      // Provide helpful fallback based on intent
      let fallbackMessage = "I'm having technical difficulties. Please try again.";
      
      if (intent.type === "portfolio_analysis") {
        fallbackMessage = "I can analyze portfolios! Provide a wallet address for risk assessment and optimization tips.";
      } else if (intent.type === "swap_routes") {
        fallbackMessage = "Jupiter offers the best swap rates by aggregating DEXs. Consider price impact for large trades.";
      } else if (intent.type === "health_score") {
        fallbackMessage = "I calculate DeFi health scores based on diversification, security, and governance. Need a wallet address.";
      }
      
      return {
        message: fallbackMessage,
        data: null,
      };
    }
  },
});

function analyzeUserIntent(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Extract wallet address if present
  const walletMatch = message.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
  const walletAddress = walletMatch ? walletMatch[0] : null;
  
  // Extract token symbols
  const tokenMatch = message.match(/\b(SOL|USDC|USDT|BTC|ETH|mSOL|stSOL|BONK|WIF|JUP|RAY)\b/gi);
  const tokens = tokenMatch || [];
  
  // Extract amounts
  const amountMatch = message.match(/\b\d+(?:\.\d+)?\b/);
  const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

  // Portfolio analysis keywords
  if (lowerMessage.includes("portfolio") || lowerMessage.includes("risk") || 
      lowerMessage.includes("analyze") || lowerMessage.includes("diversif") ||
      lowerMessage.includes("balance") || lowerMessage.includes("allocation")) {
    return {
      type: "portfolio_analysis",
      walletAddress,
      confidence: 0.9,
    };
  }
  
  // Swap routes keywords
  if (lowerMessage.includes("swap") || lowerMessage.includes("route") || 
      lowerMessage.includes("dex") || lowerMessage.includes("exchange") ||
      lowerMessage.includes("trade") || lowerMessage.includes("convert") ||
      (tokens.length >= 2 && (lowerMessage.includes("to") || lowerMessage.includes("for")))) {
    return {
      type: "swap_routes",
      inputToken: tokens[0] || "SOL",
      outputToken: tokens[1] || "USDC",
      amount: amount || 1,
      confidence: 0.9,
    };
  }
  
  // Health score keywords
  if (lowerMessage.includes("health") || lowerMessage.includes("score") || 
      lowerMessage.includes("tier") || lowerMessage.includes("rating") ||
      lowerMessage.includes("grade") || lowerMessage.includes("assessment")) {
    return {
      type: "health_score",
      walletAddress,
      confidence: 0.9,
    };
  }
  
  if (lowerMessage.includes("arbitrage") || lowerMessage.includes("profit") || lowerMessage.includes("opportunity")) {
    return {
      type: "arbitrage",
      confidence: 0.7,
    };
  }
  
  if (lowerMessage.includes("dca") || lowerMessage.includes("dollar cost") || lowerMessage.includes("averaging")) {
    return {
      type: "dca_strategy",
      confidence: 0.7,
    };
  }
  
  return {
    type: "general",
    confidence: 0.5,
  };
}

function buildContext(history: any[], portfolios: any[]) {
  let context = "";
  
  if (portfolios.length > 0) {
    context += `User has ${portfolios.length} saved portfolio(s):\n`;
    portfolios.forEach(p => {
      context += `- ${p.name}: $${p.totalValue.toLocaleString()} (${p.riskLevel} risk)\n`;
    });
  }
  
  if (history.length > 0) {
    context += `\nRecent conversation context:\n`;
    history.slice(-3).forEach(msg => {
      context += `${msg.type}: ${msg.content.substring(0, 100)}...\n`;
    });
  }
  
  return context;
}

function generateMockPortfolioData(walletAddress?: string) {
  if (!walletAddress) return null;
  
  const seed = walletAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  const totalValue = Math.round(random(1000, 50000));
  const tokenCount = Math.floor(random(3, 12));
  const riskScore = Math.round(random(20, 90));
  
  let riskLevel = "Low-Risk";
  if (riskScore > 70) riskLevel = "High-Stakes";
  else if (riskScore > 40) riskLevel = "Moderate";

  return {
    type: "portfolio_analysis",
    totalValue,
    riskLevel,
    tokenCount,
    riskScore,
    diversificationScore: Math.round(random(30, 95)),
    topTokens: ["SOL", "USDC", "RAY", "JUP"].slice(0, Math.min(tokenCount, 4)),
  };
}

function generateMockSwapData(inputToken: string, outputToken: string, amount: number) {
  const prices: Record<string, number> = {
    SOL: 200, USDC: 1, USDT: 1, RAY: 2.5, JUP: 0.8, BONK: 0.00002
  };
  
  const basePrice = prices[inputToken] || 1;
  const outputPrice = prices[outputToken] || 1;
  const expectedOutput = (amount * basePrice) / outputPrice;

  return {
    type: "swap_routes",
    inputToken,
    outputToken,
    amount,
    bestRoute: {
      dex: "Jupiter",
      outputAmount: expectedOutput * 0.998,
      priceImpact: amount > 1000 ? 0.15 : 0.05,
      fees: 2.1,
    },
    alternativeRoutes: [
      { dex: "Raydium", outputAmount: expectedOutput * 0.995, priceImpact: 0.08 },
      { dex: "Orca", outputAmount: expectedOutput * 0.992, priceImpact: 0.12 }
    ],
  };
}

function generateMockHealthData(walletAddress?: string) {
  if (!walletAddress) return null;
  
  const seed = walletAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  const overallScore = Math.round(random(40, 95));
  let tier = "Bronze";
  if (overallScore >= 85) tier = "Diamond";
  else if (overallScore >= 75) tier = "Platinum";
  else if (overallScore >= 65) tier = "Gold";
  else if (overallScore >= 50) tier = "Silver";

  return {
    type: "health_score",
    overallScore,
    tier,
    diversificationScore: Math.round(random(30, 90)),
    securityScore: Math.round(random(40, 95)),
    governanceScore: Math.round(random(20, 80)),
    experienceScore: Math.round(random(30, 85)),
  };
}
