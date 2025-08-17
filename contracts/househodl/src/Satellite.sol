// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {OApp, Origin, MessagingFee} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import {OAppOptionsType3} from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MessageType, MessageEncoder, CreateHodl} from "./Messages.sol";

contract Satellite is OApp, OAppOptionsType3 {
    /// @notice Msg type for sending a string, for use in OAppOptionsType3 as an enforced option
    uint16 public constant SEND = 1;
    uint32 internal mtmEid;

    /// @notice Emitted when a message is received and parsed
    event MessageReceived(string msgType, string data);

    /// @notice Initialize with Endpoint V2 and owner address
    /// @param _endpoint The local chain's LayerZero Endpoint V2 address
    /// @param _owner    The address permitted to configure this OApp
    constructor(
        address _endpoint,
        address _owner,
        uint32 _mtmEid,
        bytes32 _mtmAddr
    ) OApp(_endpoint, _owner) {
        if (_owner != _msgSender()) {
            _transferOwnership(_owner);
        }

        mtmEid = _mtmEid;
        _setPeer(mtmEid, _mtmAddr);
    }

    /**
     * @notice Quotes the gas needed to pay for the full omnichain transaction in native gas or ZRO token.
     * @param _dstEid Destination chain's endpoint ID.
     * @param _packet The string to send.
     * @param _options Message execution options (e.g., for sending gas to destination).
     * @param _payInLzToken Whether to return fee in ZRO token.
     * @return fee A `MessagingFee` struct containing the calculated gas fee in either the native token or ZRO token.
     */
    function quotePacket(
        uint32 _dstEid,
        bytes memory _packet,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        fee = _quote(
            _dstEid,
            _packet,
            combineOptions(_dstEid, SEND, _options),
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
    function sendCreateHodl(
        uint32 _dstEid,
        CreateHodl memory _string,
        bytes calldata _options
    ) external payable {
        bytes memory _message = MessageEncoder.encodeCreateHodl(_string);

        MessagingFee memory fee = quotePacket(
            _dstEid,
            _message,
            _options,
            false
        );

        _lzSend(
            _dstEid,
            _message,
            combineOptions(_dstEid, SEND, _options),
            fee,
            payable(address(this))
        );
    }

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
        MessageType msgType = MessageEncoder.determineType(_message);
    }
}
