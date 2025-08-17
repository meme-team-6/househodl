// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { CreateHodl, HodlCreated, AddUserToHodl, SubmitTransaction, ReconcileTransaction, MessageEncoder } from "./Messages.sol";
import { StorageUnit } from "./StorageUnit.sol";
import { Transaction, User, HodlGroup, Set, Proportion } from "./Common.sol";
import { TransactionProcessor } from "./TransactionProcessor.sol";

contract MasterTransactionManager is OApp {
    StorageUnit public storageUnit;
    uint16 internal constant SEND = 1;
    /** A mapping of the chainId to the endpoint ID */
    mapping(uint => uint32) public contractEid;
    
    
    
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

    event TransactionVoteSubmitted(
        bytes32 indexed transactionId,
        address indexed voter,
        bool isApproval
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
        uint32 chainId;
    }


    struct ContractAddresses {
        address contractAddress;
        uint chainId;
        uint32 eid;
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

        storageUnit.createHodl(newHodlId, params.initialUser, params.initialUserChainId, params.vanityName, params.spendLimit);

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

        for (uint256 i = 0; i < users.length; i++) {
            if (users[i].userAddress == params.newUser) {
                revert("User already in hodl");
            }
        }

        // Add the new user to the hodl
        storageUnit.addUserToHodl(params.hodlId, params.newUser, params.newUserChainId);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Transaction Management Functions
    // ──────────────────────────────────────────────────────────────────────────────

    function submitTransaction(SubmitTransaction memory params) external returns (bytes32) {
        
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
                params.amountUsd,
                block.timestamp,
                block.number
            )
        );

        Transaction memory transaction = Transaction({
            originatingUser: msg.sender,
            amountUsd: params.amountUsd,
            shares: params.shares,
            vanityName: params.vanityName,
            createdAt: uint48(block.timestamp),
            approvalVotes: new address[](0),
            disapprovalVotes: new address[](0)
        });

        storageUnit.addPendingTransaction(
            transactionId,
            params.hodlId,
            transaction
        );

        emit TransactionSubmitted(
            transactionId,
            params.hodlId,
            msg.sender,
            params.amountUsd,
            params.userChainId
        );

        ReconcileTransaction memory reconciliation = TransactionProcessor.calculateTransactionSplits({
            hodlId: params.hodlId,
            transaction: transaction,
            hodlUsers: storageUnit.getHodlUserAddresses(params.hodlId)
        });

        // Apply to internal state - update each user's debt based on their proportion
        for (uint256 i = 0; i < reconciliation.proportion.length; i++) {
            Proportion memory userProportion = reconciliation.proportion[i];
            // Calculate debt amount: (proportion / 1e8) * totalUsdcAmount
            int256 debtAmount = (userProportion.proportion * int256(reconciliation.totalUsdcAmount)) / 1e8;
            storageUnit.updateUserDebt(params.hodlId, userProportion.user, debtAmount);
        }


        uint[] memory connectedChains = listConnectedChainIds(hodlUsers);

        for (uint i = 0; i < connectedChains.length; i++) {
            uint32 chainId = uint32(connectedChains[i]);
            if (chainId != params.userChainId && contractEid[chainId] != 0) {
                sendReconcileTransaction(
                    contractEid[chainId],
                    reconciliation,
                    bytes("")
                );
            }
        }

        return transactionId;
    }

    function voteOnTransaction(bytes32 transactionId, bool approve) external returns (
        address[] memory approvalVotes,
        address[] memory disapprovalVotes,
        bool hasVoted,
        bool isApproval
    ) {
        StorageUnit.PendingTransaction memory pendingTx = storageUnit.getPendingTransaction(transactionId);
        
        User[] memory hodlUsers = storageUnit.getHodlUsers(pendingTx.hodlId);
        require(hodlUsers.length > 0, "Hodl does not exist");
        
        bool userInHodl = false;
        for (uint256 i = 0; i < hodlUsers.length; i++) {
            if (hodlUsers[i].userAddress == msg.sender) {
                userInHodl = true;
                break;
            }
        }
        require(userInHodl, "User not part of hodl");

        storageUnit.addVoteToTransaction(transactionId, msg.sender, approve);

        emit TransactionVoteSubmitted(transactionId, msg.sender, approve);

        // Get updated voting information
        (approvalVotes, disapprovalVotes) = this.getTransactionVotes(transactionId);
        (hasVoted, isApproval) = this.hasUserVoted(transactionId, msg.sender);
        
        return (approvalVotes, disapprovalVotes, hasVoted, isApproval);
    }

    function findAndProcessApprovedTransactions() external returns (uint256 processedCount) {
        bytes32[] memory approvedIds = TransactionProcessor.findApprovedTransactions(storageUnit);
        
        if (approvedIds.length == 0) {
            return 0;
        }

        for (uint256 i = 0; i < approvedIds.length; i++) {
            storageUnit.removePendingTransaction(approvedIds[i]);
        }

        emit TransactionsProcessed(approvedIds, approvedIds.length);
        
        return approvedIds.length;
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
            StorageUnit.PendingTransaction memory pendingTx = storageUnit.getPendingTransaction(expiredIds[i]);
            // Here you would create instructions based on the pending transaction
            // For now, we just remove them
        }

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
        uint256 totalCount = storageUnit.getPendingTransactionCount();
        StorageUnit.PendingTransaction[] memory transactions = new StorageUnit.PendingTransaction[](totalCount);
        
        uint256 matchingCount = 0;
        for (uint256 i = 0; i < totalCount; i++) {
            StorageUnit.PendingTransaction memory pending = storageUnit.getPendingTransactionByIndex(i);
            if (pending.hodlId == hodlId) {
                transactions[matchingCount] = pending;
                matchingCount++;
            }
        }
        
        // Note: Array may be larger than needed, but avoids extra copy operation
        // Calling code should only read first `matchingCount` elements
        assembly {
            mstore(transactions, matchingCount)
        }
        
        return transactions;
    }

    function getTransactionVotes(bytes32 transactionId) external view returns (
        address[] memory approvalVotes,
        address[] memory disapprovalVotes
    ) {
        StorageUnit.PendingTransaction memory pendingTx = storageUnit.getPendingTransaction(transactionId);
        return (pendingTx.transaction.approvalVotes, pendingTx.transaction.disapprovalVotes);
    }

    function hasUserVoted(bytes32 transactionId, address user) external view returns (bool hasVoted, bool isApproval) {
        StorageUnit.PendingTransaction memory pendingTx = storageUnit.getPendingTransaction(transactionId);
        
        // Check approval votes
        for (uint256 i = 0; i < pendingTx.transaction.approvalVotes.length; i++) {
            if (pendingTx.transaction.approvalVotes[i] == user) {
                return (true, true);
            }
        }
        
        // Check disapproval votes
        for (uint256 i = 0; i < pendingTx.transaction.disapprovalVotes.length; i++) {
            if (pendingTx.transaction.disapprovalVotes[i] == user) {
                return (true, false);
            }
        }
        
        return (false, false);
    }

    function setSatellite(ContractAddresses[] memory _contracts) external onlyOwner {
        for (uint256 i = 0; i < _contracts.length; i++) {
            contractEid[_contracts[i].chainId] = _contracts[i].eid;
            _setPeer(_contracts[i].eid, bytes32(uint256(uint160(_contracts[i].contractAddress))));
        }
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

    // ──────────────────────────────────────────────────────────────────────────────
    // 1. Send business logic
    //
    // Example: send a simple string to a remote chain. Replace this with your
    // own state-update logic, then encode whatever data your application needs.
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Send a string to a remote OApp on another chain
    /// @param _dstEid   Destination Endpoint ID (uint32)
    /// @param _reconsiliation  The reconciliation transaction to send
    /// @param _options  Execution options for gas on the destination (bytes)
    function sendReconcileTransaction(
        uint32 _dstEid,
        ReconcileTransaction memory _reconsiliation,
        bytes memory _options
    ) internal {
        bytes memory _message = MessageEncoder.encodeReconcileTransaction(_reconsiliation);

        MessagingFee memory fee = _quote(
            _dstEid,
            _message,
            _options,
            false
        );

        _lzSend(
            _dstEid,
            _message,
            _options,
            fee,
            payable(address(this))
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

    function listConnectedChainIds(User[] memory userList) private pure returns (uint[] memory) {
        uint[] memory tempChains = new uint[](userList.length);
        uint uniqueCount = 0;
        
        for (uint i = 0; i < userList.length; i++) {
            bool exists = false;
            for (uint j = 0; j < uniqueCount; j++) {
                if (tempChains[j] == userList[i].chainId) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                tempChains[uniqueCount] = userList[i].chainId;
                uniqueCount++;
            }
        }
        
        uint[] memory result = new uint[](uniqueCount);
        for (uint i = 0; i < uniqueCount; i++) {
            result[i] = tempChains[i];
        }
        
        return result;
    }
}
