// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

struct Share {
    address userAddress;
    uint256 percentageInBasisPoints;
}

struct Transaction {
    uint256 amountUSD;
    Share[] shares;
    address orignatingUser;
    // Unix time (seconds) when this transaction was recorded. Use block.timestamp cast to uint48 for gas efficiency.
    uint48 createdAt;
}

struct TransactionInstruction {
    bytes12 hodlId;
    address to;
    address from;
    uint32 destChainId;
}

// TODO: Create enum repersenting all the chains that we work on
