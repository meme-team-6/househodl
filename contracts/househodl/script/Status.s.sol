// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract StatusScript is Script, SimpleDeploymentState {
    function run() public view {
        printDeploymentStatus();
        
        address storageUnit = getStorageUnitAddress();
        address mtm = getMasterTransactionManagerAddress();
        address satellite = getSatelliteAddress();
        address aaveManager = getAaveMultiTokenManagerAddress();
        address endpoint = getLayerZeroEndpoint();
        bool setupComplete = isSetupComplete();
        
        console.log("Deployment Details:");
        console.log("LayerZero Endpoint:   ", endpoint);
        
        if (storageUnit != address(0)) {
            console.log("[OK] StorageUnit deployed");
        } else {
            console.log("[  ] StorageUnit not deployed");
        }
        
        if (mtm != address(0)) {
            console.log("[OK] MasterTransactionManager deployed");
        } else {
            console.log("[  ] MasterTransactionManager not deployed");
        }
        
        if (satellite != address(0)) {
            console.log("[OK] Satellite deployed");
        } else if (!isMasterChain()) {
            console.log("[  ] Satellite not deployed");
        }
        
        if (aaveManager != address(0)) {
            console.log("[OK] AaveMultiTokenManager deployed");
        } else {
            console.log("[  ] AaveMultiTokenManager not deployed");
        }
        
        if (setupComplete) {
            console.log("[OK] Setup completed");
        } else {
            console.log("[  ] Setup not completed");
        }
        
        console.log("\nNext steps:");
        if (isMasterChain()) {
            // Master chain deployment steps
            if (storageUnit == address(0)) {
                console.log("1. Run: make deploy-storage");
            } else if (mtm == address(0)) {
                console.log("1. Run: make deploy-mtm");
            } else if (aaveManager == address(0)) {
                console.log("1. Run: make deploy-aave-sepolia");
            } else if (!setupComplete) {
                console.log("1. Run: make setup");
            } else {
                console.log("Master chain ready! Deploy satellites with: make deploy-satellite-polygon-amoy");
            }
        } else {
            // Satellite chain deployment steps
            if (aaveManager == address(0)) {
                console.log("1. Run: make deploy-aave (current network)");
            } else if (satellite == address(0)) {
                console.log("1. Run: make deploy-satellite (ensure master is deployed first)");
            } else if (!setupComplete) {
                console.log("1. Run: make setup-cross-chain");
            } else {
                console.log("Satellite ready! Test cross-chain with: make test-cross-chain");
            }
        }
    }
}
