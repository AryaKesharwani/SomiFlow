# Somnia Testnet Vincent Ability

A Vincent Ability for executing transactions on the Somnia testnet using Lit Protocol PKPs.

## Features

- ✅ Native STT token transfers
- ✅ ERC20 token transfers
- ✅ Balance queries
- ✅ Transaction validation and error handling
- ✅ Secure PKP-based signing via Lit Protocol

## Installation

```bash
npm install @ethonline/somnia-ability
```

## Usage

### With Vincent SDK

```typescript
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';
import { bundledVincentAbility } from '@ethonline/somnia-ability';
import { ethers } from 'ethers';

// Get ability client
const client = getVincentAbilityClient({
  bundledVincentAbility,
  ethersSigner: yourSigner,
});

// Transfer native STT
const result = await client.execute(
  {
    operation: 'transfer_native',
    recipient: '0x...',
    amount: '0.001',
    rpcUrl: 'https://rpc-testnet.somnia.network', // optional
  },
  {
    delegatorPkpEthAddress: userPkpAddress,
  }
);

// Transfer ERC20 token
const erc20Result = await client.execute(
  {
    operation: 'transfer_erc20',
    tokenAddress: '0x...',
    recipient: '0x...',
    amount: '100',
  },
  {
    delegatorPkpEthAddress: userPkpAddress,
  }
);

// Query balance
const balanceResult = await client.execute(
  {
    operation: 'query_balance',
    queryAddress: '0x...',
  },
  {
    delegatorPkpEthAddress: userPkpAddress,
  }
);
```

## Operations

### `transfer_native`

Transfer native STT tokens on Somnia testnet.

**Parameters:**
- `operation`: `'transfer_native'`
- `recipient`: Recipient address (required)
- `amount`: Amount in STT (e.g., "0.001") (required)
- `rpcUrl`: Optional RPC URL (defaults to Somnia testnet)

### `transfer_erc20`

Transfer ERC20 tokens on Somnia testnet.

**Parameters:**
- `operation`: `'transfer_erc20'`
- `tokenAddress`: ERC20 token contract address (required)
- `recipient`: Recipient address (required)
- `amount`: Amount in token units (required)
- `rpcUrl`: Optional RPC URL

### `query_balance`

Query native STT balance for an address.

**Parameters:**
- `operation`: `'query_balance'`
- `queryAddress`: Address to query (required)
- `rpcUrl`: Optional RPC URL

## Network Details

- **Chain ID**: 23111
- **Native Currency**: STT (Somnia Test Token)
- **RPC URL**: `https://rpc-testnet.somnia.network`

## Security

This ability uses Lit Protocol PKPs (Programmable Key Pairs) for secure transaction signing:
- No private keys stored or exposed
- Decentralized threshold signing
- Policy-based access control

## License

MIT
