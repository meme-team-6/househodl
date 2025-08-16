// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {StorageUnit} from "../src/StorageUnit.sol";

contract CounterScript is Script {
    StorageUnit public storageUnit;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        storageUnit = new StorageUnit(msg.sender);

        vm.stopBroadcast();
    }
}
