/**
 * Somnia Testnet Transaction Utility
 * 
 * Provides functions to interact with Somnia testnet using Vincent SDK
 * for execution on behalf of users.
 */

import { ethers } from 'ethers';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';
import { bundledVincentAbility as evmTxSignerAbility } from '@lit-protocol/vincent-ability-evm-transaction-signer';
import { getDelegateeSigner, getSomniaAbilityClient } from '../config/vincent.js';
import { getChainConfig } from '../config/chains.js';

/**
 * Transfer Native STT on Somnia Testnet
 * 
 * @param {Object} params - Transfer parameters
 * @param {string} params.recipient - Recipient address
 * @param {string} params.amount - Amount of STT to transfer (in STT, e.g., "0.001")
 * @param {string} params.userPkpAddress - User's PKP wallet address
 * @returns {Promise<Object>} - { success: boolean, txHash?: string, error?: string }
 */
export async function transferSomniaNative({ recipient, amount, userPkpAddress }) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`\n🔄 Retry attempt ${attempt}/${maxRetries} for native STT transfer...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('🔄 Transferring Native STT on Somnia Testnet...');
      console.log(`   From: ${userPkpAddress}`);
      console.log(`   To: ${recipient}`);
      console.log(`   Amount: ${amount} STT`);

      // Validate recipient address
      if (!ethers.utils.isAddress(recipient)) {
        throw new Error(`Invalid recipient address: ${recipient}`);
      }

      // Get Somnia chain configuration
      const chain = getChainConfig('somnia');
      const rpcUrl = chain.rpcUrl;

      // Create provider
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // Parse amount to wei
      const amountWei = ethers.utils.parseEther(amount);

      // Get current nonce
      const nonce = await provider.getTransactionCount(userPkpAddress, 'pending');
      console.log(`   Current nonce: ${nonce}`);

      // Estimate gas for simple STT transfer
      const gasLimit = await provider.estimateGas({
        from: userPkpAddress,
        to: recipient,
        value: amountWei,
      });

      // Get gas price (with 10% buffer)
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice.mul(110).div(100); // 10% buffer

      // Build transaction
      const transaction = {
        to: recipient,
        value: amountWei.toHexString(),
        data: '0x', // Empty data for simple transfer
        chainId: chain.chainId,
        nonce: nonce,
        gasLimit: gasLimit.toHexString(),
        gasPrice: gasPrice.toHexString(),
      };

      console.log('   Transaction built:', {
        to: transaction.to,
        value: transaction.value,
        nonce: transaction.nonce,
        gasLimit: transaction.gasLimit,
        chainId: transaction.chainId,
      });

      // Serialize transaction
      const serializedTx = ethers.utils.serializeTransaction(transaction);

      // Try to use Somnia ability if available, otherwise fallback to EVM transaction signer
      let evmTxClient;
      try {
        const somniaClient = await getSomniaAbilityClient();
        // Use Somnia-specific ability if available
        evmTxClient = somniaClient;
      } catch (error) {
        console.log('   Using EVM transaction signer ability...');
        // Fallback to EVM transaction signer
        const signer = getDelegateeSigner();
        evmTxClient = getVincentAbilityClient({
          bundledVincentAbility: evmTxSignerAbility,
          ethersSigner: signer,
        });
      }

      // Execute transaction via Vincent
      console.log('   Executing transfer transaction...');
      const result = await evmTxClient.execute(
        {
          serializedTransaction: serializedTx,
        },
        {
          delegatorPkpEthAddress: userPkpAddress,
        }
      );

      if (!result.success) {
        throw new Error(result.runtimeError || 'Transaction failed');
      }

      // Extract the signed transaction
      const signedTx = result.result?.signedTransaction;
      const txHash = result.result?.deserializedSignedTransaction?.hash;

      if (!signedTx) {
        throw new Error('No signed transaction returned from Vincent');
      }

      console.log('✅ Transaction signed successfully!');
      console.log(`   Tx Hash (computed): ${txHash}`);
      console.log(`   Broadcasting transaction to Somnia testnet...`);

      // Broadcast the signed transaction to the network
      const txResponse = await provider.sendTransaction(signedTx);
      console.log(`   ✓ Transaction broadcasted: ${txResponse.hash}`);
      console.log(`   Waiting for confirmation...`);

      // Wait for the transaction to be mined
      const receipt = await txResponse.wait(1); // Wait for 1 confirmation
      console.log(`   ✓ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

      console.log('✅ Native STT transferred successfully on Somnia testnet!');

      return {
        success: true,
        txHash: receipt.transactionHash,
        amount: amount,
        recipient: recipient,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        chain: 'somnia',
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Transfer STT attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message);
      
      const isNonceError = error.code === 'NONCE_EXPIRED' || 
                          error.message?.includes('nonce too low') ||
                          error.message?.includes('nonce has already been used');
      
      if (isNonceError) {
        console.log(`   ⚠️  Nonce error detected, will fetch fresh nonce on retry`);
      }
      
      if (attempt < maxRetries) {
        console.log(`   🔄 Will retry (${maxRetries - attempt} retries remaining)...`);
        continue;
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Transfer failed after all retries',
  };
}

