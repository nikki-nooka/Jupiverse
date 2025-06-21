import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function SwapVisualizer() {
  const [inputToken, setInputToken] = useState("SOL");
  const [outputToken, setOutputToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [routes, setRoutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState("");

  const generateRecommendations = useAction(api.ai.generateSwapRecommendations);

  const tokenMints = {
    SOL: "So11111111111111111111111111111111111111112",
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  };

  // Generate wallet-specific route data
  const generateRoutesFromAmount = (amount: string) => {
    const seed = parseFloat(amount) * 1000;
    
    const random = (min: number, max: number) => {
      const x = Math.sin(seed * 9999) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    };

    const basePrice = inputToken === "SOL" ? 200 : 1;
    const outputPrice = outputToken === "SOL" ? 200 : 1;
    const expectedOutput = (parseFloat(amount) * basePrice) / outputPrice;

    return [
      {
        dex: "Jupiter",
        outputAmount: expectedOutput * random(0.995, 1.002),
        priceImpact: random(0.02, 0.08),
        fees: random(1.5, 2.5),
        poolAddress: "7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm",
        liquidity: random(1800000, 2200000),
      },
      {
        dex: "Raydium",
        outputAmount: expectedOutput * random(0.985, 0.998),
        priceImpact: random(0.05, 0.12),
        fees: random(2.0, 3.0),
        poolAddress: "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2",
        liquidity: random(1200000, 1800000),
      },
      {
        dex: "Orca",
        outputAmount: expectedOutput * random(0.980, 0.995),
        priceImpact: random(0.08, 0.18),
        fees: random(2.5, 3.5),
        poolAddress: "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP",
        liquidity: random(1000000, 1500000),
      },
    ].sort((a, b) => b.outputAmount - a.outputAmount);
  };

  const handleGetRoutes = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const mockRoutes = generateRoutesFromAmount(amount);
      setRoutes(mockRoutes);

      // Generate AI recommendations
      const recommendation = await generateRecommendations({
        inputToken,
        outputToken,
        amount: parseFloat(amount),
        routes: mockRoutes,
      });

      setAiRecommendation(recommendation);
      toast.success("Routes found successfully!");
    } catch (error) {
      console.error("Error getting routes:", error);
      toast.error("Failed to get swap routes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card-glass p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          <span className="gradient-text-animated">Swap Route Visualizer</span>
        </h2>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">From</label>
            <select
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="input-field"
            >
              <option value="SOL">SOL</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">To</label>
            <select
              value={outputToken}
              onChange={(e) => setOutputToken(e.target.value)}
              className="input-field"
            >
              <option value="USDC">USDC</option>
              <option value="SOL">SOL</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Slippage %</label>
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value))}
              step="0.1"
              min="0.1"
              max="5"
              className="input-field"
            />
          </div>
        </div>

        <button
          onClick={handleGetRoutes}
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? "Finding Routes..." : "Get Best Routes"}
        </button>
      </div>

      {routes.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card-glass p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Available Routes</h3>
            <div className="space-y-4">
              {routes.map((route, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer hover-lift ${
                    index === 0
                      ? "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border-purple-400/50 pulse-glow shadow-xl"
                      : "bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/30 dark:border-white/10 hover:border-purple-400/50 shadow-lg"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                        {route.dex}
                        {index === 0 && (
                          <span className="ml-2 px-3 py-1 gradient-rainbow text-white text-xs rounded-full shadow-lg">
                            Best
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Liquidity: ${route.liquidity.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium gold-text">
                        {route.outputAmount.toFixed(4)} {outputToken}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${route.fees.toFixed(2)} fees
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Price Impact:</span>
                    <span className={`font-medium ${
                      route.priceImpact < 0.1 ? "text-green-400" :
                      route.priceImpact < 0.5 ? "text-yellow-400" : "text-red-400"
                    }`}>
                      {route.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="mt-3 h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full progress-bar ${
                        index === 0 ? "gold-gradient" : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                      style={{ width: `${100 - route.priceImpact * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {aiRecommendation && (
            <div className="card-glass p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🤖</span>
                AI Recommendations
              </h3>
              <div className="bg-gray-50 dark:bg-black/30 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {aiRecommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {routes.length > 0 && (
        <div className="card-glass p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Route Visualization</h3>
          <div className="flex items-center justify-center space-x-8 py-8">
            <div className="text-center">
              <div className="w-20 h-20 gradient-rainbow rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 float-slow shadow-2xl pulse-glow">
                {inputToken}
              </div>
              <p className="text-gray-600 dark:text-gray-300">{amount}</p>
            </div>

            <div className="flex-1 relative">
              <div className="h-2 gradient-rainbow rounded-full shadow-xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/60 backdrop-blur-2xl rounded-2xl px-4 py-2 border border-white/30 dark:border-white/10 shadow-xl">
                <p className="text-xs gold-text font-medium">via {routes[0]?.dex}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 gradient-green rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 float-slow shadow-2xl pulse-glow" style={{ animationDelay: '0.5s' }}>
                {outputToken}
              </div>
              <p className="text-gray-600 dark:text-gray-300">{routes[0]?.outputAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
