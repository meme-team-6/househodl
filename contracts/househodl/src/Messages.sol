pragma solidity ^0.8.13; 

import {Share} from "./Common.sol";

enum Messages {
    CREATE_HOLD,
    HODL_CREATED,
    JOIN_HODL,
    SUBMIT_TRANSACTION
}

struct CreateHodl {
    address initialUser;
    uint32 chainEndpointId;
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


sturct SubmitTransaction {
    bytes12 hodlId;
    address user;
    uint256 amountUSD;
    Share[] shares;
}