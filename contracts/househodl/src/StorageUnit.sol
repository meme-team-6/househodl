// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;


import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Transaction, User, HodlGroup} from "./Common.sol";

contract StorageUnit is Ownable {
    struct StoredHodlGroup {
        bytes12 id;
        bytes32 vanityName;
        uint256 spendLimit;
    }

    struct PendingTransaction {
        bytes32 id;
        bytes12 hodlId;
        uint256 amountUsd;
        address originatingUser;
        uint48 transactionCreatedAt;
        address submittingUser;
        uint32 userEid;
        uint48 submittedAt;
    }

    StoredHodlGroup[] public hodlGroups;
    mapping(bytes12 => User[]) public hodlUsers; // hodlId => users array
    
    PendingTransaction[] public pendingTransactions;
    mapping(bytes32 => uint256) public pendingTransactionIndex;
    
    address public transactionManager;
    
    event TransactionManagerUpdated(address indexed oldManager, address indexed newManager);
    
    modifier onlyTransactionManager() {
        require(msg.sender == transactionManager, "StorageUnit: caller is not the transaction manager");
        _;
    }

    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
    }

    function setTransactionManager(address _transactionManager) external onlyOwner {
        address oldManager = transactionManager;
        transactionManager = _transactionManager;
        emit TransactionManagerUpdated(oldManager, _transactionManager);
    }

    function getHodlCount() external view returns (uint256) {
        return hodlGroups.length;
    }

    function createHodl(bytes12 id, address initialUser, uint32 initialUserEid) external onlyTransactionManager {
        StoredHodlGroup memory newStoredHodl = StoredHodlGroup({
            id: id,
            vanityName: bytes32(0),
            spendLimit: 0
        });
        hodlGroups.push(newStoredHodl);

        User memory initialUserStruct = User({
            userAddress: initialUser,
            eid: initialUserEid,
            trackedBalUsd: 0,
            realDebtUsd: 0,
            heldUsd: 0
        });
        
        hodlUsers[id].push(initialUserStruct);
    }

    function addUserToHodl(bytes12 hodlId, address newUser, uint32 newUserChainEid) external onlyTransactionManager {
        uint96 index = uint96(hodlId);
        require(index < hodlGroups.length, "Hodl does not exist");
        
        User memory newUserStruct = User({
            userAddress: newUser,
            eid: newUserChainEid,
            trackedBalUsd: 0,
            realDebtUsd: 0,
            heldUsd: 0
        });
        
        hodlUsers[hodlId].push(newUserStruct);
    }

    function getHodlUsers(bytes12 hodlId) external view returns (User[] memory) {
        uint96 index = uint96(hodlId);
        require(index < hodlGroups.length, "Hodl does not exist");
        
        User[] memory users = hodlUsers[hodlId];
        
        return users;
    }

    function getHodlUserAddresses(bytes12 hodlId) external view returns (address[] memory) {
        User[] memory users = hodlUsers[hodlId];
        address[] memory userAddresses = new address[](users.length);
        
        for (uint256 i = 0; i < users.length; i++) {
            userAddresses[i] = users[i].userAddress;
        }
        
        return userAddresses;
    }

    function getHodlGroup(bytes12 hodlId) external view returns (HodlGroup memory) {
        uint96 index = uint96(hodlId);
        require(index < hodlGroups.length, "Hodl does not exist");
        
        StoredHodlGroup memory storedHodl = hodlGroups[index];
        User[] memory users = hodlUsers[hodlId];
        
        return HodlGroup({
            id: storedHodl.id,
            users: users,
            vanityName: storedHodl.vanityName,
            spendLimit: storedHodl.spendLimit
        });
    }

    function setHodlVanityName(bytes12 hodlId, bytes32 vanityName) external onlyTransactionManager {
        uint96 index = uint96(hodlId);
        require(index < hodlGroups.length, "Hodl does not exist");
        hodlGroups[index].vanityName = vanityName;
    }

    function setHodlSpendLimit(bytes12 hodlId, uint256 spendLimit) external onlyTransactionManager {
        uint96 index = uint96(hodlId);
        require(index < hodlGroups.length, "Hodl does not exist");
        hodlGroups[index].spendLimit = spendLimit;
    }

    function getHodlVanityName(bytes12 hodlId) external view returns (bytes32) {
        uint96 index = uint96(hodlId);
        require(index < hodlGroups.length, "Hodl does not exist");
        return hodlGroups[index].vanityName;
    }

    function getHodlSpendLimit(bytes12 hodlId) external view returns (uint256) {
        uint96 index = uint96(hodlId);
        require(index < hodlGroups.length, "Hodl does not exist");
        return hodlGroups[index].spendLimit;
    }

    function addPendingTransaction(
        bytes32 transactionId,
        bytes12 hodlId,
        Transaction memory transaction,
        address submittingUser,
        uint32 userEid
    ) external onlyTransactionManager {
        PendingTransaction memory newPending = PendingTransaction({
            id: transactionId,
            hodlId: hodlId,
            amountUsd: transaction.amountUsd,
            originatingUser: transaction.originatingUser,
            transactionCreatedAt: transaction.createdAt,
            submittingUser: submittingUser,
            userEid: userEid,
            submittedAt: uint48(block.timestamp)
        });
        
        pendingTransactions.push(newPending);
        pendingTransactionIndex[transactionId] = pendingTransactions.length - 1;
    }

    function getPendingTransaction(bytes32 transactionId) external view returns (PendingTransaction memory) {
        uint256 index = pendingTransactionIndex[transactionId];
        require(index < pendingTransactions.length, "Transaction does not exist");
        return pendingTransactions[index];
    }

    function getPendingTransactionCount() external view returns (uint256) {
        return pendingTransactions.length;
    }

    function getPendingTransactionByIndex(uint256 index) external view returns (PendingTransaction memory) {
        require(index < pendingTransactions.length, "Index out of bounds");
        return pendingTransactions[index];
    }

    function removePendingTransaction(bytes32 transactionId) external onlyTransactionManager {
        uint256 index = pendingTransactionIndex[transactionId];
        require(index < pendingTransactions.length, "Transaction does not exist");
        
        uint256 lastIndex = pendingTransactions.length - 1;
        if (index != lastIndex) {
            PendingTransaction memory lastTransaction = pendingTransactions[lastIndex];
            pendingTransactions[index] = lastTransaction;
            pendingTransactionIndex[lastTransaction.id] = index;
        }
        
        pendingTransactions.pop();
        delete pendingTransactionIndex[transactionId];
    }
}
