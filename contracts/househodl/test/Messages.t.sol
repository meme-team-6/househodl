// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import "../src/Messages.sol";

contract MessageTest is Test {
    function setUp() public {
        // satellite = new Satellite();
    }

    function testEncoding() public pure {
        CreateHodl memory createHodl = CreateHodl({
            initialUser: address(0x123),
            initialUserChainId: 456,
            vanityName: bytes32(""),
            spendLimit: 0
        });

        bytes memory encoded = MessageEncoder.encodeCreateHodl(createHodl);
        assert(encoded.length > 0);
        MessageType tp = MessageEncoder.determineType(encoded);
        assert(tp == MessageType.CREATE_HOLD);
        CreateHodl memory decoded = MessageEncoder.asCreateHodl(encoded);
        assert(decoded.initialUser == createHodl.initialUser);
        assert(decoded.initialUserChainId == createHodl.initialUserChainId);
    }
}
