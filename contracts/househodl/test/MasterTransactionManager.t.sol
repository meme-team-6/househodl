// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// MyOApp imports
import {MasterTransactionManager} from "../src/MasterTransactionManager.sol";
import {TestDispatcher} from "./fixtures/TestDispatcher.sol";

// OApp imports
import {IOAppOptionsType3, EnforcedOptionParam} from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import {OptionsBuilder} from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";

// OZ imports
import {IERC20} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

// Forge imports
import "forge-std/console.sol";

// DevTools imports
import {TestHelperOz5} from "@layerzerolabs/test-devtools-evm-foundry/contracts/TestHelperOz5.sol";

contract MasterTransactionManagerTest is TestHelperOz5 {
    using OptionsBuilder for bytes;

    uint32 private aEid = 1;
    uint32 private bEid = 2;

    MasterTransactionManager private masterTransactionManager;
    TestDispatcher private testDispatcher;

    address private userA = address(0x1);
    address private userB = address(0x2);
    uint256 private initialBalance = 100 ether;

    function setUp() public virtual override {
        vm.deal(userA, 1000 ether);
        vm.deal(userB, 1000 ether);

        super.setUp();
        setUpEndpoints(2, LibraryType.UltraLightNode);

        masterTransactionManager = MasterTransactionManager(
            _deployOApp(
                type(MasterTransactionManager).creationCode,
                abi.encode(address(endpoints[aEid]), address(this))
            )
        );

        testDispatcher = TestDispatcher(
            _deployOApp(
                type(TestDispatcher).creationCode,
                abi.encode(address(endpoints[bEid]), address(this))
            )
        );

        vm.deal(address(testDispatcher), 1000 ether);
        vm.deal(address(masterTransactionManager), 1000 ether);

        address[] memory oapps = new address[](2);
        oapps[0] = address(masterTransactionManager);
        oapps[1] = address(testDispatcher);
        this.wireOApps(oapps);
    }

    function test_constructor() public {
        assertEq(aOApp.owner(), address(this));
        assertEq(bOApp.owner(), address(this));

        assertEq(address(aOApp.endpoint()), address(endpoints[aEid]));
        assertEq(address(bOApp.endpoint()), address(endpoints[bEid]));
    }

    function test_send_string() public {
        // bytes memory options = OptionsBuilder
        //     .newOptions()
        //     .addExecutorLzReceiveOption(200000, 0);
        // string memory message = "Hello, World!";
        // MessagingFee memory fee = aOApp.quoteSendString(
        //     bEid,
        //     message,
        //     options,
        //     false
        // );
        // assertEq(aOApp.lastMessage(), "");
        // assertEq(bOApp.lastMessage(), "");
        // vm.prank(userA);
        // aOApp.sendString{value: fee.nativeFee}(bEid, message, options);
        // verifyPackets(bEid, addressToBytes32(address(bOApp)));
        // assertEq(aOApp.lastMessage(), "");
        // assertEq(bOApp.lastMessage(), message);
    }
}
