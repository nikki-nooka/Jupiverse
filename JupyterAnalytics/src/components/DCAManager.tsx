import { useState } from "react";
import { toast } from "sonner";

export function DCAManager() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      inputToken: "USDC",
      outputToken: "SOL",
      amount: 100,
      frequency: "weekly",
      isActive: true,
      nextExecution: Date.now() + 7 * 24 * 60 * 60 * 1000,
      totalExecutions: 12,
      averagePrice: 195.50,
    },
    {
      id: 2,
      inputToken: "USDC",
      outputToken: "BTC",
      amount: 50,
      frequency: "daily",
      isActive: false,
      nextExecution: Date.now() + 24 * 60 * 60 * 1000,
      totalExecutions: 30,
      averagePrice: 42000,
    },
  ]);

  const [newOrder, setNewOrder] = useState({
    inputToken: "USDC",
    outputToken: "SOL",
    amount: "",
    frequency: "weekly",
  });

  const handleCreateOrder = () => {
    if (!newOrder.amount || parseFloat(newOrder.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const order = {
      id: Date.now(),
      ...newOrder,
      amount: parseFloat(newOrder.amount),
      isActive: true,
      nextExecution: Date.now() + (newOrder.frequency === "daily" ? 24 : 7 * 24) * 60 * 60 * 1000,
      totalExecutions: 0,
      averagePrice: 0,
    };

    setOrders([...orders, order]);
    setNewOrder({ inputToken: "USDC", outputToken: "SOL", amount: "", frequency: "weekly" });
    toast.success("DCA order created successfully!");
  };

  const toggleOrder = (id: number) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, isActive: !order.isActive } : order
    ));
    toast.success("Order status updated");
  };

  const deleteOrder = (id: number) => {
    setOrders(orders.filter(order => order.id !== id));
    toast.success("Order deleted");
  };

  return (
    <div className="space-y-8">
      <div className="card-glass p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dollar Cost Averaging</h2>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">From</label>
            <select
              value={newOrder.inputToken}
              onChange={(e) => setNewOrder({ ...newOrder, inputToken: e.target.value })}
              className="input-field"
            >
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
              <option value="SOL">SOL</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              value={newOrder.amount}
              onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
              placeholder="100"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Frequency</label>
            <select
              value={newOrder.frequency}
              onChange={(e) => setNewOrder({ ...newOrder, frequency: e.target.value })}
              className="input-field"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCreateOrder}
          className="btn-primary"
        >
          Create DCA Order
        </button>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Active DCA Orders</h3>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏰</div>
            <p className="text-gray-500 dark:text-gray-400">No DCA orders yet. Create your first automated investment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`p-6 rounded-xl border transition-all duration-200 card-hover ${
                  order.isActive
                    ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30"
                    : "bg-gray-50 dark:bg-black/30 border-gray-200 dark:border-gray-600/30"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      ${order.amount} {order.inputToken} → {order.outputToken}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">{order.frequency} purchases</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleOrder(order.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        order.isActive
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {order.isActive ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-black/30 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Execution</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(order.nextExecution).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-black/30 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Executions</p>
                    <p className="text-gray-900 dark:text-white font-medium">{order.totalExecutions}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-black/30 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Price</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      ${order.averagePrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{order.totalExecutions} executions</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full progress-bar"
                      style={{ width: `${Math.min((order.totalExecutions / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
