/**
 * Somnia Testnet Vincent Ability Implementation
 * 
 * Provides secure transaction execution on Somnia testnet using Vincent SDK.
 */

import { createVincentAbility } from '@lit-protocol/vincent-ability-sdk';
import { ethers } from 'ethers';

// Somnia Testnet Configuration
const SOMNIA_CHAIN_ID = 23111;
const SOMNIA_RPC_URL = process.env.RPC_SOMNIA || 'https://rpc-testnet.somnia.network';

/**
 * Parameters for Somnia ability operations
 */
export interface SomniaAbilityParams {
  /**
   * Operation type: 'transfer_native' | 'transfer_erc20' | 'query_balance'
   */
  operation: 'transfer_native' | 'transfer_erc20' | 'query_balance';
  
  /**
   * RPC URL for Somnia testnet (optional, uses default if not provided)
   */
  rpcUrl?: string;
  
  /**
   * For transfer operations: recipient address
   */
  recipient?: string;
  
  /**
   * For transfer operations: amount in native token units (e.g., "0.001")
   */
  amount?: string;
  
  /**
   * For ERC20 transfers: token contract address
   */
  tokenAddress?: string;
  
  /**
   * For balance queries: address to query
   */
  queryAddress?: string;
}

/**
 * Result returned by the ability
 */
export interface SomniaAbilityResult {
  success: boolean;
  txHash?: string;
  balance?: string;
  error?: string;
  blockNumber?: number;
  gasUsed?: string;
}

/**
 * Vincent Ability for Somnia Testnet
 */