/**
 * Transfer ERC20 Token on Somnia Testnet
 * 
 * @param {Object} params - Transfer parameters
 * @param {string} params.tokenAddress - ERC20 token contract address
 * @param {string} params.recipient - Recipient address
 * @param {string} params.amount - Amount of tokens to transfer (in token units, e.g., "100")
 * @param {string} params.userPkpAddress - User's PKP wallet address
 * @returns {Promise<Object>} - { success: boolean, txHash?: string, error?: string }
 */
export async function transferSomniaERC20({ tokenAddress, recipient, amount, userPkpAddress }) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`\n🔄 Retry attempt ${attempt}/${maxRetries} for ERC20 transfer on Somnia...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('🔄 Transferring ERC20 Token on Somnia Testnet...');
      console.log(`   Token: ${tokenAddress}`);
      console.log(`   From: ${userPkpAddress}`);
      console.log(`   To: ${recipient}`);
      console.log(`   Amount: ${amount}`);

      // Validate addresses
      if (!ethers.utils.isAddress(recipient)) {
        throw new Error(`Invalid recipient address: ${recipient}`);
      }
      if (!ethers.utils.isAddress(tokenAddress)) {
        throw new Error(`Invalid token address: ${tokenAddress}`);
      }

      // Get Somnia chain configuration
      const chain = getChainConfig('somnia');
      const rpcUrl = chain.rpcUrl;

      // Create provider
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // ERC20 ABI
      const ERC20_ABI = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
      ];

      // Create token contract interface
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

      // Get token details
      const [decimals, symbol] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
      ]);

      console.log(`   Token: ${symbol} (${decimals} decimals)`);

      // Parse amount to smallest unit
      const amountWei = ethers.utils.parseUnits(amount, decimals);

      // Check balance
      const balance = await tokenContract.balanceOf(userPkpAddress);
      if (balance.lt(amountWei)) {
        throw new Error(
          `Insufficient balance. Required: ${amount} ${symbol}, Available: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`
        );
      }

      console.log(`   Balance check passed: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);

      // Create token interface
      const tokenInterface = new ethers.utils.Interface(ERC20_ABI);

      // Encode transfer function call
      const data = tokenInterface.encodeFunctionData('transfer', [recipient, amountWei]);

      // Get current nonce
      const nonce = await provider.getTransactionCount(userPkpAddress, 'pending');
      console.log(`   Current nonce: ${nonce}`);

      // Estimate gas
      const gasLimit = await provider.estimateGas({
        from: userPkpAddress,
        to: tokenAddress,
        data: data,
      });

      // Get gas price (with 10% buffer)
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice.mul(110).div(100); // 10% buffer

      // Build transaction
      const transaction = {
        to: tokenAddress,
        value: '0x00',
        data: data,
        chainId: chain.chainId,
        nonce: nonce,
        gasLimit: gasLimit.toHexString(),
        gasPrice: gasPrice.toHexString(),
      };

      console.log('   Transaction built:', {
        to: transaction.to,
        nonce: transaction.nonce,
        gasLimit: transaction.gasLimit,
        chainId: transaction.chainId,
      });

      // Serialize transaction
      const serializedTx = ethers.utils.serializeTransaction(transaction);

      // Get ability client (try Somnia ability, fallback to EVM transaction signer)
      const signer = getDelegateeSigner();
      let evmTxClient;
      try {
        evmTxClient = await getSomniaAbilityClient();
      } catch (error) {
        evmTxClient = getVincentAbilityClient({
          bundledVincentAbility: evmTxSignerAbility,
          ethersSigner: signer,
        });
      }

      // Execute transaction via Vincent
      console.log('   Executing transfer transaction...');
      const result = await evmTxClient.execute(
        {
          serializedTransaction: serializedTx,
        },
        {
          delegatorPkpEthAddress: userPkpAddress,
        }
      );

      if (!result.success) {
        throw new Error(result.runtimeError || 'Transaction failed');
      }

      // Extract the signed transaction
      const signedTx = result.result?.signedTransaction;
      const txHash = result.result?.deserializedSignedTransaction?.hash;

      if (!signedTx) {
        throw new Error('No signed transaction returned from Vincent');
      }

      console.log('✅ Transaction signed successfully!');
      console.log(`   Tx Hash (computed): ${txHash}`);
      console.log(`   Broadcasting transaction to Somnia testnet...`);

      // Broadcast the signed transaction to the network
      const txResponse = await provider.sendTransaction(signedTx);
      console.log(`   ✓ Transaction broadcasted: ${txResponse.hash}`);
      console.log(`   Waiting for confirmation...`);

      // Wait for the transaction to be mined
      const receipt = await txResponse.wait(1);
      console.log(`   ✓ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

      // Verify new balance
      const newBalance = await tokenContract.balanceOf(userPkpAddress);
      const newBalanceFormatted = ethers.utils.formatUnits(newBalance, decimals);
      console.log(`   ✓ New balance: ${newBalanceFormatted} ${symbol}`);

      console.log('✅ ERC20 token transferred successfully on Somnia testnet!');

      return {
        success: true,
        txHash: receipt.transactionHash,
        amount: amount,
        token: symbol,
        tokenAddress: tokenAddress,
        recipient: recipient,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        newBalance: newBalanceFormatted,
        chain: 'somnia',
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Transfer ERC20 on Somnia attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message);

      const isNonceError = error.code === 'NONCE_EXPIRED' || 
                          error.message?.includes('nonce too low') ||
                          error.message?.includes('nonce has already been used');

      if (isNonceError) {
        console.log(`   ⚠️  Nonce error detected, will fetch fresh nonce on retry`);
      }

      if (attempt < maxRetries) {
        console.log(`   🔄 Will retry (${maxRetries - attempt} retries remaining)...`);
        continue;
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Transfer failed after all retries',
  };
}

/**
 * Query native STT balance on Somnia Testnet
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.address - Address to query
 * @returns {Promise<Object>} - { success: boolean, balance?: string, error?: string }
 */
export async function querySomniaBalance({ address }) {
  try {
    console.log('🔍 Querying STT balance on Somnia testnet...');
    console.log(`   Address: ${address}`);

    if (!ethers.utils.isAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }

    const chain = getChainConfig('somnia');
    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);

    const balance = await provider.getBalance(address);
    const balanceFormatted = ethers.utils.formatEther(balance);

    console.log(`✅ Balance: ${balanceFormatted} STT`);

    return {
      success: true,
      balance: balanceFormatted,
      balanceWei: balance.toString(),
      address: address,
      chain: 'somnia',
    };
  } catch (error) {
    console.error(`❌ Failed to query balance:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
