'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import {
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
    coinbaseWallet,
    trustWallet,
} from '@rainbow-me/rainbowkit/wallets';

export const config = getDefaultConfig({
    appName: 'HealthOS',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'd61ae964425e119c03fedcf90e4068bc',
    chains: [sepolia],
    wallets: [
        {
            groupName: 'Recommended',
            wallets: [metaMaskWallet, rainbowWallet, coinbaseWallet, trustWallet, walletConnectWallet],
        },
    ],
    ssr: true,
});

// Hospital system wallet address (Sepolia Testnet)
export const HOSPITAL_WALLET_ADDRESS = '0xd87c05c93c7407b84905742ba3c34c8776f18fd9' as const;
// Fixed Sepolia ETH amount for every appointment booking
export const PAYMENT_AMOUNT_ETH = '0.0000001';
