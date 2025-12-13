const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const { ethers } = hre;
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy Price Oracle
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const oracle = await PriceOracle.deploy();
    await oracle.waitForDeployment();
    const oracleAddress = await oracle.getAddress();
    console.log("PriceOracle deployed to:", oracleAddress);

    // 2. Deploy Synthetic Stock Factory
    const SyntheticStockFactory = await ethers.getContractFactory("SyntheticStockFactory");
    const factory = await SyntheticStockFactory.deploy();
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("Factory deployed to:", factoryAddress);

    // 3. Deploy Mock USD
    const MockUSD = await ethers.getContractFactory("MockUSD");
    const usd = await MockUSD.deploy();
    await usd.waitForDeployment();
    const usdAddress = await usd.getAddress();
    console.log("MockUSD deployed to:", usdAddress);

    // 4. Deploy Lightning DEX
    const LightningDEX = await ethers.getContractFactory("LightningDEX");
    const dex = await LightningDEX.deploy(usdAddress, oracleAddress, factoryAddress);
    await dex.waitForDeployment();
    const dexAddress = await dex.getAddress();
    console.log("LightningDEX deployed to:", dexAddress);

    // 5. Deploy Bank
    const Bank = await ethers.getContractFactory("Bank");
    const bank = await Bank.deploy(usdAddress);
    await bank.waitForDeployment();
    const bankAddress = await bank.getAddress();
    console.log("Bank deployed to:", bankAddress);

    // Mint 10,000 USD to deployer for demo/testing
    const demoAmount = BigInt(10000) * BigInt(10 ** 18);
    await usd.mint(deployer.address, demoAmount);
    console.log("Minted 10,000 USD to deployer for demo");

    // Transfer MockUSD ownership to Bank so it can mint
    await usd.transferOwnership(bankAddress);
    console.log("Transferred MockUSD ownership to Bank");

    // Seed some stocks
    const tx1 = await factory.createStock("Apple Synthetic", "mAAPL");
    await tx1.wait();

    const tx2 = await factory.createStock("Tesla Synthetic", "mTSLA");
    await tx2.wait();

    const tx3 = await factory.createStock("Nvidia Synthetic", "mNVDA");
    await tx3.wait();

    // Seed Crypto & Commodities
    await (await factory.createStock("Bitcoin Synthetic", "mBTC")).wait();
    await (await factory.createStock("Ethereum Synthetic", "mETH")).wait();
    await (await factory.createStock("Gold Synthetic", "mGLD")).wait();
    await (await factory.createStock("Silver Synthetic", "mSLV")).wait();
    await (await factory.createStock("Oil Synthetic", "mUSO")).wait();

    // Seed International (Japan, EU, HK)
    await (await factory.createStock("Toyota Synthetic", "mTM")).wait();
    await (await factory.createStock("ASML Synthetic", "mASML")).wait();
    await (await factory.createStock("Alibaba Synthetic", "mBABA")).wait();

    console.log("Seeded stocks: mAAPL, mTSLA, mNVDA, mBTC, mETH, mGLD, mSLV, mUSO, mTM, mASML, mBABA");

    console.log("Seeded stocks mAAPL, mTSLA, mNVDA");

    // Save addresses to a file for Frontend to use
    const addresses = {
        PriceOracle: oracleAddress,
        SyntheticStockFactory: factoryAddress,
        MockUSD: usdAddress,
        LightningDEX: dexAddress,
        Bank: bankAddress
    };

    // Ensure directory exists
    if (!fs.existsSync("../frontend/src")) {
        fs.mkdirSync("../frontend/src", { recursive: true });
    }

    fs.writeFileSync("../frontend/src/contractContracts.json", JSON.stringify(addresses, null, 2));
    console.log("Addresses saved to frontend/src/contractContracts.json");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
