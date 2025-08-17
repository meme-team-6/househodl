// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

contract SimpleDeploymentState is Script {
    
    function getNetworkName(uint256 chainId) public pure returns (string memory) {
        if (chainId == 1) return "mainnet";
        if (chainId == 11155111) return "sepolia";
        if (chainId == 42161) return "arbitrum";
        if (chainId == 137) return "polygon";
        if (chainId == 80002) return "polygon_amoy";
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
    
    function getSatelliteAddress() public view returns (address) {
        return getContractAddress("Satellite");
    }
    
    function saveCrossChainAddress(string memory contractName, uint256 chainId, address contractAddress) public {
        string memory filename = string.concat("./deployments/", getNetworkName(chainId), "_", contractName, ".txt");
        string memory addressStr = vm.toString(contractAddress);
        
        // Create deployments directory if it doesn't exist
        string[] memory mkdirCmd = new string[](3);
        mkdirCmd[0] = "mkdir";
        mkdirCmd[1] = "-p";
        mkdirCmd[2] = "./deployments";
        vm.ffi(mkdirCmd);
        
        vm.writeFile(filename, addressStr);
        
        console.log(string.concat("Saved ", contractName, " address for ", getNetworkName(chainId), " to ", filename));
        console.log("Address:", contractAddress);
        console.log("Chain ID:", chainId);
    }
    
    function getCrossChainAddress(string memory contractName, uint256 chainId) public view returns (address) {
        string memory filename = string.concat("./deployments/", getNetworkName(chainId), "_", contractName, ".txt");
        
        try vm.readFile(filename) returns (string memory addressStr) {
            // Remove any whitespace/newlines
            bytes memory addressBytes = bytes(addressStr);
            if (addressBytes.length >= 42) {
                return vm.parseAddress(addressStr);
            }
        } catch {}
        
        return address(0);
    }
    
    function getLayerZeroEndpoint() public view returns (address) {
        // Hardcoded values based on network
        if (block.chainid == 11155111) return address(0x6EDCE65403992e310A62460808c4b910D972f10f); // Sepolia
        if (block.chainid == 1) return address(0x1a44076050125825900e736c501f859c50fE728c); // Mainnet
        if (block.chainid == 42161) return address(0x3c2269811836af69497E5F486A85D7316753cf62); // Arbitrum
        if (block.chainid == 137) return address(0x3c2269811836af69497E5F486A85D7316753cf62); // Polygon
        if (block.chainid == 80002) return address(0x6EDCE65403992e310A62460808c4b910D972f10f); // Polygon Amoy (testnet)
        return address(0);
    }
    
    function getLayerZeroEndpointId() public view returns (uint32) {
        // LayerZero V2 Endpoint IDs
        if (block.chainid == 11155111) return 40161; // Sepolia
        if (block.chainid == 1) return 30101; // Mainnet
        if (block.chainid == 42161) return 30110; // Arbitrum
        if (block.chainid == 137) return 30109; // Polygon
        if (block.chainid == 80002) return 40109; // Polygon Amoy (testnet)
        return 0;
    }
    
    function isMasterChain() public view returns (bool) {
        // Master contract lives on Sepolia for testnet and Mainnet for production
        return block.chainid == 11155111 || block.chainid == 1;
    }
    
    function getMasterChainId() public view returns (uint256) {
        // Return the appropriate master chain based on current network
        if (block.chainid == 80002 || block.chainid == 11155111) return 11155111; // Testnet chains use Sepolia as master
        return 1; // Production chains use Mainnet as master
    }
    
    function getMasterEndpointId() public view returns (uint32) {
        uint256 masterChainId = getMasterChainId();
        if (masterChainId == 11155111) return 40161; // Sepolia
        return 30101; // Mainnet
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
        address satellite = getSatelliteAddress();
        bool setupComplete = isSetupComplete();
        
        console.log("\n=== Deployment Status ===");
        console.log("Network:", networkName);
        console.log("Chain ID:", block.chainid);
        console.log("LayerZero Endpoint ID:", getLayerZeroEndpointId());
        console.log("LayerZero Endpoint:", getLayerZeroEndpoint());
        console.log("Is Master Chain:", isMasterChain());
        
        if (isMasterChain()) {
            console.log("StorageUnit:", storageUnit);
            console.log("MasterTransactionManager:", mtm);
        } else {
            console.log("Satellite:", satellite);
            console.log("Master Chain ID:", getMasterChainId());
            console.log("Master Endpoint ID:", getMasterEndpointId());
        }
        
        console.log("Setup Complete:", setupComplete);
        console.log("=========================\n");
    }
    
    // Aave V3 contract addresses by chain
    function getAavePool() public view returns (address) {
        if (block.chainid == 11155111) return 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951; // Sepolia
        if (block.chainid == 80002) return 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951; // Polygon Amoy
        if (block.chainid == 137) return 0x794a61358D6845594F94dc1DB02A252b5b4814aD; // Polygon
        if (block.chainid == 1) return 0x87870BcA8f44E22aF092d77cc45B93F3D1DE5f60; // Mainnet
        revert("Aave Pool not available on this chain");
    }
    
    function getAaveWETHGateway() public view returns (address) {
        if (block.chainid == 11155111) return 0x387d311e47e80b498169e6fb51d3193167d89F7D; // Sepolia  
        if (block.chainid == 80002) return 0x1e4b7A6b903680eab0c5dAbcb8fD429cD2a9598c; // Polygon Amoy
        if (block.chainid == 137) return 0x1e4b7A6b903680eab0c5dAbcb8fD429cD2a9598c; // Polygon
        if (block.chainid == 1) return 0x893411580e590D62dDBca8a703d61Cc4A8c7b2b9; // Mainnet
        revert("Aave WETH Gateway not available on this chain");
    }
    
    function getAavePriceOracle() public view returns (address) {
        if (block.chainid == 11155111) return 0x2da88497588bf89281816106C7259e31AF45a663; // Sepolia
        if (block.chainid == 80002) return 0x2da88497588bf89281816106C7259e31AF45a663; // Polygon Amoy  
        if (block.chainid == 137) return 0xb023e699F5a33916Ea823A16485e259257cA8Bd1; // Polygon
        if (block.chainid == 1) return 0x54586bE62E3c3580375aE3723C145253060Ca0C2; // Mainnet
        revert("Aave Price Oracle not available on this chain");
    }
    
    function getUSDCAddress() public view returns (address) {
        if (block.chainid == 11155111) return 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // Sepolia USDC
        if (block.chainid == 80002) return 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582; // Polygon Amoy USDC
        if (block.chainid == 137) return 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // Polygon USDC
        if (block.chainid == 1) return 0xA0B86A33e6411E28D0C6D1c8e1e2cA1b95c0De20; // Mainnet USDC
        revert("USDC not available on this chain");
    }
    
    function getAaveDataProvider() public view returns (address) {
        if (block.chainid == 11155111) return 0x3e9708d80f7B3e43118013075F7e95CE3AB31F31; // Sepolia
        if (block.chainid == 80002) return 0x3e9708d80f7B3e43118013075F7e95CE3AB31F31; // Polygon Amoy
        if (block.chainid == 137) return 0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654; // Polygon  
        if (block.chainid == 1) return 0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3; // Mainnet
        revert("Aave Data Provider not available on this chain");
    }
    
    function getAaveMultiTokenManagerAddress() public view returns (address) {
        return getContractAddress("AaveMultiTokenManager");
    }
}
