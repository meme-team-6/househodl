// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;


import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StorageUnit is Ownable {
    struct Hodl {
        bytes12 id;
        address[] users;
    }

    Hodl[] public hodls;
    mapping(address => address) public mapUserToEid;
    
    address public transactionManager;
    
    event TransactionManagerUpdated(address indexed oldManager, address indexed newManager);
    
    modifier onlyTransactionManager() {
        require(msg.sender == transactionManager, "StorageUnit: caller is not the transaction manager");
        _;
    }

    constructor(address initialOwner) Ownable() {
        if (initialOwner != _msgSender()) {
            _transferOwnership(initialOwner);
        }
    }

    function setTransactionManager(address _transactionManager) external onlyOwner {
        address oldManager = transactionManager;
        transactionManager = _transactionManager;
        emit TransactionManagerUpdated(oldManager, _transactionManager);
    }

    function getHodlCount() external view returns (uint256) {
        return hodls.length;
    }

    function createHodl(bytes12 id, address initialUser, address initialUserChainId) external onlyTransactionManager {
        address[] memory initialUsers = new address[](1);
        initialUsers[0] = initialUser;
        Hodl memory newHodl = Hodl({
            id: id,
            users: initialUsers
        });
        hodls.push(newHodl);
        mapUserToEid[initialUser] = initialUserChainId;
    }

    function addUserToHodl(bytes12 hodlId, address newUser, address newUserChainId) external onlyTransactionManager {
        // Assuming hodlId is the index
        hodls[uint96(hodlId)].users.push(newUser);
        mapUserToEid[newUser] = newUserChainId;
    }

    function getHodlUsers(bytes12 hodlId) external view returns (address[] memory) {
        // Assuming hodlId is the index
        return hodls[uint96(hodlId)].users;
    }
}
