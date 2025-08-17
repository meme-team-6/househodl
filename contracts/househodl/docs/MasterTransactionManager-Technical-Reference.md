# MasterTransactionManager Technical Reference

This document provides technical details and advanced integration patterns for the MasterTransactionManager contract.

## Contract Address & Deployment Info

**Contract Name:** `MasterTransactionManager`  
**Solidity Version:** `^0.8.13`  
**Compilation:** Requires `viaIR: true` in Solidity compiler settings  
**Dependencies:** LayerZero OApp, OpenZeppelin  

## Function Signatures & Gas Estimates

### Write Functions

| Function | Selector | Estimated Gas | Notes |
|----------|----------|---------------|-------|
| `createHodl(CreateHodl)` | `0x...` | ~150,000 | Creates new hodl group |
| `addUserToHodl(AddUserToHodl)` | `0x...` | ~230,000 | Adds user to existing hodl |
| `submitTransaction(SubmitTransaction)` | `0x...` | ~310,000 | Submits new transaction |
| `setHodlVanityName(bytes12,bytes32)` | `0x...` | ~45,000 | Updates hodl name |
| `setHodlSpendLimit(bytes12,uint256)` | `0x...` | ~45,000 | Updates spend limit |
| `findAndProcessExpiredTransactions()` | `0x...` | Variable | Processes expired txs |

### Read Functions

| Function | Selector | Gas | Return Type |
|----------|----------|-----|-------------|
| `getHodlGroup(bytes12)` | `0x...` | ~25,000 | `HodlGroup` |
| `getHodlUsers(bytes12)` | `0x...` | ~20,000 | `User[]` |
| `getHodlUsersAddresses(bytes12)` | `0x...` | ~15,000 | `address[]` |
| `getUserHodls(address)` | `0x...` | Variable | `bytes12[]` |
| `listPendingTransactions(bytes12)` | `0x...` | Variable | `PendingTransaction[]` |
| `getHodlCount()` | `0x...` | ~2,100 | `uint256` |
| `getPendingTransactionCount()` | `0x...` | ~2,100 | `uint256` |

## Data Encoding & Decoding

### Hodl ID Format
Hodl IDs are `bytes12` values representing the hodl index:
```javascript
// Convert hodl index to ID
function indexToHodlId(index) {
    return ethers.utils.hexZeroPad(ethers.utils.hexlify(index), 12);
}

// Convert hodl ID to index
function hodlIdToIndex(hodlId) {
    return ethers.BigNumber.from(hodlId).toNumber();
}
```

### Vanity Name Encoding
Vanity names are stored as `bytes32`:
```javascript
// Encode string to bytes32
const vanityName = ethers.utils.formatBytes32String("My Hodl Name");

// Decode bytes32 to string
const decodedName = ethers.utils.parseBytes32String(vanityName);
```

### USD Amount Handling
All USD amounts use 6 decimal places:
```javascript
// Convert dollar amount to contract format
function dollarToWei(dollarAmount) {
    return ethers.utils.parseUnits(dollarAmount.toString(), 6);
}

// Convert contract format to dollar amount
function weiToDollar(weiAmount) {
    return parseFloat(ethers.utils.formatUnits(weiAmount, 6));
}
```

## Advanced Usage Patterns

### Batch Operations
```javascript
// Get complete hodl information in one call
async function getCompleteHodlInfo(hodlId) {
    const [hodlGroup, pendingTxs] = await Promise.all([
        contract.getHodlGroup(hodlId),
        contract.listPendingTransactions(hodlId)
    ]);
    
    return {
        ...hodlGroup,
        pendingTransactions: pendingTxs,
        vanityNameString: ethers.utils.parseBytes32String(hodlGroup.vanityName),
        spendLimitDollars: weiToDollar(hodlGroup.spendLimit)
    };
}
```

