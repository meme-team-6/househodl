// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Transaction, TransactionInstruction} from "./Common.sol";
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
            if (block.timestamp >= pending.submittedAt + PROCESSING_THRESHOLD) {
                tempExpired[expiredCount] = pending.id;
                expiredCount++;
            }
        }

        expiredIds = new bytes32[](expiredCount);
        for (uint256 i = 0; i < expiredCount; i++) {
            expiredIds[i] = tempExpired[i];
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
