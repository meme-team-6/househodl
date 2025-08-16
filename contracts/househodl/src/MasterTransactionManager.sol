// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { CreateHodl, HodlCreated, AddUserToHodl } from "./Messages.sol";
import { StorageUnit } from "./StorageUnit.sol";

contract MasterTransactionManager is OApp {
    StorageUnit public storageUnit;
    
    uint16 internal constant SEND = 1;
    
    error InvalidStorageUnit();

    constructor(address _endpoint, address _owner, address _storageUnit)
        OApp(_endpoint, _owner)
    {
        if (_storageUnit == address(0)) revert InvalidStorageUnit();
        storageUnit = StorageUnit(_storageUnit);
    }

    function createHodl(CreateHodl memory params) public returns (HodlCreated memory) {
        uint256 hodlCount = storageUnit.getHodlCount();
        require(hodlCount < (2**12 - 1), "Hodl pool full"); // Ensure we don't overflow the bytes12 ID
        require(params.initialUser != address(0), "Initial user cannot be zero address");

        bytes12 newHodlId = bytes12(uint96(hodlCount));

        storageUnit.createHodl(newHodlId, params.initialUser, params.initialUserChainId);

        return HodlCreated({
            hodleId: newHodlId
        });
    }

    function addUserToHodl(AddUserToHodl memory params) public {
        // Only the first user can add new users
        address[] memory users = storageUnit.getHodlUsers(params.hodlId);
        require(users.length > 0, "Hodl does not exist");
        require(users[0] == msg.sender, "Only the first user can add new users");
        require(params.newUser != address(0), "New user cannot be zero address");
        require(params.invitingUser != address(0), "Inviting user cannot be zero address");

        // Add the new user to the hodl
        storageUnit.addUserToHodl(params.hodlId, params.newUser, params.chainEndpointId);
    }




    // ──────────────────────────────────────────────────────────────────────────────
    // 0. (Optional) Quote business logic
    //
    // Example: Get a quote from the Endpoint for a cost estimate of sending a message.
    // Replace this to mirror your own send business logic.
    // ──────────────────────────────────────────────────────────────────────────────

    /**
     * @notice Quotes the gas needed to pay for the full omnichain transaction in native gas or ZRO token.
     * @param _dstEid Destination chain's endpoint ID.
     * @param _string The string to send.
     * @param _options Message execution options (e.g., for sending gas to destination).
     * @param _payInLzToken Whether to return fee in ZRO token.
     * @return fee A `MessagingFee` struct containing the calculated gas fee in either the native token or ZRO token.
     */
    function quoteSendString(
        uint32 _dstEid,
        string calldata _string,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory _message = abi.encode(_string);
        // combineOptions (from OAppOptionsType3) merges enforced options set by the contract owner
        // with any additional execution options provided by the caller
        fee = _quote(
            _dstEid,
            _message,
            _options,
            _payInLzToken
        );
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 1. Send business logic
    //
    // Example: send a simple string to a remote chain. Replace this with your
    // own state-update logic, then encode whatever data your application needs.
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Send a string to a remote OApp on another chain
    /// @param _dstEid   Destination Endpoint ID (uint32)
    /// @param _string  The string to send
    /// @param _options  Execution options for gas on the destination (bytes)
    function sendString(
        uint32 _dstEid,
        string calldata _string,
        bytes calldata _options
    ) external payable {
        // 1. (Optional) Update any local state here.
        //    e.g., record that a message was "sent":
        //    sentCount += 1;

        // 2. Encode any data structures you wish to send into bytes
        //    You can use abi.encode, abi.encodePacked, or directly splice bytes
        //    if you know the format of your data structures
        bytes memory _message = abi.encode(_string);

        // 3. Call OAppSender._lzSend to package and dispatch the cross-chain message
        //    - _dstEid:   remote chain's Endpoint ID
        //    - _message:  ABI-encoded string
        //    - _options:  combined execution options (enforced + caller-provided)
        //    - MessagingFee(msg.value, 0): pay all gas as native token; no ZRO
        //    - payable(msg.sender): refund excess gas to caller
        //
        //    combineOptions (from OAppOptionsType3) merges enforced options set by the contract owner
        //    with any additional execution options provided by the caller
        _lzSend(
            _dstEid,
            _message,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 2. Receive business logic
    //
    // Override _lzReceive to decode the incoming bytes and apply your logic.
    // The base OAppReceiver.lzReceive ensures:
    //   • Only the LayerZero Endpoint can call this method
    //   • The sender is a registered peer (peers[srcEid] == origin.sender)
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Invoked by OAppReceiver when EndpointV2.lzReceive is called
    /// @dev   _origin    Metadata (source chain, sender address, nonce)
    /// @dev   _guid      Global unique ID for tracking this message
    /// @param _message   ABI-encoded bytes (the string we sent earlier)
    /// @dev   _executor  Executor address that delivered the message
    /// @dev   _extraData Additional data from the Executor (unused here)
    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // 1. Decode the incoming bytes into a string
        //    You can use abi.decode, abi.decodePacked, or directly splice bytes
        //    if you know the format of your data structures
        string memory _string = abi.decode(_message, (string));

        // 2. Apply your custom logic. In this example, store it in `lastMessage`.

        // 3. (Optional) Trigger further on-chain actions.
        //    e.g., emit an event, mint tokens, call another contract, etc.
        //    emit MessageReceived(_origin.srcEid, _string);
    }
}
