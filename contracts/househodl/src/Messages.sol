pragma solidity ^0.8.13;

import {Transaction, TransactionInstruction} from "./Common.sol";

enum Messages {
    CREATE_HOLD,
    HODL_CREATED,
    JOIN_HODL,
    SUBMIT_TRANSACTION,
    RECONCILE_TRANSACTION
}

struct CreateHodl {
    uint32 chainEndpointId;
    address initialUser;
    bytes32 initialUserChainId;
}

struct HodlCreated {
    bytes12 hodleId;
}

struct AddUserToHodl {
    address newUser;
    address invitingUser;
    bytes12 hodlId;
    uint32 chainEndpointId;
}

struct SubmitTransaction {
    bytes12 hodlId;
    Transaction transaction;
}

struct ReconcileTranscation {
    bytes12 hodlId;
    TransactionInstruction[] transactionInstructions;
}

abstract contract IMessageEncoder {
    function createPacket(
        Messages message,
        bytes memory packet
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(Stringuint16(message));
    }

    function encodeCreateHodl(
        CreateHodl memory _createHodl
    ) internal pure returns (bytes memory) {
        bytes memory encoded = abi.encode(_createHodl);
    }
}