### Event Filtering & Indexing
```javascript
// Get all hodls for a user via events
async function getUserHodlsFromEvents(userAddress) {
    const createFilter = contract.filters.HodlVanityNameUpdated(null, userAddress);
    const addUserFilter = contract.filters.TransactionSubmitted(null, null, userAddress);
    
    const [createEvents, txEvents] = await Promise.all([
        contract.queryFilter(createFilter),
        contract.queryFilter(addUserFilter)
    ]);
    
    const hodlIds = new Set();
    createEvents.forEach(event => hodlIds.add(event.args.hodlId));
    txEvents.forEach(event => hodlIds.add(event.args.hodlId));
    
    return Array.from(hodlIds);
}
```

### Real-time Updates with WebSockets
```javascript
class HodlWatcher {
    constructor(contract, hodlId) {
        this.contract = contract;
        this.hodlId = hodlId;
        this.listeners = [];
    }
    
    startWatching() {
        // Watch for new transactions
        this.contract.on("TransactionSubmitted", (txId, hodlId, submitter, amount, userChainId) => {
            if (hodlId === this.hodlId) {
                this.emit('newTransaction', { txId, submitter, amount: weiToDollar(amount) });
            }
        });
        
        // Watch for hodl updates
        this.contract.on("HodlVanityNameUpdated", (hodlId, updatedBy, oldName, newName) => {
            if (hodlId === this.hodlId) {
                this.emit('nameUpdated', {
                    updatedBy,
                    oldName: ethers.utils.parseBytes32String(oldName),
                    newName: ethers.utils.parseBytes32String(newName)
                });
            }
        });
        
        this.contract.on("HodlSpendLimitUpdated", (hodlId, updatedBy, oldLimit, newLimit) => {
            if (hodlId === this.hodlId) {
                this.emit('limitUpdated', {
                    updatedBy,
                    oldLimit: weiToDollar(oldLimit),
                    newLimit: weiToDollar(newLimit)
                });
            }
        });
    }
    
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    stopWatching() {
        this.contract.removeAllListeners();
    }
}
```

## State Management Integration

### Redux Integration
```javascript
// Action creators
const hodlActions = {
    loadHodl: (hodlId) => async (dispatch) => {
        dispatch({ type: 'HODL_LOADING', hodlId });
        try {
            const hodlData = await getCompleteHodlInfo(hodlId);
            dispatch({ type: 'HODL_LOADED', hodlId, data: hodlData });
        } catch (error) {
            dispatch({ type: 'HODL_ERROR', hodlId, error: error.message });
        }
    },
    
    updateVanityName: (hodlId, newName) => async (dispatch, getState) => {
        try {
            const tx = await contract.setHodlVanityName(
                hodlId, 
                ethers.utils.formatBytes32String(newName)
            );
            dispatch({ type: 'HODL_UPDATE_PENDING', hodlId, field: 'vanityName' });
            await tx.wait();
            dispatch({ type: 'HODL_UPDATE_SUCCESS', hodlId, field: 'vanityName', value: newName });
        } catch (error) {
            dispatch({ type: 'HODL_UPDATE_ERROR', hodlId, field: 'vanityName', error: error.message });
        }
    }
};

// Reducer
const hodlReducer = (state = {}, action) => {
    switch (action.type) {
        case 'HODL_LOADED':
            return {
                ...state,
                [action.hodlId]: {
                    ...action.data,
                    loading: false,
                    error: null
                }
            };
        case 'HODL_UPDATE_SUCCESS':
            return {
                ...state,
                [action.hodlId]: {
                    ...state[action.hodlId],
                    [action.field]: action.value,
                    updating: { ...state[action.hodlId].updating, [action.field]: false }
                }
            };
        // ... other cases
        default:
            return state;
    }
};
```

