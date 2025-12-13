// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SyntheticToken.sol";

contract SyntheticStockFactory {
    // Symbol -> Token Address
    mapping(string => address) public stocks;
    address[] public allStocks;
    address public owner;

    event StockCreated(string symbol, address tokenAddress);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function createStock(string memory name, string memory symbol) external onlyOwner {
        require(stocks[symbol] == address(0), "Stock already exists");
        
        SyntheticToken newToken = new SyntheticToken(name, symbol, msg.sender);
        
        stocks[symbol] = address(newToken);
        allStocks.push(address(newToken));
        
        emit StockCreated(symbol, address(newToken));
    }

    function getStockAddress(string memory symbol) external view returns (address) {
        return stocks[symbol];
    }
    
    function getAllStocks() external view returns (address[] memory) {
        return allStocks;
    }
}
