// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {StorageUnit} from "../src/StorageUnit.sol";
import {MasterTransactionManager} from "../src/MasterTransactionManager.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract DeployAllScript is Script, SimpleDeploymentState {
    StorageUnit public storageUnit;
    MasterTransactionManager public masterTransactionManager;

    function run() public {
        printDeploymentStatus();
        
        // Check if contracts are already deployed
        address existingStorageUnit = getStorageUnitAddress();
        address existingMTMAddress = getMasterTransactionManagerAddress();
        
        if (existingStorageUnit != address(0) && existingMTMAddress != address(0) && isSetupComplete()) {
            console.log("Contracts already deployed and setup complete!");
            console.log("Use --force flag or delete deployments/ folder to redeploy");
            return;
        }

        address endpoint = getLayerZeroEndpoint();
        address owner = vm.envOr("CONTRACT_OWNER", msg.sender);

        // For local testing, deploy a mock endpoint if needed
        if (block.chainid == 31337 && endpoint == address(0)) {
            endpoint = address(0x6EDCE65403992e310A62460808c4b910D972f10f);
            vm.mockCall(
                endpoint,
                abi.encodeWithSignature("delegates(address)"),
                abi.encode(address(0))
            );
        }

        vm.startBroadcast();

        // Step 1: Deploy StorageUnit if not already deployed
        if (existingStorageUnit == address(0)) {
            storageUnit = new StorageUnit(owner);
            console.log("StorageUnit deployed at:", address(storageUnit));
        } else {
            storageUnit = StorageUnit(existingStorageUnit);
            console.log("Using existing StorageUnit at:", address(storageUnit));
        }

        // Step 2: Deploy MasterTransactionManager if not already deployed
        if (existingMTMAddress == address(0)) {
            masterTransactionManager = new MasterTransactionManager(
                endpoint,
                owner,
                address(storageUnit)
            );
            console.log("MasterTransactionManager deployed at:", address(masterTransactionManager));
        } else {
            masterTransactionManager = MasterTransactionManager(existingMTMAddress);
            console.log("Using existing MasterTransactionManager at:", address(masterTransactionManager));
        }

        // Step 3: Connect the contracts if setup not complete
        if (!isSetupComplete()) {
            storageUnit.setTransactionManager(address(masterTransactionManager));
            console.log("Contracts connected - StorageUnit transaction manager set");
        } else {
            console.log("Setup already complete - contracts are connected");
        }

        vm.stopBroadcast();

        // Save addresses (after broadcast to avoid issues)
        if (existingStorageUnit == address(0)) {
            saveContractAddress("StorageUnit", address(storageUnit));
        }
        if (existingMTMAddress == address(0)) {
            saveContractAddress("MasterTransactionManager", address(masterTransactionManager));
        }
        if (!isSetupComplete()) {
            markSetupComplete();
        }

        console.log("\nDeployment Summary:");
        console.log("==================");
        console.log("Network:                  ", getCurrentNetworkName());
        console.log("Chain ID:                 ", block.chainid);
        console.log("StorageUnit:              ", address(storageUnit));
        console.log("MasterTransactionManager: ", address(masterTransactionManager));
        console.log("LayerZero Endpoint:       ", endpoint);
        console.log("Owner:                    ", owner);
        console.log("Setup Complete:           ", isSetupComplete());
        
        console.log("\nDeployment addresses saved to files");
    }
}
