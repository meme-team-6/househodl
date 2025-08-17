# Load environment variables
include .env
export

# Default network settings (Sepolia testnet)
CHAIN ?= sepolia
ACCOUNT ?= One

# Set RPC_URL based on CHAIN parameter
ifeq ($(CHAIN),sepolia)
    RPC_URL = https://sepolia.drpc.org
else ifeq ($(CHAIN),polygon-amoy)
    RPC_URL = https://rpc-amoy.polygon.technology
else ifeq ($(CHAIN),polygon)
    RPC_URL = https://polygon-rpc.com
else
    $(error Unknown chain: $(CHAIN). Supported chains: sepolia, polygon-amoy, polygon)
endif

# Legacy chain URLs (kept for backward compatibility)
SEPOLIA_RPC = https://sepolia.drpc.org
POLYGON_AMOY_RPC = https://rpc-amoy.polygon.technology
POLYGON_RPC = https://polygon-rpc.com

# Show deployment status for specified chain
status:
	@echo "Checking status on $(CHAIN) ($(RPC_URL))..."
	forge script script/Status.s.sol:StatusScript \
		--rpc-url $(RPC_URL) \
		-vvvv

# Show cross-chain deployment status
cross-chain-status:
	@echo "Cross-chain deployment status..."
	forge script script/CrossChainDeploy.s.sol:CrossChainDeployScript \
		--rpc-url $(SEPOLIA_RPC) \
		-vvvv

# Deploy all contracts at once (recommended for single chain)
deploy-all:
	@echo "Starting sequential deployment on $(CHAIN) ($(RPC_URL))..."
	@echo "Step 1: Deploying StorageUnit..."
	$(MAKE) deploy-storage CHAIN=$(CHAIN)
	@echo "Step 2: Deploying MasterTransactionManager..."
	$(MAKE) deploy-mtm CHAIN=$(CHAIN)
	@echo "Step 3: Setting up contract connections..."
	$(MAKE) setup CHAIN=$(CHAIN)
	@echo "Deployment complete! Run 'make status CHAIN=$(CHAIN)' to verify."

# Deploy master contracts (StorageUnit + MasterTransactionManager)
deploy-master:
	@echo "Deploying master contracts on $(CHAIN) ($(RPC_URL))..."
	@echo "Step 1: Deploying StorageUnit..."
	$(MAKE) deploy-storage CHAIN=$(CHAIN)
	@echo "Step 2: Deploying MasterTransactionManager..."
	$(MAKE) deploy-mtm CHAIN=$(CHAIN)
	@echo "Step 3: Setting up contract connections..."
	$(MAKE) setup CHAIN=$(CHAIN)
	@echo "Master deployment complete!"

# Deploy satellite contracts
deploy-satellite:
	@echo "Deploying satellite on $(CHAIN) ($(RPC_URL))..."
	forge script script/Satellite.s.sol:SatelliteScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--retries 15 \
		--delay 10 \
		--account $(ACCOUNT) \
		-vvvv

# Full cross-chain deployment (master + satellites)
deploy-cross-chain:
	@echo "=== Full Cross-Chain Deployment ==="
	@echo "Step 1: Deploy master contracts on Sepolia"
	$(MAKE) deploy-master CHAIN=sepolia
	@echo "Step 2: Deploy satellite also on Sepolia"
	$(MAKE) deploy-satellite CHAIN=sepolia
	@echo "Step 3: Setup cross-chain connections"
	$(MAKE) setup-cross-chain
	@echo "=== Cross-chain deployment complete! ==="

# Setup cross-chain peer connections
setup-cross-chain:
	@echo "Setting up cross-chain peer connections..."
	@echo "Configuring master && satellite (Sepolia)..."
	forge script script/SetupCrossChain.s.sol:SetupCrossChainScript \
		--rpc-url $(SEPOLIA_RPC) \
		--broadcast \
		--account $(ACCOUNT) \
		-vvvv
	@echo "Cross-chain setup complete!"

