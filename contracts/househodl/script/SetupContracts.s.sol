// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {StorageUnit} from "../src/StorageUnit.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract SetupContractsScript is Script, SimpleDeploymentState {
    function run() public {
        printDeploymentStatus();
        
        if (isSetupComplete()) {
            console.log("Setup already complete!");
            return;
        }

        address storageUnitAddress = getStorageUnitAddress();
        address masterTransactionManagerAddress = getMasterTransactionManagerAddress();

        require(storageUnitAddress != address(0), "StorageUnit not deployed");
        require(masterTransactionManagerAddress != address(0), "MasterTransactionManager not deployed");

        vm.startBroadcast();

        StorageUnit storageUnit = StorageUnit(storageUnitAddress);
        
        // Set the MasterTransactionManager as the transaction manager in StorageUnit
        storageUnit.setTransactionManager(masterTransactionManagerAddress);

        vm.stopBroadcast();
        
        // Mark setup as complete (after broadcast)
        markSetupComplete();
        
        console.log("Setup completed:");
        console.log("Network:", getCurrentNetworkName());
        console.log("StorageUnit:", storageUnitAddress);
        console.log("MasterTransactionManager:", masterTransactionManagerAddress);
        console.log("Transaction manager set in StorageUnit");
        
        console.log("\nSetup state saved to file");
    }
}
