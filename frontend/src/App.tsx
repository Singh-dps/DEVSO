import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TradingDashboard } from './components/TradingDashboard';

function App() {
  return (
    <div className="min-h-screen bg-monad-black text-white font-sans selection:bg-monad-purple/30">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-monad-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-monad-purple rounded-lg flex items-center justify-center font-black italic text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">M</div>
            <span className="font-black text-xl tracking-tight uppercase">MONA</span>
          </div>



          <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
        </div>
      </nav>

      <main className="pt-6 pb-20">
        <TradingDashboard />
      </main>
    </div>
  );
}

export default App;
