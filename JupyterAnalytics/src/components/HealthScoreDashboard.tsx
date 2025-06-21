import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface HealthMetrics {
  diversificationScore: number;
  securityScore: number;
  governanceScore: number;
  experienceScore: number;
  overallScore: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  badges: string[];
  recommendations: string[];
  portfolioInsights: {
    totalValue: number;
    tokenCount: number;
    categories: string[];
    walletAge: number;
    transactionCount: number;
    uniqueProtocols: number;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export function HealthScoreDashboard() {
  const [walletAddress, setWalletAddress] = useState("");
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const calculateHealthScore = useAction(api.health.calculateHealthScore);
  const mintAchievementBadge = useMutation(api.jupiter.mintAchievementBadge);

  useEffect(() => {
    // Initialize achievements
    setAchievements([
      {
        id: "diversifier",
        name: "Portfolio Diversifier",
        description: "Hold tokens from 5+ different categories",
        icon: "🎯",
        unlocked: false,
        progress: 0,
        maxProgress: 5,
      },
      {
        id: "security_expert",
        name: "Security Expert",
        description: "Maintain 90+ security score",
        icon: "🛡️",
        unlocked: false,
        progress: 0,
        maxProgress: 90,
      },
      {
        id: "governance_guru",
        name: "Governance Guru",
        description: "Participate in 10+ DAO votes",
        icon: "🗳️",
        unlocked: false,
        progress: 0,
        maxProgress: 10,
      },
      {
        id: "diamond_hands",
        name: "Diamond Hands",
        description: "Hold positions for 6+ months",
        icon: "💎",
        unlocked: false,
        progress: 0,
        maxProgress: 180,
      },
      {
        id: "defi_explorer",
        name: "DeFi Explorer",
        description: "Use 10+ different protocols",
        icon: "🌐",
        unlocked: false,
        progress: 0,
        maxProgress: 10,
      },
      {
        id: "veteran_trader",
        name: "Veteran Trader",
        description: "Wallet active for 1+ year",
        icon: "⭐",
        unlocked: false,
        progress: 0,
        maxProgress: 365,
      },
    ]);
  }, []);

  const handleAnalyzeHealth = async () => {
    if (!walletAddress.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await calculateHealthScore({ walletAddress });
      setHealthMetrics(result);
      
      // Update achievements based on health score
      updateAchievements(result);
      
      toast.success("Health score calculated successfully!");
    } catch (error) {
      console.error("Error calculating health score:", error);
      toast.error("Failed to calculate health score");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateAchievements = (metrics: HealthMetrics) => {
    setAchievements(prev => prev.map(achievement => {
      let progress = achievement.progress;
      let unlocked = achievement.unlocked;

      switch (achievement.id) {
        case "diversifier":
          progress = metrics.portfolioInsights.categories.length;
          unlocked = progress >= achievement.maxProgress;
          break;
        case "security_expert":
          progress = metrics.securityScore;
          unlocked = progress >= achievement.maxProgress;
          break;
        case "governance_guru":
          progress = Math.min(metrics.governanceScore / 7, achievement.maxProgress);
          unlocked = progress >= achievement.maxProgress;
          break;
        case "diamond_hands":
          progress = Math.min(metrics.portfolioInsights.walletAge, achievement.maxProgress);
          unlocked = progress >= achievement.maxProgress;
          break;
        case "defi_explorer":
          progress = metrics.portfolioInsights.uniqueProtocols;
          unlocked = progress >= achievement.maxProgress;
          break;
        case "veteran_trader":
          progress = metrics.portfolioInsights.walletAge;
          unlocked = progress >= achievement.maxProgress;
          break;
        default:
          break;
      }

      return { ...achievement, progress, unlocked };
    }));
  };

  const handleMintBadge = async (achievementId: string) => {
    try {
      await mintAchievementBadge({ achievementId, walletAddress });
      toast.success("Achievement badge minted as NFT!");
    } catch (error) {
      toast.error("Failed to mint badge");
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Diamond": return "from-yellow-300 to-yellow-500";
      case "Platinum": return "from-gray-300 to-gray-400";
      case "Gold": return "from-yellow-400 to-yellow-600";
      case "Silver": return "from-gray-400 to-gray-500";
      case "Bronze": return "from-orange-600 to-red-600";
      default: return "from-gray-400 to-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-yellow-500";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-8">
      {/* Health Score Calculator */}
      <div className="card-glass p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          <span className="gradient-text-animated">DeFi Health Score Certification</span>
        </h2>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter wallet address to analyze..."
            className="flex-1 input-field"
          />
          <button
            onClick={handleAnalyzeHealth}
            disabled={isAnalyzing}
            className="px-8 py-3 btn-primary"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Health"}
          </button>
        </div>
      </div>

      {/* Health Score Results */}
      {healthMetrics && (
        <div className="card-glass p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Health Score Results</h3>
            <div className={`px-6 py-3 rounded-full bg-gradient-to-r ${getTierColor(healthMetrics.tier)} text-white font-bold text-lg shadow-lg`}>
              {healthMetrics.tier} Tier
            </div>
          </div>

          {/* Portfolio Insights */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-400/30 hover-lift shadow-xl">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Portfolio Value</h4>
              <p className="text-xl font-bold gold-text">${healthMetrics.portfolioInsights.totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-2xl p-6 border border-blue-400/30 hover-lift shadow-xl">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Tokens</h4>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{healthMetrics.portfolioInsights.tokenCount}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 rounded-2xl p-6 border border-emerald-400/30 hover-lift shadow-xl">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Protocols</h4>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{healthMetrics.portfolioInsights.uniqueProtocols}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 rounded-2xl p-6 border border-purple-400/30 hover-lift shadow-xl">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Wallet Age</h4>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{Math.round(healthMetrics.portfolioInsights.walletAge / 30)} months</p>
            </div>
          </div>

          {/* Overall Score */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-36 h-36 rounded-full gradient-rainbow flex items-center justify-center shadow-2xl pulse-glow">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-inner">
                  <span className={`text-3xl font-bold ${getScoreColor(healthMetrics.overallScore)}`}>
                    {healthMetrics.overallScore}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border gold-border">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Overall Score</span>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-400/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Diversification</h4>
                <span className="text-2xl">🎯</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Score</span>
                  <span className={`font-bold ${getScoreColor(healthMetrics.diversificationScore)}`}>
                    {healthMetrics.diversificationScore}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${healthMetrics.diversificationScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-400/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Security</h4>
                <span className="text-2xl">🛡️</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Score</span>
                  <span className={`font-bold ${getScoreColor(healthMetrics.securityScore)}`}>
                    {healthMetrics.securityScore}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-1000"
                    style={{ width: `${healthMetrics.securityScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Governance</h4>
                <span className="text-2xl">🗳️</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Score</span>
                  <span className={`font-bold ${getScoreColor(healthMetrics.governanceScore)}`}>
                    {healthMetrics.governanceScore}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000"
                    style={{ width: `${healthMetrics.governanceScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-400/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Experience</h4>
                <span className="text-2xl">⭐</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Score</span>
                  <span className={`font-bold ${getScoreColor(healthMetrics.experienceScore)}`}>
                    {healthMetrics.experienceScore}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full gold-gradient rounded-full transition-all duration-1000"
                    style={{ width: `${healthMetrics.experienceScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {healthMetrics.badges.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🏆 Earned Badges</h4>
              <div className="flex flex-wrap gap-2">
                {healthMetrics.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 gold-gradient text-white text-sm font-medium rounded-full shadow-lg badge-glow"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🤖 AI Recommendations</h4>
            <div className="space-y-2">
              {healthMetrics.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="gold-text mt-1">•</span>
                  <p className="text-gray-700 dark:text-gray-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Achievements & Badges */}
      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Achievement Badges</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-6 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer card-hover ${
                achievement.unlocked
                  ? "achievement-unlocked"
                  : "achievement-locked"
              }`}
            >
              <div className="text-center mb-4">
                <div className={`text-4xl mb-2 ${achievement.unlocked ? "" : "grayscale opacity-50"}`}>
                  {achievement.icon}
                </div>
                <h4 className={`font-semibold ${achievement.unlocked ? "gold-text" : "text-gray-600 dark:text-gray-400"}`}>
                  {achievement.name}
                </h4>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
                {achievement.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Progress</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {Math.round(achievement.progress)}/{achievement.maxProgress}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      achievement.unlocked
                        ? "gold-gradient"
                        : "bg-gradient-to-r from-gray-400 to-gray-500"
                    }`}
                    style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {achievement.unlocked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMintBadge(achievement.id);
                  }}
                  className="w-full mt-4 px-4 py-2 btn-primary"
                >
                  Mint NFT Badge
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
