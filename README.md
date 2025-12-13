# 🏦 Mona - Synthetic Stock Trading Platform

**Mona** is a decentralized application (dApp) built on the **Monad Testnet** that allows users to trade synthetic versions of real-world assets like Apple, Tesla, Gold, and Bitcoin using a stablecoin (USD).

The platform features a distinctive **"Retro Pop / Bollywood"** aesthetic, combining bold colors, vintage textures, and a high-energy user interface.

## 🌟 Features

*   **Synthetic Assets:** Trade `mAAPL`, `mTSLA`, `mNVDA`, `mBTC`, `mETH`, `mGLD` (Gold), and more.
*   **Bank System:** seamless **Deposit** (MON -> USD) and **Withdraw** (USD -> MON) functionality with a fixed exchange rate.
*   **Real-time Trading:** Buy and sell assets instantly via the `LightningDEX` contract.
*   **Live Charts:** Integration with Finnhub API for real-time market data visualization.
*   **User Portfolio:** Track your holdings, wallet balance, and portfolio value in real-time.
*   **Zero-Gas Experience (Mock):** Optimized for Monad's high-throughput, low-latency network.

## 🛠 Tech Stack

*   **Blockchain:** Monad Testnet
*   **Smart Contracts:** Solidity, Hardhat, OpenZeppelin
*   **Frontend:** React, Vite, TypeScript
*   **Styling:** Tailwind CSS (Custom "Retro Pop" Theme)
*   **Web3 Integration:** Wagmi, Viem, RainbowKit
*   **Data:** Finnhub API (Market Data)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+)
*   MetaMask Wallet (configured for Monad Testnet)

### 1. Installation

Clone the repository and install dependencies for both the contracts and frontend.

```bash
git clone https://github.com/Singh-dps/DEVSO.git
cd DEVSO
```

**Install Frontend Dependencies:**
```bash
cd frontend
npm install
```

**Install Contract Dependencies:**
```bash
cd ../contracts
npm install
```

### 2. Smart Contract Deployment

1.  **Configure Environment:**
    Create a `.env` file in the `contracts` directory:
    ```bash
    cd contracts
    cp .env.example .env
    ```
    Edit `.env` and add your **Monad Testnet Private Key** (must start with `0x`):
    ```env
    PRIVATE_KEY=0xYourPrivateKeyHere...
    ```

2.  **Deploy Contracts:**
    Deploy the contracts to the Monad Testnet. This script will deploy the `Bank`, `MockUSD`, `PriceOracle`, `SyntheticStockFactory`, and `LightningDEX`.
    ```bash
    npx hardhat run scripts/deploy.js --network monadTestnet
    ```
    *Note: The deployment script automatically mines 10,000 USD to the deployer for testing.*

### 3. Running the Frontend

Start the React application:

```bash
cd ../frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage Guide

1.  **Connect Wallet:** Click the "Connect Wallet" button in the top right to connect MetaMask.
2.  **Get Funds:**
    *   **Option A:** Use the **Deposit** button in the Portfolio section to swap MON for USD.
    *   **Option B:** If you deployed the contracts yourself, you already have 10,000 USD.
3.  **Trade:**
    *   Select a stock from the ticker list (e.g., AAPL).
    *   Enter an amount in the "Order Entry" panel.
    *   Click **BUY** or **SELL**.
    *   Confirm the transaction in MetaMask.
4.  **Withdraw:** Converting your profits back to MON is easy via the **Withdraw** button.

## 🎨 Theme & Design

The UI runs on a custom Tailwind configuration designed to mimic 80s/90s Bollywood posters:
*   **Colors:** Deep Maroon (`#6D1525`), Gold (`#FFD700`), Vibrant Green (`#00FF00`), and Red (`#FF0000`).
*   **Typography:** 'Carter One' (Google Fonts) for headings, `Space Mono` for data.
*   **Effects:** Heavy drop shadows, thick borders, and a vintage paper texture overlay.

## 📄 License

This project is licensed under the MIT License.
