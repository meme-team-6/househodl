// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract StatusScript is Script, SimpleDeploymentState {
    function run() public view {
        printDeploymentStatus();
        
        address storageUnit = getStorageUnitAddress();
        address mtm = getMasterTransactionManagerAddress();
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
        
        if (setupComplete) {
            console.log("[OK] Setup completed");
        } else {
            console.log("[  ] Setup not completed");
        }
        
        console.log("\nNext steps:");
        if (storageUnit == address(0)) {
            console.log("1. Run: make deploy-storage");
        } else if (mtm == address(0)) {
            console.log("1. Run: make deploy-mtm");
        } else if (!setupComplete) {
            console.log("1. Run: make setup");
        } else {
            console.log("All done! Run: make verify-deployment to double-check");
        }
    }
}
