// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import "../src/Messages.sol";

contract MessageTest is Test {
    function setUp() public {
        // satellite = new Satellite();
    }

    function testEncoding() public {
        CreateHodl memory createHodl = CreateHodl({
            chainEndpointId: 1,
            initialUser: address(0x123),
            initialUserChainId: bytes32(uint256(0x456))
        });

        bytes memory encoded = MessageEncoder.encodeCreateHodl(createHodl);
        assert(encoded.length > 0);
        MessageType tp = MessageEncoder.determineType(encoded);
        assert(tp == MessageType.CREATE_HOLD);
    }
}
