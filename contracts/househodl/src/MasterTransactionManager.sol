// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { CreateHodl, HodlCreated, AddUserToHodl, SubmitTransaction } from "./Messages.sol";
import { StorageUnit } from "./StorageUnit.sol";
import { Transaction, TransactionInstruction, User, HodlGroup } from "./Common.sol";
import { TransactionProcessor } from "./TransactionProcessor.sol";

contract MasterTransactionManager is OApp {
    StorageUnit public storageUnit;
    
    uint16 internal constant SEND = 1;
    
    error InvalidStorageUnit();

    event TransactionSubmitted(
        bytes32 indexed transactionId,
        bytes12 indexed hodlId,
        address indexed submittingUser,
        uint256 amountUsd,
        uint32 userEid
    );

    event TransactionsProcessed(
        bytes32[] transactionIds,
        uint256 processedCount
    );

    event HodlVanityNameUpdated(
        bytes12 indexed hodlId,
        address indexed updatedBy,
        bytes32 oldName,
        bytes32 newName
    );

    event HodlSpendLimitUpdated(
        bytes12 indexed hodlId,
        address indexed updatedBy,
        uint256 oldLimit,
        uint256 newLimit
    );

    struct UserWithEid {
        address user;
        uint32 eid;
    }

    struct HodlInfo {
        bytes12 id;
        UserWithEid[] users;
    }

    constructor(address _endpoint, address _owner, address _storageUnit)
        OApp(_endpoint, _owner)
    {
        if (_storageUnit == address(0)) revert InvalidStorageUnit();
        storageUnit = StorageUnit(_storageUnit);
    }

    function createHodl(CreateHodl memory params) public returns (HodlCreated memory) {
        uint256 hodlCount = storageUnit.getHodlCount();
        require(hodlCount < (2**12 - 1), "Hodl pool full"); // Ensure we don't overflow the bytes12 ID
        require(params.initialUser != address(0), "Initial user cannot be zero address");
        require(params.initialUser == msg.sender, "Initial user must be the sender");

        bytes12 newHodlId = bytes12(uint96(hodlCount));

        storageUnit.createHodl(newHodlId, params.initialUser, params.initialUserEid);

        return HodlCreated({
            hodlId: newHodlId
        });
    }

    function addUserToHodl(AddUserToHodl memory params) public {
        // Only the first user can add new users
        User[] memory users = storageUnit.getHodlUsers(params.hodlId);
        require(users.length > 0, "Hodl does not exist");
        require(users[0].userAddress == msg.sender, "Only the first user can add new users");
        require(params.newUser != address(0), "New user cannot be zero address");
        require(params.invitingUser != address(0), "Inviting user cannot be zero address");

        // Add the new user to the hodl
        storageUnit.addUserToHodl(params.hodlId, params.newUser, params.newUserEid);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Transaction Management Functions
    // ──────────────────────────────────────────────────────────────────────────────

    function submitTransaction(SubmitTransaction memory params) external returns (bytes32) {
        require(params.transaction.originatingUser == msg.sender, "Only originating user can submit");
        
        User[] memory hodlUsers = storageUnit.getHodlUsers(params.hodlId);
        require(hodlUsers.length > 0, "Hodl does not exist");
        
        bool userInHodl = false;
        for (uint256 i = 0; i < hodlUsers.length; i++) {
            if (hodlUsers[i].userAddress == msg.sender) {
                userInHodl = true;
                break;
            }
        }
        require(userInHodl, "User not part of hodl");

        bytes32 transactionId = keccak256(
            abi.encodePacked(
                params.hodlId,
                msg.sender,
                params.transaction.amountUsd,
                block.timestamp,
                block.number
            )
        );

        storageUnit.addPendingTransaction(
            transactionId,
            params.hodlId,
            params.transaction,
            msg.sender,
            params.userEid
        );

        emit TransactionSubmitted(
            transactionId,
            params.hodlId,
            msg.sender,
            params.transaction.amountUsd,
            params.userEid
        );

        return transactionId;
    }

    function findAndProcessExpiredTransactions() external returns (uint256 processedCount) {
        bytes32[] memory expiredIds = TransactionProcessor.findExpiredTransactions(storageUnit);
        
        if (expiredIds.length == 0) {
            return 0;
        }

        // Process expired transactions (stub implementation for now)
        // In a full implementation, this would create TransactionInstructions
        // and send them to other chains for processing

        for (uint256 i = 0; i < expiredIds.length; i++) {
            storageUnit.removePendingTransaction(expiredIds[i]);
        }

        emit TransactionsProcessed(expiredIds, expiredIds.length);
        
        return expiredIds.length;
    }

    function getPendingTransactionCount() external view returns (uint256) {
        return storageUnit.getPendingTransactionCount();
    }

    function getPendingTransaction(bytes32 transactionId) external view returns (StorageUnit.PendingTransaction memory) {
        return storageUnit.getPendingTransaction(transactionId);
    }

    function listPendingTransactions(bytes12 hodlId) external view returns (StorageUnit.PendingTransaction[] memory) {
        uint256 count = storageUnit.getPendingTransactionCount();
        StorageUnit.PendingTransaction[] memory transactions = new StorageUnit.PendingTransaction[](count);
        
        for (uint256 i = 0; i < count; i++) {
            StorageUnit.PendingTransaction memory pending = storageUnit.getPendingTransactionByIndex(i);
            if (pending.hodlId == hodlId) {
                transactions[i] = pending;
            }
        }
        
        return transactions;
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Hodl Management Functions
    // ──────────────────────────────────────────────────────────────────────────────

    function setHodlVanityName(bytes12 hodlId, bytes32 vanityName) external {
        User[] memory hodlUsers = storageUnit.getHodlUsers(hodlId);
        require(hodlUsers.length > 0, "Hodl does not exist");
        
        bool userInHodl = false;
        for (uint256 i = 0; i < hodlUsers.length; i++) {
            if (hodlUsers[i].userAddress == msg.sender) {
                userInHodl = true;
                break;
            }
        }
        require(userInHodl, "Only hodl members can update vanity name");

        bytes32 oldName = storageUnit.getHodlVanityName(hodlId);
        storageUnit.setHodlVanityName(hodlId, vanityName);

        emit HodlVanityNameUpdated(hodlId, msg.sender, oldName, vanityName);
    }

    function setHodlSpendLimit(bytes12 hodlId, uint256 spendLimit) external {
        User[] memory hodlUsers = storageUnit.getHodlUsers(hodlId);
        require(hodlUsers.length > 0, "Hodl does not exist");
        
        bool userInHodl = false;
        for (uint256 i = 0; i < hodlUsers.length; i++) {
            if (hodlUsers[i].userAddress == msg.sender) {
                userInHodl = true;
                break;
            }
        }
        require(userInHodl, "Only hodl members can update spend limit");

        uint256 oldLimit = storageUnit.getHodlSpendLimit(hodlId);
        storageUnit.setHodlSpendLimit(hodlId, spendLimit);

        emit HodlSpendLimitUpdated(hodlId, msg.sender, oldLimit, spendLimit);
    }

    function getHodlGroup(bytes12 hodlId) external view returns (HodlGroup memory) {
        return storageUnit.getHodlGroup(hodlId);
    }


    // ──────────────────────────────────────────────────────────────────────────────
    // Public read functions - exposing StorageUnit functions
    // ──────────────────────────────────────────────────────────────────────────────

    function getHodlCount() external view returns (uint256) {
        return storageUnit.getHodlCount();
    }

    function getHodlUsers(bytes12 hodlId) external view returns (User[] memory) {
        return storageUnit.getHodlUsers(hodlId);
    }

    function getHodlUsersAddresses(bytes12 hodlId) external view returns (address[] memory) {
        return storageUnit.getHodlUserAddresses(hodlId);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Convenience functions for reading data
    // ──────────────────────────────────────────────────────────────────────────────

    function getUserHodls(address user) external view returns (bytes12[] memory) {
        uint256 hodlCount = storageUnit.getHodlCount();
        bytes12[] memory tempHodls = new bytes12[](hodlCount);
        uint256 userHodlCount = 0;
        
        for (uint256 i = 0; i < hodlCount; i++) {
            bytes12 hodlId = bytes12(uint96(i));
            User[] memory users = storageUnit.getHodlUsers(hodlId);
            
            for (uint256 j = 0; j < users.length; j++) {
                if (users[j].userAddress == user) {
                    tempHodls[userHodlCount] = hodlId;
                    userHodlCount++;
                    break;
                }
            }
        }
        
        bytes12[] memory userHodls = new bytes12[](userHodlCount);
        for (uint256 i = 0; i < userHodlCount; i++) {
            userHodls[i] = tempHodls[i];
        }
        
        return userHodls;
    }


    // ──────────────────────────────────────────────────────────────────────────────
    // 0. (Optional) Quote business logic
    //
    // Example: Get a quote from the Endpoint for a cost estimate of sending a message.
    // Replace this to mirror your own send business logic.
    // ──────────────────────────────────────────────────────────────────────────────

    /**
     * @notice Quotes the gas needed to pay for the full omnichain transaction in native gas or ZRO token.
     * @param _dstEid Destination chain's endpoint ID.
     * @param _string The string to send.
     * @param _options Message execution options (e.g., for sending gas to destination).
     * @param _payInLzToken Whether to return fee in ZRO token.
     * @return fee A `MessagingFee` struct containing the calculated gas fee in either the native token or ZRO token.
     */
    function quoteSendString(
        uint32 _dstEid,
        string calldata _string,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory _message = abi.encode(_string);
        // combineOptions (from OAppOptionsType3) merges enforced options set by the contract owner
        // with any additional execution options provided by the caller
        fee = _quote(
            _dstEid,
            _message,
            _options,
            _payInLzToken
        );
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 1. Send business logic
    //
    // Example: send a simple string to a remote chain. Replace this with your
    // own state-update logic, then encode whatever data your application needs.
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Send a string to a remote OApp on another chain
    /// @param _dstEid   Destination Endpoint ID (uint32)
    /// @param _string  The string to send
    /// @param _options  Execution options for gas on the destination (bytes)
    function sendString(
        uint32 _dstEid,
        string calldata _string,
        bytes calldata _options
    ) external payable {
        // 1. (Optional) Update any local state here.
        //    e.g., record that a message was "sent":
        //    sentCount += 1;

        // 2. Encode any data structures you wish to send into bytes
        //    You can use abi.encode, abi.encodePacked, or directly splice bytes
        //    if you know the format of your data structures
        bytes memory _message = abi.encode(_string);

        // 3. Call OAppSender._lzSend to package and dispatch the cross-chain message
        //    - _dstEid:   remote chain's Endpoint ID
        //    - _message:  ABI-encoded string
        //    - _options:  combined execution options (enforced + caller-provided)
        //    - MessagingFee(msg.value, 0): pay all gas as native token; no ZRO
        //    - payable(msg.sender): refund excess gas to caller
        //
        //    combineOptions (from OAppOptionsType3) merges enforced options set by the contract owner
        //    with any additional execution options provided by the caller
        _lzSend(
            _dstEid,
            _message,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 2. Receive business logic
    //
    // Override _lzReceive to decode the incoming bytes and apply your logic.
    // The base OAppReceiver.lzReceive ensures:
    //   • Only the LayerZero Endpoint can call this method
    //   • The sender is a registered peer (peers[srcEid] == origin.sender)
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Invoked by OAppReceiver when EndpointV2.lzReceive is called
    /// @dev   _origin    Metadata (source chain, sender address, nonce)
    /// @dev   _guid      Global unique ID for tracking this message
    /// @param _message   ABI-encoded bytes (the string we sent earlier)
    /// @dev   _executor  Executor address that delivered the message
    /// @dev   _extraData Additional data from the Executor (unused here)
    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // Decode the incoming bytes into a string
        abi.decode(_message, (string));
        // Custom logic would go here
    }
}
