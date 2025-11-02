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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col border-2 border-gray-800">
        {/* Header */}
        <div className="px-5 py-3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b-2 border-gray-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-100">
              AI Workflow Builder
            </h2>
            <p className="text-gray-400 text-xs mt-1 font-medium">
              Describe your DeFi workflow in natural language, powered by ASI Alliance
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-800"
            title="Close"
          >
            <svg
              className="w-6 h-6"
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-950 min-h-0">
          {conversation.length === 0 ? (
            <div className="text-center py-6">
              
              <h3 className="text-lg font-black text-gray-100 mb-2">
                Start with a Prompt
              </h3>
              <p className="text-gray-400 text-xs max-w-md mx-auto mb-3 font-medium">
                Describe what you want to do. Here are some examples:
              </p>
              <div className="space-y-2 text-left max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-gray-800/50 border border-gray-700 hover:border-blue-600 rounded-lg p-2 transition-all hover:shadow-md cursor-pointer group">
                  <Terminal className="w-full bg-gray-950/80 border-gray-700 max-h-[100px]" sequence={false}>
                    <AnimatedSpan className="text-blue-400 text-[10px]" startOnView={false}>$ swap USDC ETH</AnimatedSpan>
                    
                  </Terminal>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 hover:border-blue-600 rounded-lg p-2 transition-all hover:shadow-md cursor-pointer group">
                  <Terminal className="w-full bg-gray-950/80 border-gray-700 max-h-[100px]" sequence={false}>
                    <AnimatedSpan className="text-purple-400 text-[10px]" startOnView={false}>$ yield USDC</AnimatedSpan>
                    
                  </Terminal>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 hover:border-blue-600 rounded-lg p-2 transition-all hover:shadow-md cursor-pointer group">
                  <Terminal className="w-full bg-gray-950/80 border-gray-700 max-h-[100px]" sequence={false}>
                    <AnimatedSpan className="text-purple-400 text-[10px]" startOnView={false}>$ yield USDC</AnimatedSpan>
      
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
              <div className="max-w-[80%] rounded-xl px-4 py-3 bg-gray-800 border-2 border-gray-700 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-black">
                    AI
                  </div>
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                  <span className="text-xs text-gray-300 font-semibold">
                    Generating workflow...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-5 py-3 border-t-2 border-gray-800 bg-gray-900/80 flex-shrink-0">
          <div className="flex gap-2">
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
              className="flex-1 bg-gray-800 text-gray-100 text-sm rounded-xl px-3 py-2 border-2 border-gray-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 resize-none transition-all font-medium placeholder:text-gray-500"
              rows={2}
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </>
              ) : conversation.length === 0 ? (
                <>
                  
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

          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-500 font-medium">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs font-semibold text-gray-300">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs font-semibold text-gray-300">
                Shift+Enter
              </kbd>{" "}
              for new line
            </div>
            <div className="flex gap-2">
              {conversation.length > 0 && (
                <button
                  onClick={handleStartOver}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-800 font-semibold"
                >
                  Start Over
                </button>
              )}
              {hasWorkflow && (
                <button
                  onClick={handleApply}
                  className="px-4 py-1.5 bg-gradient-to-br from-green-600 to-green-700 text-white text-xs rounded-lg hover:from-green-700 hover:to-green-800 hover:shadow-lg transition-all font-bold flex items-center gap-1.5"
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
