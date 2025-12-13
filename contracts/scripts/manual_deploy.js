import { ethers, JsonRpcProvider } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const provider = new JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);
    console.log("Deploying with account:", await signer.getAddress());

    const artifactsDir = path.join(__dirname, "../artifacts/contracts");

    async function deploy(name, args = []) {
        const artifactPath = path.join(artifactsDir, `${name}.sol/${name}.json`);
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
        const contract = await factory.deploy(...args);
        await contract.waitForDeployment();
        return await contract.getAddress();
    }

    const oracleAddress = await deploy("PriceOracle");
    console.log("PriceOracle:", oracleAddress);

    const factoryAddress = await deploy("SyntheticStockFactory");
    console.log("Factory:", factoryAddress);

    const usdAddress = await deploy("MockUSD");
    console.log("MockUSD:", usdAddress);

    const dexAddress = await deploy("LightningDEX", [usdAddress, oracleAddress, factoryAddress]);
    console.log("LightningDEX:", dexAddress);

    // Seed stocks
    // Need abi to interact
    const factoryArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, "SyntheticStockFactory.sol/SyntheticStockFactory.json"), "utf8"));
    const factory = new ethers.Contract(factoryAddress, factoryArtifact.abi, signer);

    await (await factory.createStock("Apple Synthetic", "mAAPL")).wait();
    await (await factory.createStock("Tesla Synthetic", "mTSLA")).wait();
    await (await factory.createStock("Nvidia Synthetic", "mNVDA")).wait();

    console.log("Seeded stocks");

    // Save addresses
    const addresses = {
        PriceOracle: oracleAddress,
        SyntheticStockFactory: factoryAddress,
        MockUSD: usdAddress,
        LightningDEX: dexAddress
    };

    const frontendSrc = path.join(__dirname, "../../frontend/src");
    if (!fs.existsSync(frontendSrc)) {
        fs.mkdirSync(frontendSrc, { recursive: true });
    }

    fs.writeFileSync(path.join(frontendSrc, "contractContracts.json"), JSON.stringify(addresses, null, 2));
    console.log("Addresses saved.");
}

main().catch(console.error);
