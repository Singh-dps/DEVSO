import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOP_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'TSM', 'V',
    'JNJ', 'WMT', 'JPM', 'XOM', 'PG', 'MA', 'UNH', 'HD', 'CVX', 'MRK',
    'ABBV', 'LLY', 'KO', 'AVGO', 'PEP', 'PFE', 'COST', 'ORCL', 'TMO', 'MCD',
    'DIS', 'NKE', 'CSCO', 'VZ', 'DHR', 'CRM', 'ADBE', 'ABT', 'NFLX', 'AMD',
    'INTC', 'QCOM', 'IBM', 'TXN', 'PM', 'MS', 'CAT', 'BA', 'GS', 'HON',
    'ETH', 'BTC'
];

async function main() {
    // 1. Connect to Local Hardhat Node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 2. Setup Signer (Account #0)
    // Hardhat default private key for Account #0
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const wallet = new ethers.Wallet(privateKey, provider);

    // 3. Load Contract
    const contractContractsPath = path.join(__dirname, '../../frontend/src/contractContracts.json');
    if (!fs.existsSync(contractContractsPath)) {
        throw new Error("Contracts file not found");
    }
    const contracts = JSON.parse(fs.readFileSync(contractContractsPath, 'utf8'));
    const oracleAddress = contracts.PriceOracle;

    // Load ABI
    const artifactPath = path.join(__dirname, '../artifacts/contracts/PriceOracle.sol/PriceOracle.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const oracle = new ethers.Contract(oracleAddress, artifact.abi, wallet);

    console.log(`Connected to Oracle at ${oracleAddress}`);

    // 4. Seed
    let currentNonce = await wallet.getNonce();
    console.log(`Starting nonce: ${currentNonce}`);

    for (const symbol of TOP_STOCKS) {
        const basePrice = symbol.charCodeAt(0) * 2 + (symbol.length * 10);
        const price = ethers.parseUnits(basePrice.toString(), 8);

        console.log(`Setting price for ${symbol} to $${basePrice} (nonce: ${currentNonce})`);
        try {
            // Pass explicit nonce
            const tx = await oracle.updatePrice(symbol, price, { nonce: currentNonce });
            currentNonce++; // Increment immediately
            await tx.wait();
        } catch (e) {
            console.error(`Error setting ${symbol}:`, e.message);
            // If we fail, we might need to re-fetch nonce or just verify if it was incremented on chain.
            // For now, retry fetch to be safe.
            currentNonce = await wallet.getNonce();
        }
    }

    // Overrides
    const overrides = {
        'AAPL': '175',
        'TSLA': '240',
        'NVDA': '460',
        'ETH': '2200',
        'BTC': '42000',
        'MSFT': '400'
    };

    for (const [sym, val] of Object.entries(overrides)) {
        console.log(`Overriding ${sym} (nonce: ${currentNonce})`);
        try {
            const tx = await oracle.updatePrice(sym, ethers.parseUnits(val, 8), { nonce: currentNonce });
            currentNonce++;
            await tx.wait();
        } catch (e) {
            console.error(`Error overriding ${sym}:`, e.message);
            currentNonce = await wallet.getNonce();
        }
    }

    console.log("Done!");
}

main();
