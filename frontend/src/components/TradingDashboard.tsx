import React, { useState } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '../constants/contracts';
import { TOP_STOCKS } from '../constants/stocks';
import { formatUnits } from 'viem';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { OrderEntry } from './OrderEntry';
import { UserPortfolio } from './UserPortfolio';
import { Activity, Zap, Clock } from 'lucide-react';
import { useFinnhub } from '../hooks/useFinnhub';
import { CandleChart } from './CandleChart';

export function TradingDashboard() {
    // Initialize from URL or default to mAAPL
    const [selectedStock, setSelectedStock] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('asset') || 'mAAPL';
    });

    // Sync to URL
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('asset') !== selectedStock) {
            params.set('asset', selectedStock);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, '', newUrl);
        }
    }, [selectedStock]);

    // Real Data Hook
    const { candles, quote, loading } = useFinnhub(selectedStock);

    // On-Chain Price
    const { data: oraclePriceData } = useReadContract({
        ...CONTRACTS.PriceOracle,
        functionName: 'getPrice',
        args: [selectedStock.replace('m', '')],
    });

    const oraclePrice = oraclePriceData ? Number(formatUnits(oraclePriceData as bigint, 8)) : 0;
    // Override: User requested Realtime Market Price = On-Chain Oracle
    const marketPrice = oraclePrice > 0 ? oraclePrice : (quote?.c || 0);

    // Prepare Data for Lightweight Charts
    // Align chart to the Oracle Price (Demo Hack: Shift the whole curve)
    const lastClose = candles?.c?.[candles.c.length - 1] || 0;
    const chartOffset = (lastClose > 0 && oraclePrice > 0) ? (oraclePrice - lastClose) : 0;

    const candleData = React.useMemo(() => {
        if (!candles || !candles.t) return [];
        return candles.t.map((t, i) => ({
            time: t as any, // Lightweight charts handles unix timestamps
            open: candles.o[i] + chartOffset,
            high: candles.h[i] + chartOffset,
            low: candles.l[i] + chartOffset,
            close: candles.c[i] + chartOffset,
        })).sort((a, b) => a.time - b.time);
    }, [candles, chartOffset]);

    return (
        <div className="grid grid-cols-12 gap-6 p-6 max-w-[1600px] mx-auto">
            {/* Header Stat Bar */}
            <div className="col-span-12 grid grid-cols-4 gap-4 mb-2">
                <div className="bg-monad-dark p-4 rounded-none border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.2)] flex items-center justify-between">
                    <div>
                        <p className="text-monad-light text-sm font-bold uppercase">Monad TPS</p>
                        <p className="text-2xl font-black text-monad-purple">10,421</p>
                    </div>
                    <Zap className="text-monad-black" fill="#FFD600" size={32} />
                </div>
                <div className="col-span-3 bg-monad-dark p-4 rounded-none border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.2)] flex items-center gap-6">
                    <div className="flex-1">
                        <label className="text-xs text-monad-light uppercase font-bold tracking-widest mb-1 block">Select Asset</label>
                        <select
                            value={selectedStock}
                            onChange={(e) => setSelectedStock(e.target.value)}
                            className="w-full bg-black text-white font-bold border-2 border-monad-purple rounded-none px-4 py-2 focus:outline-none focus:ring-4 focus:ring-monad-purple/50 transition-all cursor-pointer uppercase tracking-wider"
                        >
                            {TOP_STOCKS.map(stock => (
                                <option key={stock.symbol} value={`m${stock.symbol}`}>
                                    m{stock.symbol} - {stock.name} ({stock.sector})
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Quick Toggles for popular ones */}
                    <div className="hidden md:flex gap-2">
                        {['mAAPL', 'mETH', 'mBTC'].map(sym => (
                            <button
                                key={sym}
                                onClick={() => setSelectedStock(sym)}
                                className={`px-3 py-1 rounded-md text-sm transition-all ${selectedStock === sym ? 'bg-monad-purple/20 text-monad-light border border-monad-purple/50' : 'text-gray-500 hover:text-white border border-transparent'}`}
                            >
                                {sym}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="col-span-12 lg:col-span-8 bg-monad-dark rounded-none border-4 border-black shadow-[8px_8px_0px_rgba(255,215,0,1)] p-6 min-h-[500px]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-5xl font-black text-white mb-2 uppercase tracking-tighter" style={{ textShadow: '4px 4px 0px #FFD700' }}>{selectedStock}</h2>
                        <div className="flex items-baseline gap-4">
                            <div>
                                <span className="text-xs text-black bg-monad-purple px-2 py-1 font-bold uppercase tracking-wide border border-black shadow-[2px_2px_0px_#000]">Real Market</span>
                                <div className="text-4xl font-mono text-white mt-1">${marketPrice.toFixed(2)}</div>
                                <span className={`text-xl font-bold flex items-center gap-1 ${(quote?.dp || 0) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                    {quote?.dp ? `${quote.dp > 0 ? '▲' : '▼'}${quote.dp.toFixed(2)}%` : '--'}
                                </span>
                            </div>

                            <div className="ml-8 pl-8 border-l-4 border-monad-purple">
                                <span className="text-xs text-black bg-white px-2 py-1 font-bold uppercase tracking-wide border border-black shadow-[2px_2px_0px_#000]">Oracle</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="text-3xl font-mono text-monad-light">${oraclePrice.toFixed(2)}</div>
                                    <div className="bg-green-500 text-black px-2 py-1 text-xs font-black uppercase tracking-wider transform -rotate-2 border border-black">
                                        Synced
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 text-sm text-monad-light">
                        <span className="flex items-center gap-1 font-bold uppercase"><Clock size={16} /> 1s Finality</span>
                    </div>
                </div>

                <div className="h-[400px] w-full flex items-center justify-center relative">
                    {loading ? (
                        <div className="text-gray-500">Loading Chart Data...</div>
                    ) : candleData.length === 0 ? (
                        <div className="text-gray-500">No chart data available for {selectedStock}</div>
                    ) : (
                        <CandleChart data={candleData} />
                    )}
                </div>
            </div>

            {/* Sidebar: Order Entry */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Pass market price if oracle is stale/zero, or strictly use oracle price? 
            DEX uses Oracle price for checks, so we should pass Oracle Price but maybe user wants Market?
            Let's pass Oracle Price for consistency with contract. */}
                <OrderEntry selectedStock={selectedStock} currentPrice={oraclePrice > 0 ? oraclePrice : marketPrice} />
                <UserPortfolio />
            </div>

            {/* Recent Trades (Bottom) */}
            <div className="col-span-12 bg-monad-dark rounded-none border-4 border-black shadow-[8px_8px_0px_#000] p-6">
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2 uppercase tracking-tighter">
                    <Activity size={24} className="text-monad-purple" /> Recent Trades
                </h3>
                <div className="w-full overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-monad-light text-sm border-b-2 border-monad-purple/30 uppercase tracking-wider font-bold">
                                <th className="pb-3 pl-2">Time</th>
                                <th className="pb-3">Type</th>
                                <th className="pb-3">Price</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Total</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-mono font-bold">
                            {/* Placeholder rows until we hook up events */}
                            {[1, 2, 3].map((_, i) => (
                                <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                                    <td className="py-3 pl-2 text-gray-300">12:30:{45 + i}</td>
                                    <td className={i % 2 === 0 ? "text-green-400" : "text-monad-purple"}>
                                        {i % 2 === 0 ? "BUY" : "SELL"}
                                    </td>
                                    <td className="py-3 text-white">${((oraclePrice || marketPrice) + i).toFixed(2)}</td>
                                    <td className="py-3 text-white">{(10 * (i + 1)).toFixed(4)}</td>
                                    <td className="py-3 text-gray-300">${(((oraclePrice || marketPrice) + i) * 10).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
