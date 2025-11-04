import { useState, useEffect } from "react";
import { apiClient } from "../lib/apiClient";
import { showToast } from "../lib/toast";
import { useAuth } from "../contexts/AuthContext";

interface StakingProps {
  sttBalance: string;
  onStakeSuccess?: () => void;
}

export default function SomniaStaking({ sttBalance, onStakeSuccess }: StakingProps) {
  const { user } = useAuth();
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [rewards, setRewards] = useState<string | null>(null);
  const [totalStaked, setTotalStaked] = useState<string | null>(null);

  // Fetch staked balance on mount and when user changes
  useEffect(() => {
    if (user?.ethAddress) {
      fetchStakedBalance();
    }
  }, [user?.ethAddress]);

  const fetchStakedBalance = async () => {
    if (!user?.ethAddress) return;

    setLoadingBalance(true);
    try {
      const result = await apiClient.getSomniaStakedBalance();
      if (result.success) {
        setStakedBalance(result.stakedBalance || "0");
        setRewards(result.rewards || null);
        setTotalStaked(result.totalStaked || null);
      } else {
        console.error("Failed to fetch staked balance:", result.error);
        // Don't show error toast for balance queries - might just be no contract deployed
      }
    } catch (error) {
      console.error("Failed to fetch staked balance:", error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      showToast.error("Please enter a valid amount to stake");
      return;
    }

    const amount = parseFloat(stakeAmount);
    const available = parseFloat(sttBalance);

    if (amount > available) {
      showToast.error("Insufficient STT balance");
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.stakeSomnia(stakeAmount);
      if (result.success && result.txHash) {
        showToast.success(`Successfully staked ${stakeAmount} STT!`);
        setStakeAmount("");
        await fetchStakedBalance();
        if (onStakeSuccess) onStakeSuccess();
        
        // Show transaction link
        if (result.txHash) {
          const explorerUrl = `https://shannon-explorer.somnia.network/tx/${result.txHash}`;
          setTimeout(() => {
            if (window.confirm("View transaction on explorer?")) {
              window.open(explorerUrl, "_blank");
            }
          }, 1000);
        }
      } else {
        showToast.error(result.error || "Failed to stake STT");
      }
    } catch (error: any) {
      console.error("Stake error:", error);
      showToast.error(error.message || "Failed to stake STT");
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      showToast.error("Please enter a valid amount to unstake");
      return;
    }

    const amount = parseFloat(unstakeAmount);
    const staked = parseFloat(stakedBalance);

    if (amount > staked) {
      showToast.error("Insufficient staked balance");
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.unstakeSomnia(unstakeAmount);
      if (result.success && result.txHash) {
        showToast.success(`Successfully unstaked ${unstakeAmount} STT!`);
        setUnstakeAmount("");
        await fetchStakedBalance();
        if (onStakeSuccess) onStakeSuccess();
        
        // Show transaction link
        if (result.txHash) {
          const explorerUrl = `https://shannon-explorer.somnia.network/tx/${result.txHash}`;
          setTimeout(() => {
            if (window.confirm("View transaction on explorer?")) {
              window.open(explorerUrl, "_blank");
            }
          }, 1000);
        }
      } else {
        showToast.error(result.error || "Failed to unstake STT");
      }
    } catch (error: any) {
      console.error("Unstake error:", error);
      showToast.error(error.message || "Failed to unstake STT");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxStake = () => {
    const available = parseFloat(sttBalance);
    if (available > 0) {
      setStakeAmount(available.toString());
    }
  };

  const handleMaxUnstake = () => {
    const staked = parseFloat(stakedBalance);
    if (staked > 0) {
      setUnstakeAmount(staked.toString());
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700/30 backdrop-blur-sm rounded-lg flex items-center justify-center border border-blue-600/50">
              <svg
                className="w-5 h-5 text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-100">Somnia Staking</h2>
              <p className="text-gray-400 text-xs">Stake and unstake STT tokens</p>
            </div>
          </div>
          <button
            onClick={fetchStakedBalance}
            disabled={loadingBalance}
            className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 backdrop-blur-sm rounded-lg transition text-xs font-semibold text-gray-200 border border-gray-600 disabled:opacity-50"
          >
            {loadingBalance ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Staked Balance</p>
            <p className="text-2xl font-black text-blue-300">
              {loadingBalance ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${parseFloat(stakedBalance).toFixed(4)} STT`
              )}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Available Balance</p>
            <p className="text-2xl font-black text-green-300">
              {parseFloat(sttBalance).toFixed(4)} STT
            </p>
          </div>
          {rewards !== null && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Rewards</p>
              <p className="text-2xl font-black text-purple-300">
                {parseFloat(rewards).toFixed(4)} STT
              </p>
            </div>
          )}
        </div>

        {totalStaked !== null && (
          <div className="mb-6 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <p className="text-xs text-gray-400">
              Total Staked: <span className="text-gray-300 font-semibold">{parseFloat(totalStaked).toFixed(2)} STT</span>
            </p>
          </div>
        )}

        {/* Staking Form */}
        <div className="space-y-4">
          {/* Stake Section */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3">Stake STT</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleMaxStake}
                className="px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition border border-gray-600"
              >
                MAX
              </button>
              <button
                onClick={handleStake}
                disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Stake"}
              </button>
            </div>
          </div>

          {/* Unstake Section */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3">Unstake STT</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleMaxUnstake}
                className="px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition border border-gray-600"
              >
                MAX
              </button>
              <button
                onClick={handleUnstake}
                disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Unstake"}
              </button>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <p className="text-xs text-blue-300">
            <strong>Note:</strong> Ensure the staking contract address is configured in your environment variables (SOMNIA_STAKING_CONTRACT).
            {parseFloat(stakedBalance) === 0 && loadingBalance === false && (
              <span className="block mt-1 text-blue-400">
                If you see an error, the staking contract may not be deployed yet.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

