import contractAddresses from '../contractContracts.json';
import LightningDEXAbi from '../../../contracts/artifacts/contracts/LightningDEX.sol/LightningDEX.json';
import PriceOracleAbi from '../../../contracts/artifacts/contracts/PriceOracle.sol/PriceOracle.json';
import SyntheticStockFactoryAbi from '../../../contracts/artifacts/contracts/SyntheticStockFactory.sol/SyntheticStockFactory.json';
import MockUSDAbi from '../../../contracts/artifacts/contracts/MockUSD.sol/MockUSD.json';
import BankAbi from '../../../contracts/artifacts/contracts/Bank.sol/Bank.json';
import { erc20Abi } from 'viem';

export const CONTRACTS = {
    LightningDEX: {
        address: contractAddresses.LightningDEX as `0x${string}`,
        abi: LightningDEXAbi.abi
    },
    PriceOracle: {
        address: contractAddresses.PriceOracle as `0x${string}`,
        abi: PriceOracleAbi.abi
    },
    SyntheticStockFactory: {
        address: contractAddresses.SyntheticStockFactory as `0x${string}`,
        abi: SyntheticStockFactoryAbi.abi
    },
    MockUSD: {
        address: contractAddresses.MockUSD as `0x${string}`,
        abi: MockUSDAbi.abi
    },
    Bank: {
        address: (contractAddresses as any).Bank as `0x${string}`,
        abi: BankAbi.abi
    },
    ERC20: {
        abi: erc20Abi
    }
} as const;
