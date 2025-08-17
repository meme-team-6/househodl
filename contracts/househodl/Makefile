# Load environment variables
include .env
export

# Default network settings (Sepolia testnet)
RPC_URL ?= https://sepolia.drpc.org
ACCOUNT ?= One

# Cross-chain deployment URLs
SEPOLIA_RPC = https://sepolia.drpc.org
POLYGON_AMOY_RPC = https://rpc-amoy.polygon.technology
POLYGON_RPC = https://polygon-rpc.com

# Show deployment status
status:
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
	@echo "Starting sequential deployment..."
	@echo "Step 1: Deploying StorageUnit..."
	$(MAKE) deploy-storage
	@echo "Step 2: Deploying MasterTransactionManager..."
	$(MAKE) deploy-mtm
	@echo "Step 3: Setting up contract connections..."
	$(MAKE) setup
	@echo "Deployment complete! Run 'make status' to verify."

# Deploy master contracts (StorageUnit + MasterTransactionManager) on Sepolia
deploy-master:
	@echo "Deploying master contracts on Sepolia..."
	@echo "Step 1: Deploying StorageUnit..."
	$(MAKE) deploy-storage RPC_URL=$(SEPOLIA_RPC)
	@echo "Step 2: Deploying MasterTransactionManager..."
	$(MAKE) deploy-mtm RPC_URL=$(SEPOLIA_RPC)
	@echo "Step 3: Setting up contract connections..."
	$(MAKE) setup RPC_URL=$(SEPOLIA_RPC)
	@echo "Master deployment complete!"

# Deploy satellite contracts
deploy-satellite:
	@if [ "$(RPC_URL)" = "$(SEPOLIA_RPC)" ]; then \
		echo "Error: Cannot deploy satellite on master chain (Sepolia)"; \
		exit 1; \
	fi
	@echo "Deploying satellite on $(RPC_URL)..."
	forge script script/Satellite.s.sol:SatelliteScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--retries 10 \
		--delay 10 \
		--account $(ACCOUNT) \
		-vvvv

# Deploy satellite on Polygon Amoy specifically
deploy-satellite-polygon-amoy:
	$(MAKE) deploy-satellite RPC_URL=$(POLYGON_AMOY_RPC)

# Full cross-chain deployment (master + satellites)
deploy-cross-chain:
	@echo "=== Full Cross-Chain Deployment ==="
	@echo "Step 1: Deploy master contracts on Sepolia"
	$(MAKE) deploy-master
	@echo "Step 2: Deploy satellite on Polygon Amoy"
	$(MAKE) deploy-satellite-polygon-amoy
	@echo "Step 3: Setup cross-chain connections"
	$(MAKE) setup-cross-chain
	@echo "=== Cross-chain deployment complete! ==="

# Setup cross-chain peer connections
setup-cross-chain:
	@echo "Setting up cross-chain peer connections..."
	@echo "Configuring master (Sepolia)..."
	forge script script/SetupCrossChain.s.sol:SetupCrossChainScript \
		--rpc-url $(SEPOLIA_RPC) \
		--broadcast \
		--account $(ACCOUNT) \
		-vvvv
	@echo "Configuring satellite (Polygon Amoy)..."
	forge script script/SetupCrossChain.s.sol:SetupCrossChainScript \
		--rpc-url $(POLYGON_AMOY_RPC) \
		--broadcast \
		--account $(ACCOUNT) \
		-vvvv
	@echo "Cross-chain setup complete!"

# Deploy AaveMultiTokenManager only
deploy-aave:
	forge script script/AaveMultiTokenManager.s.sol:AaveMultiTokenManagerScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--retries 10 \
		--delay 10 \
		--account $(ACCOUNT) \
		-vvvv

# Deploy AaveMultiTokenManager on Sepolia specifically  
deploy-aave-sepolia:
	$(MAKE) deploy-aave RPC_URL=$(SEPOLIA_RPC)

# Deploy AaveMultiTokenManager on Polygon Amoy specifically
deploy-aave-polygon-amoy:
	$(MAKE) deploy-aave RPC_URL=$(POLYGON_AMOY_RPC)

# Deploy StorageUnit only
deploy-storage:
	forge script script/StorageUnit.s.sol:StorageUnitScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--retries 10 \
		--delay 10 \
		--account $(ACCOUNT) \
		-vvvv

# Deploy MasterTransactionManager only (requires StorageUnit to be deployed first)
deploy-mtm:
	forge script script/MasterTransactionManager.s.sol:MasterTransactionManagerScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--retries 10 \
		--delay 10 \
		--account $(ACCOUNT) \
		-vvvv

# Setup contracts connection (requires both contracts to be deployed)
setup:
	forge script script/SetupContracts.s.sol:SetupContractsScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--account $(ACCOUNT) \
		-vvvv

