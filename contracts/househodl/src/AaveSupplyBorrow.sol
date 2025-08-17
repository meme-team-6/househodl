// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IPool} from "@aave-v3-core/contracts/interfaces/IPool.sol";
import {IPriceOracle} from "@aave-v3-core/contracts/interfaces/IPriceOracle.sol";   
import {IWrappedTokenGatewayV3} from "@aave-v3-periphery/contracts/misc/interfaces/IWrappedTokenGatewayV3.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AaveProtocolDataProvider} from "@aave-v3-origin/contracts/helpers/AaveProtocolDataProvider.sol";

event Supply(address indexed token, uint256 amount, uint256 aTokenBalance);

contract AaveMultiTokenManager {
    IPool public immutable pool;
    IWrappedTokenGatewayV3 public immutable wethGateway;
    IPriceOracle public immutable aaveOracle;
    address public immutable usdc;
    AaveProtocolDataProvider public immutable dataProvider;

    constructor(
        address _pool,
        address _wethGateway,
        address _oracle,
        address _usdc,
        address _dataProvider
    ) {
        pool = IPool(_pool);
        wethGateway = IWrappedTokenGatewayV3(_wethGateway);
        aaveOracle = IPriceOracle(_oracle);
        usdc = _usdc;
        dataProvider = AaveProtocolDataProvider(_dataProvider);
    }

    /// @notice Borrow USDC directly from Aave
    /// @param amount Amount of USDC to borrow
    /// @param interestRateMode 1 = Stable, 2 = Variable
    function borrowUSDC(uint256 amount, uint256 interestRateMode) private {
        pool.borrow(address(usdc), amount, interestRateMode, 0, address(this));
    }

    /// @notice Get the price of `token` in USDC (6 decimals)
    function getTokenPriceInUSDC(address token) private view returns (uint256) {
        uint256 tokenPriceUsd = aaveOracle.getAssetPrice(token); // 8 decimals
        uint256 usdcPriceUsd = aaveOracle.getAssetPrice(usdc);   // 8 decimals

        // Normalize to USDC decimals (6)
        uint256 priceInUSDC = (tokenPriceUsd * 1e6) / usdcPriceUsd;
        return priceInUSDC;
    }

    /// @notice Calculate the USDC value of a token amount
    function getUSDCValue(address token, uint256 tokenAmount, uint8 tokenDecimals) private view returns (uint256) {
        uint256 priceInUSDC = getTokenPriceInUSDC(token); // 6 decimals
        // Adjust for token decimals
        uint256 usdcAmount = (tokenAmount * priceInUSDC) / (10 ** tokenDecimals);
        return usdcAmount; // value in USDC (6 decimals)
    }

    /// @notice Supply any ERC20 token to Aave
    /// @param asset ERC20 token address (e.g. USDC, DAI, WETH, etc.)
    /// @param amount Amount of tokens to supply
    function supplyERC20(address asset, uint256 amount) private {
        IERC20(asset).approve(address(pool), amount);
        pool.supply(asset, amount, address(this), 0);
    }

    function recycleUSDC(uint256 amount) private {
        IERC20(usdc).approve(address(pool), amount);
        pool.supply(usdc, amount, address(this), 0);
        (address aToken, ,address variableDebtToken) = dataProvider.getReserveTokensAddresses(usdc);
        
        uint256 aTokenBalance = IERC20(aToken).balanceOf(address(this));
        emit Supply(usdc, amount, aTokenBalance);
    }

    function SupplyTokens(
        address userAddr,
        uint256 amount, 
        address supplyTokenAddr
    ) external
        returns (uint256)
    {
        require(amount > 0, "Amount must be greater than zero");
        require(supplyTokenAddr != address(0), "Invalid staking token");
        
        // Transfer tokens from user to this contract
        require(IERC20(supplyTokenAddr).transferFrom(userAddr, address(this), amount), "Transfer failed");

        (uint256 decimals, uint256 ltv, , , , , , , , ) = dataProvider.getReserveConfigurationData(supplyTokenAddr);
        
        uint256 usdcAmount = getUSDCValue(supplyTokenAddr, amount, uint8(decimals));
        uint256 borrowableAmount = (usdcAmount * ltv) / 10000; // ltv is in basis points (e.g. 7500 for 75%)

        // Call the private function to supply the token to Aave (mocked event)
        supplyERC20(supplyTokenAddr, amount);

        // Call the private function to borrow USDC from Aave (mocked event)
        borrowUSDC(borrowableAmount, 2);

        //Resupply the USDC straight back into aave, and instead track aUSDC token
        recycleUSDC(borrowableAmount);

        //Returns the amount of aUSDC added in this transaction
        return borrowableAmount;
    }

    /// @notice Get the total available aToken balance for a specific asset
    /// @param asset ERC20 token address
    /// @return Total available aToken balance
    function GetTotalAvailableAaveToken(address asset) external view returns (uint256) {
        (address aToken, ,) = dataProvider.getReserveTokensAddresses(asset);
        return IERC20(aToken).balanceOf(address(this));
    }

    /// @notice Get the USDC value of the contract's balance of a given asset
    /// @param asset ERC20 token address
    /// @return USDC value (6 decimals)
    function GetTokenBalanceAsUSDC(uint256 tokenBalance, address asset) external view returns (uint256) {
        (uint256 decimals, , , , , , , , , ) = dataProvider.getReserveConfigurationData(asset);
        return getUSDCValue(asset, tokenBalance, uint8(decimals));
    }

    /// @notice Withdraw ERC20 token from Aave
    /// @param asset ERC20 token address to withdraw
    /// @param amount Amount to withdraw (type `uint(-1)` for full balance)
    function withdrawERC20(
        address userAddr,address asset, uint256 amount) external {
        pool.withdraw(asset, amount, userAddr);
    }

    /// @notice Supply native token (ETH, AVAX, MATIC) using Aave's Gateway
    function supplyNative() external payable {
        wethGateway.depositETH{value: msg.value}(address(pool), address(this), 0);
    }

    /// @notice Withdraw native token (ETH, AVAX, MATIC) from Aave back to user
    /// @param amount Amount to withdraw
    function withdrawNative(
        address userAddr,uint256 amount) external {
        wethGateway.withdrawETH(address(pool), amount, userAddr);
    }

    /// @notice Borrow any ERC20 token from Aave
    /// @param asset Token to borrow
    /// @param amount Amount to borrow
    /// @param interestRateMode 1 = Stable, 2 = Variable
    function borrowERC20(
        address userAddr,address asset, uint256 amount, uint256 interestRateMode) external {
        pool.borrow(asset, amount, interestRateMode, 0, address(this));
        IERC20(asset).transfer(userAddr, amount);
    }

    /// @notice Repay borrowed ERC20 token
    /// @param asset Token to repay
    /// @param amount Amount to repay
    /// @param interestRateMode 1 = Stable, 2 = Variable
    function repayERC20(
        address userAddr,address asset, uint256 amount, uint256 interestRateMode) external {
        IERC20(asset).transferFrom(userAddr, address(this), amount);
        IERC20(asset).approve(address(pool), amount);
        pool.repay(asset, amount, interestRateMode, address(this));
    }

    /// @notice Repay borrowed native token using Gateway
    /// @param interestRateMode 1 = Stable, 2 = Variable
    function repayNative(uint256 interestRateMode) external payable {
        wethGateway.repayETH{value: msg.value}(address(pool), msg.value, interestRateMode, address(this));
    }

}
