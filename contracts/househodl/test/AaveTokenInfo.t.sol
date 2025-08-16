// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/AaveTokenInfo.sol";

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

contract AaveTokenInfoTest is Test {
    MockDataProvider dataProvider;
    AaveTokenInfo tokenInfo;

    function setUp() public {
        dataProvider = new MockDataProvider();
        tokenInfo = new AaveTokenInfo(address(dataProvider));
    }

    function testGetEthTokenAddresses() public view {
        (address aToken, address stableDebt, address variableDebt) = tokenInfo.getATokenAndDebtTokens(address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE));
        assertEq(aToken, 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9, "aToken address mismatch");
        assertEq(stableDebt, 0x268497bF083388B1504270d0E717222d3A87D6F2, "stableDebt address mismatch");
        assertEq(variableDebt, 0x72E95b8931767C79bA4EeE721354d6E99a61D004, "variableDebt address mismatch");
    }
}
