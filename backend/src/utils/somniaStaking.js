/**
 * Somnia Testnet Staking Utility
 * 
 * Provides functions to delegate stake tokens to validators on Somnia testnet using Vincent SDK
 * for execution on behalf of users.
 */

import { ethers } from 'ethers';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';
import { bundledVincentAbility as evmTxSignerAbility } from '@lit-protocol/vincent-ability-evm-transaction-signer';
import { getDelegateeSigner, getSomniaAbilityClient } from '../config/vincent.js';
import { getChainConfig } from '../config/chains.js';

// Delegate Staking Contract ABI (for validator delegation)
const DELEGATE_STAKING_ABI = [
  'function delegateStake(address validator, uint256 amount) returns (bool)',
];

/**
 * Get delegate staking contract address
 * Default to the contract address provided by the user
 */
function getDelegateStakingContractAddress() {
  return process.env.SOMNIA_DELEGATE_STAKING_CONTRACT || '0xBe367d410D96E1cAeF68C0632251072CDf1b8250';
}

/**
 * Delegate Stake to a validator on Somnia Testnet
 * 
 * @param {Object} params - Delegation parameters
 * @param {string} params.validatorAddress - Address of the validator to delegate to
 * @param {string} params.amount - Amount of STT to delegate (in STT, e.g., "1.0")
 * @param {string} params.userPkpAddress - User's PKP wallet address
 * @param {string} params.stakingContract - Optional staking contract address (overrides env)
 * @returns {Promise<Object>} - { success: boolean, txHash?: string, error?: string }
 */
export async function delegateStakeSomnia({ validatorAddress, amount, userPkpAddress, stakingContract }) {
  try {
    console.log('🔄 Delegating stake to validator on Somnia Testnet...');
    console.log(`   From: ${userPkpAddress}`);
    console.log(`   Validator: ${validatorAddress}`);
    console.log(`   Amount: ${amount} STT`);

    // Validate validator address
    if (!ethers.utils.isAddress(validatorAddress)) {
      throw new Error(`Invalid validator address: ${validatorAddress}`);
    }

    const chain = getChainConfig('somnia');
    const rpcUrl = chain.rpcUrl;
    const contractAddress = stakingContract || getDelegateStakingContractAddress();

    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Parse amount to wei
    const amountWei = ethers.utils.parseEther(amount);

    // Check balance
    const balance = await provider.getBalance(userPkpAddress);
    if (balance.lt(amountWei)) {
      throw new Error(
        `Insufficient balance. Required: ${amount} STT, Available: ${ethers.utils.formatEther(balance)} STT`
      );
    }

    console.log(`   Balance check passed: ${ethers.utils.formatEther(balance)} STT`);
    console.log(`   Delegate Staking Contract: ${contractAddress}`);

    // Create delegate staking contract interface
    const delegateStakingInterface = new ethers.utils.Interface(DELEGATE_STAKING_ABI);

    // Encode delegateStake function call
    const data = delegateStakingInterface.encodeFunctionData('delegateStake', [validatorAddress, amountWei]);

    // Get current nonce
    const nonce = await provider.getTransactionCount(userPkpAddress, 'pending');
    console.log(`   Current nonce: ${nonce}`);

    // Estimate gas
    const gasLimit = await provider.estimateGas({
      from: userPkpAddress,
      to: contractAddress,
      value: amountWei, // Native token staking - send value with transaction
      data: data,
    });

    // Get gas price (with 10% buffer)
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice.mul(110).div(100); // 10% buffer

    // Build transaction
    const transaction = {
      to: contractAddress,
      value: amountWei.toHexString(), // Send native tokens
      data: data,
      chainId: chain.chainId,
      nonce: nonce,
      gasLimit: gasLimit.toHexString(),
      gasPrice: gasPrice.toHexString(),
    };

    console.log('   Transaction built:', {
      to: transaction.to,
      value: transaction.value,
      validator: validatorAddress,
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
    console.log('   Executing delegate stake transaction...');
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

    console.log('✅ STT delegated successfully to validator on Somnia testnet!');

    return {
      success: true,
      txHash: receipt.transactionHash,
      amount: amount,
      validatorAddress: validatorAddress,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      chain: 'somnia',
    };
  } catch (error) {
    // Extract error message from nested error objects
    let errorMessage = error.message || 
                      error.error?.message || 
                      error.runtimeError ||
                      'Unknown error';
    
    // Try to extract error from stringified JSON in error message
    try {
      if (errorMessage.includes('Response from the nodes:')) {
        const jsonMatch = errorMessage.match(/\{.*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.error?.message) {
            errorMessage = parsed.error.message;
          }
        }
      }
    } catch (e) {
      // If parsing fails, use original error message
    }
    
    console.error(`❌ Delegate stake failed:`, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

