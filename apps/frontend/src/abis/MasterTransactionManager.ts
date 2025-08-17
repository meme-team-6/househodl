export const ensReverseChainId = 11155111; // sepolia
export const masterTransactionManagerChainId = 11155111; // sepolia
export const masterTransactionManagerAddress =
  "0xf5CbB6b8c336BE5e9A1015B2884b82D8904Ff1d7";
export const masterTransactionManagerAbi = [
  {
    inputs: [
      { internalType: "address", name: "_endpoint", type: "address" },
      { internalType: "address", name: "_owner", type: "address" },
      { internalType: "address", name: "_storageUnit", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "InvalidDelegate", type: "error" },
  { inputs: [], name: "InvalidEndpointCall", type: "error" },
  { inputs: [], name: "InvalidStorageUnit", type: "error" },
  { inputs: [], name: "LzTokenUnavailable", type: "error" },
  {
    inputs: [{ internalType: "uint32", name: "eid", type: "uint32" }],
    name: "NoPeer",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "msgValue", type: "uint256" }],
    name: "NotEnoughNative",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "OnlyEndpoint",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint32", name: "eid", type: "uint32" },
      { internalType: "bytes32", name: "sender", type: "bytes32" },
    ],
    name: "OnlyPeer",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes12",
        name: "hodlId",
        type: "bytes12",
      },
      {
        indexed: true,
        internalType: "address",
        name: "updatedBy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldLimit",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newLimit",
        type: "uint256",
      },
    ],
    name: "HodlSpendLimitUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes12",
        name: "hodlId",
        type: "bytes12",
      },
      {
        indexed: true,
        internalType: "address",
        name: "updatedBy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "oldName",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "newName",
        type: "bytes32",
      },
    ],
    name: "HodlVanityNameUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint32", name: "eid", type: "uint32" },
      {
        indexed: false,
        internalType: "bytes32",
        name: "peer",
        type: "bytes32",
      },
    ],
    name: "PeerSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "transactionId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes12",
        name: "hodlId",
        type: "bytes12",
      },
      {
        indexed: true,
        internalType: "address",
        name: "submittingUser",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountUsd",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "userEid",
        type: "uint32",
      },
    ],
    name: "TransactionSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "transactionId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isApproval",
        type: "bool",
      },
    ],
    name: "TransactionVoteSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32[]",
        name: "transactionIds",
        type: "bytes32[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "processedCount",
        type: "uint256",
      },
    ],
    name: "TransactionsProcessed",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "newUser", type: "address" },
          { internalType: "address", name: "invitingUser", type: "address" },
          { internalType: "bytes12", name: "hodlId", type: "bytes12" },
          { internalType: "uint32", name: "newUserChainId", type: "uint32" },
        ],
        internalType: "struct AddUserToHodl",
        name: "params",
        type: "tuple",
      },
    ],
    name: "addUserToHodl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "srcEid", type: "uint32" },
          { internalType: "bytes32", name: "sender", type: "bytes32" },
          { internalType: "uint64", name: "nonce", type: "uint64" },
        ],
        internalType: "struct Origin",
        name: "origin",
        type: "tuple",
      },
    ],
    name: "allowInitializePath",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "contractEid",
    outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "initialUser", type: "address" },
          {
            internalType: "uint32",
            name: "initialUserChainId",
            type: "uint32",
          },
          { internalType: "bytes32", name: "vanityName", type: "bytes32" },
          { internalType: "uint256", name: "spendLimit", type: "uint256" },
        ],
        internalType: "struct CreateHodl",
        name: "params",
        type: "tuple",
      },
    ],
    name: "createHodl",
    outputs: [
      {
        components: [
          { internalType: "bytes12", name: "hodlId", type: "bytes12" },
        ],
        internalType: "struct HodlCreated",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "deploymentInfo",
    outputs: [
      { internalType: "uint256", name: "deploymentBlock", type: "uint256" },
      { internalType: "uint256", name: "deploymentTimestamp", type: "uint256" },
      { internalType: "address", name: "deployer", type: "address" },
      { internalType: "uint256", name: "chainId", type: "uint256" },
      { internalType: "string", name: "version", type: "string" },
      { internalType: "address", name: "layerZeroEndpoint", type: "address" },
      { internalType: "address", name: "storageUnitAddress", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "endpoint",
    outputs: [
      {
        internalType: "contract ILayerZeroEndpointV2",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "findAndProcessApprovedTransactions",
    outputs: [
      { internalType: "uint256", name: "processedCount", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "findAndProcessExpiredTransactions",
    outputs: [
      { internalType: "uint256", name: "processedCount", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getDeploymentInfo",
    outputs: [
      { internalType: "uint256", name: "deploymentBlock", type: "uint256" },
      { internalType: "uint256", name: "deploymentTimestamp", type: "uint256" },
      { internalType: "address", name: "deployer", type: "address" },
      { internalType: "uint256", name: "chainId", type: "uint256" },
      { internalType: "string", name: "version", type: "string" },
      { internalType: "address", name: "layerZeroEndpoint", type: "address" },
      { internalType: "address", name: "storageUnitAddress", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getHodlCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes12", name: "hodlId", type: "bytes12" }],
    name: "getHodlGroup",
    outputs: [
      {
        components: [
          { internalType: "bytes12", name: "id", type: "bytes12" },
          {
            components: [
              { internalType: "address", name: "userAddress", type: "address" },
              { internalType: "uint32", name: "chainId", type: "uint32" },
              { internalType: "int256", name: "trackedBalUsd", type: "int256" },
              { internalType: "int256", name: "realDebtUsd", type: "int256" },
              { internalType: "int256", name: "heldUsd", type: "int256" },
            ],
            internalType: "struct User[]",
            name: "users",
            type: "tuple[]",
          },
          { internalType: "bytes32", name: "vanityName", type: "bytes32" },
          { internalType: "uint256", name: "spendLimit", type: "uint256" },
        ],
        internalType: "struct HodlGroup",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes12", name: "hodlId", type: "bytes12" }],
    name: "getHodlUsers",
    outputs: [
      {
        components: [
          { internalType: "address", name: "userAddress", type: "address" },
          { internalType: "uint32", name: "chainId", type: "uint32" },
          { internalType: "int256", name: "trackedBalUsd", type: "int256" },
          { internalType: "int256", name: "realDebtUsd", type: "int256" },
          { internalType: "int256", name: "heldUsd", type: "int256" },
        ],
        internalType: "struct User[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes12", name: "hodlId", type: "bytes12" }],
    name: "getHodlUsersAddresses",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "transactionId", type: "bytes32" },
    ],
    name: "getPendingTransaction",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "id", type: "bytes32" },
          { internalType: "bytes12", name: "hodlId", type: "bytes12" },
          {
            components: [
              { internalType: "uint256", name: "amountUsd", type: "uint256" },
              {
                components: [
                  {
                    internalType: "address",
                    name: "userAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "percentageInBasisPoints",
                    type: "uint256",
                  },
                ],
                internalType: "struct Share[]",
                name: "shares",
                type: "tuple[]",
              },
              {
                internalType: "address",
                name: "originatingUser",
                type: "address",
              },
              { internalType: "uint48", name: "createdAt", type: "uint48" },
              { internalType: "bytes32", name: "vanityName", type: "bytes32" },
              {
                internalType: "address[]",
                name: "approvalVotes",
                type: "address[]",
              },
              {
                internalType: "address[]",
                name: "disapprovalVotes",
                type: "address[]",
              },
            ],
            internalType: "struct Transaction",
            name: "transaction",
            type: "tuple",
          },
        ],
        internalType: "struct StorageUnit.PendingTransaction",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPendingTransactionCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "transactionId", type: "bytes32" },
    ],
    name: "getTransactionVotes",
    outputs: [
      { internalType: "address[]", name: "approvalVotes", type: "address[]" },
      {
        internalType: "address[]",
        name: "disapprovalVotes",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserHodls",
    outputs: [{ internalType: "bytes12[]", name: "", type: "bytes12[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "transactionId", type: "bytes32" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "hasUserVoted",
    outputs: [
      { internalType: "bool", name: "hasVoted", type: "bool" },
      { internalType: "bool", name: "isApproval", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "srcEid", type: "uint32" },
          { internalType: "bytes32", name: "sender", type: "bytes32" },
          { internalType: "uint64", name: "nonce", type: "uint64" },
        ],
        internalType: "struct Origin",
        name: "",
        type: "tuple",
      },
      { internalType: "bytes", name: "", type: "bytes" },
      { internalType: "address", name: "_sender", type: "address" },
    ],
    name: "isComposeMsgSender",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes12", name: "hodlId", type: "bytes12" }],
    name: "listPendingTransactions",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "id", type: "bytes32" },
          { internalType: "bytes12", name: "hodlId", type: "bytes12" },
          {
            components: [
              { internalType: "uint256", name: "amountUsd", type: "uint256" },
              {
                components: [
                  {
                    internalType: "address",
                    name: "userAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "percentageInBasisPoints",
                    type: "uint256",
                  },
                ],
                internalType: "struct Share[]",
                name: "shares",
                type: "tuple[]",
              },
              {
                internalType: "address",
                name: "originatingUser",
                type: "address",
              },
              { internalType: "uint48", name: "createdAt", type: "uint48" },
              { internalType: "bytes32", name: "vanityName", type: "bytes32" },
              {
                internalType: "address[]",
                name: "approvalVotes",
                type: "address[]",
              },
              {
                internalType: "address[]",
                name: "disapprovalVotes",
                type: "address[]",
              },
            ],
            internalType: "struct Transaction",
            name: "transaction",
            type: "tuple",
          },
        ],
        internalType: "struct StorageUnit.PendingTransaction[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "srcEid", type: "uint32" },
          { internalType: "bytes32", name: "sender", type: "bytes32" },
          { internalType: "uint64", name: "nonce", type: "uint64" },
        ],
        internalType: "struct Origin",
        name: "_origin",
        type: "tuple",
      },
      { internalType: "bytes32", name: "_guid", type: "bytes32" },
      { internalType: "bytes", name: "_message", type: "bytes" },
      { internalType: "address", name: "_executor", type: "address" },
      { internalType: "bytes", name: "_extraData", type: "bytes" },
    ],
    name: "lzReceive",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint32", name: "", type: "uint32" },
      { internalType: "bytes32", name: "", type: "bytes32" },
    ],
    name: "nextNonce",
    outputs: [{ internalType: "uint64", name: "nonce", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oAppVersion",
    outputs: [
      { internalType: "uint64", name: "senderVersion", type: "uint64" },
      { internalType: "uint64", name: "receiverVersion", type: "uint64" },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint32", name: "eid", type: "uint32" }],
    name: "peers",
    outputs: [{ internalType: "bytes32", name: "peer", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_delegate", type: "address" }],
    name: "setDelegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes12", name: "hodlId", type: "bytes12" },
      { internalType: "uint256", name: "spendLimit", type: "uint256" },
    ],
    name: "setHodlSpendLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes12", name: "hodlId", type: "bytes12" },
      { internalType: "bytes32", name: "vanityName", type: "bytes32" },
    ],
    name: "setHodlVanityName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint32", name: "_eid", type: "uint32" },
      { internalType: "bytes32", name: "_peer", type: "bytes32" },
    ],
    name: "setPeer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "contractAddress", type: "address" },
          { internalType: "uint256", name: "chainId", type: "uint256" },
          { internalType: "uint32", name: "eid", type: "uint32" },
        ],
        internalType: "struct MasterTransactionManager.ContractAddresses[]",
        name: "_contracts",
        type: "tuple[]",
      },
    ],
    name: "setSatellite",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "storageUnit",
    outputs: [
      { internalType: "contract StorageUnit", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "bytes12", name: "hodlId", type: "bytes12" },
          { internalType: "uint32", name: "userChainId", type: "uint32" },
          { internalType: "uint256", name: "amountUsd", type: "uint256" },
          {
            components: [
              { internalType: "address", name: "userAddress", type: "address" },
              {
                internalType: "uint256",
                name: "percentageInBasisPoints",
                type: "uint256",
              },
            ],
            internalType: "struct Share[]",
            name: "shares",
            type: "tuple[]",
          },
          { internalType: "bytes32", name: "vanityName", type: "bytes32" },
        ],
        internalType: "struct SubmitTransaction",
        name: "params",
        type: "tuple",
      },
    ],
    name: "submitTransaction",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "transactionId", type: "bytes32" },
      { internalType: "bool", name: "approve", type: "bool" },
    ],
    name: "voteOnTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
