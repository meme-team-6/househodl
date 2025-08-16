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
