import { useState } from "react";
import { toast } from "sonner";

export function LimitOrderManager() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      inputToken: "SOL",
      outputToken: "USDC",
      amount: 5,
      targetPrice: 250,
      currentPrice: 200,
      isActive: true,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: 2,
      inputToken: "USDC",
      outputToken: "SOL",
      amount: 1000,
      targetPrice: 180,
      currentPrice: 200,
      isActive: true,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
  ]);

  const [newOrder, setNewOrder] = useState({
    inputToken: "SOL",
    outputToken: "USDC",
    amount: "",
    targetPrice: "",
    expiryDays: "30",
  });

  const handleCreateOrder = () => {
    if (!newOrder.amount || !newOrder.targetPrice || parseFloat(newOrder.amount) <= 0 || parseFloat(newOrder.targetPrice) <= 0) {
      toast.error("Please enter valid amount and target price");
      return;
    }

    const order = {
      id: Date.now(),
      inputToken: newOrder.inputToken,
      outputToken: newOrder.outputToken,
      amount: parseFloat(newOrder.amount),
      targetPrice: parseFloat(newOrder.targetPrice),
      currentPrice: 200, // Mock current price
      isActive: true,
      expiresAt: Date.now() + parseInt(newOrder.expiryDays) * 24 * 60 * 60 * 1000,
    };

    setOrders([...orders, order]);
    setNewOrder({ inputToken: "SOL", outputToken: "USDC", amount: "", targetPrice: "", expiryDays: "30" });
    toast.success("Limit order created successfully!");
  };

  const cancelOrder = (id: number) => {
    setOrders(orders.filter(order => order.id !== id));
    toast.success("Order cancelled");
  };

  const getOrderStatus = (order: any) => {
    if (!order.isActive) return { status: "Cancelled", color: "text-gray-400" };
    if (Date.now() > order.expiresAt) return { status: "Expired", color: "text-red-400" };
    
    const isAboveTarget = order.inputToken === "SOL" ? 
      order.currentPrice >= order.targetPrice : 
      order.currentPrice <= order.targetPrice;
    
    if (isAboveTarget) return { status: "Ready to Execute", color: "text-green-400" };
    return { status: "Waiting", color: "text-yellow-400" };
  };

  return (
    <div className="space-y-8">
      <div className="card-glass p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Limit Orders</h2>
        
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">From</label>
            <select
              value={newOrder.inputToken}
              onChange={(e) => setNewOrder({ ...newOrder, inputToken: e.target.value })}
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
              value={newOrder.outputToken}
              onChange={(e) => setNewOrder({ ...newOrder, outputToken: e.target.value })}
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
              value={newOrder.amount}
              onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
              placeholder="0.0"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Target Price</label>
            <input
              type="number"
              value={newOrder.targetPrice}
              onChange={(e) => setNewOrder({ ...newOrder, targetPrice: e.target.value })}
              placeholder="0.0"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Expires In</label>
            <select
              value={newOrder.expiryDays}
              onChange={(e) => setNewOrder({ ...newOrder, expiryDays: e.target.value })}
              className="input-field"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCreateOrder}
          className="btn-primary"
        >
          Create Limit Order
        </button>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Limit Orders</h3>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-500 dark:text-gray-400">No limit orders yet. Set your target prices and let the market come to you!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderStatus = getOrderStatus(order);
              return (
                <div
                  key={order.id}
                  className="p-6 bg-gray-50 dark:bg-black/30 rounded-xl border border-gray-200 dark:border-white/20 hover:border-purple-400/30 transition-all duration-200 card-hover"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {order.amount} {order.inputToken} → {order.outputToken}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Target: ${order.targetPrice} | Current: ${order.currentPrice}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`font-medium ${orderStatus.color}`}>
                        {orderStatus.status}
                      </span>
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="btn-danger"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white dark:bg-black/30 rounded-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price Difference</p>
                      <p className={`font-medium ${
                        order.currentPrice > order.targetPrice ? "text-green-400" : "text-red-400"
                      }`}>
                        {((order.currentPrice - order.targetPrice) / order.targetPrice * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-white dark:bg-black/30 rounded-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expires</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(order.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-black/30 rounded-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Value</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        ${(order.amount * order.targetPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Price Progress</span>
                      <span>${order.currentPrice} / ${order.targetPrice}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full progress-bar ${
                          order.currentPrice >= order.targetPrice
                            ? "bg-gradient-to-r from-green-400 to-emerald-400"
                            : "bg-gradient-to-r from-yellow-400 to-orange-400"
                        }`}
                        style={{ 
                          width: `${Math.min((order.currentPrice / order.targetPrice) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
