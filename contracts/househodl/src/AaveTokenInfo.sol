// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPoolDataProvider} from "@aave-v3-core/contracts/interfaces/IPoolDataProvider.sol";

contract AaveTokenInfo {
    IPoolDataProvider public immutable dataProvider;

    constructor(address _dataProvider) {
        dataProvider = IPoolDataProvider(_dataProvider);
    }

    /// @notice Returns the aToken and debt token addresses for a given asset
    function getATokenAndDebtTokens(address asset)
        external
        view
        returns (
            address aToken,
            address stableDebtToken,
            address variableDebtToken
        )
    {
        (aToken, stableDebtToken, variableDebtToken) = dataProvider.getReserveTokensAddresses(asset);
    }
}