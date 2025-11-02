import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { apiClient } from "../lib/apiClient";
import { showToast } from "../lib/toast";
import { useTransactionPopup } from "@blockscout/app-sdk";
import { Terminal, TypingAnimation, AnimatedSpan } from "../components/ui/terminal";
import { Spotlight } from "../components/ui/spotlight";

interface Workflow {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
}

interface ExecutionHistory {
  _id: string;
  workflow: {
    _id: string;
    name: string;
  };
  status: "success" | "failed" | "pending";
  startedAt: string;
  completedAt?: string;
  errorMessages?: string[];
}

interface ChainBalance {
  chainKey: string;
  chainId: number;
  chainName: string;
  balance: string;
  symbol: string;
  isTestnet: boolean;
  error?: string;
}

const EXPLORER_URLS: Record<string, string> = {
  ethereum: "https://etherscan.io",
  polygon: "https://polygonscan.com",
  arbitrum: "https://arbiscan.io",
  optimism: "https://optimistic.etherscan.io",
  base: "https://basescan.org",
  bnb: "https://bscscan.com",
  avalanche: "https://snowtrace.io",
  celo: "https://explorer.celo.org/mainnet",
  sepolia: "https://sepolia.etherscan.io",
  basesepolia: "https://sepolia.basescan.org",
  arbitrumsepolia: "https://sepolia.arbiscan.io",
  optimismsepolia: "https://sepolia-optimism.etherscan.io",
  avalanchefuji: "https://testnet.snowtrace.io",
  polygonmumbai: "https://mumbai.polygonscan.com",
};

// Blockscout chain IDs mapping - all supported chains
const BLOCKSCOUT_CHAIN_IDS: Record<number, string> = {
  // Mainnets
  1: "1", // Ethereum
  137: "137", // Polygon
  42161: "42161", // Arbitrum
  10: "10", // Optimism
  8453: "8453", // Base
  56: "56", // BNB Chain
  43114: "43114", // Avalanche
  42220: "42220", // Celo
  // Testnets
  11155111: "11155111", // Sepolia
  84532: "84532", // Base Sepolia
  421614: "421614", // Arbitrum Sepolia
  11155420: "11155420", // Optimism Sepolia
  43113: "43113", // Avalanche Fuji
  80001: "80001", // Polygon Mumbai
};