# Deploy AaveMultiTokenManager
deploy-aave:
	@echo "Deploying AaveMultiTokenManager on $(CHAIN) ($(RPC_URL))..."
	forge script script/AaveMultiTokenManager.s.sol:AaveMultiTokenManagerScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--retries 15 \
		--delay 10 \
		--account $(ACCOUNT) \
		-vvvv

# Deploy StorageUnit
deploy-storage:
	@echo "Deploying StorageUnit on $(CHAIN) ($(RPC_URL))..."
	forge script script/StorageUnit.s.sol:StorageUnitScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--retries 15 \
		--delay 10 \
		--account $(ACCOUNT) \
		-vvvv

# Deploy MasterTransactionManager (requires StorageUnit to be deployed first)
deploy-mtm:
	@echo "Deploying MasterTransactionManager on $(CHAIN) ($(RPC_URL))..."
	forge script script/MasterTransactionManager.s.sol:MasterTransactionManagerScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--retries 15 \
		--delay 10 \
		--account $(ACCOUNT) \
		-vvvv

# Setup contracts connection (requires both contracts to be deployed)
setup:
	@echo "Setting up contract connections on $(CHAIN) ($(RPC_URL))..."
	forge script script/SetupContracts.s.sol:SetupContractsScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--account $(ACCOUNT) \
		-vvvv

# Verify deployment (requires both addresses to be deployed)
verify-deployment:
	@echo "Verifying deployment on $(CHAIN) ($(RPC_URL))..."
	forge script script/VerifyDeployment.s.sol:VerifyDeploymentScript \
		--rpc-url $(RPC_URL) \
		-vvvv

# Build contracts
build:
	forge build --optimize --optimizer-runs 2000

# Run tests
test:
	forge test -vvvv

# Clean build artifacts
clean:
	forge clean

# Manual verification commands (use if automatic verification fails)
verify-storage:
	@echo "Manually verifying StorageUnit on $(CHAIN) ($(RPC_URL))..."
	@STORAGE_ADDRESS=$$(forge script script/Status.s.sol:StatusScript --rpc-url $(RPC_URL) 2>/dev/null | grep "StorageUnit:" | awk '{print $$2}'); \
	if [ "$$STORAGE_ADDRESS" != "0x0000000000000000000000000000000000000000" ]; then \
		forge verify-contract $$STORAGE_ADDRESS src/StorageUnit.sol:StorageUnit \
			--etherscan-api-key $(ETHERSCAN_API_KEY) \
			--constructor-args $$(cast abi-encode "constructor(address)" "$(CONTRACT_OWNER)") \
			--retries 15 \
			--delay 10; \
	else \
		echo "StorageUnit not deployed yet"; \
	fi

verify-mtm:
	@echo "Manually verifying MasterTransactionManager on $(CHAIN) ($(RPC_URL))..."
	@STORAGE_ADDRESS=$$(forge script script/Status.s.sol:StatusScript --rpc-url $(RPC_URL) 2>/dev/null | grep "StorageUnit:" | awk '{print $$2}'); \
	MTM_ADDRESS=$$(forge script script/Status.s.sol:StatusScript --rpc-url $(RPC_URL) 2>/dev/null | grep "MasterTransactionManager:" | awk '{print $$2}'); \
	if [ "$$MTM_ADDRESS" != "0x0000000000000000000000000000000000000000" ] && [ "$$STORAGE_ADDRESS" != "0x0000000000000000000000000000000000000000" ]; then \
		forge verify-contract $$MTM_ADDRESS src/MasterTransactionManager.sol:MasterTransactionManager \
			--etherscan-api-key $(ETHERSCAN_API_KEY) \
			--constructor-args $$(cast abi-encode "constructor(address,address,address)" "0x6EDCE65403992e310A62460808c4b910D972f10f" "$(CONTRACT_OWNER)" "$$STORAGE_ADDRESS") \
			--retries 15 \
			--delay 10; \
	else \
		echo "MasterTransactionManager or StorageUnit not deployed yet"; \
	fi

