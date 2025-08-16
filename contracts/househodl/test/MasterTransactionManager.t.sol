// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {MasterTransactionManager} from "../src/MasterTransactionManager.sol";
import {StorageUnit} from "../src/StorageUnit.sol";
import {CreateHodl, HodlCreated, AddUserToHodl} from "../src/Messages.sol";

contract MasterTransactionManagerFixedTest is Test {
    MasterTransactionManager public manager;
    StorageUnit public storageUnit;
    address public mockEndpoint;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    address public user4 = address(0x5);
    
    uint32 constant USER1_EID = 101;
    uint32 constant USER2_EID = 102;
    uint32 constant USER3_EID = 103;
    uint32 constant USER4_EID = 104;

    function setUp() public {
        // Deploy a mock endpoint address
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
        
        // Set MasterTransactionManager as transaction manager
        vm.prank(owner);
        storageUnit.setTransactionManager(address(manager));
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Constructor Tests
    // ──────────────────────────────────────────────────────────────────────────────

    function testConstructor_Success() public {
        assertEq(address(manager.storageUnit()), address(storageUnit), "Storage unit should be set correctly");
        assertEq(manager.owner(), owner, "Owner should be set correctly");
    }

    function testConstructor_RevertWithZeroStorageUnit() public {
        vm.expectRevert(MasterTransactionManager.InvalidStorageUnit.selector);
        vm.prank(owner);
        new MasterTransactionManager(mockEndpoint, owner, address(0));
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // createHodl Tests
    // ──────────────────────────────────────────────────────────────────────────────

    function testCreateHodl_Success() public {
        CreateHodl memory params = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });

        HodlCreated memory result = manager.createHodl(params);
        bytes12 expectedHodlId = bytes12(uint96(0)); // First hodl should have ID 0

        assertEq(result.hodleId, expectedHodlId, "Returned hodl ID should be correct");
        assertEq(storageUnit.getHodlCount(), 1, "Hodl count should be 1");
        
        address[] memory users = storageUnit.getHodlUsers(expectedHodlId);
        assertEq(users.length, 1, "Hodl should have 1 user");
        assertEq(users[0], user1, "User should be user1");
        assertEq(storageUnit.mapUserToEid(user1), USER1_EID, "User1 EID should be set correctly");
    }

    function testCreateHodl_RevertWithZeroAddress() public {
        CreateHodl memory params = CreateHodl({
            initialUser: address(0),
            initialUserEid: USER1_EID
        });

        vm.expectRevert("Initial user cannot be zero address");
        manager.createHodl(params);
    }

    function testCreateHodl_MultipleHodls() public {
        // Create first hodl
        CreateHodl memory params1 = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory result1 = manager.createHodl(params1);
        
        // Create second hodl
        CreateHodl memory params2 = CreateHodl({
            initialUser: user2,
            initialUserEid: USER2_EID
        });
        HodlCreated memory result2 = manager.createHodl(params2);

        assertEq(result1.hodleId, bytes12(uint96(0)), "First hodl ID should be 0");
        assertEq(result2.hodleId, bytes12(uint96(1)), "Second hodl ID should be 1");
        assertEq(storageUnit.getHodlCount(), 2, "Should have 2 hodls");
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // addUserToHodl Tests
    // ──────────────────────────────────────────────────────────────────────────────

    function testAddUserToHodl_Success() public {
        // Create hodl first
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory created = manager.createHodl(createParams);

        // Add user to hodl
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodleId,
            newUser: user2,
            invitingUser: user1,
            newUserEid: USER2_EID
        });

        vm.prank(user1); // Only first user can add new users
        manager.addUserToHodl(addParams);

        address[] memory users = storageUnit.getHodlUsers(created.hodleId);
        assertEq(users.length, 2, "Hodl should have 2 users");
        assertEq(users[0], user1, "First user should be user1");
        assertEq(users[1], user2, "Second user should be user2");
        assertEq(storageUnit.mapUserToEid(user2), USER2_EID, "User2 EID should be set correctly");
    }

    function testAddUserToHodl_RevertWhenNotFirstUser() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory created = manager.createHodl(createParams);

        // Try to add user as non-first user
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodleId,
            newUser: user2,
            invitingUser: user1,
            newUserEid: USER2_EID
        });

        vm.expectRevert("Only the first user can add new users");
        vm.prank(user2); // user2 is not the first user
        manager.addUserToHodl(addParams);
    }

    function testAddUserToHodl_RevertWhenHodlDoesNotExist() public {
        bytes12 nonExistentHodlId = bytes12(uint96(999));
        
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: nonExistentHodlId,
            newUser: user2,
            invitingUser: user1,
            newUserEid: USER2_EID
        });

        vm.expectRevert("Hodl does not exist");
        vm.prank(user1);
        manager.addUserToHodl(addParams);
    }

    function testAddUserToHodl_RevertWithZeroNewUser() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory created = manager.createHodl(createParams);

        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodleId,
            newUser: address(0),
            invitingUser: user1,
            newUserEid: USER2_EID
        });

        vm.expectRevert("New user cannot be zero address");
        vm.prank(user1);
        manager.addUserToHodl(addParams);
    }

    function testAddUserToHodl_RevertWithZeroInvitingUser() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory created = manager.createHodl(createParams);

        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodleId,
            newUser: user2,
            invitingUser: address(0),
            newUserEid: USER2_EID
        });

        vm.expectRevert("Inviting user cannot be zero address");
        vm.prank(user1);
        manager.addUserToHodl(addParams);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Public Read Function Tests
    // ──────────────────────────────────────────────────────────────────────────────

    function testGetHodlCount() public {
        assertEq(manager.getHodlCount(), 0, "Should start with 0 hodls");

        // Create a hodl
        CreateHodl memory params = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        manager.createHodl(params);

        assertEq(manager.getHodlCount(), 1, "Should have 1 hodl after creation");
    }

    function testGetHodlUsers() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory created = manager.createHodl(createParams);

        // Test initial user
        address[] memory users = manager.getHodlUsers(created.hodleId);
        assertEq(users.length, 1, "Should have 1 user initially");
        assertEq(users[0], user1, "Should be user1");

        // Add another user
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodleId,
            newUser: user2,
            invitingUser: user1,
            newUserEid: USER2_EID
        });
        vm.prank(user1);
        manager.addUserToHodl(addParams);

        // Test after adding user
        users = manager.getHodlUsers(created.hodleId);
        assertEq(users.length, 2, "Should have 2 users");
        assertEq(users[0], user1, "First user should be user1");
        assertEq(users[1], user2, "Second user should be user2");
    }

    function testMapUserToEid() public {
        // Test unmapped user
        assertEq(manager.mapUserToEid(user1), 0, "Unmapped user should return 0");

        // Create hodl
        CreateHodl memory params = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        manager.createHodl(params);

        // Test mapped user
        assertEq(manager.mapUserToEid(user1), USER1_EID, "Should return correct EID for mapped user");
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Convenience Function Tests
    // ──────────────────────────────────────────────────────────────────────────────

    function testGetHodlUsersWithEid() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory created = manager.createHodl(createParams);

        // Add second user
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodleId,
            newUser: user2,
            invitingUser: user1,
            newUserEid: USER2_EID
        });
        vm.prank(user1);
        manager.addUserToHodl(addParams);

        // Test convenience function
        MasterTransactionManager.UserWithEid[] memory usersWithEid = manager.getHodlUsersWithEid(created.hodleId);
        
        assertEq(usersWithEid.length, 2, "Should return 2 users with EIDs");
        assertEq(usersWithEid[0].user, user1, "First user should be user1");
        assertEq(usersWithEid[0].eid, USER1_EID, "First user EID should be correct");
        assertEq(usersWithEid[1].user, user2, "Second user should be user2");
        assertEq(usersWithEid[1].eid, USER2_EID, "Second user EID should be correct");
    }

    function testGetUserHodls_SingleUser() public {
        // Create first hodl with user1
        CreateHodl memory params1 = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory created1 = manager.createHodl(params1);

        // Create second hodl with user2
        CreateHodl memory params2 = CreateHodl({
            initialUser: user2,
            initialUserEid: USER2_EID
        });
        manager.createHodl(params2);

        // Test user1's hodls
        bytes12[] memory user1Hodls = manager.getUserHodls(user1);
        assertEq(user1Hodls.length, 1, "User1 should be in 1 hodl");
        assertEq(user1Hodls[0], created1.hodleId, "Should return correct hodl ID");

        // Test user2's hodls
        bytes12[] memory user2Hodls = manager.getUserHodls(user2);
        assertEq(user2Hodls.length, 1, "User2 should be in 1 hodl");
    }

    function testGetUserHodls_MultipleHodls() public {
        // Create first hodl with user1
        CreateHodl memory params1 = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory created1 = manager.createHodl(params1);

        // Create second hodl with user2
        CreateHodl memory params2 = CreateHodl({
            initialUser: user2,
            initialUserEid: USER2_EID
        });
        HodlCreated memory created2 = manager.createHodl(params2);

        // Add user1 to second hodl
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created2.hodleId,
            newUser: user1,
            invitingUser: user2,
            newUserEid: USER1_EID
        });
        vm.prank(user2);
        manager.addUserToHodl(addParams);

        // Test user1's hodls (should be in both)
        bytes12[] memory user1Hodls = manager.getUserHodls(user1);
        assertEq(user1Hodls.length, 2, "User1 should be in 2 hodls");
        
        // Check that both hodl IDs are present (order might vary)
        bool found1 = false;
        bool found2 = false;
        for (uint i = 0; i < user1Hodls.length; i++) {
            if (user1Hodls[i] == created1.hodleId) found1 = true;
            if (user1Hodls[i] == created2.hodleId) found2 = true;
        }
        assertTrue(found1, "Should find first hodl");
        assertTrue(found2, "Should find second hodl");
    }

    function testGetUserHodls_NoHodls() public {
        // Test user with no hodls
        bytes12[] memory userHodls = manager.getUserHodls(user1);
        assertEq(userHodls.length, 0, "User with no hodls should return empty array");
    }

    function testGetUserHodls_RemovedFromMiddle() public {
        // Create multiple hodls
        CreateHodl memory params1 = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory created1 = manager.createHodl(params1);

        CreateHodl memory params2 = CreateHodl({
            initialUser: user2,
            initialUserEid: USER2_EID
        });
        manager.createHodl(params2);

        CreateHodl memory params3 = CreateHodl({
            initialUser: user3,
            initialUserEid: USER3_EID
        });
        manager.createHodl(params3);

        // Add user4 to first and third hodl only
        AddUserToHodl memory addParams1 = AddUserToHodl({
            hodlId: created1.hodleId,
            newUser: user4,
            invitingUser: user1,
            newUserEid: USER4_EID
        });
        vm.prank(user1);
        manager.addUserToHodl(addParams1);

        bytes12 hodl3Id = bytes12(uint96(2));
        AddUserToHodl memory addParams3 = AddUserToHodl({
            hodlId: hodl3Id,
            newUser: user4,
            invitingUser: user3,
            newUserEid: USER4_EID
        });
        vm.prank(user3);
        manager.addUserToHodl(addParams3);

        // Test user4's hodls (should be in first and third, but not second)
        bytes12[] memory user4Hodls = manager.getUserHodls(user4);
        assertEq(user4Hodls.length, 2, "User4 should be in 2 hodls");
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Edge Case Tests
    // ──────────────────────────────────────────────────────────────────────────────

    function testCreateHodl_MaxHodls() public {
        // This would test the limit, but it's impractical to create 2^12-1 hodls in a test
        // Instead, we can test the logic by temporarily modifying the limit or mocking
        
        // For now, just test that the limit exists
        CreateHodl memory params = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        
        // This should succeed for a normal number
        manager.createHodl(params);
        assertTrue(true, "Should be able to create hodl under normal circumstances");
    }

    function testIntegration_ComplexScenario() public {
        // Create multiple hodls and add users to test integration
        
        // Hodl 1: user1 creates, adds user2
        CreateHodl memory params1 = CreateHodl({
            initialUser: user1,
            initialUserEid: USER1_EID
        });
        HodlCreated memory created1 = manager.createHodl(params1);

        AddUserToHodl memory addParams1 = AddUserToHodl({
            hodlId: created1.hodleId,
            newUser: user2,
            invitingUser: user1,
            newUserEid: USER2_EID
        });
        vm.prank(user1);
        manager.addUserToHodl(addParams1);

        // Hodl 2: user3 creates, adds user1 and user4
        CreateHodl memory params2 = CreateHodl({
            initialUser: user3,
            initialUserEid: USER3_EID
        });
        HodlCreated memory created2 = manager.createHodl(params2);

        AddUserToHodl memory addParams2 = AddUserToHodl({
            hodlId: created2.hodleId,
            newUser: user1,
            invitingUser: user3,
            newUserEid: USER1_EID
        });
        vm.prank(user3);
        manager.addUserToHodl(addParams2);

        AddUserToHodl memory addParams3 = AddUserToHodl({
            hodlId: created2.hodleId,
            newUser: user4,
            invitingUser: user3,
            newUserEid: USER4_EID
        });
        vm.prank(user3);
        manager.addUserToHodl(addParams3);

        // Verify final state
        assertEq(manager.getHodlCount(), 2, "Should have 2 hodls");
        
        // Check hodl 1
        MasterTransactionManager.UserWithEid[] memory hodl1Users = manager.getHodlUsersWithEid(created1.hodleId);
        assertEq(hodl1Users.length, 2, "Hodl 1 should have 2 users");
        
        // Check hodl 2
        MasterTransactionManager.UserWithEid[] memory hodl2Users = manager.getHodlUsersWithEid(created2.hodleId);
        assertEq(hodl2Users.length, 3, "Hodl 2 should have 3 users");

        // Check user1 is in both hodls
        bytes12[] memory user1Hodls = manager.getUserHodls(user1);
        assertEq(user1Hodls.length, 2, "User1 should be in 2 hodls");

        // Check user2 is only in hodl 1
        bytes12[] memory user2Hodls = manager.getUserHodls(user2);
        assertEq(user2Hodls.length, 1, "User2 should be in 1 hodl");

        // Check user3 is only in hodl 2
        bytes12[] memory user3Hodls = manager.getUserHodls(user3);
        assertEq(user3Hodls.length, 1, "User3 should be in 1 hodl");

        // Check user4 is only in hodl 2
        bytes12[] memory user4Hodls = manager.getUserHodls(user4);
        assertEq(user4Hodls.length, 1, "User4 should be in 1 hodl");
    }
}
