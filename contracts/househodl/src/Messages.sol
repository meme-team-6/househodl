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

library MessageEncoder {
    function encodeCreateHodl(
        CreateHodl memory _createHodl
    ) public pure returns (bytes memory) {
        bytes memory encoded = abi.encode(_createHodl);
        return abi.encode(MessageType.CREATE_HOLD, encoded);
    }

    function determineType(
        bytes memory packet
    ) public pure returns (MessageType) {
        return abi.decode(packet, (MessageType));
    }
}
