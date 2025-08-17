# Load environment variables
include .env
export

# Default network settings (Sepolia testnet)
RPC_URL ?= https://sepolia.drpc.org
ACCOUNT ?= One

# Show deployment status
status:
	forge script script/Status.s.sol:StatusScript \
		--rpc-url $(RPC_URL) \
		-vvvv

# Deploy all contracts at once (recommended)
deploy-all:
	forge script script/DeployAll.s.sol:DeployAllScript \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		--retries 10 \
		--delay 10 \
		--account $(ACCOUNT) \
		-vvvv

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

.PHONY: status deploy-all deploy-storage deploy-mtm setup verify-deployment verify-storage verify-mtm build test clean reset
