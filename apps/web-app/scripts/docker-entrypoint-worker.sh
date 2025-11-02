#!/bin/sh
set -e

# Create .env.sepolia file in the contract package directory from environment variables
CONTRACT_PACKAGE_PATH=${CONTRACT_PACKAGE_PATH:-/app/packages/token-smart-contract}
ENV_FILE="${CONTRACT_PACKAGE_PATH}/.env.sepolia"

echo "Creating ${ENV_FILE} from environment variables..."

# Create the .env.sepolia file with required Hardhat environment variables
cat > "${ENV_FILE}" << EOF
CHAIN_RPC_URL=${CHAIN_RPC_URL}
ACCOUNT_PRIVATE_KEY=${ACCOUNT_PRIVATE_KEY}
ETHERSCAN_API_KEY=${ETHERSCAN_API_KEY}
EOF

echo "Created ${ENV_FILE}"
echo "Starting worker..."

# Execute the worker command
exec "$@"

