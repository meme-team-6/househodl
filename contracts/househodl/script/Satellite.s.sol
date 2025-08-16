// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Satellite} from "../src/Satellite.sol";

contract SatelliteScript is Script {
    Satellite public satellite;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        satellite = new Satellite();

        vm.stopBroadcast();
    }
}
