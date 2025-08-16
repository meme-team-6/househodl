// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;


import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StorageUnit is Ownable {
    struct Hodl {
        bytes12 id;
        address[] users;
    }

    Hodl[] public hodls;
    mapping(address => bytes32) public mapUserToEid;

    constructor(address initialOwner) {
        if (initialOwner != _msgSender()) {
            _transferOwnership(initialOwner);
        }
    }

    function getHodlCount() external view returns (uint256) {
        return hodls.length;
    }

    function createHodl(bytes12 id, address initialUser, bytes32 initialUserChainId) external onlyOwner {
        address[] memory initialUsers = new address[](1);
        initialUsers[0] = initialUser;
        Hodl memory newHodl = Hodl({
            id: id,
            users: initialUsers
        });
        hodls.push(newHodl);
        mapUserToEid[initialUser] = initialUserChainId;
    }

    function addUserToHodl(bytes12 hodlId, address newUser, uint32 newUserChainId) external onlyOwner {
        // Assuming hodlId is the index
        hodls[uint96(hodlId)].users.push(newUser);
        mapUserToEid[newUser] = bytes32(uint256(newUserChainId));
    }

    function getHodlUsers(bytes12 hodlId) external view returns (address[] memory) {
        // Assuming hodlId is the index
        return hodls[uint96(hodlId)].users;
    }
}
