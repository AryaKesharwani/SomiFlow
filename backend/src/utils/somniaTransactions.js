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
  // Try once only - no retries
  try {
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
      console.log('⚠️  Somnia ability not available. Using EVM transaction signer as fallback.');
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
    
    console.error(`❌ Transfer STT failed:`, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
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
  // Try once only - no retries
  try {
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
    
    console.error(`❌ Transfer ERC20 on Somnia failed:`, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
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

/**
 * Uniswap V2 Router ABI - only the functions we need
 */
const UNISWAP_V2_ROUTER_ABI = [
  'function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) payable returns (uint256[] memory amounts)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) returns (uint256[] memory amounts)',
  'function getAmountsOut(uint256 amountIn, address[] calldata path) view returns (uint256[] memory amounts)',
  'function WETH() pure returns (address)',
];

/**
 * ERC20 ABI for approvals
 */
const ERC20_ABI_FOR_APPROVAL = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

/**
 * Swap tokens on Somnia using Uniswap V2
 * 
 * @param {Object} params - Swap parameters
 * @param {string} params.tokenInAddress - Input token address (use WSTT address for native STT)
 * @param {string} params.tokenOutAddress - Output token address
 * @param {string} params.amountIn - Amount of input tokens (in token units, e.g., "0.01")
 * @param {string} params.slippage - Slippage tolerance in percentage (e.g., "0.5" for 0.5%)
 * @param {string} params.userPkpAddress - User's PKP wallet address
 * @returns {Promise<Object>} - { success: boolean, txHash?: string, amountOut?: string, error?: string }
 */
export async function swapTokensUniswapV2({
  tokenInAddress,
  tokenOutAddress,
  amountIn,
  slippage = "0.5",
  userPkpAddress,
}) {
  try {
    console.log('🔄 Executing Uniswap V2 swap on Somnia...');
    console.log(`   Token In: ${tokenInAddress}`);
    console.log(`   Token Out: ${tokenOutAddress}`);
    console.log(`   Amount In: ${amountIn}`);
    console.log(`   Slippage: ${slippage}%`);

    // Get Somnia chain configuration
    const chain = getChainConfig('somnia');
    const rpcUrl = chain.rpcUrl;
    const routerAddress = chain.uniswapV2Router;
    const wsttAddress = chain.wrappedNativeToken;

    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const router = new ethers.Contract(routerAddress, UNISWAP_V2_ROUTER_ABI, provider);

    // Check if swapping native STT (WSTT)
    const isNativeSwap = tokenInAddress.toLowerCase() === wsttAddress.toLowerCase() || 
                         tokenInAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

    // Get token decimals
    let tokenInDecimals = 18;
    let tokenOutDecimals = 18;
    
    if (!isNativeSwap) {
      const tokenInContract = new ethers.Contract(tokenInAddress, ERC20_ABI_FOR_APPROVAL, provider);
      tokenInDecimals = await tokenInContract.decimals();
    }
    
    const tokenOutContract = new ethers.Contract(tokenOutAddress, ERC20_ABI_FOR_APPROVAL, provider);
    tokenOutDecimals = await tokenOutContract.decimals();

    // Parse amount to wei
    const amountInWei = ethers.utils.parseUnits(amountIn, tokenInDecimals);

    // Build swap path
    const path = isNativeSwap 
      ? [wsttAddress, tokenOutAddress]
      : [tokenInAddress, tokenOutAddress];

    console.log(`   Path: ${path.join(' -> ')}`);

    // Get expected output amount
    const amountsOut = await router.getAmountsOut(amountInWei, path);
    const expectedAmountOut = amountsOut[amountsOut.length - 1];
    
    // Calculate minimum amount out with slippage
    const slippageBps = parseFloat(slippage) * 100; // Convert to basis points
    const amountOutMin = expectedAmountOut.mul(10000 - slippageBps).div(10000);
    
    console.log(`   Expected output: ${ethers.utils.formatUnits(expectedAmountOut, tokenOutDecimals)}`);
    console.log(`   Minimum output (with ${slippage}% slippage): ${ethers.utils.formatUnits(amountOutMin, tokenOutDecimals)}`);

    // Set deadline (20 minutes from now)
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    // Get current nonce
    const nonce = await provider.getTransactionCount(userPkpAddress, 'pending');
    console.log(`   Current nonce: ${nonce}`);

    let transaction;
    let data;

    if (isNativeSwap) {
      // swapExactETHForTokens
      console.log('   Using swapExactETHForTokens...');
      const routerInterface = new ethers.utils.Interface(UNISWAP_V2_ROUTER_ABI);
      data = routerInterface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        path,
        userPkpAddress,
        deadline,
      ]);

      // Estimate gas
      const gasLimit = await provider.estimateGas({
        from: userPkpAddress,
        to: routerAddress,
        value: amountInWei,
        data: data,
      });

      // Get gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice.mul(110).div(100); // 10% buffer

      transaction = {
        to: routerAddress,
        value: amountInWei.toHexString(),
        data: data,
        chainId: chain.chainId,
        nonce: nonce,
        gasLimit: gasLimit.toHexString(),
        gasPrice: gasPrice.toHexString(),
      };
    } else {
      // swapExactTokensForTokens - need approval first
      console.log('   Checking ERC20 approval...');
      
      const tokenInContract = new ethers.Contract(tokenInAddress, ERC20_ABI_FOR_APPROVAL, provider);
      
      // Check current allowance
      const currentAllowance = await tokenInContract.allowance(userPkpAddress, routerAddress);
      
      if (currentAllowance.lt(amountInWei)) {
        console.log('   → Approving router to spend tokens...');
        
        // Approve router
        const approveData = new ethers.utils.Interface(ERC20_ABI_FOR_APPROVAL).encodeFunctionData('approve', [
          routerAddress,
          ethers.constants.MaxUint256, // Approve max for gas efficiency
        ]);

        const approveGasLimit = await provider.estimateGas({
          from: userPkpAddress,
          to: tokenInAddress,
          data: approveData,
        });

        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice.mul(110).div(100);

        const approveTx = {
          to: tokenInAddress,
          value: '0x00',
          data: approveData,
          chainId: chain.chainId,
          nonce: nonce,
          gasLimit: approveGasLimit.toHexString(),
          gasPrice: gasPrice.toHexString(),
        };

        // Serialize and execute approval
        const serializedApproveTx = ethers.utils.serializeTransaction(approveTx);
        const signer = getDelegateeSigner();
        let evmTxClient;
        try {
          evmTxClient = await getSomniaAbilityClient();
        } catch (error) {
          const { bundledVincentAbility: evmTxSignerAbility } = await import('@lit-protocol/vincent-ability-evm-transaction-signer');
          evmTxClient = getVincentAbilityClient({
            bundledVincentAbility: evmTxSignerAbility,
            ethersSigner: signer,
          });
        }

        const approveResult = await evmTxClient.execute(
          { serializedTransaction: serializedApproveTx },
          { delegatorPkpEthAddress: userPkpAddress }
        );

        if (!approveResult.success) {
          throw new Error(`Approval failed: ${approveResult.runtimeError || 'Unknown error'}`);
        }

        const signedApproveTx = approveResult.result?.signedTransaction;
        if (!signedApproveTx) {
          throw new Error('No signed approval transaction returned');
        }

        const approveTxResponse = await provider.sendTransaction(signedApproveTx);
        console.log(`   ✓ Approval transaction: ${approveTxResponse.hash}`);
        await approveTxResponse.wait(1);
        console.log('   ✓ Approval confirmed');
      } else {
        console.log('   ✓ Sufficient allowance already exists');
      }

      // Now build swap transaction
      console.log('   Using swapExactTokensForTokens...');
      const routerInterface = new ethers.utils.Interface(UNISWAP_V2_ROUTER_ABI);
      data = routerInterface.encodeFunctionData('swapExactTokensForTokens', [
        amountInWei,
        amountOutMin,
        path,
        userPkpAddress,
        deadline,
      ]);

      // Estimate gas
      const gasLimit = await provider.estimateGas({
        from: userPkpAddress,
        to: routerAddress,
        data: data,
      });

      // Get gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice.mul(110).div(100); // 10% buffer

      transaction = {
        to: routerAddress,
        value: '0x00',
        data: data,
        chainId: chain.chainId,
        nonce: await provider.getTransactionCount(userPkpAddress, 'pending'), // Get new nonce after approval
        gasLimit: gasLimit.toHexString(),
        gasPrice: gasPrice.toHexString(),
      };
    }

    console.log('   Transaction built:', {
      to: transaction.to,
      value: transaction.value || '0x00',
      nonce: transaction.nonce,
      gasLimit: transaction.gasLimit,
    });

    // Serialize transaction
    const serializedTx = ethers.utils.serializeTransaction(transaction);

    // Get ability client
    const signer = getDelegateeSigner();
    let evmTxClient;
    try {
      evmTxClient = await getSomniaAbilityClient();
    } catch (error) {
      const { bundledVincentAbility: evmTxSignerAbility } = await import('@lit-protocol/vincent-ability-evm-transaction-signer');
      evmTxClient = getVincentAbilityClient({
        bundledVincentAbility: evmTxSignerAbility,
        ethersSigner: signer,
      });
    }

    // Execute transaction via Vincent
    console.log('   Executing swap transaction...');
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
    console.log(`   Tx Hash: ${txHash}`);
    console.log(`   Broadcasting transaction to Somnia testnet...`);

    // Broadcast the signed transaction to the network
    const txResponse = await provider.sendTransaction(signedTx);
    console.log(`   ✓ Transaction broadcasted: ${txResponse.hash}`);
    console.log(`   Waiting for confirmation...`);

    // Wait for the transaction to be mined
    const receipt = await txResponse.wait(1);
    console.log(`   ✓ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

    // Parse the output amount from transaction receipt logs if possible
    // For now, we'll use the expected amount
    const amountOutFormatted = ethers.utils.formatUnits(expectedAmountOut, tokenOutDecimals);

    console.log('✅ Uniswap V2 swap executed successfully!');
    console.log(`   Amount received: ~${amountOutFormatted} tokens`);

    return {
      success: true,
      txHash: receipt.transactionHash,
      amountIn: amountIn,
      amountOut: amountOutFormatted,
      amountOutWei: expectedAmountOut.toString(),
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      slippage: slippage,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      chain: 'somnia',
    };
  } catch (error) {
    // Extract error message
    let errorMessage = error.message || 
                      error.error?.message || 
                      error.runtimeError ||
                      'Unknown error';
    
    // Try to extract error from stringified JSON
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
    
    console.error(`❌ Uniswap V2 swap failed:`, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}
