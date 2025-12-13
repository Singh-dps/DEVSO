// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMockUSD is IERC20 {
    function mint(address to, uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

contract Bank is ReentrancyGuard, Ownable {
    IMockUSD public usd;
    uint256 public constant RATE = 100; // 1 MON = 100 USD

    event Deposit(address indexed user, uint256 monAmount, uint256 usdAmount);
    event Withdraw(address indexed user, uint256 monAmount, uint256 usdAmount);

    constructor(address _usd) Ownable(msg.sender) {
        usd = IMockUSD(_usd);
    }

    // Deposit MON, get mUSD
    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Amount must be > 0");
        
        uint256 usdAmount = msg.value * RATE;
        usd.mint(msg.sender, usdAmount);

        emit Deposit(msg.sender, msg.value, usdAmount);
    }

    // Withdraw mUSD, get MON
    // User must approve Bank to spend mUSD first (if using transferFrom/burnFrom)
    // NOTE: MockUSD needs to support burnFrom or we can transfer to Bank and burn? 
    // MockUSD implementation in view_file earlier only had `mint`. It inherited ERC20.
    // Standard ERC20 does NOT have burnFrom by default usually unless ERC20Burnable is used.
    // Let's assume I need to update MockUSD to be ERC20Burnable or just transferFrom to this contract and let it sit?
    // Burning is better to keep supply clean. 
    // For now, I will assume MockUSD can be upgraded or I will trigger a burn if possible.
    // The previous view of MockUSD showed `contract MockUSD is ERC20, Ownable`. 
    // It did NOT inherit ERC20Burnable. 
    // So `burnFrom` might not exist.
    // Checks:
    // 1. Update MockUSD to inherit ERC20Burnable.
    // 2. Or just take the tokens into the Bank contract.
    // I will update MockUSD.sol first in the next step.
    
    function withdraw(uint256 usdAmount) external nonReentrant {
        require(usdAmount > 0, "Amount must be > 0");
        require(usd.balanceOf(msg.sender) >= usdAmount, "Insufficient balance");

        // Calculate MON amount
        uint256 monAmount = usdAmount / RATE;
        require(address(this).balance >= monAmount, "Bank insufficient liquidity");

        // Burn the USD from user
        // Requires approval
        usd.burnFrom(msg.sender, usdAmount);

        // Send MON
        (bool sent, ) = payable(msg.sender).call{value: monAmount}("");
        require(sent, "Failed to send MON");

        emit Withdraw(msg.sender, monAmount, usdAmount);
    }

    // Allow owner to fund the bank if needed (though deposits fund it)
    receive() external payable {}
}
