require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const networks = {
    localhost: {
        url: "http://127.0.0.1:8545",
        chainId: 31337
    }
};

if (PRIVATE_KEY.startsWith("0x")) {
    networks.monadTestnet = {
        url: "https://testnet-rpc.monad.xyz/",
        chainId: 10143,
        accounts: [PRIVATE_KEY]
    };
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: networks
};
