import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hardcoded copy of TOP_STOCKS
const TOP_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'TSM', 'V',
    'JNJ', 'WMT', 'JPM', 'XOM', 'PG', 'MA', 'UNH', 'HD', 'CVX', 'MRK',
    'ABBV', 'LLY', 'KO', 'AVGO', 'PEP', 'PFE', 'COST', 'ORCL', 'TMO', 'MCD',
    'DIS', 'NKE', 'CSCO', 'VZ', 'DHR', 'CRM', 'ADBE', 'ABT', 'NFLX', 'AMD',
    'INTC', 'QCOM', 'IBM', 'TXN', 'PM', 'MS', 'CAT', 'BA', 'GS', 'HON',
    'ETH', 'BTC'
];

async function main() {
    const contractContractsPath = path.join(__dirname, '../../frontend/src/contractContracts.json');

    if (!fs.existsSync(contractContractsPath)) {
        console.error('Contract address file not found');
        process.exit(1);
    }

    const { PriceOracle: oracleAddress } = JSON.parse(fs.readFileSync(contractContractsPath, 'utf8'));
    console.log(`Seeding Oracle at ${oracleAddress}...`);

    const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
    const oracle = PriceOracle.attach(oracleAddress);

    // Seed prices
    for (const symbol of TOP_STOCKS) {
        const basePrice = symbol.charCodeAt(0) * 2 + (symbol.length * 10);
        const price = ethers.parseUnits(basePrice.toString(), 8);

        console.log(`Setting price for ${symbol} to $${basePrice}`);
        const tx = await oracle.updatePrice(symbol, price);
        await tx.wait();
    }

    // Explicit overrides
    await (await oracle.updatePrice('AAPL', ethers.parseUnits('175', 8))).wait();
    await (await oracle.updatePrice('TSLA', ethers.parseUnits('240', 8))).wait();
    await (await oracle.updatePrice('NVDA', ethers.parseUnits('460', 8))).wait();
    await (await oracle.updatePrice('ETH', ethers.parseUnits('2200', 8))).wait();
    await (await oracle.updatePrice('BTC', ethers.parseUnits('42000', 8))).wait();
    await (await oracle.updatePrice('MSFT', ethers.parseUnits('400', 8))).wait();

    console.log("Oracle seeded successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
