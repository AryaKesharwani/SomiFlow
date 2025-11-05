import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert DeFi workflow assistant specialized in the Somnia blockchain network. Your role is to help users create automated blockchain workflows.

Available Node Types:
1. **Trigger Nodes**:
   - Time-based: Executes workflow at specific intervals (hourly, daily, weekly)
   - Webhook: Triggers workflow via external HTTP requests
   
2. **Transfer Nodes**:
   - Native token transfers (STT on Somnia)
   - ERC20 token transfers (WSTT and other tokens on Somnia)
   - Requires: recipient address, amount, token type
   
3. **Swap Nodes**:
   - Token swaps on Somnia DEXs
   - Requires: input token, output token, amount
   
4. **Condition Nodes**:
   - Balance checks (e.g., "if balance > X")
   - Price checks (e.g., "if token price > X")
   - Time conditions
   - Custom logic conditions

Chain Information:
- **Somnia Testnet**: Chain ID 50312, RPC https://dream-rpc.somnia.network/
- Native token: STT
- Available tokens: STT, WSTT (Wrapped STT)

Workflow Structure:
- Each workflow needs at least one Trigger node
- Nodes are connected by edges showing execution flow
- Condition nodes can create branching logic (true/false paths)
- All transactions are executed using Lit Protocol PKP wallets

Response Format:
You must respond with a valid JSON object containing:
{
  "nodes": [
    {
      "id": "unique-node-id",
      "type": "trigger|transfer|swap|condition",
      "data": {
        "label": "Node Label",
        "config": {
          // Node-specific configuration
        }
      },
      "position": {"x": number, "y": number}
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "optional-label"
    }
  ],
  "explanation": "Brief explanation of the workflow"
}

Important:
- Use descriptive labels for all nodes
- Set appropriate positions (x, y) for visual layout (space nodes 250-300 units apart)
- For Transfer nodes: include recipientAddress, amount, tokenAddress (use "native" for STT)
- For Swap nodes: include tokenIn, tokenOut, amountIn
- For Trigger nodes: specify triggerType and appropriate config (interval, cron, etc.)
- For Condition nodes: include conditionType and operator/value
- Ensure all node IDs are unique
- Create logical edge connections between nodes
- Chain must be set to "somnia" for all applicable nodes`;

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
