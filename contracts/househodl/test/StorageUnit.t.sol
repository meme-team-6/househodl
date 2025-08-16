// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {StorageUnit} from "../src/StorageUnit.sol";

contract CounterTest is Test {
    StorageUnit public storageUnit;

    function setUp() public {
        storageUnit = new StorageUnit(address(this));
    }
}
