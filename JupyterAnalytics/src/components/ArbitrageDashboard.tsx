import { useState, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ArbitrageOpportunity {
  pair: string;
  solPrice: number;
  ethPrice: number;
  bscPrice: number;
  profitMargin: number;
  volume24h: number;
  gasCost: number;
  netProfit: number;
  riskLevel: "Low" | "Medium" | "High";
}

export function ArbitrageDashboard() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [selectedPair, setSelectedPair] = useState<ArbitrageOpportunity | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const getArbitrageOpportunities = useAction(api.arbitrage.getArbitrageOpportunities);
  const executeArbitrage = useAction(api.arbitrage.executeArbitrage);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(fetchOpportunities, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, refreshInterval]);

  const fetchOpportunities = async () => {
    try {
      const data = await getArbitrageOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    }
  };

  const handleExecuteArbitrage = async (opportunity: ArbitrageOpportunity) => {
    try {
      await executeArbitrage({
        pair: opportunity.pair,
        amount: 1000, // Default amount
        fromChain: "solana",
        toChain: "ethereum",
      });
      toast.success("Arbitrage executed successfully!");
    } catch (error) {
      toast.error("Failed to execute arbitrage");
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-400 bg-green-400/10";
      case "Medium": return "text-yellow-400 bg-yellow-400/10";
      case "High": return "text-red-400 bg-red-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getProfitColor = (profit: number) => {
    if (profit > 5) return "text-green-400";
    if (profit > 2) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-8">
      {/* Control Panel */}
      <div className="bg-white dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cross-Chain Arbitrage Monitor</h2>
          <div className="flex items-center space-x-4">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-4 py-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all"
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
            <button
              onClick={() => {
                setIsMonitoring(!isMonitoring);
                if (!isMonitoring) fetchOpportunities();
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                isMonitoring
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              }`}
            >
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-400/20">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Active Opportunities</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{opportunities.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/20">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Best Profit</h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {opportunities.length > 0 ? `${Math.max(...opportunities.map(o => o.profitMargin)).toFixed(2)}%` : "0%"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-400/20">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Avg Gas Cost</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${opportunities.length > 0 ? (opportunities.reduce((sum, o) => sum + o.gasCost, 0) / opportunities.length).toFixed(2) : "0"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/20">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Volume</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${opportunities.reduce((sum, o) => sum + o.volume24h, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Arbitrage Heatmap */}
      <div className="bg-white dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Arbitrage Opportunities Heatmap</h3>
        
        {opportunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400">
              {isMonitoring ? "Scanning for opportunities..." : "Start monitoring to see arbitrage opportunities"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {opportunities.map((opportunity, index) => (
              <div
                key={index}
                onClick={() => setSelectedPair(opportunity)}
                className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  opportunity.profitMargin > 5
                    ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30 hover:border-green-400/50"
                    : opportunity.profitMargin > 2
                    ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-400/30 hover:border-yellow-400/50"
                    : "bg-gray-50 dark:bg-black/30 border-gray-200 dark:border-white/20 hover:border-purple-400/50"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{opportunity.pair}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>SOL: ${opportunity.solPrice}</span>
                      <span>ETH: ${opportunity.ethPrice}</span>
                      <span>BSC: ${opportunity.bscPrice}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getProfitColor(opportunity.profitMargin)}`}>
                      +{opportunity.profitMargin.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Net: ${opportunity.netProfit.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(opportunity.riskLevel)}`}>
                      {opportunity.riskLevel} Risk
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Vol: ${opportunity.volume24h.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExecuteArbitrage(opportunity);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                  >
                    Execute
                  </button>
                </div>

                {/* Profit Visualization Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        opportunity.profitMargin > 5
                          ? "bg-gradient-to-r from-green-400 to-emerald-400"
                          : opportunity.profitMargin > 2
                          ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                          : "bg-gradient-to-r from-red-400 to-pink-400"
                      }`}
                      style={{ width: `${Math.min(opportunity.profitMargin * 10, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Analysis Modal */}
      {selectedPair && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPair.pair} Analysis</h3>
              <button
                onClick={() => setSelectedPair(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500 dark:text-gray-400">×</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Price Comparison Chart */}
              <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Comparison</h4>
                <div className="space-y-4">
                  {[
                    { chain: "Solana", price: selectedPair.solPrice, color: "from-purple-400 to-blue-400" },
                    { chain: "Ethereum", price: selectedPair.ethPrice, color: "from-blue-400 to-cyan-400" },
                    { chain: "BSC", price: selectedPair.bscPrice, color: "from-yellow-400 to-orange-400" },
                  ].map((item) => (
                    <div key={item.chain} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{item.chain}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${(item.price / Math.max(selectedPair.solPrice, selectedPair.ethPrice, selectedPair.bscPrice)) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-900 dark:text-white font-semibold">${item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Strategy */}
              <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Execution Strategy</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Optimal Route</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Buy on {selectedPair.solPrice < selectedPair.ethPrice ? "Solana" : "Ethereum"} → 
                      Sell on {selectedPair.solPrice > selectedPair.ethPrice ? "Solana" : "Ethereum"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Gas Optimization</p>
                    <p className="text-gray-900 dark:text-white font-medium">${selectedPair.gasCost.toFixed(2)} total cost</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  handleExecuteArbitrage(selectedPair);
                  setSelectedPair(null);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
              >
                Execute Arbitrage Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
