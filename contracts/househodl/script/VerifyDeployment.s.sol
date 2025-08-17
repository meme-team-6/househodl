// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract VerifyDeploymentScript is Script, SimpleDeploymentState {
    function run() public view {
        console.log("Deployment Verification Report");
        console.log("=============================");
        
        string memory network = getCurrentNetworkName();
        uint256 chainId = block.chainid;
        
        console.log("Network:", network);
        console.log("Chain ID:", chainId);
        console.log("");

        // Check StorageUnit
        address storageUnit = getStorageUnitAddress();
        if (storageUnit != address(0)) {
            console.log("[OK] StorageUnit deployed at:", storageUnit);
            
            // Check if code exists
            uint256 codeSize;
            assembly {
                codeSize := extcodesize(storageUnit)
            }
            if (codeSize > 0) {
                console.log("[OK] StorageUnit has contract code");
            } else {
                console.log("[ERROR] StorageUnit address has no code!");
            }
        } else {
            console.log("[ERROR] StorageUnit not deployed");
        }

        // Check MasterTransactionManager
        address mtm = getMasterTransactionManagerAddress();
        if (mtm != address(0)) {
            console.log("[OK] MasterTransactionManager deployed at:", mtm);
            
            // Check if code exists
            uint256 codeSize;
            assembly {
                codeSize := extcodesize(mtm)
            }
            if (codeSize > 0) {
                console.log("[OK] MasterTransactionManager has contract code");
            } else {
                console.log("[ERROR] MasterTransactionManager address has no code!");
            }
        } else {
            console.log("[ERROR] MasterTransactionManager not deployed");
        }

        // Check setup completion
        bool setupComplete = isSetupComplete();
        if (setupComplete) {
            console.log("[OK] Setup marked as complete");
        } else {
            console.log("[ERROR] Setup not complete");
        }

        console.log("");
        console.log("Deployment Files Status:");
        console.log("=======================");
        
        if (storageUnit != address(0)) {
            console.log("[OK] StorageUnit address file exists");
        } else {
            console.log("[ERROR] StorageUnit address file missing");
        }
        
        if (mtm != address(0)) {
            console.log("[OK] MasterTransactionManager address file exists");
        } else {
            console.log("[ERROR] MasterTransactionManager address file missing");
        }
        
        if (setupComplete) {
            console.log("[OK] Setup completion marker exists");
        } else {
            console.log("[ERROR] Setup completion marker missing");
        }

        // LayerZero endpoint info
        address endpoint = getLayerZeroEndpoint();
        console.log("");
        console.log("Network Configuration:");
        console.log("=====================");
        if (endpoint != address(0)) {
            console.log("[OK] LayerZero endpoint configured:", endpoint);
        } else {
            console.log("[ERROR] LayerZero endpoint not configured for network:", network);
        }
        
        console.log("");
        if (storageUnit != address(0) && mtm != address(0) && setupComplete) {
            console.log("SUCCESS: All contracts deployed and configured successfully!");
        } else {
            console.log("WARNING: Deployment incomplete. Run deployment scripts to continue.");
        }
    }
}