# Verify deployment (requires both addresses to be deployed)
verify-deployment:
	forge script script/VerifyDeployment.s.sol:VerifyDeploymentScript \
		--rpc-url $(RPC_URL) \
		-vvvv

# Build contracts
build:
	forge build

# Run tests
test:
	forge test -vvvv

# Clean build artifacts
clean:
	forge clean

# Manual verification commands (use if automatic verification fails)
verify-storage:
	@echo "Manually verifying StorageUnit..."
	@STORAGE_ADDRESS=$$(forge script script/Status.s.sol:StatusScript --rpc-url $(RPC_URL) 2>/dev/null | grep "StorageUnit:" | awk '{print $$2}'); \
	if [ "$$STORAGE_ADDRESS" != "0x0000000000000000000000000000000000000000" ]; then \
		forge verify-contract $$STORAGE_ADDRESS src/StorageUnit.sol:StorageUnit \
			--etherscan-api-key $(ETHERSCAN_API_KEY) \
			--constructor-args $$(cast abi-encode "constructor(address)" "$(CONTRACT_OWNER)") \
			--retries 10 \
			--delay 10; \
	else \
		echo "StorageUnit not deployed yet"; \
	fi

verify-mtm:
	@echo "Manually verifying MasterTransactionManager..."
	@STORAGE_ADDRESS=$$(forge script script/Status.s.sol:StatusScript --rpc-url $(RPC_URL) 2>/dev/null | grep "StorageUnit:" | awk '{print $$2}'); \
	MTM_ADDRESS=$$(forge script script/Status.s.sol:StatusScript --rpc-url $(RPC_URL) 2>/dev/null | grep "MasterTransactionManager:" | awk '{print $$2}'); \
	if [ "$$MTM_ADDRESS" != "0x0000000000000000000000000000000000000000" ] && [ "$$STORAGE_ADDRESS" != "0x0000000000000000000000000000000000000000" ]; then \
		forge verify-contract $$MTM_ADDRESS src/MasterTransactionManager.sol:MasterTransactionManager \
			--etherscan-api-key $(ETHERSCAN_API_KEY) \
			--constructor-args $$(cast abi-encode "constructor(address,address,address)" "0x6EDCE65403992e310A62460808c4b910D972f10f" "$(CONTRACT_OWNER)" "$$STORAGE_ADDRESS") \
			--retries 10 \
			--delay 10; \
	else \
		echo "MasterTransactionManager or StorageUnit not deployed yet"; \
	fi

# Reset deployment state (delete deployment files)
reset:
	rm -rf ./deployments/
	@echo "Deployment state reset. Next deployment will be fresh."

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

# Show help for cross-chain commands
help-cross-chain:
	@echo "Cross-Chain Deployment Commands:"
	@echo "  deploy-cross-chain          - Full deployment (master + satellites + setup)"
	@echo "  deploy-master              - Deploy master contracts on Sepolia"
	@echo "  deploy-satellite           - Deploy satellite on specified RPC_URL"
	@echo "  deploy-satellite-polygon-amoy - Deploy satellite on Polygon Amoy"
	@echo "  deploy-aave                - Deploy AaveMultiTokenManager on specified RPC_URL"
	@echo "  deploy-aave-sepolia        - Deploy AaveMultiTokenManager on Sepolia"
	@echo "  deploy-aave-polygon-amoy   - Deploy AaveMultiTokenManager on Polygon Amoy"
	@echo "  setup-cross-chain          - Setup peer connections between chains"
	@echo "  cross-chain-status         - Show deployment status across all chains"
	@echo "  reset-cross-chain          - Reset cross-chain deployment files"
	@echo ""
	@echo "Aave Deployment Commands:"
	@echo "  deploy-aave                - Deploy AaveMultiTokenManager on specified RPC_URL"
	@echo "  deploy-aave-sepolia        - Deploy AaveMultiTokenManager on Sepolia"
	@echo "  deploy-aave-polygon-amoy   - Deploy AaveMultiTokenManager on Polygon Amoy"
	@echo ""
	@echo "Examples:"
	@echo "  make deploy-cross-chain                    # Deploy everything"
	@echo "  make deploy-satellite RPC_URL=<custom>    # Deploy satellite on custom RPC"
	@echo "  make deploy-aave-sepolia                   # Deploy AAVE manager on Sepolia"
	@echo "  make cross-chain-status                    # Check deployment status"

.PHONY: status deploy-all deploy-master deploy-satellite deploy-satellite-polygon-amoy deploy-cross-chain setup-cross-chain cross-chain-status deploy-aave deploy-aave-sepolia deploy-aave-polygon-amoy deploy-storage deploy-mtm setup verify-deployment verify-storage verify-mtm build test clean reset reset-cross-chain test-cross-chain help-cross-chain
