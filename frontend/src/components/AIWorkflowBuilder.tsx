import { useState } from "react";
import {
  generateWorkflowFromPrompt,
  refineWorkflow,
  type ConversationMessage,
} from "../lib/asiClient";
import { showToast } from "../lib/toast";
import { Terminal, AnimatedSpan } from "./ui/terminal";

// Node type colors and labels for preview
const NODE_TYPES_INFO: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  trigger: {
    label: "Trigger",
    color: "from-yellow-400 to-orange-500",
    icon: "TR",
  },
  swap: { label: "Token Swap", color: "from-blue-400 to-blue-600", icon: "SW" },
  aave: {
    label: "Aave Protocol",
    color: "from-purple-400 to-purple-600",
    icon: "AA",
  },
  transfer: {
    label: "Token Transfer",
    color: "from-green-400 to-green-600",
    icon: "TF",
  },
  condition: {
    label: "Conditional",
    color: "from-pink-400 to-pink-600",
    icon: "IF",
  },
  ai: { label: "ASI:One", color: "from-indigo-400 to-indigo-600", icon: "AI" },
  mcp: { label: "MCP Tool", color: "from-cyan-400 to-cyan-600", icon: "MC" },
};

interface AIWorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (
    workflow: { nodes: any[]; edges: any[] },
    explanation: string
  ) => void;
  currentWorkflow?: { nodes: any[]; edges: any[] } | null;
}

