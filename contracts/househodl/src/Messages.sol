// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Transaction, TransactionInstruction} from "./Common.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

enum MessageType {
    CREATE_HOLD,
    HODL_CREATED,
    JOIN_HODL,
    SUBMIT_TRANSACTION,
    RECONCILE_TRANSACTION,
    HODL_USERS_RESPONSE,
    STAKE
}
struct GetHodlUsersRequest {
    bytes12 hodlId;
}

struct HodlUsersResponse {
    bytes12 hodlId;
    address[] users;
}

struct CreateHodl {
    address initialUser;
    uint32 initialUserChainId;
    bytes32 vanityName;
    uint256 spendLimit; 
}

struct Stake {
    address user;
    bytes12 hodlId;
    uint256 amount;
}

struct HodlCreated {
    bytes12 hodlId;
}

struct AddUserToHodl {
    address newUser;
    address invitingUser;
    bytes12 hodlId;
    uint32 newUserChainId;
}

struct SubmitTransaction {
    bytes12 hodlId;
    Transaction transaction;
    uint32 userChainId;
}

struct ReconcileTransaction {
    bytes12 hodlId;
    TransactionInstruction[] transactionInstructions;
}

library MessageEncoder {
    function encodeHodlUsersResponse(HodlUsersResponse memory resp) public pure returns (bytes memory) {
        return abi.encode(MessageType.HODL_USERS_RESPONSE, resp);
    }

    function asHodlUsersResponse(bytes memory packet) public pure returns (HodlUsersResponse memory sentMsg) {
        MessageType _type;
        (_type, sentMsg) = abi.decode(packet, (MessageType, HodlUsersResponse));
    }
    
    function encodeStake(
        Stake memory _stake
    ) public pure returns (bytes memory) {
        return abi.encode(MessageType.STAKE, _stake);
    }

    function asStake(
        bytes memory packet
    ) public pure returns (Stake memory sentMsg) {
        MessageType _type;
        (_type, sentMsg) = abi.decode(packet, (MessageType, Stake));
    }
    function encodeCreateHodl(
        CreateHodl memory _createHodl
    ) public pure returns (bytes memory) {
        return abi.encode(MessageType.CREATE_HOLD, _createHodl);
    }

    function encodeReconcileTransaction(
        ReconcileTransaction memory _reconcileTransaction
    ) public pure returns (bytes memory) {
        return abi.encode(MessageType.RECONCILE_TRANSACTION, _reconcileTransaction);
    }
    function determineType(
        bytes memory packet
    ) public pure returns (MessageType) {
        return abi.decode(packet, (MessageType));
    }

    function asReconcileTranscation(
        bytes memory packet
    ) public pure returns (ReconcileTransaction memory sentMsg) {
        MessageType _type;
        (_type, sentMsg) = abi.decode(
            packet,
            (MessageType, ReconcileTransaction)
        );
    }

    function asCreateHodl(
        bytes memory packet
    ) public pure returns (CreateHodl memory sentMsg) {
        MessageType _type;
        (_type, sentMsg) = abi.decode(packet, (MessageType, CreateHodl));
    }
}
