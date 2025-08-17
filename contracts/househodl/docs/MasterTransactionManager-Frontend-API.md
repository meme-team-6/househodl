# MasterTransactionManager Frontend API Documentation

This document provides a comprehensive guide for frontend developers integrating with the MasterTransactionManager smart contract. The contract manages hodl groups, users, transactions, and cross-chain operations.

## Table of Contents

- [Contract Overview](#contract-overview)
- [Data Structures](#data-structures)
- [Events](#events)
- [Core Functions](#core-functions)
  - [Hodl Management](#hodl-management)
  - [Transaction Management](#transaction-management)
  - [User Management](#user-management)
  - [Query Functions](#query-functions)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)

## Contract Overview

The MasterTransactionManager is the main contract for managing decentralized hodl groups across multiple chains. It handles:

- Creating and managing hodl groups
- Adding users to hodls
- Submitting and processing transactions
- Setting group preferences (vanity names, spend limits)
- Cross-chain messaging via LayerZero

**Contract Address:** `[To be deployed]`  
**Network:** Multi-chain (LayerZero compatible)

## Data Structures

### User
Represents a user in the system with their financial tracking data.

```solidity
struct User {
    address userAddress;    // User's wallet address
    uint32 chainId;            // Original endpoint ID (chain ID)
    uint256 trackedBalUsd; // Tracked balance in USD (6 decimals)
    uint256 realDebtUsd;   // Real debt in USD (6 decimals)
    uint256 heldUsd;       // Held amount in USD (6 decimals)
}
```

### HodlGroup
Complete hodl group information including users and settings.

```solidity
struct HodlGroup {
    bytes12 id;           // Unique hodl identifier
    User[] users;         // Array of users in the hodl
    bytes32 vanityName;   // Human-readable name for the hodl
    uint256 spendLimit;   // Spending limit in USD (6 decimals)
}
```

### Transaction
Transaction details for submissions.

```solidity
struct Transaction {
    uint256 amountUsd;         // Amount in USD (6 decimals)
    Share[] shares;            // How the transaction is split
    address originatingUser;   // Who originated the transaction
    uint48 createdAt;          // Unix timestamp when created
}
```

### Share
How transaction amounts are distributed among users.

```solidity
struct Share {
    address userAddress;              // Recipient address
    uint256 percentageInBasisPoints; // Percentage (10000 = 100%)
}
```

### PendingTransaction
Information about transactions awaiting processing.

```solidity
struct PendingTransaction {
    bytes32 id;                    // Unique transaction ID
    bytes12 hodlId;               // Associated hodl
    uint256 amountUsd;            // Transaction amount
    address originatingUser;      // Who created the transaction
    uint48 transactionCreatedAt;  // When transaction was created
    address submittingUser;       // Who submitted to the chain
    uint32 userChainId;              // Submitter's endpoint ID
    uint48 submittedAt;          // When submitted to chain
}
```

## Events

### TransactionSubmitted
Emitted when a new transaction is submitted.

```solidity
event TransactionSubmitted(
    bytes32 indexed transactionId,
    bytes12 indexed hodlId,
    address indexed submittingUser,
    uint256 amountUsd,
    uint32 userChainId
);
```

### TransactionsProcessed
Emitted when expired transactions are processed.

```solidity
event TransactionsProcessed(
    bytes32[] transactionIds,
    uint256 processedCount
);
```

### HodlVanityNameUpdated
Emitted when a hodl's vanity name changes.

```solidity
event HodlVanityNameUpdated(
    bytes12 indexed hodlId,
    address indexed updatedBy,
    bytes32 oldName,
    bytes32 newName
);
```

### HodlSpendLimitUpdated
Emitted when a hodl's spend limit changes.

```solidity
event HodlSpendLimitUpdated(
    bytes12 indexed hodlId,
    address indexed updatedBy,
    uint256 oldLimit,
    uint256 newLimit
);
```

## Core Functions

### Hodl Management

#### `createHodl(CreateHodl memory params) → HodlCreated`
Creates a new hodl group.

**Parameters:**
- `params.initialUser`: Address of the hodl creator (must be msg.sender)
- `params.initialUserChainId`: Endpoint ID of the creator's chain
- `params.vanityName`: Human-readable name for the hodl (32 bytes)
- `params.spendLimit`: Spending limit in USD

**Returns:** `HodlCreated` struct with the new hodl ID

**Example:**
```javascript
const createParams = {
    initialUser: "0x...", // Your wallet address
    initialUserChainId: 101   // Ethereum mainnet CHAIN_ID
};
const result = await contract.createHodl(createParams);
const hodlId = result.hodlId;
```

#### `addUserToHodl(AddUserToHodl memory params)`
Adds a new user to an existing hodl. Only the hodl creator can add users.

**Parameters:**
- `params.hodlId`: ID of the hodl to add user to
- `params.newUser`: Address of the user to add
- `params.invitingUser`: Address of the inviting user (for validation)
- `params.newUserChainId`: Endpoint ID of the new user's chain

**Example:**
```javascript
const addParams = {
    hodlId: "0x...",
    newUser: "0x...",
    invitingUser: "0x...", // Your address
    newUserChainId: 102
};
await contract.addUserToHodl(addParams);
```

#### `setHodlVanityName(bytes12 hodlId, bytes32 vanityName)`
Sets a human-readable name for the hodl. Any hodl member can call this.

**Parameters:**
- `hodlId`: ID of the hodl
- `vanityName`: 32-byte name (use ethers.utils.formatBytes32String())

**Example:**
```javascript
const hodlId = "0x...";
const vanityName = ethers.utils.formatBytes32String("My Awesome Hodl");
await contract.setHodlVanityName(hodlId, vanityName);
```

#### `setHodlSpendLimit(bytes12 hodlId, uint256 spendLimit)`
Sets the spending limit for the hodl. Any hodl member can call this.

**Parameters:**
- `hodlId`: ID of the hodl
- `spendLimit`: Limit in USD with 6 decimals (1000000 = $1.00)

**Example:**
```javascript
const hodlId = "0x...";
const spendLimit = ethers.utils.parseUnits("5000", 6); // $5000
await contract.setHodlSpendLimit(hodlId, spendLimit);
```

### Transaction Management

#### `submitTransaction(SubmitTransaction memory params) → bytes32`
Submits a new transaction to the hodl. Returns the transaction ID.

**Parameters:**
- `params.hodlId`: ID of the hodl
- `params.transaction`: Transaction details
- `params.userChainId`: Submitter's endpoint ID

**Returns:** Transaction ID (bytes32)

**Example:**
```javascript
const shares = [
    {
        userAddress: "0x...",
        percentageInBasisPoints: 5000 // 50%
    },
    {
        userAddress: "0x...",
        percentageInBasisPoints: 5000 // 50%
    }
];

const transaction = {
    amountUsd: ethers.utils.parseUnits("100", 6), // $100
    shares: shares,
    originatingUser: "0x...", // Your address
    createdAt: Math.floor(Date.now() / 1000) // Current timestamp
};

const params = {
    hodlId: "0x...",
    transaction: transaction,
    userChainId: 101
};

const txId = await contract.submitTransaction(params);
```

#### `findAndProcessExpiredTransactions() → uint256`
Processes transactions that have been pending for more than 7 days.

**Returns:** Number of transactions processed

**Example:**
```javascript
const processedCount = await contract.findAndProcessExpiredTransactions();
console.log(`Processed ${processedCount} expired transactions`);
```

### Query Functions

#### `getHodlGroup(bytes12 hodlId) → HodlGroup`
Gets complete hodl information including all users.

**Parameters:**
- `hodlId`: ID of the hodl

**Returns:** Complete `HodlGroup` struct

**Example:**
```javascript
const hodlId = "0x...";
const hodlGroup = await contract.getHodlGroup(hodlId);
console.log("Hodl name:", ethers.utils.parseBytes32String(hodlGroup.vanityName));
console.log("Spend limit:", ethers.utils.formatUnits(hodlGroup.spendLimit, 6));
console.log("Users:", hodlGroup.users.length);
```

#### `getHodlUsers(bytes12 hodlId) → User[]`
Gets array of all users in a hodl with their full User structs.

**Parameters:**
- `hodlId`: ID of the hodl

**Returns:** Array of `User` structs

#### `getHodlUsersAddresses(bytes12 hodlId) → address[]`
Gets array of user addresses only (lighter call).

**Parameters:**
- `hodlId`: ID of the hodl

**Returns:** Array of addresses

#### `getUserHodls(address user) → bytes12[]`
Gets all hodl IDs that a user belongs to.

**Parameters:**
- `user`: User's wallet address

**Returns:** Array of hodl IDs

**Example:**
```javascript
const userAddress = "0x...";
const userHodls = await contract.getUserHodls(userAddress);
console.log(`User belongs to ${userHodls.length} hodls`);
```

#### `listPendingTransactions(bytes12 hodlId) → PendingTransaction[]`
Gets all pending transactions for a specific hodl.

**Parameters:**
- `hodlId`: ID of the hodl

**Returns:** Array of `PendingTransaction` structs

**Example:**
```javascript
const hodlId = "0x...";
const pending = await contract.listPendingTransactions(hodlId);
console.log(`${pending.length} pending transactions`);
```

#### `getPendingTransactionCount() → uint256`
Gets total count of all pending transactions across all hodls.

#### `getPendingTransaction(bytes32 transactionId) → PendingTransaction`
Gets details of a specific pending transaction.

#### `getHodlCount() → uint256`
Gets total number of hodls created.

## Usage Examples

### Creating and Setting Up a Hodl

```javascript
// 1. Create hodl
const createParams = {
    initialUser: await signer.getAddress(),
    initialUserChainId: 101 // Ethereum
};
const created = await contract.createHodl(createParams);
const hodlId = created.hodlId;

// 2. Set vanity name
const vanityName = ethers.utils.formatBytes32String("Dev Team Hodl");
await contract.setHodlVanityName(hodlId, vanityName);

// 3. Set spend limit
const spendLimit = ethers.utils.parseUnits("10000", 6); // $10,000
await contract.setHodlSpendLimit(hodlId, spendLimit);

// 4. Add team members
const addUser1 = {
    hodlId: hodlId,
    newUser: "0x...", // Team member 1
    invitingUser: await signer.getAddress(),
    newUserChainId: 101
};
await contract.addUserToHodl(addUser1);
```

### Submitting a Transaction

```javascript
// Create transaction for splitting a $500 expense
const shares = [
    { userAddress: "0x...", percentageInBasisPoints: 4000 }, // 40%
    { userAddress: "0x...", percentageInBasisPoints: 3000 }, // 30%
    { userAddress: "0x...", percentageInBasisPoints: 3000 }  // 30%
];

const transaction = {
    amountUsd: ethers.utils.parseUnits("500", 6),
    shares: shares,
    originatingUser: await signer.getAddress(),
    createdAt: Math.floor(Date.now() / 1000)
};

const submitParams = {
    hodlId: "0x...",
    transaction: transaction,
    userChainId: 101
};

const txId = await contract.submitTransaction(submitParams);
console.log("Transaction submitted with ID:", txId);
```

### Monitoring Events

```javascript
// Listen for new transactions
contract.on("TransactionSubmitted", (txId, hodlId, submitter, amount, userChainId) => {
    console.log("New transaction:", {
        id: txId,
        hodl: hodlId,
        submitter: submitter,
        amount: ethers.utils.formatUnits(amount, 6)
    });
});

// Listen for hodl updates
contract.on("HodlVanityNameUpdated", (hodlId, updatedBy, oldName, newName) => {
    console.log("Hodl renamed:", {
        hodl: hodlId,
        oldName: ethers.utils.parseBytes32String(oldName),
        newName: ethers.utils.parseBytes32String(newName)
    });
});
```

## Error Handling

### Common Errors

- `"Hodl does not exist"` - Invalid hodl ID
- `"Only hodl members can update vanity name"` - Non-member trying to update
- `"Only hodl members can update spend limit"` - Non-member trying to update
- `"User not part of hodl"` - User not in the specified hodl
- `"Only originating user can submit"` - Wrong user submitting transaction
- `"Only the first user can add new users"` - Non-creator trying to add users

### Example Error Handling

```javascript
try {
    await contract.setHodlVanityName(hodlId, vanityName);
} catch (error) {
    if (error.message.includes("Only hodl members")) {
        console.error("You must be a member of this hodl to update its name");
    } else if (error.message.includes("Hodl does not exist")) {
        console.error("This hodl does not exist");
    } else {
        console.error("Unexpected error:", error.message);
    }
}
```

## Best Practices

1. **Always validate hodl membership** before allowing UI actions
2. **Cache hodl data** but refresh periodically as it can change
3. **Listen to events** for real-time updates
4. **Handle pending states** - transactions take time to process
5. **Validate amounts** - Use proper decimal handling (6 decimals for USD)
6. **Check gas costs** - Cross-chain operations can be expensive

## Frontend Integration Checklist

- [ ] Contract ABI imported and configured
- [ ] Event listeners set up for real-time updates
- [ ] Proper decimal handling for USD amounts (6 decimals)
- [ ] Error handling for all contract calls
- [ ] Loading states for async operations
- [ ] Hodl membership validation before UI actions
- [ ] Proper bytes32 string conversion for vanity names
- [ ] Cross-chain gas estimation and user warnings