export default function AppPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for selected chain for transaction viewing
  const [selectedTxChainId, setSelectedTxChainId] = useState<number | null>(null);
  const { openPopup } = useTransactionPopup();
  // const { chainId } = useAccount();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<ExecutionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch balances when user is loaded
  useEffect(() => {
    if (user?.ethAddress) {
      fetchBalances();
    }
  }, [user?.ethAddress]);

  const fetchBalances = async () => {
    if (!user?.ethAddress) return;

    setLoadingBalances(true);
    try {
      const response = await apiClient.getBalances();
      setBalances(response.balances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      showToast.error("Failed to fetch balances");
    } finally {
      setLoadingBalances(false);
    }
  };

  const copyAddress = () => {
    if (user?.ethAddress) {
      navigator.clipboard.writeText(user.ethAddress);
      setCopiedAddress(true);
      showToast.success("Address copied to clipboard");
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

    const handleViewTransactions = () => {
    // Validate user is logged in
    if (!user?.ethAddress) {
      showToast.error("Please connect your wallet");
      return;
    }

    // Validate chain is selected
    if (!selectedTxChainId) {
      showToast.error("Please select a chain to view transactions");
      return;
    }

    // Check if chain is supported by Blockscout
    const blockscoutChainId = BLOCKSCOUT_CHAIN_IDS[selectedTxChainId];
    if (!blockscoutChainId) {
      showToast.error(
        `Chain ID ${selectedTxChainId} not supported by Blockscout`
      );
      return;
    }

    // Open Blockscout transaction popup
    openPopup({
      chainId: blockscoutChainId,
      address: user.ethAddress,
    });
  };

  const openExplorer = (chainKey: string) => {
    if (user?.ethAddress && EXPLORER_URLS[chainKey]) {
      window.open(
        `${EXPLORER_URLS[chainKey]}/address/${user.ethAddress}`,
        "_blank"
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workflowsRes, executionsRes] = await Promise.all([
        apiClient.getWorkflows(),
        apiClient.getAllExecutions(),
      ]);
      setWorkflows(workflowsRes.workflows || []);
      setExecutions(executionsRes.executions || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    if (activeTab === "active") return w.isActive;
    if (activeTab === "inactive") return !w.isActive;
    return true;
  });

  const toggleWorkflowStatus = async (
    workflowId: string,
    currentStatus: boolean
  ) => {
    try {
      await apiClient.patchWorkflow(workflowId, { isActive: !currentStatus });
      setWorkflows(
        workflows.map((w) =>
          w._id === workflowId ? { ...w, isActive: !currentStatus } : w
        )
      );
      showToast.success(
        `Workflow ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Failed to toggle workflow status:", error);
      showToast.error("Failed to update workflow status");
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    // Use a custom confirmation instead of browser confirm
    const workflow = workflows.find((w) => w._id === workflowId);
    if (!workflow) return;

    try {
      await apiClient.deleteWorkflow(workflowId);
      setWorkflows(workflows.filter((w) => w._id !== workflowId));
      showToast.success("Workflow deleted successfully");
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      showToast.error("Failed to delete workflow");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Spotlight Effect */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        <div className="relative z-10">
          <nav className=" backdrop-blur-sm border-b border-gray-500 shadow-sm">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden border border-gray-700">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
                  <svg
                    className="w-6 h-6 text-gray-300 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                  </svg>
                </div>
                <span className="text-2xl font-black text-gray-100 tracking-tight">
                  SomiFlow
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="text-gray-400">Connected</div>
                  <div className="font-mono text-xs text-gray-200">
                    {user?.ethAddress.slice(0, 6)}...
                    {user?.ethAddress.slice(-4)}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-gray-100 transition"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-100 mb-2">
                Workflows Dashboard
              </h1>
              <p className="text-gray-400">
                Manage and monitor your SomiFlow automation workflows
              </p>
            </div>
            <button
              onClick={() => navigate("/workflow/new")}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-100 font-bold rounded-lg hover:shadow-lg transition transform hover:scale-105 border border-gray-700"
            >
              + Create Workflow
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Workflows Card */}
            <Terminal className="w-full max-w-full h-auto max-h-none">
              <TypingAnimation className="text-blue-400">&gt; query --total-workflows</TypingAnimation>
              <AnimatedSpan className="text-green-500">
                Database query executed
              </AnimatedSpan>
              <AnimatedSpan className="text-cyan-400">
                <span>Total Workflows: {workflows.length}</span>
              </AnimatedSpan>
              <TypingAnimation className="text-gray-400">
                All time created
              </TypingAnimation>
            </Terminal>

            {/* Active Workflows Card */}
            <Terminal className="w-full max-w-full h-auto max-h-none">
              <TypingAnimation className="text-blue-400">&gt; status --active-workflows</TypingAnimation>
              <AnimatedSpan className="text-green-500">
                Scanning active processes...
              </AnimatedSpan>
              <AnimatedSpan className="text-cyan-400">
                <span>Active: {workflows.filter((w) => w.isActive).length}</span>
              </AnimatedSpan>
              <TypingAnimation className="text-gray-400">
                Currently running
              </TypingAnimation>
            </Terminal>

            {/* Total Executions Card */}
            <Terminal className="w-full max-w-full h-auto max-h-none">
              <TypingAnimation className="text-blue-400">&gt; analytics --execution-count</TypingAnimation>
              <AnimatedSpan className="text-green-500">
                Fetching execution history...
              </AnimatedSpan>
              <AnimatedSpan className="text-cyan-400">
                <span>Executions: {executions.length}</span>
              </AnimatedSpan>
              <TypingAnimation className="text-gray-400">
                Total runs
              </TypingAnimation>
            </Terminal>

            {/* Success Rate Card */}
            <Terminal className="w-full max-w-full h-auto max-h-none">
              <TypingAnimation className="text-blue-400">&gt; metrics --success-rate</TypingAnimation>
              <AnimatedSpan className="text-green-500">
                Calculating performance metrics...
              </AnimatedSpan>
              <AnimatedSpan className="text-cyan-400">
                <span>Success Rate: {executions.length > 0
                    ? Math.round(
                        (executions.filter((e) => e.status === "success")
                          .length /
                          executions.length) *
                          100
                      )
                    : 0}%</span>
              </AnimatedSpan>
              <TypingAnimation className="text-gray-400">
                {`${executions.filter((e) => e.status === "success").length} of ${executions.length} successful`}
              </TypingAnimation>
            </Terminal>
          </div>

          {/* Account Information Card - Compact */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-md mb-8 overflow-hidden border border-gray-800">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700/50 backdrop-blur-sm rounded-lg flex items-center justify-center border border-gray-700">
                    <svg
                      className="w-5 h-5 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-100">Account</h2>
                    <p className="text-gray-400 text-xs font-mono">
                      {user?.ethAddress.slice(0, 10)}...
                      {user?.ethAddress.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {/* Chain selector for transactions */}
                  <select
                    value={selectedTxChainId || ""}
                    onChange={(e) =>
                      setSelectedTxChainId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="" className="bg-slate-800 text-white">
                      Select Chain
                    </option>
                    {balances
                      .filter((b) => BLOCKSCOUT_CHAIN_IDS[b.chainId]) // Only show chains supported by Blockscout
                      .map((balance) => (
                        <option
                          key={balance.chainId}
                          value={balance.chainId}
                          className="bg-slate-800 text-white"
                        >
                          {balance.chainName}
                          {balance.isTestnet ? " (Testnet)" : ""}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={handleViewTransactions}
                    disabled={!selectedTxChainId}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 backdrop-blur-sm rounded-lg transition text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 border border-gray-600"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Transactions
                  </button>

                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 backdrop-blur-sm rounded-lg transition text-xs font-semibold text-gray-200 border border-gray-600"
                  >
                    {copiedAddress ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Balances Grid */}
            <div className="p-4">
              {loadingBalances ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse p-3 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="h-3 bg-gray-700 rounded w-2/3 mb-2"></div>
                      <div className="h-5 bg-gray-700 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Mainnets */}
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                      Mainnets
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {balances
                        .filter((b) => !b.isTestnet)
                        .map((balance) => (
                          <button
                            key={balance.chainKey}
                            onClick={() => openExplorer(balance.chainKey)}
                            className="relative p-3 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition text-left group"
                            title={`View ${balance.chainName} on explorer`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-300 truncate">
                                  {balance.chainName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {balance.symbol}
                                </p>
                              </div>
                              <svg
                                className="w-3 h-3 text-gray-500 group-hover:text-gray-400 flex-shrink-0 ml-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </div>
                            <p
                              className="text-base font-black text-gray-100 truncate"
                              title={balance.balance}
                            >
                              {parseFloat(balance.balance).toFixed(4)}
                            </p>
                            {parseFloat(balance.balance) === 0 && (
                              <div className="absolute top-1 right-1">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              </div>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Testnets */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                      Testnets
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {balances
                        .filter((b) => b.isTestnet)
                        .map((balance) => (
                          <button
                            key={balance.chainKey}
                            onClick={() => openExplorer(balance.chainKey)}
                            className="relative p-3 bg-gradient-to-br from-blue-900/30 to-blue-800/30 hover:from-blue-800/40 hover:to-blue-700/40 rounded-lg border border-blue-800/50 hover:border-blue-700/50 transition text-left group"
                            title={`View ${balance.chainName} on explorer`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-blue-300 truncate">
                                  {balance.chainName}
                                </p>
                                <p className="text-xs text-blue-400">
                                  {balance.symbol}
                                </p>
                              </div>
                              <svg
                                className="w-3 h-3 text-blue-500 group-hover:text-blue-400 flex-shrink-0 ml-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </div>
                            <p
                              className="text-base font-black text-blue-100 truncate"
                              title={balance.balance}
                            >
                              {parseFloat(balance.balance).toFixed(4)}
                            </p>
                            {parseFloat(balance.balance) === 0 && (
                              <div className="absolute top-1 right-1">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              </div>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Faucet Info */}
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs text-blue-200 font-semibold mb-1">
                          Need testnet tokens?
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-blue-300">
                          <a
                            href="https://www.alchemy.com/faucets/base-sepolia"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-200 font-medium"
                          >
                            Base Sepolia
                          </a>
                          <a
                            href="https://www.alchemy.com/faucets/ethereum-sepolia"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-600 font-medium"
                          >
                            Sepolia
                          </a>
                          <a
                            href="https://faucet.quicknode.com/arbitrum/sepolia"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-600 font-medium"
                          >
                            Arbitrum Sepolia
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Workflows Section */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-md mb-8 border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-100">
                  Your Workflows
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      activeTab === "all"
                        ? "bg-gray-700 text-gray-100"
                        : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    All ({workflows.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      activeTab === "active"
                        ? "bg-green-900/50 text-green-300"
                        : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    Active ({workflows.filter((w) => w.isActive).length})
                  </button>
                  <button
                    onClick={() => setActiveTab("inactive")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      activeTab === "inactive"
                        ? "bg-gray-700 text-gray-300"
                        : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    Inactive ({workflows.filter((w) => !w.isActive).length})
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              {loading ? (
                <div className="p-12 text-center text-gray-400">
                  Loading workflows...
                </div>
              ) : filteredWorkflows.length === 0 ? (
                <div className="p-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-100 mb-2">
                    No workflows yet
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Get started by creating your first workflow
                  </p>
                  <button
                    onClick={() => navigate("/workflow/new")}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 font-bold rounded-lg border border-gray-700 transition"
                  >
                    Create Workflow
                  </button>
                </div>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <div
                    key={workflow._id}
                    className="p-6 hover:bg-gray-800/50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-100">
                            {workflow.name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              workflow.isActive
                                ? "bg-green-900/50 text-green-300"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {workflow.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-3">
                          {workflow.description || "No description"}
                        </p>
                        <div className="flex gap-6 text-sm text-gray-500">
                          <span>
                            <strong className="text-gray-300">{workflow.nodes.length}</strong> nodes
                          </span>
                          <span>
                            Created{" "}
                            {new Date(workflow.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            Updated{" "}
                            {new Date(workflow.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            toggleWorkflowStatus(
                              workflow._id,
                              workflow.isActive
                            )
                          }
                          className={`px-4 py-2 rounded-lg font-medium text-sm ${
                            workflow.isActive
                              ? "bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70"
                              : "bg-green-900/50 text-green-300 hover:bg-green-900/70"
                          }`}
                        >
                          {workflow.isActive ? "Pause" : "Activate"}
                        </button>
                        <button
                          onClick={() => navigate(`/workflow/${workflow._id}`)}
                          className="px-4 py-2 bg-blue-900/50 text-blue-300 rounded-lg font-medium text-sm hover:bg-blue-900/70"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteWorkflow(workflow._id)}
                          className="px-4 py-2 bg-red-900/50 text-red-300 rounded-lg font-medium text-sm hover:bg-red-900/70"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Executions */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-black text-gray-100">
                Recent Executions
              </h2>
            </div>
            <div className="divide-y divide-gray-800">
              {executions.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  No executions yet
                </div>
              ) : (
                executions.slice(0, 10).map((execution) => (
                  <div
                    key={execution._id}
                    className="p-6 hover:bg-gray-800/50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-100">
                            {execution.workflow?.name || "Unknown Workflow"}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              execution.status === "success"
                                ? "bg-green-900/50 text-green-300"
                                : execution.status === "failed"
                                ? "bg-red-900/50 text-red-300"
                                : "bg-yellow-900/50 text-yellow-300"
                            }`}
                          >
                            {execution.status}
                          </span>
                        </div>
                        <div className="flex gap-6 text-sm text-gray-500">
                          <span>
                            Started{" "}
                            {new Date(execution.startedAt).toLocaleString()}
                          </span>
                          {execution.completedAt && (
                            <span>
                              Completed{" "}
                              {new Date(execution.completedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {execution.errorMessages &&
                          execution.errorMessages.length > 0 && (
                            <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                              <p className="text-sm text-red-300 font-medium mb-1">
                                Errors:
                              </p>
                              <ul className="text-sm text-red-400 list-disc list-inside">
                                {execution.errorMessages.map((err, idx) => (
                                  <li key={idx}>{err}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </div> {/* Close relative z-10 wrapper */}
      </div> {/* Close main container */}
    </ProtectedRoute>
  );
}
