// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

struct Share {
    address userAddress;
    uint256 percentageInBasisPoints;
}

struct User {
    address userAddress;
    uint32 chainId; // original chain
    int256 trackedBalUsd;
    int256 realDebtUsd;
    int256 heldUsd;
}

struct HodlGroup {
    bytes12 id;
    User[] users;
    bytes32 vanityName;
    uint256 spendLimit;
}

struct Transaction {
    uint256 amountUsd;
    Share[] shares;
    address originatingUser;
    // Unix time (seconds) when this transaction was recorded. Use block.timestamp cast to uint48 for gas efficiency.
    uint48 createdAt;
    bytes32 vanityName;
    address[] approvalVotes;
    address[] disapprovalVotes;
}

struct TransactionInstruction {
    bytes12 hodlId;
    address to;
    address from;
    uint32 destChainId;
    uint256 amountUsd;
}

// TODO: Create enum repersenting all the chains that we work on
