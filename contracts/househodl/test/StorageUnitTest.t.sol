// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {StorageUnit} from "../src/StorageUnit.sol";

contract StorageUnitTest is Test {
    StorageUnit public storageUnit;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    address public notOwner = address(0x5);
    
    bytes32 constant USER1_CHAIN_ID = bytes32(uint256(1));
    bytes32 constant USER2_CHAIN_ID = bytes32(uint256(2));
    uint32 constant USER2_ENDPOINT_ID = 2;
    uint32 constant USER3_ENDPOINT_ID = 3;

    function setUp() public {
        vm.prank(owner);
        storageUnit = new StorageUnit(owner);
    }

    function testConstructor_Success() public {
        // Act
        vm.prank(owner);
        StorageUnit newStorageUnit = new StorageUnit(owner);

        // Assert
        assertEq(newStorageUnit.owner(), owner, "Owner should be set correctly");
        assertEq(newStorageUnit.getHodlCount(), 0, "Should start with 0 hodls");
    }

    function testCreateHodl_Success() public {
        // Arrange
        bytes12 hodlId = bytes12(uint96(0));

        // Act
        vm.prank(owner);
        storageUnit.createHodl(hodlId, user1, USER1_CHAIN_ID);

        // Assert
        assertEq(storageUnit.getHodlCount(), 1, "Should have 1 hodl created");
        
        address[] memory users = storageUnit.getHodlUsers(hodlId);
        assertEq(users.length, 1, "Hodl should have 1 user");
        assertEq(users[0], user1, "Initial user should be user1");
        assertEq(storageUnit.mapUserToEid(user1), USER1_CHAIN_ID, "User1 chain ID should be set correctly");
    }

    function testCreateHodl_MultipleHodls() public {
        // Arrange
        bytes12 hodlId1 = bytes12(uint96(0));
        bytes12 hodlId2 = bytes12(uint96(1));

        // Act
        vm.prank(owner);
        storageUnit.createHodl(hodlId1, user1, USER1_CHAIN_ID);
        
        vm.prank(owner);
        storageUnit.createHodl(hodlId2, user2, USER2_CHAIN_ID);

        // Assert
        assertEq(storageUnit.getHodlCount(), 2, "Should have 2 hodls created");
        
        address[] memory users1 = storageUnit.getHodlUsers(hodlId1);
        address[] memory users2 = storageUnit.getHodlUsers(hodlId2);
        
        assertEq(users1[0], user1, "First hodl should have user1");
        assertEq(users2[0], user2, "Second hodl should have user2");
        assertEq(storageUnit.mapUserToEid(user1), USER1_CHAIN_ID, "User1 chain ID should be set correctly");
        assertEq(storageUnit.mapUserToEid(user2), USER2_CHAIN_ID, "User2 chain ID should be set correctly");
    }

    function testCreateHodl_RevertWhenNotOwner() public {
        // Arrange
        bytes12 hodlId = bytes12(uint96(0));

        // Act & Assert
        vm.expectRevert();
        vm.prank(notOwner);
        storageUnit.createHodl(hodlId, user1, USER1_CHAIN_ID);
    }

    function testAddUserToHodl_Success() public {
        // Arrange - Create a hodl first
        bytes12 hodlId = bytes12(uint96(0));
        vm.prank(owner);
        storageUnit.createHodl(hodlId, user1, USER1_CHAIN_ID);

        // Act
        vm.prank(owner);
        storageUnit.addUserToHodl(hodlId, user2, USER2_ENDPOINT_ID);

        // Assert
        address[] memory users = storageUnit.getHodlUsers(hodlId);
        assertEq(users.length, 2, "Hodl should have 2 users");
        assertEq(users[0], user1, "First user should still be user1");
        assertEq(users[1], user2, "Second user should be user2");
        assertEq(storageUnit.mapUserToEid(user2), bytes32(uint256(USER2_ENDPOINT_ID)), "User2 endpoint ID should be set correctly");
    }

    function testAddUserToHodl_MultipleUsers() public {
        // Arrange - Create a hodl first
        bytes12 hodlId = bytes12(uint96(0));
        vm.prank(owner);
        storageUnit.createHodl(hodlId, user1, USER1_CHAIN_ID);

        // Act
        vm.prank(owner);
        storageUnit.addUserToHodl(hodlId, user2, USER2_ENDPOINT_ID);
        
        vm.prank(owner);
        storageUnit.addUserToHodl(hodlId, user3, USER3_ENDPOINT_ID);

        // Assert
        address[] memory users = storageUnit.getHodlUsers(hodlId);
        assertEq(users.length, 3, "Hodl should have 3 users");
        assertEq(users[0], user1, "First user should be user1");
        assertEq(users[1], user2, "Second user should be user2");
        assertEq(users[2], user3, "Third user should be user3");
        assertEq(storageUnit.mapUserToEid(user2), bytes32(uint256(USER2_ENDPOINT_ID)), "User2 endpoint ID should be set correctly");
        assertEq(storageUnit.mapUserToEid(user3), bytes32(uint256(USER3_ENDPOINT_ID)), "User3 endpoint ID should be set correctly");
    }

    function testAddUserToHodl_RevertWhenNotOwner() public {
        // Arrange - Create a hodl first
        bytes12 hodlId = bytes12(uint96(0));
        vm.prank(owner);
        storageUnit.createHodl(hodlId, user1, USER1_CHAIN_ID);

        // Act & Assert
        vm.expectRevert();
        vm.prank(notOwner);
        storageUnit.addUserToHodl(hodlId, user2, USER2_ENDPOINT_ID);
    }

    function testGetHodlUsers_EmptyWhenNonExistent() public {
        // This will revert with array out of bounds since the hodl doesn't exist
        bytes12 nonExistentHodlId = bytes12(uint96(999));
        
        vm.expectRevert();
        storageUnit.getHodlUsers(nonExistentHodlId);
    }

    function testMapUserToEid_ReturnsZeroForUnsetUser() public {
        // Assert
        assertEq(storageUnit.mapUserToEid(user1), bytes32(0), "Unset user should return zero");
    }
}
