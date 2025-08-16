// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {SatelliteValueStore} from "../src/SatelliteValueStore.sol";

contract SatelliteValueStoreTest is Test {
    SatelliteValueStore public satelliteValueStore;

    function setUp() public {
        satelliteValueStore = new SatelliteValueStore();
    }
}
