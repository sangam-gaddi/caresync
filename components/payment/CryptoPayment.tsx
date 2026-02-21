'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { HOSPITAL_WALLET_ADDRESS, PAYMENT_AMOUNT_ETH } from '@/config/wagmi';

interface CryptoPaymentProps {
    amount: number;
    onSuccess: (transactionHash: string) => void;
    onError?: (error: string) => void;
}

export default function CryptoPayment({ amount, onSuccess, onError }: CryptoPaymentProps) {
    const { address, isConnected } = useAccount();
    const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess && hash) {
            onSuccess(hash);
        }
    }, [isSuccess, hash, onSuccess]);

    useEffect(() => {
        if (error) {
            console.error('Transaction error:', error);
            onError?.(error.message || 'Transaction failed');
        }
    }, [error, onError]);

    const handlePayment = async () => {
        if (!isConnected || !address) return;
        try {
            sendTransaction({
                to: HOSPITAL_WALLET_ADDRESS as `0x${string}`,
                value: parseEther(PAYMENT_AMOUNT_ETH),
            });
        } catch (err: any) {
            console.error('Payment error:', err);
            onError?.(err.message || 'Payment failed');
        }
    };

    return (
        <div className="space-y-5">
            {/* Network Info Card */}
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl p-5 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Sepolia ETH Payment</h3>
                        <p className="text-[10px] text-white/40">Blockchain-verified • Testnet</p>
                    </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-white/40">Network</span>
                        <span className="text-white font-semibold">Sepolia Testnet</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-white/40">Amount</span>
                        <span className="text-white font-semibold">{PAYMENT_AMOUNT_ETH} Sepolia ETH</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-white/40">Consultation Fee</span>
                        <span className="text-green-400 font-semibold">${amount}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                        <p className="text-[10px] text-white/30">Hospital Wallet</p>
                        <p className="text-[10px] font-mono text-white/50 break-all mt-0.5">{HOSPITAL_WALLET_ADDRESS}</p>
                    </div>
                </div>
            </div>

            {!isConnected ? (
                <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-200/80 space-y-1">
                                <p className="font-semibold text-amber-300">Before you pay:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                    <li>Make sure you have Sepolia ETH in your wallet</li>
                                    <li>Connect MetaMask, Rainbow, or any Web3 wallet</li>
                                    <li>Mobile wallets can scan QR code</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <ConnectButton chainStatus="icon" showBalance={true} />
                    </div>

                    <div className="text-center space-y-1">
                        <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer"
                            className="block text-[11px] text-purple-300 hover:text-purple-200 underline">
                            Get Free Sepolia ETH (Alchemy Faucet)
                        </a>
                        <a href="https://www.infura.io/faucet/sepolia" target="_blank" rel="noopener noreferrer"
                            className="block text-[11px] text-purple-300 hover:text-purple-200 underline">
                            Infura Sepolia Faucet
                        </a>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <div>
                                <p className="text-xs font-semibold text-white">Wallet Connected</p>
                                <p className="text-[10px] text-green-300 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <ConnectButton chainStatus="icon" showBalance={true} />
                    </div>

                    {hash && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3"
                        >
                            <p className="text-xs text-blue-200 mb-1 font-semibold flex items-center gap-2">
                                {isConfirming ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Confirming on blockchain...</>
                                ) : (
                                    <><CheckCircle2 className="w-3.5 h-3.5" /> Transaction confirmed!</>
                                )}
                            </p>
                            <p className="text-[10px] text-blue-200/60 font-mono break-all mb-1">{hash}</p>
                            <a
                                href={`https://sepolia.etherscan.io/tx/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-300 hover:text-blue-200 underline inline-flex items-center gap-1"
                            >
                                View on Etherscan <ExternalLink className="w-3 h-3" />
                            </a>
                        </motion.div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={isPending || isConfirming || isSuccess}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                        {isPending || isConfirming ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />
                                {isPending ? 'Sending Transaction...' : 'Confirming...'}</>
                        ) : isSuccess ? (
                            <><CheckCircle2 className="w-4 h-4" /> Payment Successful!</>
                        ) : (
                            <>Pay {PAYMENT_AMOUNT_ETH} ETH (${amount})</>
                        )}
                    </button>

                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                            <p className="text-xs text-red-300 font-semibold mb-0.5">Transaction Failed</p>
                            <p className="text-[10px] text-red-300/70">{error.message}</p>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
