// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {StorageUnit} from "../src/StorageUnit.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract StorageUnitScript is Script, SimpleDeploymentState {
    StorageUnit public storageUnit;

    function run() public {
        printDeploymentStatus();
        
        // Check if StorageUnit is already deployed
        address existingStorageUnit = getStorageUnitAddress();
        if (existingStorageUnit != address(0)) {
            console.log("StorageUnit already deployed at:", existingStorageUnit);
            console.log("Use --force flag or delete deployments/ folder to redeploy");
            return;
        }

        address owner = vm.envOr("CONTRACT_OWNER", msg.sender);

        vm.startBroadcast();

        // Deploy StorageUnit with deployer as initial owner
        storageUnit = new StorageUnit(owner);
        
        console.log("StorageUnit deployed at:", address(storageUnit));
        console.log("Owner:", storageUnit.owner());
        console.log("Network:", getCurrentNetworkName());

        vm.stopBroadcast();

        // Save to deployment state (after broadcast to avoid issues)
        saveContractAddress("StorageUnit", address(storageUnit));
        
        console.log("\nDeployment address saved to file");
    }
}