export const vincentAbility = createVincentAbility({
  packageName: '@ethonline/somnia-ability',
  abilityDescription: 'Execute transactions on Somnia testnet including native STT transfers, ERC20 transfers, and balance queries',

  /**
   * Precheck - runs locally to validate the transaction before execution
   */
  precheck: async ({ abilityParams }: { abilityParams: SomniaAbilityParams }, { fail, succeed }) => {
    try {
      const params = abilityParams as SomniaAbilityParams;
      const rpcUrl = params.rpcUrl || SOMNIA_RPC_URL;

      // Validate operation type
      if (!params.operation) {
        return fail({ error: 'Operation type is required' });
      }

      // Validate chain ID matches Somnia testnet
      if (params.rpcUrl) {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const network = await provider.getNetwork();
        if (network.chainId !== SOMNIA_CHAIN_ID) {
          return fail({ error: `Chain ID mismatch. Expected ${SOMNIA_CHAIN_ID} (Somnia testnet), got ${network.chainId}` });
        }
      }

      // Validate transfer operations
      if (params.operation === 'transfer_native' || params.operation === 'transfer_erc20') {
        if (!params.recipient) {
          return fail({ error: 'Recipient address is required for transfer operations' });
        }

        if (!ethers.utils.isAddress(params.recipient)) {
          return fail({ error: `Invalid recipient address: ${params.recipient}` });
        }

        if (!params.amount || parseFloat(params.amount) <= 0) {
          return fail({ error: 'Amount must be greater than 0' });
        }
      }

      // Validate ERC20 specific params
      if (params.operation === 'transfer_erc20') {
        if (!params.tokenAddress) {
          return fail({ error: 'Token address is required for ERC20 transfers' });
        }

        if (!ethers.utils.isAddress(params.tokenAddress)) {
          return fail({ error: `Invalid token address: ${params.tokenAddress}` });
        }
      }

      // Validate balance query
      if (params.operation === 'query_balance') {
        if (!params.queryAddress) {
          return fail({ error: 'Query address is required for balance queries' });
        }

        if (!ethers.utils.isAddress(params.queryAddress)) {
          return fail({ error: `Invalid query address: ${params.queryAddress}` });
        }
      }

      return succeed({ validated: true });
    } catch (error: any) {
      return fail({ error: error.message || 'Precheck validation failed' });
    }
  },

  /**
   * Execute - runs in Lit Action environment with access to PKP signing
   */
  execute: async ({ abilityParams }: { abilityParams: SomniaAbilityParams }, { fail, succeed }) => {
    try {
      const params = abilityParams as SomniaAbilityParams;
      const rpcUrl = params.rpcUrl || SOMNIA_RPC_URL;

      // Get PKP address from context (provided by Vincent SDK)
      const pkpAddress = (globalThis as any).pkpPublicKey 
        ? ethers.utils.computeAddress((globalThis as any).pkpPublicKey) 
        : (globalThis as any).pkpEthAddress;

      if (!pkpAddress) {
        return fail({ error: 'PKP address not available in execution context' });
      }

      // Create provider for Somnia testnet
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      
      // Get signer from Lit Actions context
      // In Lit Actions, we use the PKP to sign transactions
      const signer = new ethers.Wallet(
        (globalThis as any).litActionCode,
        provider
      );

      switch (params.operation) {
        case 'transfer_native': {
          if (!params.recipient || !params.amount) {
            return fail({ error: 'Recipient and amount are required for native transfers' });
          }

          // Check balance
          const balance = await provider.getBalance(pkpAddress);
          const amountWei = ethers.utils.parseEther(params.amount);
          
          if (balance.lt(amountWei)) {
            return fail({ error: `Insufficient balance. Required: ${params.amount} STT, Available: ${ethers.utils.formatEther(balance)} STT` });
          }

          // Estimate gas
          const gasLimit = await provider.estimateGas({
            from: pkpAddress,
            to: params.recipient,
            value: amountWei,
          });

          // Get gas price
          const feeData = await provider.getFeeData();
          const gasPrice = feeData.gasPrice || ethers.BigNumber.from('20000000000'); // 20 gwei default

          // Build transaction
          const nonce = await provider.getTransactionCount(pkpAddress, 'pending');
          const transaction = {
            to: params.recipient,
            value: amountWei,
            gasLimit,
            gasPrice,
            nonce,
            chainId: SOMNIA_CHAIN_ID,
          };

          // Sign and send transaction
          // Note: In actual Lit Actions, we use the PKP signing mechanism
          // This is a simplified version - the actual implementation would use Lit's signing
          const signedTx = await signer.signTransaction(transaction);
          const txResponse = await provider.sendTransaction(signedTx);
          
          // Wait for confirmation
          const receipt = await txResponse.wait(1);

          return succeed({
            success: true,
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
          });
        }

        case 'transfer_erc20': {
          if (!params.tokenAddress || !params.recipient || !params.amount) {
            return fail({ error: 'Token address, recipient, and amount are required for ERC20 transfers' });
          }

          // ERC20 ABI
          const erc20Abi = [
            'function transfer(address to, uint256 amount) returns (bool)',
            'function decimals() view returns (uint8)',
            'function balanceOf(address owner) view returns (uint256)',
          ];

          const tokenContract = new ethers.Contract(params.tokenAddress, erc20Abi, provider);

          // Get token decimals
          const decimals = await tokenContract.decimals();
          const amountWei = ethers.utils.parseUnits(params.amount, decimals);

          // Check balance
          const balance = await tokenContract.balanceOf(pkpAddress);
          if (balance.lt(amountWei)) {
            return fail({ error: `Insufficient token balance` });
          }

          // Create transaction
          const nonce = await provider.getTransactionCount(pkpAddress, 'pending');
          const tx = await tokenContract.populateTransaction.transfer(params.recipient, amountWei);
          
          const gasLimit = await provider.estimateGas({
            from: pkpAddress,
            to: params.tokenAddress,
            data: tx.data,
          });

          const feeData = await provider.getFeeData();
          const gasPrice = feeData.gasPrice || ethers.BigNumber.from('20000000000');

          const transaction = {
            to: params.tokenAddress,
            data: tx.data,
            gasLimit,
            gasPrice,
            nonce,
            chainId: SOMNIA_CHAIN_ID,
          };

          const signedTx = await signer.signTransaction(transaction);
          const txResponse = await provider.sendTransaction(signedTx);
          const receipt = await txResponse.wait(1);

          return succeed({
            success: true,
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
          });
        }

        case 'query_balance': {
          if (!params.queryAddress) {
            return fail({ error: 'Query address is required' });
          }

          // Query native balance
          const balance = await provider.getBalance(params.queryAddress);
          const balanceFormatted = ethers.utils.formatEther(balance);

          return succeed({
            success: true,
            balance: balanceFormatted,
          });
        }

        default:
          return fail({ error: `Unknown operation: ${params.operation}` });
      }
    } catch (error: any) {
      return fail({ error: error.message || 'Execution failed' });
    }
  },
});

// Export bundled ability for use with Vincent SDK
export const bundledVincentAbility = vincentAbility;
