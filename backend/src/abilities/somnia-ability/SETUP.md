# Somnia Ability Setup Guide

## Overview

This Vincent Ability enables secure transaction execution on the Somnia testnet using Lit Protocol PKPs.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend/src/abilities/somnia-ability
npm install
```

### 2. Build the Ability

```bash
npm run build
```

This will compile TypeScript and create the `dist/` directory with the compiled JavaScript.

### 3. Deploy to IPFS (Optional)

To publish the ability to IPFS using Pinata:

```bash
# Ensure you have Pinata JWT in .env
pnpm nx action:deploy somnia-ability
```

### 4. Integration with Backend

The ability is automatically integrated in `backend/src/config/vincent.js` via the `getSomniaAbilityClient()` function.

## Using the Ability

### Via Utility Functions

The easiest way to use the Somnia ability is through the utility functions:

```javascript
import { transferSomniaNative, transferSomniaERC20, querySomniaBalance } from '../utils/somniaTransactions.js';

// Transfer native STT
const result = await transferSomniaNative({
  recipient: '0x...',
  amount: '0.001',
  userPkpAddress: userPkpAddress,
});

// Transfer ERC20 token
const erc20Result = await transferSomniaERC20({
  tokenAddress: '0x...',
  recipient: '0x...',
  amount: '100',
  userPkpAddress: userPkpAddress,
});

// Query balance
const balanceResult = await querySomniaBalance({
  address: '0x...',
});
```

### Via Ability Client Directly

```javascript
import { getSomniaAbilityClient } from '../config/vincent.js';

const client = await getSomniaAbilityClient();

// Note: The ability uses the EVM transaction signer pattern
// For direct ability usage, ensure the ability is properly built and deployed
```

## Network Configuration

Somnia testnet is configured in `backend/src/config/chains.js`:

- **Chain ID**: 23111
- **Native Currency**: STT
- **RPC URL**: `https://rpc-testnet.somnia.network` (or set `RPC_SOMNIA` env var)

## Troubleshooting

### Ability Not Found Error

If you see "Somnia ability not available", the system will automatically fallback to using the EVM transaction signer ability, which works the same way for basic transactions.

### Build Errors

If TypeScript compilation fails:
1. Ensure all dependencies are installed: `npm install`
2. Check that `@lit-protocol/vincent-ability-sdk` is available (may need to be added to root package.json)
3. Verify TypeScript version: `npx tsc --version`

### Lit Actions Context

The ability execution function runs in Lit Actions context. The current implementation uses a simplified signing approach. For production use, ensure the Lit Actions APIs are properly integrated according to the latest Vincent SDK documentation.

## Development

### Local Testing

1. Build the ability: `npm run build`
2. Use the utility functions which automatically handle the ability or fallback to EVM transaction signer

### Publishing to NPM

When ready to publish:

```bash
cd backend/src/abilities/somnia-ability
npm publish
```

Then update imports in `vincent.js` to use the published package:

```javascript
import { bundledVincentAbility as somniaBundledAbility } from '@ethonline/somnia-ability';
```
