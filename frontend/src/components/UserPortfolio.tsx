import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../constants/contracts';
import { formatUnits, parseUnits, parseEther } from 'viem';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Loader2, X } from 'lucide-react';

export function UserPortfolio() {
    const { address } = useAccount();
    const { writeContract, data: hash, isPending: isTxPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const [showDeposit, setShowDeposit] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [amount, setAmount] = useState('');

    const { data: usdBalance } = useReadContract({
        ...CONTRACTS.MockUSD,
        functionName: 'balanceOf',
        args: [address],
    });

    const isPending = isTxPending || isConfirming;

    const handleDeposit = () => {
        if (!amount) return;
        writeContract({
            ...CONTRACTS.Bank,
            functionName: 'deposit',
            value: parseEther(amount)
        });
        setAmount('');
        setShowDeposit(false);
    };

    const handleWithdraw = () => {
        if (!amount) return;
        // Check approval first? Standard pattern usually requires approve -> burnFrom.
        // Assuming user has approved Bank to spend mUSD? 
        // For simplicity UI, we might trigger approve first if not approved, but let's assume direct burnFrom flow needs approval.
        // Or we can rely on error message. 
        // Ideally we check allowance.

        writeContract({
            ...CONTRACTS.Bank,
            functionName: 'withdraw',
            args: [parseUnits(amount, 18)]
        });
        setAmount('');
        setShowWithdraw(false);
    };

    // Check Allowance for Withdraw
    const { data: bankAllowance } = useReadContract({
        ...CONTRACTS.MockUSD,
        functionName: 'allowance',
        args: [address, CONTRACTS.Bank.address],
    });

    const approveBank = () => {
        writeContract({
            ...CONTRACTS.MockUSD,
            functionName: 'approve',
            args: [CONTRACTS.Bank.address, BigInt(2 ** 256) - 1n]
        });
    }

    return (
        <div id="portfolio" className="bg-monad-dark rounded-none border-4 border-black shadow-[8px_8px_0px_#000] p-6 relative overflow-hidden">
            {/* Decorative 'tape' or cutout effect */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-monad-purple rotate-45 border-4 border-black"></div>

            <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-2xl font-black text-monad-black flex items-center gap-2 uppercase tracking-tighter" style={{ textShadow: '2px 2px 0px #FFD700' }}>
                    <Wallet size={24} className="text-monad-purple" /> Portfolio
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowDeposit(true)}
                        className="text-xs font-bold bg-green-500 text-black border-2 border-black px-3 py-1 rounded-none hover:bg-white flex items-center gap-1 transition-all shadow-[2px_2px_0px_#000] active:translate-y-[2px] active:shadow-none uppercase"
                        title="Deposit"
                    >
                        <ArrowDownCircle size={18} />
                    </button>
                    <button
                        onClick={() => setShowWithdraw(true)}
                        className="text-xs font-bold bg-red-500 text-black border-2 border-black px-3 py-1 rounded-none hover:bg-white flex items-center gap-1 transition-all shadow-[2px_2px_0px_#000] active:translate-y-[2px] active:shadow-none uppercase"
                        title="Withdraw"
                    >
                        <ArrowUpCircle size={18} />
                    </button>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="bg-monad-black p-4 rounded-none border-2 border-black flex justify-between items-center shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center text-black font-black text-lg">$</div>
                        <div>
                            <p className="font-black text-white text-lg uppercase leading-none">USD</p>
                            <p className="text-xs text-white/70 font-bold uppercase">Stablecoin</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-mono font-bold text-white text-xl">
                            {usdBalance ? Number(formatUnits(usdBalance as bigint, 18)).toFixed(2) : '0.00'}
                        </p>
                    </div>
                </div>

                {/* Holdings List */}
                {['mAAPL', 'mTSLA', 'mNVDA', 'mBTC', 'mETH', 'mGLD'].map(sym => (
                    <HoldingRow key={sym} symbol={sym} />
                ))}
            </div>

            {/* Modals */}
            {(showDeposit || showWithdraw) && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-monad-dark border-4 border-black p-6 w-96 shadow-[8px_8px_0px_#FFD700]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-black text-white uppercase">{showDeposit ? 'Deposit MON' : 'Withdraw USD'}</h3>
                            <button onClick={() => { setShowDeposit(false); setShowWithdraw(false); }} className="text-white hover:text-red-500"><X /></button>
                        </div>

                        <p className="text-xs text-gray-400 mb-4 font-mono">Rate: 1 MON = 100 USD</p>

                        <input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-black border-2 border-white/20 p-2 text-white font-mono mb-4 focus:border-monad-purple outline-none"
                        />

                        {showWithdraw && (bankAllowance as bigint) < parseUnits(amount || '0', 18) ? (
                            <button
                                onClick={approveBank}
                                disabled={isPending}
                                className="w-full bg-monad-purple text-black font-black py-2 border-2 border-black shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none"
                            >
                                {isPending ? <Loader2 className="animate-spin mx-auto" /> : 'APPROVE BANK'}
                            </button>
                        ) : (
                            <button
                                onClick={showDeposit ? handleDeposit : handleWithdraw}
                                disabled={isPending}
                                className="w-full bg-monad-purple text-black font-black py-2 border-2 border-black shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none"
                            >
                                {isPending ? <Loader2 className="animate-spin mx-auto" /> : 'CONFIRM'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function HoldingRow({ symbol }: { symbol: string }) {
    // Simplification for Hackathon: Just show 0 or "Fetch"
    return (
        <div className="p-3 border-b-2 border-monad-purple/20 flex justify-between items-center hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-none rotate-3 bg-monad-purple border-2 border-black flex items-center justify-center text-white font-black text-xs shadow-[2px_2px_0px_#000]">
                    {symbol[1]}
                </div>
                <div>
                    <p className="font-bold text-monad-black uppercase tracking-wide">{symbol}</p>
                    <p className="text-xs text-monad-light/70 uppercase">Synthetic</p>
                </div>
            </div>
            <p className="text-sm font-mono text-monad-black">--</p>
        </div>
    );
}
