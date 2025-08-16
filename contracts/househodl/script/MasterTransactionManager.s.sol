// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {MasterTransactionManager} from "../src/MasterTransactionManager.sol";

contract MasterTransactionManagerScript is Script {
    MasterTransactionManager public masterTransactionManager;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        masterTransactionManager = new MasterTransactionManager();

        vm.stopBroadcast();
    }
}
