// Chain configurations for Vincent SDK execution
// Supported chains for Uniswap V3 swaps

// Special address used to represent native ETH in frontend
const NATIVE_ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
import dotenv from "dotenv";
dotenv.config();
export const SUPPORTED_CHAINS = {
  somnia: {
    chainId: 50312,
    name: "Somnia Testnet",
    rpcUrl: process.env.RPC_SOMNIA || "https://dream-rpc.somnia.network/",
    nativeCurrency: "STT",
    wrappedNativeToken: "0xF22eF0085f6511f70b01a68F360dCc56261F768a", // WSTT
    explorerUrl: "https://shannon-explorer.somnia.network",
    uniswapV2Router: "0xb98c15a0dC1e271132e341250703c7e94c059e8D", // Uniswap V2 Router
    uniswapV2Factory: "0x31015A978c5815EdE29D0F969a17e116BC1866B1", // Uniswap V2 Factory
  },
};

// Helper function to get chain config by name
export function getChainConfig(chainName) {
  const chain = SUPPORTED_CHAINS[chainName];
  if (!chain) {
    throw new Error(
      `Unsupported chain: ${chainName}. Supported chains: ${Object.keys(
        SUPPORTED_CHAINS
      ).join(", ")}`
    );
  }
  return chain;
}

// Helper function to get RPC URL for a chain
export function getRpcUrl(chainName) {
  return getChainConfig(chainName).rpcUrl;
}

// Helper function to get chain ID
export function getChainId(chainName) {
  return getChainConfig(chainName).chainId;
}

// List of all supported chain names
export const CHAIN_NAMES = Object.keys(SUPPORTED_CHAINS);

// List of mainnet chain names
export const MAINNET_CHAINS = [];

// List of testnet chain names
export const TESTNET_CHAINS = ["somnia"];

/**
 * Convert native ETH placeholder address to actual WETH address
 * Uniswap V3 requires WETH address, not the 0xEee... placeholder
 */
export function normalizeTokenAddress(chainName, tokenAddress) {
  const NATIVE_ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

  // If it's the native ETH placeholder, return WETH address
  if (tokenAddress.toLowerCase() === NATIVE_ETH_ADDRESS.toLowerCase()) {
    const chain = getChainConfig(chainName);
    return chain.wrappedNativeToken;
  }

  return tokenAddress;
}
