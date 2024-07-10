import TradingView from "../components/TradingView";

import Header from "../components/Header";

const Trading = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <h1 className="text-3xl font-bold mb-1">Trading Chart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradingView symbol="BTC/USDT" />
        </div>
      </div>
    </div>
  );
};

export default Trading;
