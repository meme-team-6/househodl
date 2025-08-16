// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {SatelliteValueStore} from "../src/SatelliteValueStore.sol";

contract SatelliteValueStoreScript is Script {
    SatelliteValueStore public satelliteValueStore;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        satelliteValueStore = new SatelliteValueStore();

        vm.stopBroadcast();
    }
}
