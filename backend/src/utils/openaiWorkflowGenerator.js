import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert DeFi workflow assistant specialized in the Somnia blockchain network. Your role is to help users create automated blockchain workflows.

CRITICAL RULES:
1. **EVERY workflow must have EXACTLY ONE trigger node at the start**
2. **The trigger node must ALWAYS be the first node (at the top)**
3. **Never create multiple trigger nodes in a single workflow**
4. **Use ALL available node types when relevant to the user's request**

Available Node Types:
1. **Trigger Node** (type: "trigger") - REQUIRED, MUST BE FIRST:
   - Time-based: Executes workflow at specific intervals (hourly, daily, weekly)
   - Webhook: Triggers workflow via external HTTP requests
   - Config: { triggerType: "time|webhook", interval: "hourly|daily|weekly", cron: "..." }
   
2. **Transfer Node** (type: "transfer"):
   - Native token transfers (STT on Somnia)
   - ERC20 token transfers (WSTT and other tokens on Somnia)
   - Config: { chain: "somnia", recipientAddress: "0x...", amount: "1.0", tokenAddress: "native" or "0x..." }
   
3. **Swap Node** (type: "swap"):
   - Token swaps on Somnia DEXs
   - Config: { chain: "somnia", tokenIn: "STT|WSTT", tokenOut: "STT|WSTT", amountIn: "1.0" }
   
4. **Condition Node** (type: "condition"):
   - Creates branching logic with "true" and "false" paths
   - Balance checks, price checks, time conditions
   - Config: { conditionType: "balance|price|time", operator: ">|<|==", value: "10" }
   
5. **Staking Node** (type: "staking"):
   - Stake or unstake STT tokens on Somnia
   - Config: { chain: "somnia", action: "stake|unstake", amount: "1.0" }

Chain Information:
- **Somnia Testnet**: Chain ID 50312, RPC https://dream-rpc.somnia.network/
- Native token: STT
- Available tokens: STT, WSTT (Wrapped STT)

Workflow Structure:
- **MUST start with exactly ONE trigger node**
- **Trigger must be positioned at the top (smallest y coordinate)**
- Nodes are connected by edges showing execution flow
- Condition nodes create branching with TWO edges: one labeled "true", one labeled "false"
- All transactions are executed using Lit Protocol PKP wallets
- Use descriptive labels for all nodes

Branching Logic with Conditions:
- When a condition node is used, it MUST have TWO outgoing edges:
  - One edge with label: "true" (for success path)
  - One edge with label: "false" (for failure path)
- Example: "if swap succeeds, transfer; if fails, stake"
  - Trigger → Swap → Condition (check success) → Transfer (true path) / Staking (false path)

Response Format:
You must respond with a valid JSON object containing:
{
  "nodes": [
    {
      "id": "trigger-1",
      "type": "trigger",
      "data": {
        "label": "Trigger Label",
        "config": { "triggerType": "time", "interval": "daily" }
      },
      "position": {"x": 250, "y": 50}
    },
    {
      "id": "node-2",
      "type": "swap|transfer|condition|staking",
      "data": {
        "label": "Node Label",
        "config": { "chain": "somnia", /* node-specific config */ }
      },
      "position": {"x": 250, "y": 200}
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "trigger-1",
      "target": "node-2",
      "label": ""
    },
    {
      "id": "edge-2",
      "source": "node-2",
      "target": "node-3",
      "label": "true"
    },
    {
      "id": "edge-3",
      "source": "node-2",
      "target": "node-4",
      "label": "false"
    }
  ],
  "explanation": "Brief explanation of the workflow"
}

Important Guidelines:
- First node MUST be type "trigger" with position y: 50
- Use descriptive labels for all nodes
- Space nodes vertically 200-250 units apart (y coordinate)
- For Transfer nodes: include recipientAddress, amount, tokenAddress ("native" for STT)
- For Swap nodes: include tokenIn, tokenOut, amountIn
- For Trigger nodes: specify triggerType and interval/cron
- For Condition nodes: include conditionType, operator, value
- For Staking nodes: include action ("stake" or "unstake") and amount
- Ensure all node IDs are unique
- Chain must be "somnia" for all applicable nodes
- When user mentions conditional logic, use condition node with true/false branching`;

/**
 * Generate a workflow from a natural language prompt
 */
async function generateWorkflowFromPrompt(prompt, conversationHistory = []) {
  try {
    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }

    // Add the current prompt
    messages.push({
      role: 'user',
      content: prompt
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0].message.content;
    const workflowData = JSON.parse(responseContent);

    // Validate the response structure
    if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
      throw new Error('Invalid workflow structure: missing nodes array');
    }

    if (!workflowData.edges || !Array.isArray(workflowData.edges)) {
      throw new Error('Invalid workflow structure: missing edges array');
    }

    // Ensure all nodes have required fields
    workflowData.nodes = workflowData.nodes.map((node, index) => ({
      id: node.id || `node-${Date.now()}-${index}`,
      type: node.type || 'transfer',
      data: {
        label: node.data?.label || `Node ${index + 1}`,
        config: {
          chain: 'somnia',
          ...node.data?.config
        }
      },
      position: node.position || { x: 250, y: 100 + (index * 150) }
    }));

    // Ensure all edges have required fields
    workflowData.edges = workflowData.edges.map((edge, index) => ({
      id: edge.id || `edge-${Date.now()}-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label || ''
    }));

    return {
      success: true,
      workflow: {
        nodes: workflowData.nodes,
        edges: workflowData.edges
      },
      explanation: workflowData.explanation || 'Workflow generated successfully',
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: prompt },
        { role: 'assistant', content: responseContent }
      ]
    };

  } catch (error) {
    console.error('OpenAI workflow generation error:', error);
    
    // Handle specific error types
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your API key and billing.');
    }
    
    if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    }

    throw new Error(`Failed to generate workflow: ${error.message}`);
  }
}

/**
 * Refine an existing workflow based on user feedback
 */
async function refineWorkflow(prompt, currentWorkflow, conversationHistory = []) {
  try {
    // Create a refinement prompt that includes the current workflow
    const refinementPrompt = `Current workflow:
${JSON.stringify(currentWorkflow, null, 2)}

User feedback: ${prompt}

Please modify the workflow based on the user's feedback while maintaining the overall structure and purpose.`;

    return await generateWorkflowFromPrompt(refinementPrompt, conversationHistory);

  } catch (error) {
    console.error('OpenAI workflow refinement error:', error);
    throw new Error(`Failed to refine workflow: ${error.message}`);
  }
}

export {
  generateWorkflowFromPrompt,
  refineWorkflow
};
