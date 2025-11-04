/**
 * Staking Routes
 * 
 * Endpoints for staking and unstaking on Somnia testnet
 */

import express from 'express';
import { vincentHandler } from '../config/vincent.js';
import { getPKPInfo } from '@lit-protocol/vincent-app-sdk/jwt';
import {
  delegateStakeSomnia,
} from '../utils/somniaStaking.js';
import { getAllValidators, getValidatorByAddress, getValidatorByName } from '../config/somniaValidators.js';

const router = express.Router();

/**
 * POST /api/staking/somnia/delegate-stake
 * Delegate stake to a validator on Somnia testnet
 */
router.post('/somnia/delegate-stake', vincentHandler(async (req, res) => {
  try {
    const { validatorAddress, amount, stakingContract } = req.body;
    const { decodedJWT } = req.vincentUser;
    const pkpInfo = getPKPInfo(decodedJWT);
    
    if (!validatorAddress) {
      return res.status(400).json({
        success: false,
        message: 'Validator address is required',
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    // Validate amount is a positive number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
      });
    }

    // Validate validator address format
    if (!validatorAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid validator address format',
      });
    }

    console.log(`[Staking] Delegating stake for user: ${pkpInfo.ethAddress}`);
    console.log(`   Validator: ${validatorAddress}`);
    console.log(`   Amount: ${amount} STT`);

    const result = await delegateStakeSomnia({
      validatorAddress,
      amount: amount.toString(),
      userPkpAddress: pkpInfo.ethAddress,
      stakingContract,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Delegate stake failed',
        error: result.error,
      });
    }

    console.log(`[Staking] Delegate stake successful: ${result.txHash}`);

    res.json({
      success: true,
      txHash: result.txHash,
      amount: result.amount,
      validatorAddress: result.validatorAddress,
      blockNumber: result.blockNumber,
      gasUsed: result.gasUsed,
      chain: result.chain,
    });
  } catch (error) {
    console.error('[Staking] Error delegating stake:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delegate stake',
      error: error.message,
    });
  }
}));

/**
 * GET /api/staking/somnia/validators
 * Get all Somnia validators
 */
router.get('/somnia/validators', (req, res) => {
  try {
    const { address, name } = req.query;
    
    let result;
    
    if (address) {
      // Get validator by address
      const validator = getValidatorByAddress(address);
      if (!validator) {
        return res.status(404).json({
          success: false,
          message: 'Validator not found',
        });
      }
      result = validator;
    } else if (name) {
      // Get validator by name
      const validator = getValidatorByName(name);
      if (!validator) {
        return res.status(404).json({
          success: false,
          message: 'Validator not found',
        });
      }
      result = validator;
    } else {
      // Get all validators
      result = getAllValidators();
    }

    res.json({
      success: true,
      validators: Array.isArray(result) ? result : [result],
      count: Array.isArray(result) ? result.length : 1,
    });
  } catch (error) {
    console.error('[Staking] Error fetching validators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch validators',
      error: error.message,
    });
  }
});

export default router;

