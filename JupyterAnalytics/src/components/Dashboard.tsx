import { useState } from "react";
import { PortfolioAnalyzer } from "./PortfolioAnalyzer";
import { SwapVisualizer } from "./SwapVisualizer";
import { DCAManager } from "./DCAManager";
import { LimitOrderManager } from "./LimitOrderManager";
import { ArbitrageDashboard } from "./ArbitrageDashboard";
import { HealthScoreDashboard } from "./HealthScoreDashboard";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("arbitrage");

  const tabs = [
    { id: "arbitrage", label: "Cross-Chain Arbitrage", icon: "⚡" },
    { id: "health", label: "Health Score", icon: "🏆" },
    { id: "portfolio", label: "Portfolio", icon: "📊" },
    { id: "swap", label: "Swap Routes", icon: "🔄" },
    { id: "dca", label: "DCA Orders", icon: "⏰" },
    { id: "limits", label: "Limit Orders", icon: "🎯" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Advanced DeFi Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Cross-chain arbitrage, health scoring, and AI-powered portfolio management
        </p>
      </div>

      <div className="mb-8">
        <div className="flex space-x-1 bg-white dark:bg-black/20 backdrop-blur-xl rounded-xl p-1 border border-gray-200 dark:border-white/10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[600px]">
        {activeTab === "arbitrage" && <ArbitrageDashboard />}
        {activeTab === "health" && <HealthScoreDashboard />}
        {activeTab === "portfolio" && <PortfolioAnalyzer />}
        {activeTab === "swap" && <SwapVisualizer />}
        {activeTab === "dca" && <DCAManager />}
        {activeTab === "limits" && <LimitOrderManager />}
      </div>
    </div>
  );
}
