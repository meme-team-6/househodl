pragma solidity ^0.8.26;

contract SatelliteContract
{
    struct Share {
        address userAddress;
        uint256 percentageInBasisPoints;
    }

    address valueStore;

    constructor (address _adminUser, address _valueStore) Ownable(msg.sender){}

    function SendAaveTokensToValue(uint256 amount, address flatGroup, address stakingToken) private{}

    function Stake(uint256 amount, address flatGroup, address stakingToken){}

    function SubmitTransaction(uint256 amountUSD, address flatGroup, Share[] shares){}

    function lzReceive(...sdsd){}

    function CCTPUSDCReceive(...){}

    // This is for taking the AaveTokens and converting back to the real tokens.
    function aaveSwap(uint256 amount, address flatGroup, address stakingToken){}

    function AaveBorrowUsdc(...){}

    // this contract interacts with Circle

};

contract SatelliteValueStore
{

    struct UserGroupKey
    {
        address user;
        bytes12 group;
    }

    struct UserGroupValue
    {
        uint256 USDC;
        uint256 nativeToken;
        uint256 aaveToken;
        address nativeTokenAddress;
    };

    constructor (address _usdcTokenAddr) Ownable (msg.sender){}

    mapping(bytes32 => UserGroupValue) private UserValueMap;

    function ConcatUserGroupKey(UserGroupKey key) private
    {

    }

    function ReceiveAaveFromSatellite(uint256 amount, address flatGroup, address stakingToken) public
    {

    }

    function SendAaveTokenToSatellite(uint256 amount, address flatGroup, address stakingToken) private
    {

    }


}