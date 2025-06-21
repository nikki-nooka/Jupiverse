import { SignInForm } from "../SignInForm";

export function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Advanced DeFi Analytics
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Cross-chain arbitrage monitoring, DeFi health scoring, and AI-powered portfolio optimization 
            with gamified achievement system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon="⚡"
            title="Cross-Chain Arbitrage"
            description="Real-time price differential monitoring across Solana, Ethereum, and BSC with automated execution"
          />
          <FeatureCard
            icon="🏆"
            title="Health Score Certification"
            description="AI-powered portfolio health scoring with mintable NFT achievement badges"
          />
          <FeatureCard
            icon="🎯"
            title="Risk Management"
            description="Advanced safety scoring and gamified reputation system for DAO participation"
          />
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get Started</h3>
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 p-6 hover:border-purple-400/30 transition-all duration-300 hover:scale-105">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
