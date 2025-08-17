// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AaveMultiTokenManager} from "../src/AaveSupplyBorrow.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract AaveMultiTokenManagerScript is Script, SimpleDeploymentState {
    function run() external {
        vm.startBroadcast();

        // Get Aave contract addresses for current network
        address poolAddress = getAavePool();
        address wethGateway = getAaveWETHGateway();
        address priceOracle = getAavePriceOracle();
        address usdcAddress = getUSDCAddress();
        address dataProvider = getAaveDataProvider();

        console.log("Deploying AaveMultiTokenManager with:");
        console.log("Network:", getCurrentNetworkName());
        console.log("Chain ID:", block.chainid);
        console.log("Pool:", poolAddress);
        console.log("WETH Gateway:", wethGateway);
        console.log("Price Oracle:", priceOracle);
        console.log("USDC:", usdcAddress);
        console.log("Data Provider:", dataProvider);

        // Deploy AaveMultiTokenManager
        AaveMultiTokenManager aaveManager = new AaveMultiTokenManager(
            poolAddress,
            wethGateway,
            priceOracle,
            usdcAddress,
            dataProvider
        );

        // Save deployment addresses
        saveContractAddress("AaveMultiTokenManager", address(aaveManager));

        console.log("AaveMultiTokenManager deployed at:", address(aaveManager));
        console.log("Deployment complete!");

        vm.stopBroadcast();
    }
}
