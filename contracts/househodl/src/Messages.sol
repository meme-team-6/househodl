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
    RECONCILE_TRANSACTION
}

struct CreateHodl {
    address initialUser;
    uint32 initialUserChainId;
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
