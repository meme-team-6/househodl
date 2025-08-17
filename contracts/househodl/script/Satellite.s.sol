// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Satellite} from "../src/Satellite.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract SatelliteScript is Script, SimpleDeploymentState {
    Satellite public satellite;

    function run() public {
        printDeploymentStatus();
        
        require(!isMasterChain(), "This script should only be run on satellite chains, not the master chain");
        
        address existingSatellite = getSatelliteAddress();
        if (existingSatellite != address(0)) {
            console.log("Redeploying Satellite (previous deployment at:", existingSatellite, ")");
        }

        address endpoint = getLayerZeroEndpoint();
        address owner = vm.envOr("CONTRACT_OWNER", msg.sender);
        uint32 masterEid = getMasterEndpointId();
        
        require(endpoint != address(0), "LayerZero endpoint not configured for this network");
        require(masterEid != 0, "Master endpoint ID not configured");

        // Get the master contract address from deployment files
        address masterAddress = getCrossChainAddress("MasterTransactionManager", getMasterChainId());
        require(masterAddress != address(0), "MasterTransactionManager not found. Deploy master contract first.");
        
        // Convert master address to bytes32 for LayerZero
        bytes32 masterAddrBytes32 = bytes32(uint256(uint160(masterAddress)));

        // Get AAVE manager address from deployment state
        address aaveManager = getAaveMultiTokenManagerAddress();
        require(aaveManager != address(0), "AaveMultiTokenManager not found. Deploy it first with: make deploy-aave");

        vm.startBroadcast();

        satellite = new Satellite(
            endpoint,
            owner,
            masterEid,
            masterAddrBytes32,
            aaveManager
        );
        
        console.log("Satellite deployed at:", address(satellite));
        console.log("LayerZero Endpoint:", endpoint);
        console.log("Owner:", owner);
        console.log("Master Endpoint ID:", masterEid);
        console.log("Master Address:", masterAddress);
        console.log("AAVE Manager:", aaveManager);
        console.log("Network:", getCurrentNetworkName());

        vm.stopBroadcast();

        // Save to deployment state (after broadcast)
        saveContractAddress("Satellite", address(satellite));
        
        console.log("\nDeployment address saved to file");
    }
}
