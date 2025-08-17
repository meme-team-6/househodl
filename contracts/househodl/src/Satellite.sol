
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {OApp, Origin, MessagingFee} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import {OAppOptionsType3} from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MessageType, MessageEncoder, CreateHodl, Stake, HodlUsersResponse, ReconcileTransaction} from "./Messages.sol";
import {AaveMultiTokenManager} from "./AaveSupplyBorrow.sol";
import {Proportion} from "./Common.sol";

contract Satellite is OApp, OAppOptionsType3 {
    /// @notice Msg type for sending a string, for use in OAppOptionsType3 as an enforced option
    uint16 public constant SEND = 1;
    uint32 internal mtmEid;
    AaveMultiTokenManager internal aaveManager;
    struct TokenOwnership{
        address owner;
        bytes12 hodlId;
        address tokenAddr;
        uint256 shareAmount;
    }

    mapping(bytes20 => TokenOwnership) public tokenOwnershipsPerUserHodl;
    mapping(address => uint256) public totalSharesAssignedPerToken;

    /// @notice Emitted when a message is received and parsed
    event MessageReceived(string msgType, string data);

    /// @notice Initialize with Endpoint V2 and owner address
    /// @param _endpoint The local chain's LayerZero Endpoint V2 address
    /// @param _owner    The address permitted to configure this OApp
    constructor(
        address _endpoint,
        address _owner,
        uint32 _mtmEid,
        bytes32 _mtmAddr,
        address _aaveManager
    ) OApp(_endpoint, _owner) {
        if (_owner != _msgSender()) {
            _transferOwnership(_owner);
        }
        
        mtmEid = _mtmEid;
        _setPeer(mtmEid, _mtmAddr);
        aaveManager = AaveMultiTokenManager(_aaveManager);
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

    function ConfirmStake(
        uint32 _dstEid,
        Stake memory _stake,
        bytes calldata _options
    ) external payable {
        bytes memory _message = MessageEncoder.encodeStake(_stake);

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
        if (msgType == MessageType.HODL_USERS_RESPONSE) {
            HodlUsersResponse memory resp = MessageEncoder.asHodlUsersResponse(_message);
            // emit HodlUsersResponse(resp.hodlId, resp.users);
        } else if (msgType == MessageType.RECONCILE_TRANSACTION) {
            ReconcileTransaction memory reconcile = MessageEncoder.asReconcileTransaction(_message);

            this.CoordinateTransaction(
                reconcile.hodlId,
                reconcile.totalUsdcAmount,
                reconcile.proportion
            );
        }
    }

    function GetBalanceOfToken(bytes12 hodlId, address tokenAddr) public view returns (uint256) {
        bytes20 userHodlKey = bytes20(abi.encodePacked(hodlId, msg.sender));
        TokenOwnership storage ownership = tokenOwnershipsPerUserHodl[userHodlKey];

        require(ownership.owner == msg.sender, "Not owner of this hodlId");
        
        uint256 totalATokens = aaveManager.GetTotalAvailableAaveToken(tokenAddr);
        uint256 totalShares = totalSharesAssignedPerToken[tokenAddr];

        if (totalShares == 0) {
            return 0;
        }

        // User's balance = (user shares / total shares) * total aTokens
        return (ownership.shareAmount * totalATokens) / totalShares;
    }

    function GetBalanceOfTokenAsUSDC(bytes12 hodlId, address tokenAddr) external view returns (uint256) {
        uint256 tokenBalance = GetBalanceOfToken(hodlId, tokenAddr);
        // User's balance = (user shares / total shares) * total aTokens
        return aaveManager.GetTokenBalanceAsUSDC(tokenBalance, tokenAddr);
    }



    function CoordinateTransaction(
        bytes12 hodlId,
        uint256 totalUsdcAmount,
        Proportion[] calldata proportions
    ) external onlyOwner {
        require(proportions.length > 0, "No proportions provided");

        // Sum proportions and check they add up to 0
        int256 sumProportions = 0;
        for (uint256 i = 0; i < proportions.length; i++) {
            sumProportions += proportions[i].proportion;
        }
        require(sumProportions == 0, "Proportions must sum to 0");

        // For each user, calculate new share amount based on their proportion of totalUsdcAmount
        for (uint256 i = 0; i < proportions.length; i++) {

            bytes20 userHodlKey = bytes20(abi.encodePacked(hodlId, proportions[i].user));
            TokenOwnership storage ownership = tokenOwnershipsPerUserHodl[userHodlKey];

            // If user doesn't exist, initialize
            if(ownership.owner == address(0))
            {
                continue;
            }

            // Get total shares for this token
            int256 totalShares = int256(totalSharesAssignedPerToken[proportions[i].tokenAddr]);
            require(totalShares > 0, "No shares to rearrange");

            // Get total aTokens and their USDC value
            int256 totalATokens = int256(aaveManager.GetTotalAvailableAaveToken(proportions[i].tokenAddr));
            int256 pricePerShare = int256(totalATokens) / int256(totalShares);

            int256 totalATokensAsUSDC = int256(aaveManager.GetTokenBalanceAsUSDC(uint256(totalATokens), proportions[i].tokenAddr));

            require(totalATokensAsUSDC > 0, "No USDC value in pool");

            address user = proportions[i].user;
            int256 userProp = proportions[i].proportion;

            // Calculate user's USDC change
            int256 userUsdcChange = (int256(totalUsdcAmount) * userProp) / 1e8;

            // Convert USDC allocation to aToken amount
            int256 userATokensChange = (totalATokens * userUsdcChange) / totalATokensAsUSDC;

            // Set new share amount
            int256 adjustedshareAmount = userATokensChange / pricePerShare + int256(ownership.shareAmount);
            ownership.shareAmount = uint256(adjustedshareAmount);
            tokenOwnershipsPerUserHodl[userHodlKey] = ownership;
        }
    }


    function StakeUsingAave(bytes12 hodlId, uint256 amount, address tokenAddr) external payable {
        
        // First the associated AaveMultiTokenManager should be interrogated to 
        // find out how many aTokens of given token are present in the pool
        // The shares owned by this user divided by total shares * amount of aTokens present in the contract
        // = amount of the crypto that this user owns
        // Price per share is calculate by doing amount of aTokens divided by number of shares issued. 

        // Now when staking more, the amount staked is divided by the price per share to give 
        // the number of shares associated with this stake.

        // Get the total amount of aTokens for this token in the pool
        uint256 totalATokensPreStake = aaveManager.GetTotalAvailableAaveToken(tokenAddr);
        uint256 totalShares = totalSharesAssignedPerToken[tokenAddr];

        //Assume this works
        aaveManager.SupplyTokens(msg.sender, amount, tokenAddr);

        uint256 pricePerShare;
        uint256 sharesAssociatedWithStake;
        if(totalATokensPreStake == 0){
            require(totalShares == 0, "Tokens exist, but no shares assigned somehow!");
            totalShares = amount;
            pricePerShare = 1;
        }
        else {
            pricePerShare = totalATokensPreStake / totalShares;
        }

        sharesAssociatedWithStake = amount / pricePerShare;
        totalSharesAssignedPerToken[tokenAddr] += sharesAssociatedWithStake;

        bytes20 userHodlKey = bytes20(abi.encodePacked(hodlId, msg.sender));
        TokenOwnership storage ownership = tokenOwnershipsPerUserHodl[userHodlKey];

        if(ownership.owner == address(0))
        {
            ownership.owner = msg.sender;
            ownership.hodlId = hodlId;
            ownership.tokenAddr = tokenAddr;
        }

        ownership.shareAmount += sharesAssociatedWithStake;
        tokenOwnershipsPerUserHodl[userHodlKey] = ownership;

    }

}
