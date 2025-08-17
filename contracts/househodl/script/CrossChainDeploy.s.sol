// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SimpleDeploymentState} from "./SimpleDeploymentState.sol";

contract CrossChainDeployScript is Script, SimpleDeploymentState {
    
    struct ChainConfig {
        uint256 chainId;
        string name;
        string rpcUrl;
        uint32 lzEid;
        bool isMaster;
    }
    
    function run() public view {
        console.log("=== Cross-Chain Deployment Orchestrator ===");
        
        // Define supported chains
        ChainConfig[] memory chains = new ChainConfig[](2);
        
        // Sepolia (Master)
        chains[0] = ChainConfig({
            chainId: 11155111,
            name: "sepolia",
            rpcUrl: "https://sepolia.drpc.org",
            lzEid: 40161,
            isMaster: true
        });
        
        // Polygon Amoy (Satellite)
        chains[1] = ChainConfig({
            chainId: 80002,
            name: "polygon_amoy",
            rpcUrl: "https://rpc-amoy.polygon.technology",
            lzEid: 40109,
            isMaster: false
        });
        
        console.log("Supported chains for cross-chain deployment:");
        for (uint256 i = 0; i < chains.length; i++) {
            console.log("Chain:", chains[i].name);
            console.log("  Chain ID:", chains[i].chainId);
            console.log("  LZ EID:", chains[i].lzEid);
            console.log("  Type:", chains[i].isMaster ? "Master" : "Satellite");
            console.log("  RPC:", chains[i].rpcUrl);
        }
        
        console.log("\n=== Deployment Instructions ===");
        console.log("1. Deploy master contracts first:");
        console.log("   make deploy-master RPC_URL=https://sepolia.drpc.org");
        
        console.log("\n2. Deploy satellites:");
        console.log("   make deploy-satellite RPC_URL=https://rpc-amoy.polygon.technology");
        
        console.log("\n3. Setup cross-chain connections:");
        console.log("   make setup-cross-chain");
        
        console.log("\n=== Current Deployment Status ===");
        _checkDeploymentStatus(chains);
    }
    
    function _checkDeploymentStatus(ChainConfig[] memory chains) internal view {
        for (uint256 i = 0; i < chains.length; i++) {
            ChainConfig memory chain = chains[i];
            console.log("\n--- Status for", chain.name, "---");
            
            if (chain.isMaster) {
                address storageUnit = getCrossChainAddress("StorageUnit", chain.chainId);
                address mtm = getCrossChainAddress("MasterTransactionManager", chain.chainId);
                
                console.log("StorageUnit:", storageUnit == address(0) ? "NOT DEPLOYED" : vm.toString(storageUnit));
                console.log("MasterTransactionManager:", mtm == address(0) ? "NOT DEPLOYED" : vm.toString(mtm));
                
                if (storageUnit != address(0) && mtm != address(0)) {
                    console.log("Status: MASTER READY");
                } else {
                    console.log("Status: MISSING MASTER CONTRACTS");
                }
            } else {
                address satellite = getCrossChainAddress("Satellite", chain.chainId);
                console.log("Satellite:", satellite == address(0) ? "NOT DEPLOYED" : vm.toString(satellite));
                
                if (satellite != address(0)) {
                    console.log("Status: SATELLITE READY");
                } else {
                    console.log("Status: SATELLITE NOT DEPLOYED");
                }
            }
        }
    }
}
