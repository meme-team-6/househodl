// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {StorageUnit} from "../src/StorageUnit.sol";

contract StorageUnitTest is Test {
    StorageUnit public storageUnit;
    
    address public owner = address(0x1);
    address public transactionManager = address(0x2);
    address public user1 = address(0x3);
    address public user2 = address(0x4);
    address public nonOwner = address(0x5);
    
    uint32 public chainId1 = 101;
    uint32 public chainId2 = 102;

    function setUp() public {
        vm.prank(owner);
        storageUnit = new StorageUnit(owner);
        
        vm.prank(owner);
        storageUnit.setTransactionManager(transactionManager);
    }

    function testConstructor_SetsOwnerCorrectly() public {
        assertEq(storageUnit.owner(), owner, "Owner should be set correctly");
    }

    function testSetTransactionManager_Success() public {
        address newTransactionManager = address(0x999);
        
        vm.prank(owner);
        vm.expectEmit(true, true, false, false);
        emit StorageUnit.TransactionManagerUpdated(transactionManager, newTransactionManager);
        storageUnit.setTransactionManager(newTransactionManager);
        
        assertEq(storageUnit.transactionManager(), newTransactionManager, "Transaction manager should be updated");
    }

    function testSetTransactionManager_RevertWhenNotOwner() public {
        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(nonOwner);
        storageUnit.setTransactionManager(address(0x999));
    }

    function testCreateHodl_Success() public {
        bytes12 hodlId = bytes12(uint96(0));
        
        vm.prank(transactionManager);
        storageUnit.createHodl(hodlId, user1, chainId1);
        
        assertEq(storageUnit.getHodlCount(), 1, "Should have 1 hodl");
        address[] memory users = storageUnit.getHodlUsers(hodlId);
        assertEq(users.length, 1, "Hodl should have 1 user");
        assertEq(users[0], user1, "User should be user1");
        assertEq(storageUnit.mapUserToEid(user1), chainId1, "User chain ID should be set");
    }

    function testCreateHodl_RevertWhenNotTransactionManager() public {
        bytes12 hodlId = bytes12(uint96(0));
        
        vm.expectRevert("StorageUnit: caller is not the transaction manager");
        vm.prank(owner);
        storageUnit.createHodl(hodlId, user1, chainId1);
    }

    function testAddUserToHodl_Success() public {
        bytes12 hodlId = bytes12(uint96(0));
        
        // Create hodl first
        vm.prank(transactionManager);
        storageUnit.createHodl(hodlId, user1, chainId1);
        
        // Add second user
        vm.prank(transactionManager);
        storageUnit.addUserToHodl(hodlId, user2, chainId2);
        
        address[] memory users = storageUnit.getHodlUsers(hodlId);
        assertEq(users.length, 2, "Hodl should have 2 users");
        assertEq(users[0], user1, "First user should be user1");
        assertEq(users[1], user2, "Second user should be user2");
        assertEq(storageUnit.mapUserToEid(user2), chainId2, "User2 chain ID should be set");
    }

    function testAddUserToHodl_RevertWhenNotTransactionManager() public {
        bytes12 hodlId = bytes12(uint96(0));
        
        // Create hodl first
        vm.prank(transactionManager);
        storageUnit.createHodl(hodlId, user1, chainId1);
        
        // Try to add user as non-transaction manager
        vm.expectRevert("StorageUnit: caller is not the transaction manager");
        vm.prank(owner);
        storageUnit.addUserToHodl(hodlId, user2, chainId2);
    }

    function testGetHodlUsers_ReturnsCorrectUsers() public {
        bytes12 hodlId = bytes12(uint96(0));
        
        vm.prank(transactionManager);
        storageUnit.createHodl(hodlId, user1, chainId1);
        
        vm.prank(transactionManager);
        storageUnit.addUserToHodl(hodlId, user2, chainId2);
        
        address[] memory users = storageUnit.getHodlUsers(hodlId);
        assertEq(users.length, 2, "Should return 2 users");
        assertEq(users[0], user1, "First user should be user1");
        assertEq(users[1], user2, "Second user should be user2");
    }

    function testMapUserToEid_ReturnsCorrectEid() public {
        bytes12 hodlId = bytes12(uint96(0));
        
        vm.prank(transactionManager);
        storageUnit.createHodl(hodlId, user1, chainId1);
        
        assertEq(storageUnit.mapUserToEid(user1), chainId1, "Should return correct chain ID for user1");
        assertEq(storageUnit.mapUserToEid(user2), uint32(0), "Should return zero for unmapped user");
    }
}