### React Hooks
```javascript
// Custom hook for hodl data
function useHodl(hodlId) {
    const [hodl, setHodl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        let mounted = true;
        
        async function loadHodl() {
            try {
                setLoading(true);
                const data = await getCompleteHodlInfo(hodlId);
                if (mounted) {
                    setHodl(data);
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    setError(err.message);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }
        
        if (hodlId) {
            loadHodl();
        }
        
        return () => { mounted = false; };
    }, [hodlId]);
    
    const updateVanityName = useCallback(async (newName) => {
        try {
            const tx = await contract.setHodlVanityName(
                hodlId,
                ethers.utils.formatBytes32String(newName)
            );
            await tx.wait();
            // Refresh hodl data
            const updatedData = await getCompleteHodlInfo(hodlId);
            setHodl(updatedData);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [hodlId]);
    
    const updateSpendLimit = useCallback(async (newLimit) => {
        try {
            const tx = await contract.setHodlSpendLimit(
                hodlId,
                dollarToWei(newLimit)
            );
            await tx.wait();
            const updatedData = await getCompleteHodlInfo(hodlId);
            setHodl(updatedData);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [hodlId]);
    
    return {
        hodl,
        loading,
        error,
        updateVanityName,
        updateSpendLimit
    };
}
```

## Performance Optimization

### Caching Strategy
```javascript
class HodlCache {
    constructor(ttl = 300000) { // 5 minutes
        this.cache = new Map();
        this.ttl = ttl;
    }
    
    async getHodl(hodlId) {
        const cached = this.cache.get(hodlId);
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            return cached.data;
        }
        
        const data = await getCompleteHodlInfo(hodlId);
        this.cache.set(hodlId, {
            data,
            timestamp: Date.now()
        });
        
        return data;
    }
    
    invalidate(hodlId) {
        this.cache.delete(hodlId);
    }
    
    clear() {
        this.cache.clear();
    }
}
```

### Pagination for Large Lists
```javascript
async function getPaginatedTransactions(hodlId, page = 0, limit = 10) {
    const allTransactions = await contract.listPendingTransactions(hodlId);
    const start = page * limit;
    const end = start + limit;
    
    return {
        transactions: allTransactions.slice(start, end),
        total: allTransactions.length,
        hasMore: end < allTransactions.length,
        page,
        limit
    };
}
```

## Security Considerations

### Input Validation
```javascript
function validateHodlId(hodlId) {
    if (!hodlId || hodlId.length !== 26) { // "0x" + 24 hex chars
        throw new Error("Invalid hodl ID format");
    }
    return hodlId;
}

function validateVanityName(name) {
    if (!name || name.length === 0) {
        throw new Error("Vanity name cannot be empty");
    }
    if (name.length > 32) {
        throw new Error("Vanity name too long (max 32 chars)");
    }
    return name;
}

function validateAmount(amount) {
    if (amount <= 0) {
        throw new Error("Amount must be positive");
    }
    if (amount > 1000000) { // $1M limit
        throw new Error("Amount too large");
    }
    return amount;
}
```

### Transaction Safety
```javascript
async function safeContractCall(contractMethod, ...args) {
    try {
        // Estimate gas first
        const gasEstimate = await contractMethod.estimateGas(...args);
        const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer
        
        // Execute with gas limit
        const tx = await contractMethod(...args, { gasLimit });
        
        // Wait for confirmation
        const receipt = await tx.wait(2); // 2 confirmations
        
        return receipt;
    } catch (error) {
        console.error("Contract call failed:", error);
        throw new Error(`Transaction failed: ${error.reason || error.message}`);
    }
}
```

## Testing Utilities

### Mock Data Generators
```javascript
function generateMockHodl(id = "0x000000000000000000000001") {
    return {
        id,
        users: [
            {
                userAddress: "0x1234567890123456789012345678901234567890",
                chainId: 101,
                trackedBalUsd: dollarToWei(1000),
                realDebtUsd: dollarToWei(500),
                heldUsd: dollarToWei(250)
            }
        ],
        vanityName: ethers.utils.formatBytes32String("Test Hodl"),
        spendLimit: dollarToWei(5000)
    };
}

function generateMockTransaction(hodlId, amount = 100) {
    return {
        hodlId,
        transaction: {
            amountUsd: dollarToWei(amount),
            shares: [{
                userAddress: "0x1234567890123456789012345678901234567890",
                percentageInBasisPoints: 10000
            }],
            originatingUser: "0x1234567890123456789012345678901234567890",
            createdAt: Math.floor(Date.now() / 1000)
        },
        userChainId: 101
    };
}
```

This technical reference should provide frontend developers with the detailed information needed for robust integration with the MasterTransactionManager contract.
