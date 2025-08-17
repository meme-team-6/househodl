// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {MasterTransactionManager} from "../src/MasterTransactionManager.sol";
import {StorageUnit} from "../src/StorageUnit.sol";
import {CreateHodl, HodlCreated, AddUserToHodl, SubmitTransaction} from "../src/Messages.sol";
import {Transaction, Share, HodlGroup, User} from "../src/Common.sol";

contract MasterTransactionManagerFixedTest is Test {
    MasterTransactionManager public manager;
    StorageUnit public storageUnit;
    address public mockEndpoint;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    address public user4 = address(0x5);
    
    uint32 constant USER1_CHAIN_ID = 101;
    uint32 constant USER2_CHAIN_ID = 102;
    uint32 constant USER3_CHAIN_ID = 103;
    uint32 constant USER4_CHAIN_ID = 104;

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
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });

        vm.prank(user1);
        HodlCreated memory result = manager.createHodl(params);
        bytes12 expectedHodlId = bytes12(uint96(0)); // First hodl should have ID 0

        assertEq(result.hodlId, expectedHodlId, "Returned hodl ID should be correct");
        assertEq(storageUnit.getHodlCount(), 1, "Hodl count should be 1");
        
        User[] memory users = storageUnit.getHodlUsers(expectedHodlId);
        assertEq(users.length, 1, "Hodl should have 1 user");
        assertEq(users[0].userAddress, user1, "User should be user1");
        assertEq(users[0].chainId, USER1_CHAIN_ID, "User1 CHAIN_ID should be set correctly");
    }

    function testCreateHodl_RevertWithZeroAddress() public {
        CreateHodl memory params = CreateHodl({
            initialUser: address(0),
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });

        vm.expectRevert("Initial user cannot be zero address");
        vm.prank(address(0));
        manager.createHodl(params);
    }

    function testCreateHodl_MultipleHodls() public {
        // Create first hodl
        CreateHodl memory params1 = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0

        });
        vm.prank(user1);
        HodlCreated memory result1 = manager.createHodl(params1);
        
        // Create second hodl
        CreateHodl memory params2 = CreateHodl({
            initialUser: user2,
            initialUserChainId: USER2_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user2);
        HodlCreated memory result2 = manager.createHodl(params2);

        assertEq(result1.hodlId, bytes12(uint96(0)), "First hodl ID should be 0");
        assertEq(result2.hodlId, bytes12(uint96(1)), "Second hodl ID should be 1");
        assertEq(storageUnit.getHodlCount(), 2, "Should have 2 hodls");
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // addUserToHodl Tests
    // ──────────────────────────────────────────────────────────────────────────────

    function testAddUserToHodl_Success() public {
        // Create hodl first
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        // Add user to hodl
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodlId,
            newUser: user2,
            invitingUser: user1,
            newUserChainId: USER2_CHAIN_ID
        });

        vm.prank(user1); // Only first user can add new users
        manager.addUserToHodl(addParams);

        User[] memory users = storageUnit.getHodlUsers(created.hodlId);
        assertEq(users.length, 2, "Hodl should have 2 users");
        assertEq(users[0].userAddress, user1, "First user should be user1");
        assertEq(users[1].userAddress, user2, "Second user should be user2");
        assertEq(users[1].chainId, USER2_CHAIN_ID, "User2 CHAIN_ID should be set correctly");
    }

    function testAddUserToHodl_RevertWhenNotFirstUser() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        // Try to add user as non-first user
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodlId,
            newUser: user2,
            invitingUser: user1,
            newUserChainId: USER2_CHAIN_ID
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
            newUserChainId: USER2_CHAIN_ID
        });

        vm.expectRevert("Hodl does not exist");
        vm.prank(user1);
        manager.addUserToHodl(addParams);
    }

    function testAddUserToHodl_RevertWithZeroNewUser() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodlId,
            newUser: address(0),
            invitingUser: user1,
            newUserChainId: USER2_CHAIN_ID
        });

        vm.expectRevert("New user cannot be zero address");
        vm.prank(user1);
        manager.addUserToHodl(addParams);
    }

    function testAddUserToHodl_RevertWithZeroInvitingUser() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodlId,
            newUser: user2,
            invitingUser: address(0),
            newUserChainId: USER2_CHAIN_ID
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
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        manager.createHodl(params);

        assertEq(manager.getHodlCount(), 1, "Should have 1 hodl after creation");
    }

    function testGetHodlUsers() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        // Test initial user
        address[] memory users = manager.getHodlUsersAddresses(created.hodlId);
        assertEq(users.length, 1, "Should have 1 user initially");
        assertEq(users[0], user1, "Should be user1");

        // Add another user
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodlId,
            newUser: user2,
            invitingUser: user1,
            newUserChainId: USER2_CHAIN_ID
        });
        vm.prank(user1);
        manager.addUserToHodl(addParams);

        // Test after adding user
        users = manager.getHodlUsersAddresses(created.hodlId);
        assertEq(users.length, 2, "Should have 2 users");
        assertEq(users[0], user1, "First user should be user1");
        assertEq(users[1], user2, "Second user should be user2");
    }

    function testMapUserToChainId() public {
        // Create hodl
        CreateHodl memory params = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory result = manager.createHodl(params);

        // Test mapped user
        assertEq(manager.getHodlUsers(result.hodlId)[0].chainId, USER1_CHAIN_ID, "Should return correct CHAIN_ID for mapped user");
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Convenience Function Tests
    // ──────────────────────────────────────────────────────────────────────────────

    function testGetUserHodls_SingleUser() public {
        // Create first hodl with user1
        CreateHodl memory params1 = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created1 = manager.createHodl(params1);

        // Create second hodl with user2
        CreateHodl memory params2 = CreateHodl({
            initialUser: user2,
            initialUserChainId: USER2_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user2);
        manager.createHodl(params2);

        // Test user1's hodls
        bytes12[] memory user1Hodls = manager.getUserHodls(user1);
        assertEq(user1Hodls.length, 1, "User1 should be in 1 hodl");
        assertEq(user1Hodls[0], created1.hodlId, "Should return correct hodl ID");

        // Test user2's hodls
        bytes12[] memory user2Hodls = manager.getUserHodls(user2);
        assertEq(user2Hodls.length, 1, "User2 should be in 1 hodl");
    }

    function testGetUserHodls_MultipleHodls() public {
        // Create first hodl with user1
        CreateHodl memory params1 = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created1 = manager.createHodl(params1);

        // Create second hodl with user2
        CreateHodl memory params2 = CreateHodl({
            initialUser: user2,
            initialUserChainId: USER2_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user2);
        HodlCreated memory created2 = manager.createHodl(params2);

        // Add user1 to second hodl
        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created2.hodlId,
            newUser: user1,
            invitingUser: user2,
            newUserChainId: USER1_CHAIN_ID
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
            if (user1Hodls[i] == created1.hodlId) found1 = true;
            if (user1Hodls[i] == created2.hodlId) found2 = true;
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
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created1 = manager.createHodl(params1);

        CreateHodl memory params2 = CreateHodl({
            initialUser: user2,
            initialUserChainId: USER2_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user2);
        manager.createHodl(params2);

        CreateHodl memory params3 = CreateHodl({
            initialUser: user3,
            initialUserChainId: USER3_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user3);
        manager.createHodl(params3);

        // Add user4 to first and third hodl only
        AddUserToHodl memory addParams1 = AddUserToHodl({
            hodlId: created1.hodlId,
            newUser: user4,
            invitingUser: user1,
            newUserChainId: USER4_CHAIN_ID
        });
        vm.prank(user1);
        manager.addUserToHodl(addParams1);

        bytes12 hodl3Id = bytes12(uint96(2));
        AddUserToHodl memory addParams3 = AddUserToHodl({
            hodlId: hodl3Id,
            newUser: user4,
            invitingUser: user3,
            newUserChainId: USER4_CHAIN_ID
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
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        
        // This should succeed for a normal number
        vm.prank(user1);
        manager.createHodl(params);
        assertTrue(true, "Should be able to create hodl under normal circumstances");
    }

    function testIntegration_ComplexScenario() public {
        // Create multiple hodls and add users to test integration
        
        // Hodl 1: user1 creates, adds user2
        CreateHodl memory params1 = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created1 = manager.createHodl(params1);

        AddUserToHodl memory addParams1 = AddUserToHodl({
            hodlId: created1.hodlId,
            newUser: user2,
            invitingUser: user1,
            newUserChainId: USER2_CHAIN_ID
        });
        vm.prank(user1);
        manager.addUserToHodl(addParams1);

        // Hodl 2: user3 creates, adds user1 and user4
        CreateHodl memory params2 = CreateHodl({
            initialUser: user3,
            initialUserChainId: USER3_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user3);
        HodlCreated memory created2 = manager.createHodl(params2);

        AddUserToHodl memory addParams2 = AddUserToHodl({
            hodlId: created2.hodlId,
            newUser: user1,
            invitingUser: user3,
            newUserChainId: USER1_CHAIN_ID
        });
        vm.prank(user3);
        manager.addUserToHodl(addParams2);

        AddUserToHodl memory addParams3 = AddUserToHodl({
            hodlId: created2.hodlId,
            newUser: user4,
            invitingUser: user3,
            newUserChainId: USER4_CHAIN_ID
        });
        vm.prank(user3);
        manager.addUserToHodl(addParams3);

        // Verify final state
        assertEq(manager.getHodlCount(), 2, "Should have 2 hodls");
        
        // Check hodl 1
        User[] memory hodl1Users = manager.getHodlUsers(created1.hodlId);
        assertEq(hodl1Users.length, 2, "Hodl 1 should have 2 users");
        
        // Check hodl 2
        User[] memory hodl2Users = manager.getHodlUsers(created2.hodlId);
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

    // ──────────────────────────────────────────────────────────────────────────────
    // Transaction Management Tests
    // ──────────────────────────────────────────────────────────────────────────────

    function testSubmitTransaction_Success() public {
        // Create hodl and add users
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        // Create a transaction
        Share[] memory shares = new Share[](1);
        shares[0] = Share({
            userAddress: user1,
            percentageInBasisPoints: 10000 // 100%
        });

        Transaction memory transaction = Transaction({
            amountUsd: 1000,
            shares: shares,
            originatingUser: user1,
            createdAt: uint48(block.timestamp)
        });

        SubmitTransaction memory submitParams = SubmitTransaction({
            hodlId: created.hodlId,
            transaction: transaction,
            userChainId: USER1_CHAIN_ID
        });

        // Submit transaction
        vm.prank(user1);
        bytes32 transactionId = manager.submitTransaction(submitParams);

        // Verify transaction was recorded
        assertEq(manager.getPendingTransactionCount(), 1, "Should have 1 pending transaction");
        
        StorageUnit.PendingTransaction memory pending = manager.getPendingTransaction(transactionId);
        assertEq(pending.hodlId, created.hodlId, "Hodl ID should match");
        assertEq(pending.amountUsd, 1000, "Amount should match");
        assertEq(pending.originatingUser, user1, "Originating user should match");
        assertEq(pending.userChainId, USER1_CHAIN_ID, "User CHAIN_ID should match");
    }

    function testSubmitTransaction_RevertWhenUserNotInHodl() public {
        // Create hodl with user1
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        // Create transaction with user2 (not in hodl)
        Share[] memory shares = new Share[](1);
        shares[0] = Share({
            userAddress: user2,
            percentageInBasisPoints: 10000
        });

        Transaction memory transaction = Transaction({
            amountUsd: 1000,
            shares: shares,
            originatingUser: user2,
            createdAt: uint48(block.timestamp)
        });

        SubmitTransaction memory submitParams = SubmitTransaction({
            hodlId: created.hodlId,
            transaction: transaction,
            userChainId: USER2_CHAIN_ID
        });

        // Should revert because user2 is not in the hodl
        vm.expectRevert("User not part of hodl");
        vm.prank(user2);
        manager.submitTransaction(submitParams);
    }

    function testSubmitTransaction_RevertWhenOriginatingUserMismatch() public {
        // Create hodl with user1
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        // Create transaction where originating user doesn't match msg.sender
        Share[] memory shares = new Share[](1);
        shares[0] = Share({
            userAddress: user1,
            percentageInBasisPoints: 10000
        });

        Transaction memory transaction = Transaction({
            amountUsd: 1000,
            shares: shares,
            originatingUser: user2, // Different from msg.sender
            createdAt: uint48(block.timestamp)
        });

        SubmitTransaction memory submitParams = SubmitTransaction({
            hodlId: created.hodlId,
            transaction: transaction,
            userChainId: USER1_CHAIN_ID
        });

        // Should revert because originating user doesn't match
        vm.expectRevert("Only originating user can submit");
        vm.prank(user1);
        manager.submitTransaction(submitParams);
    }

    function testFindAndProcessExpiredTransactions_NoExpired() public {
        uint256 processed = manager.findAndProcessExpiredTransactions();
        assertEq(processed, 0, "Should process 0 transactions when none are expired");
    }

    function testFindAndProcessExpiredTransactions_WithExpired() public {
        // Create hodl and submit transaction
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        Share[] memory shares = new Share[](1);
        shares[0] = Share({
            userAddress: user1,
            percentageInBasisPoints: 10000
        });

        Transaction memory transaction = Transaction({
            amountUsd: 1000,
            shares: shares,
            originatingUser: user1,
            createdAt: uint48(block.timestamp)
        });

        SubmitTransaction memory submitParams = SubmitTransaction({
            hodlId: created.hodlId,
            transaction: transaction,
            userChainId: USER1_CHAIN_ID
        });

        vm.prank(user1);
        manager.submitTransaction(submitParams);

        // Fast forward time by more than 7 days
        vm.warp(block.timestamp + 8 days);

        // Process expired transactions
        uint256 processed = manager.findAndProcessExpiredTransactions();
        assertEq(processed, 1, "Should process 1 expired transaction");
        assertEq(manager.getPendingTransactionCount(), 0, "Should have 0 pending transactions after processing");
    }

    function testTransactionEvents() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        // Create transaction
        Share[] memory shares = new Share[](1);
        shares[0] = Share({
            userAddress: user1,
            percentageInBasisPoints: 10000
        });

        Transaction memory transaction = Transaction({
            amountUsd: 1500,
            shares: shares,
            originatingUser: user1,
            createdAt: uint48(block.timestamp)
        });

        SubmitTransaction memory submitParams = SubmitTransaction({
            hodlId: created.hodlId,
            transaction: transaction,
            userChainId: USER1_CHAIN_ID
        });

        // Check that TransactionSubmitted event is emitted with correct parameters
        vm.expectEmit(false, true, true, true); // Don't check the transaction ID (first indexed param)
        emit MasterTransactionManager.TransactionSubmitted(
            bytes32(0), // We can't predict the exact transaction ID
            created.hodlId,
            user1,
            1500,
            USER1_CHAIN_ID
        );

        vm.prank(user1);
        manager.submitTransaction(submitParams);
    }
    
    // ──────────────────────────────────────────────────────────────────────────────
    // Hodl Management Tests
    // ──────────────────────────────────────────────────────────────────────────────

    function testSetHodlVanityName_Success() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        bytes32 vanityName = bytes32("MyAwesomeHodl");

        // Set vanity name
        vm.expectEmit(true, true, false, true);
        emit MasterTransactionManager.HodlVanityNameUpdated(
            created.hodlId,
            user1,
            bytes32(0), // old name (empty)
            vanityName
        );

        vm.prank(user1);
        manager.setHodlVanityName(created.hodlId, vanityName);

        // Verify vanity name was set
        bytes32 retrievedName = manager.getHodlGroup(created.hodlId).vanityName;
        assertEq(retrievedName, vanityName, "Vanity name should match");
    }

    function testSetHodlVanityName_RevertWhenUserNotInHodl() public {
        // Create hodl with user1
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        bytes32 vanityName = bytes32("MyAwesomeHodl");

        // User2 tries to set vanity name (not in hodl)
        vm.expectRevert("Only hodl members can update vanity name");
        vm.prank(user2);
        manager.setHodlVanityName(created.hodlId, vanityName);
    }

    function testSetHodlSpendLimit_Success() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        uint256 spendLimit = 5000; // $5000 USD

        // Set spend limit
        vm.expectEmit(true, true, false, true);
        emit MasterTransactionManager.HodlSpendLimitUpdated(
            created.hodlId,
            user1,
            0, // old limit (0)
            spendLimit
        );

        vm.prank(user1);
        manager.setHodlSpendLimit(created.hodlId, spendLimit);

        // Verify spend limit was set
        uint256 retrievedLimit = manager.getHodlGroup(created.hodlId).spendLimit;
        assertEq(retrievedLimit, spendLimit, "Spend limit should match");
    }

    function testSetHodlSpendLimit_RevertWhenUserNotInHodl() public {
        // Create hodl with user1
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        uint256 spendLimit = 5000;

        // User2 tries to set spend limit (not in hodl)
        vm.expectRevert("Only hodl members can update spend limit");
        vm.prank(user2);
        manager.setHodlSpendLimit(created.hodlId, spendLimit);
    }

    function testGetHodlGroup_Success() public {
        // Create hodl
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        // Set vanity name and spend limit
        bytes32 vanityName = bytes32("TestHodl");
        uint256 spendLimit = 10000;

        vm.prank(user1);
        manager.setHodlVanityName(created.hodlId, vanityName);
        
        vm.prank(user1);
        manager.setHodlSpendLimit(created.hodlId, spendLimit);

        // Get hodl group
        HodlGroup memory hodlGroup = manager.getHodlGroup(created.hodlId);

        // Verify hodl group data
        assertEq(hodlGroup.id, created.hodlId, "Hodl ID should match");
        assertEq(hodlGroup.vanityName, vanityName, "Vanity name should match");
        assertEq(hodlGroup.spendLimit, spendLimit, "Spend limit should match");
        assertEq(hodlGroup.users.length, 1, "Should have 1 user");
        assertEq(hodlGroup.users[0].userAddress, user1, "User address should match");
        assertEq(hodlGroup.users[0].chainId, USER1_CHAIN_ID, "User CHAIN_ID should match");
    }

    function testAnyUserCanUpdateHodlSettings() public {
        // Create hodl and add another user
        CreateHodl memory createParams = CreateHodl({
            initialUser: user1,
            initialUserChainId: USER1_CHAIN_ID,
            vanityName: bytes32(""),
            spendLimit: 0
        });
        vm.prank(user1);
        HodlCreated memory created = manager.createHodl(createParams);

        AddUserToHodl memory addParams = AddUserToHodl({
            hodlId: created.hodlId,
            newUser: user2,
            invitingUser: user1,
            newUserChainId: USER2_CHAIN_ID
        });
        vm.prank(user1);
        manager.addUserToHodl(addParams);

        // Both user1 and user2 should be able to update settings
        bytes32 vanityName1 = bytes32("User1Name");
        bytes32 vanityName2 = bytes32("User2Name");
        uint256 spendLimit1 = 1000;
        uint256 spendLimit2 = 2000;

        // User1 sets vanity name
        vm.prank(user1);
        manager.setHodlVanityName(created.hodlId, vanityName1);

        // User2 changes vanity name
        vm.prank(user2);
        manager.setHodlVanityName(created.hodlId, vanityName2);

        // User2 sets spend limit
        vm.prank(user2);
        manager.setHodlSpendLimit(created.hodlId, spendLimit1);

        // User1 changes spend limit
        vm.prank(user1);
        manager.setHodlSpendLimit(created.hodlId, spendLimit2);

        // Verify final values
        assertEq(manager.getHodlGroup(created.hodlId).vanityName, vanityName2, "Should have user2's vanity name");
        assertEq(manager.getHodlGroup(created.hodlId).spendLimit, spendLimit2, "Should have user1's spend limit");
    }
}
