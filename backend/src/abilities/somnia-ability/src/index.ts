/**
 * Somnia Testnet Vincent Ability
 * 
 * This ability enables secure transaction execution on the Somnia testnet
 * using Vincent SDK and Lit Protocol PKPs.
 * 
 * Features:
 * - Native STT token transfers
 * - ERC20 token transfers
 * - Balance queries
 * - Transaction validation
 */

export { vincentAbility as somniaAbility, type SomniaAbilityParams, type SomniaAbilityResult } from './lib/vincent-ability';
export { bundledVincentAbility } from './lib/vincent-ability';
