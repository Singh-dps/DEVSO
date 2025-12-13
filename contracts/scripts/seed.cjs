const fs = require('fs');
const path = require('path');
const TOP_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'TSM', 'V',
    'JNJ', 'WMT', 'JPM', 'XOM', 'PG', 'MA', 'UNH', 'HD', 'CVX', 'MRK',
    'ABBV', 'LLY', 'KO', 'AVGO', 'PEP', 'PFE', 'COST', 'ORCL', 'TMO', 'MCD',
    'DIS', 'NKE', 'CSCO', 'VZ', 'DHR', 'CRM', 'ADBE', 'ABT', 'NFLX', 'AMD',
    'INTC', 'QCOM', 'IBM', 'TXN', 'PM', 'MS', 'CAT', 'BA', 'GS', 'HON',
    'ETH', 'BTC'
];

async function main() {
    // Dynamically require hre to ensure it loads
    const hre = require("hardhat");
    const { ethers } = hre;

    const contractContractsPath = path.join(__dirname, '../../frontend/src/contractContracts.json');
    if (!fs.existsSync(contractContractsPath)) {
        console.error('Contract address file not found');
        process.exit(1);
    }

    const contracts = JSON.parse(fs.readFileSync(contractContractsPath, 'utf8'));
    const oracleAddress = contracts.PriceOracle;
    console.log(`Seeding Oracle at ${oracleAddress}...`);

    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const oracle = PriceOracle.attach(oracleAddress);

    for (const symbol of TOP_STOCKS) {
        const basePrice = symbol.charCodeAt(0) * 2 + (symbol.length * 10);
        const price = ethers.parseUnits(basePrice.toString(), 8); // 8 decimals

        console.log(`Setting price for ${symbol} to $${basePrice} (${price.toString()})`);
        try {
            const tx = await oracle.updatePrice(symbol, price);
            await tx.wait();
        } catch (e) {
            console.error(`Failed to set price for ${symbol}: ${e.message}`);
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
        console.log(`Overriding ${sym} to $${val}`);
        const tx = await oracle.updatePrice(sym, ethers.parseUnits(val, 8));
        await tx.wait();
    }

    console.log("Oracle seeded successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