# Reset deployment state (delete deployment files for specific chain or all)
reset:
ifdef CHAIN
	@if [ "$(CHAIN)" = "polygon-amoy" ]; then \
		rm -f ./deployments/polygon_amoy_*.txt; \
		echo "Deployment state reset for $(CHAIN)."; \
	elif [ "$(CHAIN)" = "sepolia" ]; then \
		rm -f ./deployments/sepolia_*.txt; \
		echo "Deployment state reset for $(CHAIN)."; \
	elif [ "$(CHAIN)" = "polygon" ]; then \
		rm -f ./deployments/polygon_*.txt; \
		echo "Deployment state reset for $(CHAIN)."; \
	else \
		echo "Unknown chain: $(CHAIN)"; \
		exit 1; \
	fi
else
	rm -rf ./deployments/
	@echo "All deployment state reset. Next deployment will be fresh."
endif

# Reset only cross-chain deployment state
reset-cross-chain:
	rm -f ./deployments/polygon_amoy_*.txt
	rm -f ./deployments/sepolia_*.txt
	@echo "Cross-chain deployment state reset."

# Test cross-chain connection (requires deployed contracts)
test-cross-chain:
	@echo "Testing cross-chain connection..."
	@echo "This would test sending a message from satellite to master"
	@echo "Implementation depends on your specific testing requirements"

# Show help for deployment commands
help:
	@echo "HouseHodl Smart Contract Deployment Commands"
	@echo ""
	@echo "Chain Selection:"
	@echo "  All commands accept CHAIN parameter to specify target chain:"
	@echo "  - sepolia (default)"
	@echo "  - polygon-amoy"
	@echo "  - polygon"
	@echo ""
	@echo "Basic Deployment Commands:"
	@echo "  deploy-all                 - Full deployment (recommended for single chain)"
	@echo "  deploy-storage             - Deploy StorageUnit only"
	@echo "  deploy-mtm                 - Deploy MasterTransactionManager only"
	@echo "  deploy-aave                - Deploy AaveMultiTokenManager only"
	@echo "  deploy-satellite           - Deploy satellite contracts"
	@echo "  setup                      - Setup contract connections"
	@echo ""
	@echo "Cross-Chain Deployment Commands:"
	@echo "  deploy-cross-chain         - Full cross-chain deployment (master + satellites + setup)"
	@echo "  deploy-master              - Deploy master contracts (defaults to Sepolia)"
	@echo "  setup-cross-chain          - Setup peer connections between chains"
	@echo "  cross-chain-status         - Show deployment status across all chains"
	@echo ""
	@echo "Utility Commands:"
	@echo "  status                     - Show deployment status for specified chain"
	@echo "  verify-deployment          - Verify deployment"
	@echo "  verify-storage             - Manually verify StorageUnit"
	@echo "  verify-mtm                 - Manually verify MasterTransactionManager"
	@echo "  reset                      - Reset deployment files (specify CHAIN for single chain)"
	@echo "  reset-cross-chain          - Reset cross-chain deployment files"
	@echo "  build                      - Build contracts"
	@echo "  test                       - Run tests"
	@echo "  clean                      - Clean build artifacts"
	@echo ""
	@echo "Examples:"
	@echo "  make deploy-all                        # Deploy on Sepolia (default)"
	@echo "  make deploy-all CHAIN=polygon-amoy     # Deploy on Polygon Amoy"
	@echo "  make deploy-aave CHAIN=polygon         # Deploy AAVE manager on Polygon"
	@echo "  make status CHAIN=sepolia              # Check status on Sepolia"
	@echo "  make reset CHAIN=polygon-amoy          # Reset deployment for Polygon Amoy"
	@echo "  make deploy-cross-chain                # Deploy across all supported chains"

.PHONY: status deploy-all deploy-master deploy-satellite deploy-cross-chain setup-cross-chain cross-chain-status deploy-aave deploy-storage deploy-mtm setup verify-deployment verify-storage verify-mtm build test clean reset reset-cross-chain test-cross-chain help
