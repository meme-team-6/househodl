// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AaveProtocolDataProvider} from "@aave-v3-origin/contracts/helpers/AaveProtocolDataProvider.sol";

contract AaveTokenInfo {
    AaveProtocolDataProvider public immutable dataProvider;

    constructor(address _dataProvider) {
        dataProvider = AaveProtocolDataProvider(_dataProvider);
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