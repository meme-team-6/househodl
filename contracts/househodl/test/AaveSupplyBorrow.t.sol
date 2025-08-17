// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import "../src/AaveSupplyBorrow.sol";
import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract MockPool {
    function supply(address, uint256, address, uint16) external {}
    function borrow(address, uint256, uint256, uint16, address) external {}
    function withdraw(address, uint256, address) external {}
    function repay(address, uint256, uint256, address) external {}
}
contract MockWETHGateway {
    function depositETH(address, address, uint16) external payable {}
    function withdrawETH(address, uint256, address) external {}
    function repayETH(address, uint256, uint256, address) external payable {}
}
contract MockOracle {
    function getAssetPrice(address) external pure returns (uint256) { return 1e8; }
}

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol)
    ERC20(name, symbol) {}

    function mint(address account, uint amount) external {
        _mint(account, amount);
    }
}

contract MockDataProvider {
    address public constant ETH_A_TOKEN = address(0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9);
    address public constant ETH_STABLE_DEBT = address(0x268497bF083388B1504270d0E717222d3A87D6F2);
    address public constant ETH_VARIABLE_DEBT_USDC = address(0x72E95b8931767C79bA4EeE721354d6E99a61D004);

    function getReserveTokensAddresses(address asset)
        external
        pure
        returns (
            address aTokenAddress,
            address stableDebtTokenAddress,
            address variableDebtTokenAddress
        )
    {
        // Only mock ETH (0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)
        if (asset == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)) {
            return (ETH_A_TOKEN, ETH_STABLE_DEBT, ETH_VARIABLE_DEBT_USDC);
        }
        return (address(0), address(0), address(0));
    }
}

contract AaveSupplyBorrowTest is Test {
    function setUp() public {
        // satellite = new Satellite();
    }

    function testStake() public {
        MockPool pool = new MockPool();
        MockWETHGateway gateway = new MockWETHGateway();
        MockOracle oracle = new MockOracle();
        MockERC20 usdc = new MockERC20("USDC", "USDC");
        MockERC20 wbtc = new MockERC20("WrappedBTC", "WBTC");
        MockDataProvider dataProvider = new MockDataProvider();
        AaveTokenInfo aaveTokenInfo = new AaveTokenInfo(address(dataProvider));

        // Deploy the contract under test
        AaveMultiTokenManager manager = new AaveMultiTokenManager(
            address(pool),
            address(gateway),
            address(oracle),
            address(usdc),
            address(aaveTokenInfo)
        );

        // Create a user and mint 0.1 WBTC (8 decimals for WBTC)
        address user = address(0xBEEF);
        uint256 wbtcAmount = 0.1e8; // 0.1 WBTC with 8 decimals
        wbtc.mint(user, wbtcAmount);

        // Prank as user for approval and staking
        vm.startPrank(user);
        wbtc.approve(address(manager), wbtcAmount);
        manager.Stake(0.05e8, 0x123456789abc000000000000, address(wbtc));
        vm.stopPrank();
    }
}

