// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MasterTransactionManager} from "../src/MasterTransactionManager.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract MasterTransactionManagerScript is Script, SimpleDeploymentState {
    MasterTransactionManager public masterTransactionManager;

    function run() public {
        printDeploymentStatus();
        
        // Check if MasterTransactionManager is already deployed
        address existingMTMAddress = getMasterTransactionManagerAddress();
        if (existingMTMAddress != address(0)) {
            console.log("MasterTransactionManager already deployed at:", existingMTMAddress);
            console.log("Use --force flag or delete deployments/ folder to redeploy");
            return;
        }

        // Get StorageUnit address from state
        address storageUnitAddress = getStorageUnitAddress();
        require(storageUnitAddress != address(0), "StorageUnit not deployed. Deploy StorageUnit first.");

        address endpoint = getLayerZeroEndpoint();
        address owner = vm.envOr("CONTRACT_OWNER", msg.sender);
        
        require(endpoint != address(0), "LayerZero endpoint not configured for this network");

        vm.startBroadcast();

        masterTransactionManager = new MasterTransactionManager(
            endpoint,
            owner,
            storageUnitAddress
        );
        
        console.log("MasterTransactionManager deployed at:", address(masterTransactionManager));
        console.log("LayerZero Endpoint:", endpoint);
        console.log("Owner:", owner);
        console.log("StorageUnit:", storageUnitAddress);
        console.log("Network:", getCurrentNetworkName());

        vm.stopBroadcast();

        // Save to deployment state (after broadcast)
        saveContractAddress("MasterTransactionManager", address(masterTransactionManager));
        
        console.log("\nDeployment address saved to file");
    }
}
