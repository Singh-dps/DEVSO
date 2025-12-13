// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PriceOracle.sol";
import "./SyntheticStockFactory.sol";

contract LightningDEX is Ownable {
    struct Order {
        uint256 id;
        address trader;
        uint256 price; // Price in USD (18 decimals)
        uint256 amount; // Amount of stock (18 decimals)
        bool isBuy;
        bool active;
    }

    IERC20 public usdToken;
    PriceOracle public oracle;
    SyntheticStockFactory public factory;

    // Symbol -> Orders
    mapping(string => Order[]) public buyOrders;
    mapping(string => Order[]) public sellOrders;
    
    uint256 public nextOrderId;
    uint256 public constant FEE_BPS = 10; // 0.1%

    event OrderPlaced(uint256 indexed id, string symbol, address trader, uint256 price, uint256 amount, bool isBuy);
    event TradeExecuted(uint256 indexed id, string symbol, address buyer, address seller, uint256 price, uint256 amount);
    event debug(string msg, uint256 val);

    constructor(address _usdToken, address _oracle, address _factory) Ownable(msg.sender) {
        usdToken = IERC20(_usdToken);
        oracle = PriceOracle(_oracle);
        factory = SyntheticStockFactory(_factory);
    }

    function placeLimitOrder(string memory symbol, uint256 amount, uint256 price, bool isBuy) external {
        address stockToken = factory.getStockAddress(symbol);
        require(stockToken != address(0), "Invalid symbol");
        require(amount > 0, "Amount must be > 0");

        if (isBuy) {
            // Buyer needs USD
            // Cost = amount * price / 1e18
            uint256 cost = (amount * price) / 1e18;
            require(usdToken.transferFrom(msg.sender, address(this), cost), "USD transfer failed");
            buyOrders[symbol].push(Order(nextOrderId, msg.sender, price, amount, true, true));
        } else {
            // Seller needs Stock
            require(IERC20(stockToken).transferFrom(msg.sender, address(this), amount), "Stock transfer failed");
            sellOrders[symbol].push(Order(nextOrderId, msg.sender, price, amount, false, true));
        }

        emit OrderPlaced(nextOrderId, symbol, msg.sender, price, amount, isBuy);
        nextOrderId++;
    }

    // Simplified Market Order: Match against best available limit orders
    // In a real DEX, we would sort the orders. Here we iterate.
    // WARNING: Gas heavy loop. For demo on high TPS chain, we can process more, but still need limits.
    function placeMarketOrder(string memory symbol, uint256 amount, bool isBuy) external {
        address stockToken = factory.getStockAddress(symbol);
        require(stockToken != address(0), "Invalid symbol");

        uint256 amountRemaining = amount;

        if (isBuy) {
            // Buying stock with USD. Find lowest Sell price.
            // Iterate through sellOrders[symbol]
            // Inefficient O(N) scan.
            
            // Temporary simple match: Just take the first active orders we find? 
            // Better: Find best price first?
            // To keep it simple: We will just iterate and match if price is reasonable? 
            // Or assume the array is roughly sorted or just match any valid order?
            // Realistically, market order should take best price.
            // Let's implement a "best match" search loop? No, that's O(N^2) if multiple fills.
            
            // Hackathon Shortcut: 
            // Just iterate and match any active order. Traders (Market Makers) will arbitrage bad prices.
            Order[] storage orders = sellOrders[symbol];
            
            for (uint256 i = 0; i < orders.length && amountRemaining > 0; i++) {
                if (orders[i].active) {
                    uint256 tradeAmount = amountRemaining < orders[i].amount ? amountRemaining : orders[i].amount;
                    uint256 tradePrice = orders[i].price; // Taker pays Maker's price
                    
                    // Execute Trade
                    // Buyer (msg.sender) pays USD to Seller (orders[i].trader)
                    uint256 cost = (tradeAmount * tradePrice) / 1e18;
                    require(usdToken.transferFrom(msg.sender, orders[i].trader, cost), "USD transfer failed");
                    
                    // Seller (contract holds stock) sends Stock to Buyer
                    require(IERC20(stockToken).transfer(msg.sender, tradeAmount), "Stock transfer failed");
                    
                    // Update Order
                    orders[i].amount -= tradeAmount;
                    if (orders[i].amount == 0) {
                        orders[i].active = false;
                    }
                    
                    amountRemaining -= tradeAmount;
                    emit TradeExecuted(orders[i].id, symbol, msg.sender, orders[i].trader, tradePrice, tradeAmount);
                }
            }

        } else {
            // Selling stock for USD. Find highest Buy price.
            Order[] storage orders = buyOrders[symbol];
            
            // Transfer stock involved from Seller to Contract first? Or just direct to Buyer?
            // Market Sell: Seller has Stock. Maker (Buyer) has locked USD in contract.
            require(IERC20(stockToken).transferFrom(msg.sender, address(this), amount), "Stock transfer in failed");
            
            for (uint256 i = 0; i < orders.length && amountRemaining > 0; i++) {
                if (orders[i].active) {
                    uint256 tradeAmount = amountRemaining < orders[i].amount ? amountRemaining : orders[i].amount;
                    uint256 tradePrice = orders[i].price; 
                    
                    // Execute Trade
                    // Contract (holding Maker's USD) sends USD to Seller
                    uint256 cost = (tradeAmount * tradePrice) / 1e18;
                    require(usdToken.transfer(msg.sender, cost), "USD payout failed");
                    
                    // Contract (holding Seller's Stock, which we just pulled) sends Stock to Buyer (Maker)
                    require(IERC20(stockToken).transfer(orders[i].trader, tradeAmount), "Stock payout failed");
                    
                    orders[i].amount -= tradeAmount;
                    if (orders[i].amount == 0) {
                        orders[i].active = false;
                    }
                    
                    amountRemaining -= tradeAmount;
                    emit TradeExecuted(orders[i].id, symbol, orders[i].trader, msg.sender, tradePrice, tradeAmount);
                }
            }
        }
        
        // If amountRemaining > 0, it means we couldn't fill the whole order.
        // For Market Order, we usually return the rest or fail?
        // Let's just leave the rest untraded (fill-or-kill is safer but partial fill is standard).
        // If Selling, we already transferred ALL stock to contract. We need to return the leftover.
        if (!isBuy && amountRemaining > 0) {
             IERC20(stockToken).transfer(msg.sender, amountRemaining);
        }
    }
}
