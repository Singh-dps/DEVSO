import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, rainbowWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http, createStorage, cookieStorage } from 'wagmi';

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [metaMaskWallet, rainbowWallet, coinbaseWallet],
        },
    ],
    {
        appName: 'MONA',
        projectId: '3a8170812b534d0ff9d794f19a901d64',
    }
);

import { hardhat } from 'wagmi/chains';

export const config = createConfig({
    connectors,
    chains: [hardhat],
    transports: {
        [hardhat.id]: http('http://127.0.0.1:8545'),
    },
    // Explicitly use localStorage for persistence
    storage: createStorage({
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }),
    // Ensure batching logic doesn't interfere
    batch: { multicall: true },
});
