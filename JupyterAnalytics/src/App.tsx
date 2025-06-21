import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { ThemeToggle } from "./components/ThemeToggle";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { PortfolioAnalyzer } from "./components/PortfolioAnalyzer";
import { SwapVisualizer } from "./components/SwapVisualizer";
import { HealthScoreDashboard } from "./components/HealthScoreDashboard";
import { ArbitrageDashboard } from "./components/ArbitrageDashboard";
import { DCAManager } from "./components/DCAManager";
import { LimitOrderManager } from "./components/LimitOrderManager";
import { DeFiChatbot } from "./components/DeFiChatbot";
import { Toaster } from "sonner";

type Tab = "dashboard" | "portfolio" | "swap" | "health" | "arbitrage" | "dca" | "orders" | "chatbot";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const user = useQuery(api.auth.loggedInUser);

  const tabs = [
    { id: "dashboard" as Tab, name: "Dashboard", icon: "📊" },
    { id: "portfolio" as Tab, name: "Portfolio", icon: "💼" },
    { id: "swap" as Tab, name: "Swap Routes", icon: "🔄" },
    { id: "health" as Tab, name: "Health Score", icon: "💚" },
    { id: "arbitrage" as Tab, name: "Arbitrage", icon: "⚡" },
    { id: "dca" as Tab, name: "DCA", icon: "📈" },
    { id: "orders" as Tab, name: "Orders", icon: "🎯" },
    { id: "chatbot" as Tab, name: "AI Assistant", icon: "🤖" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "portfolio":
        return <PortfolioAnalyzer />;
      case "swap":
        return <SwapVisualizer />;
      case "health":
        return <HealthScoreDashboard />;
      case "arbitrage":
        return <ArbitrageDashboard />;
      case "dca":
        return <DCAManager />;
      case "orders":
        return <LimitOrderManager />;
      case "chatbot":
        return <DeFiChatbot />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black transition-colors duration-300">
      <Toaster position="top-right" richColors />
      
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
      
      <Authenticated>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="bg-white/80 dark:bg-black/40 backdrop-blur-2xl border-b border-white/20 dark:border-white/10 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold">
                    <span className="gradient-text-animated">Jupiter Analytics Pro</span>
                  </div>
                  {user && (
                    <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
                      Welcome back, {user.name || "DeFi Trader"}!
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  <SignOutButton />
                </div>
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <nav className="w-64 bg-white/80 dark:bg-black/40 backdrop-blur-2xl border-r border-white/20 dark:border-white/10 shadow-2xl">
              <div className="p-4">
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 hover-lift ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-400/50 text-purple-700 dark:text-purple-300 shadow-xl pulse-glow"
                          : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 hover:shadow-lg"
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <div className="max-w-7xl mx-auto p-6">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </Authenticated>
    </div>
  );
}

export default App;
