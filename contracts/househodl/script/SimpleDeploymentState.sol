// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

contract SimpleDeploymentState is Script {
    
    function getNetworkName(uint256 chainId) public pure returns (string memory) {
        if (chainId == 1) return "mainnet";
        if (chainId == 11155111) return "sepolia";
        if (chainId == 42161) return "arbitrum";
        if (chainId == 31337) return "local";
        return "unknown";
    }
    
    function getCurrentNetworkName() public view returns (string memory) {
        return getNetworkName(block.chainid);
    }
    
    function getAddressFile(string memory contractName) internal view returns (string memory) {
        return string.concat("./deployments/", getCurrentNetworkName(), "_", contractName, ".txt");
    }
    
    function saveContractAddress(string memory contractName, address contractAddress) public {
        string memory filename = getAddressFile(contractName);
        string memory addressStr = vm.toString(contractAddress);
        
        // Create deployments directory if it doesn't exist
        string[] memory mkdirCmd = new string[](3);
        mkdirCmd[0] = "mkdir";
        mkdirCmd[1] = "-p";
        mkdirCmd[2] = "./deployments";
        vm.ffi(mkdirCmd);
        
        vm.writeFile(filename, addressStr);
        
        console.log(string.concat("Saved ", contractName, " address to ", filename));
        console.log("Address:", contractAddress);
        console.log("Network:", getCurrentNetworkName());
    }
    
    function getContractAddress(string memory contractName) public view returns (address) {
        string memory filename = getAddressFile(contractName);
        
        try vm.readFile(filename) returns (string memory addressStr) {
            // Remove any whitespace/newlines
            bytes memory addressBytes = bytes(addressStr);
            if (addressBytes.length >= 42) {
                return vm.parseAddress(addressStr);
            }
        } catch {}
        
        return address(0);
    }
    
    function getStorageUnitAddress() public view returns (address) {
        return getContractAddress("StorageUnit");
    }
    
    function getMasterTransactionManagerAddress() public view returns (address) {
        return getContractAddress("MasterTransactionManager");
    }
    
    function getLayerZeroEndpoint() public view returns (address) {
        // Hardcoded values based on network
        if (block.chainid == 11155111) return address(0x6EDCE65403992e310A62460808c4b910D972f10f); // Sepolia
        if (block.chainid == 1) return address(0x1a44076050125825900e736c501f859c50fE728c); // Mainnet
        if (block.chainid == 42161) return address(0x3c2269811836af69497E5F486A85D7316753cf62); // Arbitrum
        return address(0);
    }
    
    function markSetupComplete() public {
        string memory filename = string.concat("./deployments/", getCurrentNetworkName(), "_setup_complete.txt");
        vm.writeFile(filename, "true");
        console.log("Marked setup as complete for network:", getCurrentNetworkName());
    }
    
    function isSetupComplete() public view returns (bool) {
        string memory filename = string.concat("./deployments/", getCurrentNetworkName(), "_setup_complete.txt");
        
        try vm.readFile(filename) returns (string memory content) {
            return keccak256(bytes(content)) == keccak256(bytes("true"));
        } catch {}
        
        return false;
    }
    
    function printDeploymentStatus() public view {
        string memory networkName = getCurrentNetworkName();
        address storageUnit = getStorageUnitAddress();
        address mtm = getMasterTransactionManagerAddress();
        bool setupComplete = isSetupComplete();
        
        console.log("\n=== Deployment Status ===");
        console.log("Network:", networkName);
        console.log("Chain ID:", block.chainid);
        console.log("StorageUnit:", storageUnit);
        console.log("MasterTransactionManager:", mtm);
        console.log("Setup Complete:", setupComplete);
        console.log("=========================\n");
    }
}
