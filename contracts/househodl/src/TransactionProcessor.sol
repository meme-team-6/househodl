// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Transaction, User, Proportion, Share} from "./Common.sol";
import {ReconcileTransaction} from "./Messages.sol";
import {StorageUnit} from "./StorageUnit.sol";

library TransactionProcessor {
    uint48 constant PROCESSING_THRESHOLD = 7 days;

    struct ProcessingResult {
        bytes32[] processedTransactionIds;
        // TransactionInstruction[] instructions;
    }

    function findExpiredTransactions(
        StorageUnit storageUnit
    ) internal view returns (bytes32[] memory expiredIds) {
        uint256 totalTransactions = storageUnit.getPendingTransactionCount();
        bytes32[] memory tempExpired = new bytes32[](totalTransactions);
        uint256 expiredCount = 0;

        for (uint256 i = 0; i < totalTransactions; i++) {
            StorageUnit.PendingTransaction memory pending = storageUnit.getPendingTransactionByIndex(i);

            bool isExpired = block.timestamp >= pending.transaction.createdAt + PROCESSING_THRESHOLD;
            bool isApproved = pending.transaction.approvalVotes.length >=
                (storageUnit.getHodlUserAddresses(pending.hodlId).length / 2) + 1;
            if (isApproved && isExpired) {
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
    ) internal view {
        // Stub for the real one
    }

    function calculateTransactionSplits(
        bytes12 hodlId,
        Transaction memory transaction,
        address[] memory hodlUsers
    ) internal pure returns (ReconcileTransaction memory finalInstruction) {
        Proportion[] memory proportions = new Proportion[](hodlUsers.length);

        // Find total shares
        uint256 totalBasisPoints = 0;
        for (uint256 i = 0; i < transaction.shares.length; i++) {
            totalBasisPoints += transaction.shares[i].percentageInBasisPoints;
        }

        // For each hodl user, find their corresponding share
        for (uint256 i = 0; i < hodlUsers.length; i++) {
            int256 userProportion = 0;
            
            // Find the user's share in the transaction shares array
            for (uint256 j = 0; j < transaction.shares.length; j++) {
                if (transaction.shares[j].userAddress == hodlUsers[i]) {
                    userProportion = int256((transaction.shares[j].percentageInBasisPoints * 1e8) / totalBasisPoints);
                    break;
                }
            }
            
            proportions[i] = Proportion({
                user: hodlUsers[i],
                proportion: userProportion
            });
        }

        return ReconcileTransaction({
            hodlId: hodlId,
            proportion: proportions,
            totalUsdcAmount: transaction.amountUsd
        });
    }
}
