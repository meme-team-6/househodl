// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MasterTransactionManager} from "../src/MasterTransactionManager.sol";
import {Satellite} from "../src/Satellite.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract SetupCrossChainScript is Script, SimpleDeploymentState {
    
    function run() public {
        printDeploymentStatus();
        
        setupMasterPeers();
        setupSatellitePeers();
    }
    
    function setupMasterPeers() public {
        console.log("Setting up peers for Master chain...");
        
        address mtmAddress = getMasterTransactionManagerAddress();
        require(mtmAddress != address(0), "MasterTransactionManager not deployed");
        
        MasterTransactionManager mtm = MasterTransactionManager(payable(mtmAddress));
        
        // Define satellite chains to connect
        uint256[] memory satelliteChainIds = new uint256[](1);
        satelliteChainIds[0] = 11155111; // Sepolia
        
        vm.startBroadcast();
        
        for (uint256 i = 0; i < satelliteChainIds.length; i++) {
            uint256 satelliteChainId = satelliteChainIds[i];
            address satelliteAddress = getCrossChainAddress("Satellite", satelliteChainId);
            
            if (satelliteAddress != address(0)) {
                uint32 satelliteEid = _getEndpointIdForChain(satelliteChainId);
                bytes32 satelliteAddrBytes32 = bytes32(uint256(uint160(satelliteAddress)));
                
                // Set peer connection
                mtm.setPeer(satelliteEid, satelliteAddrBytes32);
                
                console.log("Set peer connection:");
                console.log("  Satellite Chain ID:", satelliteChainId);
                console.log("  Satellite EID:", satelliteEid);
                console.log("  Satellite Address:", satelliteAddress);
            } else {
                console.log("Warning: Satellite not found for chain ID:", satelliteChainId);
            }
        }
        
        vm.stopBroadcast();
        
        console.log("Master peer setup complete");
    }
    
    function setupSatellitePeers() public {
        console.log("Setting up peers for Satellite chain...");
        
        address satelliteAddress = getSatelliteAddress();
        require(satelliteAddress != address(0), "Satellite not deployed");
        
        Satellite satellite = Satellite(satelliteAddress);
        
        uint256 masterChainId = getMasterChainId();
        address masterAddress = getCrossChainAddress("MasterTransactionManager", masterChainId);
        require(masterAddress != address(0), "MasterTransactionManager not found on master chain");
        
        vm.startBroadcast();
        
        uint32 masterEid = getMasterEndpointId();
        bytes32 masterAddrBytes32 = bytes32(uint256(uint160(masterAddress)));
        
        // Set peer connection
        satellite.setPeer(masterEid, masterAddrBytes32);
        
        console.log("Set peer connection:");
        console.log("  Master Chain ID:", masterChainId);
        console.log("  Master EID:", masterEid);
        console.log("  Master Address:", masterAddress);
        
        vm.stopBroadcast();
        
        console.log("Satellite peer setup complete");
    }
    
    function _getEndpointIdForChain(uint256 chainId) internal pure returns (uint32) {
        if (chainId == 11155111) return 40161; // Sepolia
        if (chainId == 1) return 30101; // Mainnet
        if (chainId == 42161) return 30110; // Arbitrum
        if (chainId == 137) return 30109; // Polygon
        if (chainId == 80002) return 40109; // Polygon Amoy
        return 0;
    }
}
