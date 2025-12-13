import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../constants/contracts';
import { parseUnits, formatUnits } from 'viem';
import { Loader2 } from 'lucide-react';

interface OrderEntryProps {
    selectedStock: string;
    currentPrice: number;
}

export function OrderEntry({ selectedStock, currentPrice }: OrderEntryProps) {
    const { address } = useAccount();
    const [isBuy, setIsBuy] = useState(true);
    const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
    const [amount, setAmount] = useState('');
    const [limitPrice, setLimitPrice] = useState('');

    const { writeContract, data: hash, isPending: isTxPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // Read USD Balance and Stock Balance
    // USD
    const { data: usdBalance } = useReadContract({
        ...CONTRACTS.MockUSD,
        functionName: 'balanceOf',
        args: [address],
    });

    // Check Allowance for USD (Buy) or Stock (Sell)
    const { data: usdAllowance, refetch: refetchUsdAllow } = useReadContract({
        ...CONTRACTS.MockUSD,
        functionName: 'allowance',
        args: [address, CONTRACTS.LightningDEX.address],
    });

    const isPending = isTxPending || isConfirming;

    const handleTrade = async () => {
        if (!amount || !address) return;

        const parsedAmount = parseUnits(amount, 18);
        const parsedPrice = orderType === 'LIMIT' ? parseUnits(limitPrice || currentPrice.toString(), 18) : 0n;

        // Check approvals first
        if (isBuy) {
            const cost = orderType === 'LIMIT'
                ? parsedAmount * parsedPrice / 10n ** 18n
                : parsedAmount * parseUnits(currentPrice.toString(), 18) / 10n ** 18n; // Approx cost for market

            if (!usdAllowance || (usdAllowance as bigint) < cost) {
                writeContract({
                    ...CONTRACTS.MockUSD,
                    functionName: 'approve',
                    args: [CONTRACTS.LightningDEX.address, BigInt(2 ** 256) - 1n]
                });
                return;
            }
        }

        if (orderType === 'MARKET') {
            writeContract({
                ...CONTRACTS.LightningDEX,
                functionName: 'placeMarketOrder',
                args: [selectedStock, parsedAmount, isBuy]
            });
        } else {
            writeContract({
                ...CONTRACTS.LightningDEX,
                functionName: 'placeLimitOrder',
                args: [selectedStock, parsedAmount, parsedPrice, isBuy]
            });
        }
    };

    return (
        <div className="bg-monad-dark rounded-none border-4 border-black p-6 shadow-[8px_8px_0px_#FFD700]">
            <div className="flex bg-black rounded-none p-1 mb-6 border-2 border-black">
                <button
                    onClick={() => setIsBuy(true)}
                    className={`flex-1 py-2 rounded-none font-black uppercase tracking-wider transition-all ${isBuy ? 'bg-green-500 text-black border-2 border-black shadow-[4px_4px_0px_#000] -translate-y-1 -translate-x-1' : 'text-gray-500 hover:text-white'}`}
                >
                    BUY
                </button>
                <button
                    onClick={() => setIsBuy(false)}
                    className={`flex-1 py-2 rounded-none font-black uppercase tracking-wider transition-all ${!isBuy ? 'bg-red-500 text-black border-2 border-black shadow-[4px_4px_0px_#000] -translate-y-1 -translate-x-1' : 'text-gray-500 hover:text-white'}`}
                >
                    SELL
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between text-xs text-white uppercase font-bold tracking-wider">
                    <span>Order Type</span>
                    <div className="flex gap-4">
                        <button onClick={() => setOrderType('MARKET')} className={orderType === 'MARKET' ? 'text-monad-purple underline decoration-2 underline-offset-4' : 'text-gray-500'}>Market</button>
                        <button onClick={() => setOrderType('LIMIT')} className={orderType === 'LIMIT' ? 'text-monad-purple underline decoration-2 underline-offset-4' : 'text-gray-500'}>Limit</button>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-monad-purple block mb-1 font-bold uppercase tracking-wide">Amount ({selectedStock})</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-monad-purple border-2 border-black rounded-none px-4 py-3 text-black font-black text-xl focus:outline-none focus:ring-4 focus:ring-white/50 transition-all placeholder-black/30"
                        placeholder="0.00"
                    />
                </div>

                {orderType === 'LIMIT' && (
                    <div>
                        <label className="text-xs text-monad-purple block mb-1 font-bold uppercase tracking-wide">Limit Price ($)</label>
                        <input
                            type="number"
                            value={limitPrice}
                            onChange={e => setLimitPrice(e.target.value)}
                            className="w-full bg-monad-purple border-2 border-black rounded-none px-4 py-3 text-black font-black text-xl focus:outline-none focus:ring-4 focus:ring-white/50 transition-all placeholder-black/30"
                            placeholder={currentPrice.toString()}
                        />
                    </div>
                )}

                <div className="pt-4 border-t-2 border-white/10 mt-6">
                    <div className="flex justify-between text-sm mb-2 text-gray-400 font-mono">
                        <span>Balance</span>
                        <span className="text-white">
                            {usdBalance ? Number(formatUnits(usdBalance as bigint, 18)).toFixed(2) : '0.00'} mUSD
                        </span>
                    </div>

                    <button
                        onClick={handleTrade}
                        disabled={isPending || !amount}
                        className={`w-full py-4 rounded-none font-black text-xl flex items-center justify-center gap-2 transition-all border-2 border-black uppercase tracking-widest
                            ${isBuy
                                ? 'bg-green-500 hover:bg-green-400 text-black shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]'
                                : 'bg-red-500 hover:bg-red-400 text-black shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]'
                            }
                            ${(isPending || !amount) ? 'opacity-50 cursor-not-allowed shadow-none translate-y-[2px]' : ''}
                        `}
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : (isBuy ? 'Buy ' + selectedStock : 'Sell ' + selectedStock)}
                    </button>
                </div>
            </div>
        </div>
    );
}