export function AIWorkflowBuilder({
  isOpen,
  onClose,
  onWorkflowGenerated,
  currentWorkflow,
}: AIWorkflowBuilderProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast.error("Please enter a description");
      return;
    }

    setIsGenerating(true);

    try {
      let result;

      if (currentWorkflow && conversation.length > 0) {
        // Refining existing workflow
        result = await refineWorkflow(prompt, currentWorkflow, conversation);
      } else {
        // Generating new workflow
        result = await generateWorkflowFromPrompt(prompt);
      }

      if (result.success && result.workflow) {
        // Add to conversation
        const newConversation: ConversationMessage[] = [
          ...conversation,
          { role: "user", content: prompt },
          {
            role: "assistant",
            content: result.explanation || "Workflow generated successfully",
            workflow: result.workflow,
          },
        ];

        setConversation(newConversation);
        setPrompt("");

        showToast.success(
          currentWorkflow
            ? "Workflow refined successfully!"
            : "Workflow generated successfully!"
        );
      } else {
        showToast.error(result.error || "Failed to generate workflow");
      }
    } catch (error: any) {
      console.error("Error:", error);
      showToast.error(error.message || "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (conversation.length > 0) {
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage.role === "assistant" && lastMessage.workflow) {
        onWorkflowGenerated(lastMessage.workflow, lastMessage.content);
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setPrompt("");
    setConversation([]);
    onClose();
  };

  const handleStartOver = () => {
    setConversation([]);
    setPrompt("");
  };

  if (!isOpen) return null;

  const hasWorkflow =
    conversation.length > 0 && conversation[conversation.length - 1].workflow;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 w-full max-w-5xl h-[85vh] flex flex-col border border-gray-800/50 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 border-b border-gray-800/50 flex items-center justify-between flex-shrink-0 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5 animate-pulse"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-100">
                AI Workflow Builder
              </h2>
              <p className="text-gray-400 text-xs mt-0.5 font-medium flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></span>
                Powered by ASI Alliance • Natural Language DeFi
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="relative z-10 text-gray-400 hover:text-white transition-all p-2.5 rounded-xl hover:bg-gray-800/50 hover:shadow-lg hover:scale-110 active:scale-95 group"
            title="Close"
          >
            <svg
              className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-black to-gray-950 min-h-0 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {conversation.length === 0 ? (
            <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 shadow-lg shadow-blue-600/10">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-3">
                Start with a Prompt
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6 font-medium leading-relaxed">
                Describe your DeFi workflow in natural language. The AI will understand and generate the perfect workflow for you.
              </p>
              <div className="space-y-2 text-left max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 hover:border-blue-500/50 rounded-xl p-3 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 hover:scale-105 cursor-pointer backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
                      <span className="text-white text-xs font-black">SW</span>
                    </div>
                    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">Token Swap</span>
                  </div>
                  <Terminal className="w-full bg-black/90 border-gray-700/50 max-h-[80px] shadow-inner" sequence={false}>
                    <AnimatedSpan className="text-blue-400 text-[11px] font-mono" startOnView={false}>$ swap USDC ETH</AnimatedSpan>
                  </Terminal>
                </div>
                <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 hover:border-purple-500/50 rounded-xl p-3 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/10 hover:scale-105 cursor-pointer backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-600/30">
                      <span className="text-white text-xs font-black">AA</span>
                    </div>
                    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">Yield Strategy</span>
                  </div>
                  <Terminal className="w-full bg-black/90 border-gray-700/50 max-h-[80px] shadow-inner" sequence={false}>
                    <AnimatedSpan className="text-purple-400 text-[11px] font-mono" startOnView={false}>$ yield USDC</AnimatedSpan>
                  </Terminal>
                </div>
                <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 hover:border-green-500/50 rounded-xl p-3 transition-all duration-300 hover:shadow-xl hover:shadow-green-600/10 hover:scale-105 cursor-pointer backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-green-600/30">
                      <span className="text-white text-xs font-black">TF</span>
                    </div>
                    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">DCA Strategy</span>
                  </div>
                  <Terminal className="w-full bg-black/90 border-gray-700/50 max-h-[80px] shadow-inner" sequence={false}>
                    <AnimatedSpan className="text-green-400 text-[11px] font-mono" startOnView={false}>$ DCA ETH weekly</AnimatedSpan>
                  </Terminal>
                </div>
              </div>
            </div>
          ) : (
            conversation.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                      : "bg-gray-800/80 border-2 border-gray-700 text-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        message.role === "user"
                          ? "bg-white/20 text-white"
                          : "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                      }`}
                    >
                      {message.role === "user" ? "U" : "AI"}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">
                        {message.content}
                      </p>
                      {message.workflow && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                            Generated Workflow (
                            {message.workflow.nodes?.length || 0} nodes)
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {message.workflow.nodes?.map(
                              (node: any, nodeIndex: number) => {
                                const nodeInfo = NODE_TYPES_INFO[node.type] || {
                                  label: node.type,
                                  color: "from-gray-400 to-gray-500",
                                  icon: "??",
                                };
                                return (
                                  <div
                                    key={nodeIndex}
                                    className="inline-flex items-center gap-1"
                                  >
                                    <div
                                      className={`inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-br ${nodeInfo.color} rounded-lg text-white text-xs font-bold shadow-sm`}
                                    >
                                      <span className="font-black text-xs">
                                        {nodeInfo.icon}
                                      </span>
                                      <span className="text-xs">{nodeInfo.label}</span>
                                    </div>
                                    {nodeIndex <
                                      (message.workflow.nodes?.length || 0) -
                                        1 && (
                                      <svg
                                        className="w-3 h-3 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                          {message.workflow.nodes?.some(
                            (n: any) => n.type === "mcp"
                          ) && (
                            <div className="mt-2 p-2 bg-cyan-900/30 border border-cyan-700 rounded-lg text-xs text-cyan-300 font-semibold">
                              Warning: MCP nodes require agent execution - they cannot run standalone
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl px-4 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 shadow-lg shadow-blue-600/10">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-600/30">
                    AI
                  </div>
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                  <span className="text-xs text-gray-200 font-semibold">
                    Generating workflow...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-gray-800/50 bg-gradient-to-b from-gray-900 to-black flex-shrink-0 backdrop-blur-sm">
          <div className="flex gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder={
                conversation.length === 0
                  ? "Describe your workflow... (e.g., 'Swap ETH to USDC and supply to Aave')"
                  : "Refine the workflow... (e.g., 'Add slippage protection' or 'Use 1inch instead')"
              }
              className="flex-1 bg-gray-800/80 text-gray-100 text-sm rounded-xl px-4 py-3 border border-gray-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all font-medium placeholder:text-gray-500 shadow-inner backdrop-blur-sm"
              rows={2}
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-5 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </>
              ) : conversation.length === 0 ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Generate</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Refine</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-500 font-medium">
              Press{" "}
              <kbd className="px-2 py-1 bg-gray-800/80 border border-gray-700/50 rounded text-xs font-semibold text-gray-300 shadow-sm">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="px-2 py-1 bg-gray-800/80 border border-gray-700/50 rounded text-xs font-semibold text-gray-300 shadow-sm">
                Shift+Enter
              </kbd>{" "}
              for new line
            </div>
            <div className="flex gap-2">
              {conversation.length > 0 && (
                <button
                  onClick={handleStartOver}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-gray-100 transition-all rounded-lg hover:bg-gray-800/50 font-semibold hover:scale-105 active:scale-95"
                >
                  Start Over
                </button>
              )}
              {hasWorkflow && (
                <button
                  onClick={handleApply}
                  className="px-5 py-2 bg-gradient-to-br from-green-600 to-green-700 text-white text-xs rounded-lg hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:shadow-green-600/30 hover:scale-105 active:scale-95 transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-600/20"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Apply Workflow
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
