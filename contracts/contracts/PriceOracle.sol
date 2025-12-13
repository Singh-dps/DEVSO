// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PriceOracle {
    // Symbol -> Price (USD with 8 decimals, similar to Chainlink)
    mapping(string => uint256) public prices;
    address public owner;

    event PriceUpdated(string indexed symbol, uint256 newPrice);

    constructor() {
        owner = msg.sender;
        // Seed initial prices (8 decimals)
        prices["AAPL"] = 15000000000;  // $150.00
        prices["TSLA"] = 20000000000;  // $200.00
        prices["NVDA"] = 40000000000;  // $400.00
        prices["GOOGL"] = 13000000000; // $130.00
        prices["MSFT"] = 30000000000;  // $300.00
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function updatePrice(string memory symbol, uint256 price) external onlyOwner {
        prices[symbol] = price;
        emit PriceUpdated(symbol, price);
    }

    function getPrice(string memory symbol) external view returns (uint256) {
        require(prices[symbol] > 0, "Price not available");
        return prices[symbol];
    }
}
