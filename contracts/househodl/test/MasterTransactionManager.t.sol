// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {MasterTransactionManager} from "../src/MasterTransactionManager.sol";
import {StorageUnit} from "../src/StorageUnit.sol";
import {CreateHodl, HodlCreated, AddUserToHodl} from "../src/Messages.sol";

contract MasterTransactionManagerTest is Test {
    MasterTransactionManager public manager;
    StorageUnit public storageUnit;
    address public mockEndpoint;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    
    bytes32 constant USER1_CHAIN_ID = bytes32(uint256(1));
    bytes32 constant USER2_CHAIN_ID = bytes32(uint256(2));
    uint32 constant USER2_ENDPOINT_ID = 2;
    uint32 constant USER3_ENDPOINT_ID = 3;

    function setUp() public {
        // Deploy a mock endpoint address (we'll mock its functions)
        mockEndpoint = address(0x123456);
        
        // Mock essential LayerZero endpoint functions that OApp constructor needs
        vm.mockCall(
            mockEndpoint,
            abi.encodeWithSignature("delegates(address)"),
            abi.encode(address(0))
        );
        
        // Deploy StorageUnit first
        vm.prank(owner);
        storageUnit = new StorageUnit(owner);
        
        // Deploy MasterTransactionManager
        vm.prank(owner);
        manager = new MasterTransactionManager(
            mockEndpoint,
            owner,
            address(storageUnit)
        );
        
        // Set MasterTransactionManager as owner of StorageUnit so it can modify state
        vm.prank(owner);
        storageUnit.transferOwnership(address(manager));
    }

    function testCreateHodl_Success() public {
        // Arrange
        CreateHodl memory createParams = CreateHodl({
            chainEndpointId: 1,
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID
        });

        // Act
        vm.prank(user1);
        HodlCreated memory result = manager.createHodl(createParams);

        // Assert
        assertEq(uint96(result.hodleId), 0, "First hodl should have ID 0");
        assertEq(storageUnit.getHodlCount(), 1, "Should have 1 hodl created");
        
        address[] memory users = storageUnit.getHodlUsers(result.hodleId);
        assertEq(users.length, 1, "Hodl should have 1 user");
        assertEq(users[0], user1, "Initial user should be user1");
        assertEq(storageUnit.mapUserToEid(user1), USER1_CHAIN_ID, "User1 chain ID should be set correctly");
    }

    function testCreateHodl_MultipleHodls() public {
        // Create first hodl
        CreateHodl memory createParams1 = CreateHodl({
            chainEndpointId: 1,
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID
        });
        
        vm.prank(user1);
        HodlCreated memory result1 = manager.createHodl(createParams1);

        // Create second hodl
        CreateHodl memory createParams2 = CreateHodl({
            chainEndpointId: 2,
            initialUser: user2,
            initialUserChainId: USER2_CHAIN_ID
        });
        
        vm.prank(user2);
        HodlCreated memory result2 = manager.createHodl(createParams2);

        // Assert
        assertEq(uint96(result1.hodleId), 0, "First hodl should have ID 0");
        assertEq(uint96(result2.hodleId), 1, "Second hodl should have ID 1");
        assertEq(storageUnit.getHodlCount(), 2, "Should have 2 hodls created");
        
        address[] memory users1 = storageUnit.getHodlUsers(result1.hodleId);
        address[] memory users2 = storageUnit.getHodlUsers(result2.hodleId);
        
        assertEq(users1[0], user1, "First hodl should have user1");
        assertEq(users2[0], user2, "Second hodl should have user2");
    }

    function testCreateHodl_RevertWhenInitialUserIsZero() public {
        // Arrange
        CreateHodl memory createParams = CreateHodl({
            chainEndpointId: 1,
            initialUser: address(0),
            initialUserChainId: USER1_CHAIN_ID
        });

        // Act & Assert
        vm.expectRevert("Initial user cannot be zero address");
        manager.createHodl(createParams);
    }

    function testAddUserToHodl_Success() public {
        // Arrange: Create a hodl first
        CreateHodl memory createParams = CreateHodl({
            chainEndpointId: 1,
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID
        });
        
        vm.prank(user1);
        HodlCreated memory hodl = manager.createHodl(createParams);
        
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: hodl.hodleId,
            newUser: user2,
            invitingUser: user1,
            chainEndpointId: USER2_ENDPOINT_ID
        });

        // Act
        vm.prank(user1);
        manager.addUserToHodl(addParams);

        // Assert
        address[] memory users = storageUnit.getHodlUsers(hodl.hodleId);
        assertEq(users.length, 2, "Hodl should have 2 users");
        assertEq(users[0], user1, "First user should still be user1");
        assertEq(users[1], user2, "Second user should be user2");
        assertEq(storageUnit.mapUserToEid(user2), bytes32(uint256(USER2_ENDPOINT_ID)), "User2 endpoint ID should be set correctly");
    }

    function testAddUserToHodl_MultipleUsers() public {
        // Arrange: Create a hodl first
        CreateHodl memory createParams = CreateHodl({
            chainEndpointId: 1,
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID
        });
        
        vm.prank(user1);
        HodlCreated memory hodl = manager.createHodl(createParams);
        
        // Add user2
        AddUserToHodl memory addParams1 = AddUserToHodl({
            hodlId: hodl.hodleId,
            newUser: user2,
            invitingUser: user1,
            chainEndpointId: USER2_ENDPOINT_ID
        });
        
        vm.prank(user1);
        manager.addUserToHodl(addParams1);
        
        // Add user3
        AddUserToHodl memory addParams2 = AddUserToHodl({
            hodlId: hodl.hodleId,
            newUser: user3,
            invitingUser: user1,
            chainEndpointId: USER3_ENDPOINT_ID
        });
        
        vm.prank(user1);
        manager.addUserToHodl(addParams2);

        // Assert
        address[] memory users = storageUnit.getHodlUsers(hodl.hodleId);
        assertEq(users.length, 3, "Hodl should have 3 users");
        assertEq(users[0], user1, "First user should be user1");
        assertEq(users[1], user2, "Second user should be user2");
        assertEq(users[2], user3, "Third user should be user3");
    }

    function testAddUserToHodl_RevertWhenHodlDoesNotExist() public {
        // Arrange
        bytes12 nonExistentHodlId = bytes12(uint96(999));
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: nonExistentHodlId,
            newUser: user2,
            invitingUser: user1,
            chainEndpointId: USER2_ENDPOINT_ID
        });

        // Act & Assert - This should revert with an out of bounds error since hodl 999 doesn't exist
        vm.expectRevert();
        vm.prank(user1);
        manager.addUserToHodl(addParams);
    }

    function testAddUserToHodl_RevertWhenNotFirstUser() public {
        // Arrange: Create a hodl with user1
        CreateHodl memory createParams = CreateHodl({
            chainEndpointId: 1,
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID
        });
        
        vm.prank(user1);
        HodlCreated memory hodl = manager.createHodl(createParams);
        
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: hodl.hodleId,
            newUser: user3,
            invitingUser: user1,
            chainEndpointId: USER3_ENDPOINT_ID
        });

        // Act & Assert - user2 tries to add user3, but only user1 (first user) can
        vm.expectRevert("Only the first user can add new users");
        vm.prank(user2);
        manager.addUserToHodl(addParams);
    }

    function testAddUserToHodl_RevertWhenNewUserIsZero() public {
        // Arrange: Create a hodl first
        CreateHodl memory createParams = CreateHodl({
            chainEndpointId: 1,
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID
        });
        
        vm.prank(user1);
        HodlCreated memory hodl = manager.createHodl(createParams);
        
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: hodl.hodleId,
            newUser: address(0),
            invitingUser: user1,
            chainEndpointId: USER2_ENDPOINT_ID
        });

        // Act & Assert
        vm.expectRevert("New user cannot be zero address");
        vm.prank(user1);
        manager.addUserToHodl(addParams);
    }

    function testAddUserToHodl_RevertWhenInvitingUserIsZero() public {
        // Arrange: Create a hodl first
        CreateHodl memory createParams = CreateHodl({
            chainEndpointId: 1,
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID
        });
        
        vm.prank(user1);
        HodlCreated memory hodl = manager.createHodl(createParams);
        
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: hodl.hodleId,
            newUser: user2,
            invitingUser: address(0),
            chainEndpointId: USER2_ENDPOINT_ID
        });

        // Act & Assert
        vm.expectRevert("Inviting user cannot be zero address");
        vm.prank(user1);
        manager.addUserToHodl(addParams);
    }

    function testConstructor_RevertWithInvalidStorageUnit() public {
        // Act & Assert
        vm.expectRevert(MasterTransactionManager.InvalidStorageUnit.selector);
        vm.prank(owner);
        new MasterTransactionManager(
            mockEndpoint,
            owner,
            address(0)  // Invalid storage unit
        );
    }

    function testConstructor_Success() public {
        // Act
        vm.prank(owner);
        MasterTransactionManager newManager = new MasterTransactionManager(
            mockEndpoint,
            owner,
            address(storageUnit)
        );

        // Assert
        assertEq(address(newManager.storageUnit()), address(storageUnit), "Storage unit should be set correctly");
        assertEq(newManager.owner(), owner, "Owner should be set correctly");
    }
}
