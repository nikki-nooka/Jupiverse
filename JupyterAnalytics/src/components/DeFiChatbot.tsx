import { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: number;
  data?: any;
}

export function DeFiChatbot() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    type: "bot",
    content:
      "👋 Hi! I'm your DeFi Analytics Assistant for Solana. I can help you:\n\n📊 Analyze portfolio risk and diversification\n🔄 Find optimal swap routes across DEXs\n💚 Calculate DeFi health scores and earn tiers\n⚡ Discover arbitrage opportunities\n📈 Set up DCA and limit order strategies\n\nTry asking me something like 'analyze my portfolio' or use the quick actions below!",
    timestamp: Date.now(),
  }]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatWithBot = useAction(api.ai.chatWithDeFiBot);
  const portfolios = useQuery(api.jupiter.getUserPortfolios);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await chatWithBot({
        message: input,
        conversationHistory: [...messages.slice(-10), userMessage],
        userPortfolios: portfolios,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response.message,
        timestamp: Date.now(),
        data: response.data,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response from AI assistant");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "I'm sorry, I encountered an error. Please try again or rephrase your question.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { text: "Analyze portfolio  wallet", icon: "📊" },
    { text: "Best route to swap 10 SOL to USDC", icon: "🔄" },
    { text: "Calculate health score for my wallet", icon: "💚" },
    { text: "What are current arbitrage opportunities?", icon: "⚡" },
    { text: "How do I set up a DCA strategy for SOL?", icon: "📈" },
    { text: "Explain Jupiter limit orders", icon: "🎯" },
  ];

  const handleQuickAction = (text: string) => {
    setInput(text);
  };

  const renderMessage = (message: Message) => {
    const bubbleStyles =
      message.type === "user"
        ? "flex justify-end mb-4"
        : "flex justify-start mb-4";

    return (
      <div key={message.id} className={bubbleStyles}>
        <div className="flex items-start space-x-3">
          {message.type === "bot" && (
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
              🤖
            </div>
          )}
          <div className={`max-w-xs lg:max-w-md px-6 py-3 rounded-2xl shadow-xl ${message.type === "user" ? "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white" : "bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 text-gray-900 dark:text-white"}`}>
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            {message.data && renderMessageData(message.data)}
            <p className="text-xs opacity-75 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderMessageData = (data: any) => {
    if (data.type === "portfolio_analysis") {
      return (
        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Portfolio Summary</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Total Value:</span>
              <span className="font-medium">${data.totalValue?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Level:</span>
              <span className={`font-medium ${data.riskLevel === "Low-Risk" ? "text-green-500" : data.riskLevel === "Moderate" ? "text-yellow-500" : "text-red-500"}`}>{data.riskLevel}</span>
            </div>
            <div className="flex justify-between">
              <span>Tokens:</span>
              <span className="font-medium">{data.tokenCount}</span>
            </div>
          </div>
        </div>
      );
    }

    if (data.type === "swap_routes") {
      return (
        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Best Route</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>DEX:</span>
              <span className="font-medium">{data.bestRoute?.dex}</span>
            </div>
            <div className="flex justify-between">
              <span>Output:</span>
              <span className="font-medium">{data.bestRoute?.outputAmount?.toFixed(4)} {data.outputToken}</span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact:</span>
              <span className="font-medium">{data.bestRoute?.priceImpact?.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      );
    }

    if (data.type === "health_score") {
      return (
        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Health Score</h4>
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{data.overallScore}</span>
            </div>
          </div>
          <div className="text-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.tier === "Diamond" ? "bg-yellow-100 text-yellow-800" : data.tier === "Gold" ? "bg-yellow-100 text-yellow-700" : data.tier === "Silver" ? "bg-gray-100 text-gray-700" : "bg-orange-100 text-orange-700"}`}>{data.tier} Tier</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          <span className="gradient-text-animated">🤖 DeFi Analytics Assistant</span>
        </h2>

        <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-black/20 rounded-lg">
          {messages.map(renderMessage)}

          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🤖</div>
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.text)}
                className="px-4 py-2 bg-gradient-to-r from-white/80 to-white/60 dark:from-black/60 dark:to-black/40 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 rounded-2xl text-sm transition-all duration-300 flex items-center space-x-2 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-lg hover-lift"
              >
                <span>{action.icon}</span>
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about DeFi analytics, portfolio analysis, swap routes, health scores..."
            className="flex-1 input-field resize-none"
            rows={2}
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="px-6 py-2 btn-primary self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
