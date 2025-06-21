import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function PortfolioAnalyzer() {
  const [walletAddress, setWalletAddress] = useState("");
  const [portfolioName, setPortfolioName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const portfolios = useQuery(api.jupiter.getUserPortfolios);
  const analyzeRisk = useAction(api.jupiter.analyzePortfolioRisk);
  const savePortfolio = useMutation(api.jupiter.savePortfolio);
  const generateInsights = useAction(api.ai.generatePortfolioInsights);

  // Generate wallet-specific portfolio data
  const generatePortfolioFromWallet = (walletAddress: string) => {
    const seed = walletAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const random = (min: number, max: number) => {
      const x = Math.sin(seed * 9999) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    };

    const baseTokens = [
      {
        mint: "So11111111111111111111111111111111111111112",
        symbol: "SOL",
        name: "Solana",
        logoUri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      },
      {
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        symbol: "USDC",
        name: "USD Coin",
        logoUri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
      },
      {
        mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        symbol: "USDT",
        name: "Tether USD",
        logoUri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
      },
      {
        mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        symbol: "mSOL",
        name: "Marinade Staked SOL",
        logoUri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
      },
      {
        mint: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
        symbol: "stSOL",
        name: "Lido Staked SOL",
        logoUri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png",
      },
    ];

    const tokenCount = Math.floor(random(2, 5));
    const selectedTokens = baseTokens.slice(0, tokenCount);
    
    return selectedTokens.map((token, index) => {
      const balance = random(0.1, index === 0 ? 50 : 1000);
      const price = token.symbol === "SOL" ? random(180, 220) : 
                   token.symbol === "USDC" || token.symbol === "USDT" ? 1 :
                   random(150, 200);
      
      return {
        ...token,
        balance: parseFloat(balance.toFixed(2)),
        value: parseFloat((balance * price).toFixed(2)),
        price,
      };
    });
  };

  const handleAnalyze = async () => {
    if (!walletAddress.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Generate wallet-specific portfolio data
      const mockTokens = generatePortfolioFromWallet(walletAddress);

      const riskAnalysis = await analyzeRisk({
        tokens: mockTokens.map(t => ({
          mint: t.mint,
          balance: t.balance,
          value: t.value,
        })),
      });

      const insights = await generateInsights({
        portfolio: {
          totalValue: mockTokens.reduce((sum, t) => sum + t.value, 0),
          riskScore: riskAnalysis.riskScore,
          riskLevel: riskAnalysis.riskLevel,
          tokens: mockTokens.map(t => ({
            symbol: t.symbol,
            value: t.value,
            balance: t.balance,
          })),
        },
      });

      setAnalysisResult({
        tokens: mockTokens,
        riskAnalysis,
        insights,
        totalValue: mockTokens.reduce((sum, t) => sum + t.value, 0),
      });

      toast.success("Portfolio analysis completed!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze portfolio");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult || !portfolioName.trim()) {
      toast.error("Please provide a portfolio name");
      return;
    }

    try {
      await savePortfolio({
        walletAddress,
        name: portfolioName,
        tokens: analysisResult.tokens,
        riskAnalysis: analysisResult.riskAnalysis,
      });
      toast.success("Portfolio saved successfully!");
      setAnalysisResult(null);
      setWalletAddress("");
      setPortfolioName("");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save portfolio");
    }
  };

  return (
    <div className="space-y-8">
      <div className="card-glass p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          <span className="gradient-text-animated">Portfolio Risk Analyzer</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter Solana wallet address..."
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Portfolio Name
            </label>
            <input
              type="text"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              placeholder="My DeFi Portfolio"
              className="input-field"
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="mt-6 btn-primary"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Portfolio"}
        </button>
      </div>

      {analysisResult && (
        <div className="card-glass p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analysis Results</h3>
            <button
              onClick={handleSave}
              className="btn-success"
            >
              Save Portfolio
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-400/30 card-hover hover-lift shadow-xl">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Value</h4>
              <p className="text-2xl font-bold gold-text">${analysisResult.totalValue.toLocaleString()}</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-2xl p-6 border border-orange-400/30 card-hover hover-lift shadow-xl">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Risk Score</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysisResult.riskAnalysis.riskScore}/100</p>
            </div>
            
            <div className={`rounded-2xl p-6 border card-hover hover-lift shadow-xl ${
              analysisResult.riskAnalysis.riskLevel === "Low-Risk" 
                ? "bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 border-emerald-400/30"
                : analysisResult.riskAnalysis.riskLevel === "Moderate"
                ? "bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-orange-500/20 border-yellow-400/30"
                : "bg-gradient-to-br from-red-500/20 via-pink-500/20 to-rose-500/20 border-red-400/30"
            }`}>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Risk Level</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysisResult.riskAnalysis.riskLevel}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Token Holdings</h4>
              <div className="space-y-3">
                {analysisResult.tokens.map((token: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-2xl card-hover hover-lift border border-white/30 dark:border-white/10 shadow-lg">
                    <div className="flex items-center space-x-3">
                      {token.logoUri && (
                        <img src={token.logoUri} alt={token.symbol} className="w-8 h-8 rounded-full" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{token.symbol}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{token.balance} tokens</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium gold-text">${token.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">${token.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🤖 AI Insights</h4>
              <div className="bg-gray-50 dark:bg-black/30 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{analysisResult.insights}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {portfolios && portfolios.length > 0 && (
        <div className="card-glass p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Saved Portfolios</h3>
          <div className="grid gap-4">
            {portfolios.map((portfolio) => (
              <div key={portfolio._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/30 rounded-lg card-hover">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{portfolio.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{portfolio.walletAddress.slice(0, 8)}...{portfolio.walletAddress.slice(-8)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium gold-text">${portfolio.totalValue.toLocaleString()}</p>
                  <p className={`text-sm ${
                    portfolio.riskLevel === "Low-Risk" ? "text-green-400" :
                    portfolio.riskLevel === "Moderate" ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {portfolio.riskLevel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
