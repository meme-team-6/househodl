// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Transaction, TransactionInstruction, User} from "./Common.sol";
import {StorageUnit} from "./StorageUnit.sol";

library TransactionProcessor {
    uint48 constant PROCESSING_THRESHOLD = 7 days;

    struct ProcessingResult {
        bytes32[] processedTransactionIds;
        TransactionInstruction[] instructions;
    }

    function findExpiredTransactions(
        StorageUnit storageUnit
    ) internal view returns (bytes32[] memory expiredIds) {
        uint256 totalTransactions = storageUnit.getPendingTransactionCount();
        bytes32[] memory tempExpired = new bytes32[](totalTransactions);
        uint256 expiredCount = 0;

        for (uint256 i = 0; i < totalTransactions; i++) {
            StorageUnit.PendingTransaction memory pending = storageUnit.getPendingTransactionByIndex(i);
            if (block.timestamp >= pending.transaction.createdAt + PROCESSING_THRESHOLD) {
                tempExpired[expiredCount] = pending.id;
                expiredCount++;
            }
        }

        expiredIds = new bytes32[](expiredCount);
        for (uint256 i = 0; i < expiredCount; i++) {
            expiredIds[i] = tempExpired[i];
        }
    }

    function findApprovedTransactions(
        StorageUnit storageUnit
    ) internal view returns (bytes32[] memory approvedIds) {
        uint256 totalTransactions = storageUnit.getPendingTransactionCount();
        bytes32[] memory tempApproved = new bytes32[](totalTransactions);
        uint256 approvedCount = 0;

        for (uint256 i = 0; i < totalTransactions; i++) {
            StorageUnit.PendingTransaction memory pending = storageUnit.getPendingTransactionByIndex(i);
            
            // Get hodl users to calculate majority
            address[] memory hodlUserAddresses = storageUnit.getHodlUserAddresses(pending.hodlId);
            uint256 majorityThreshold = (hodlUserAddresses.length / 2) + 1;
            
            // Check if transaction has majority approval
            if (pending.transaction.approvalVotes.length >= majorityThreshold) {
                tempApproved[approvedCount] = pending.id;
                approvedCount++;
            }
        }

        approvedIds = new bytes32[](approvedCount);
        for (uint256 i = 0; i < approvedCount; i++) {
            approvedIds[i] = tempApproved[i];
        }
    }

    function processExpiredTransactions(
        StorageUnit storageUnit,
        bytes32[] memory transactionIds
    ) internal view returns (TransactionInstruction[] memory instructions) {
        // Stub for the real one
    }

    function calculateTransactionSplits(
        Transaction memory transaction,
        address[] memory hodlUsers
    ) internal pure returns (TransactionInstruction[] memory instructions) {
        instructions = new TransactionInstruction[](hodlUsers.length);

        // pretty sure this math is right
        
        for (uint256 i = 0; i < hodlUsers.length; i++) {
            instructions[i] = TransactionInstruction({
                hodlId: bytes12(0),
                to: hodlUsers[i],
                from: transaction.originatingUser,
                destChainId: 0,
                amountUsd: (transaction.amountUsd * transaction.shares[i].percentageInBasisPoints) / 10000
            });
        }
    }
}
