/**
 * ASI Agent Routes
 * 
 * Endpoints for AI-powered workflow generation using OpenAI
 */

import express from 'express';
import { vincentHandler } from '../config/vincent.js';
import { getPKPInfo } from '@lit-protocol/vincent-app-sdk/jwt';
import {
  generateWorkflowFromPrompt,
  refineWorkflow,
} from '../utils/openaiWorkflowGenerator.js';

const router = express.Router();

/**
 * POST /api/asi/workflow/generate
 * Generate a workflow from natural language description using OpenAI
 */
router.post('/workflow/generate', vincentHandler(async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    const { decodedJWT } = req.vincentUser;
    const pkpInfo = getPKPInfo(decodedJWT);
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required',
      });
    }

    console.log(`[OpenAI] Generating workflow for user: ${pkpInfo.ethAddress}`);
    console.log(`   Query: "${query}"`);

    const result = await generateWorkflowFromPrompt(query, conversationHistory);

    console.log(`[OpenAI] Workflow generated successfully`);
    console.log(`   Nodes: ${result.workflow.nodes.length}, Edges: ${result.workflow.edges.length}`);

    res.json({
      success: true,
      workflow: result.workflow,
      explanation: result.explanation,
      conversationHistory: result.conversationHistory,
    });
  } catch (error) {
    console.error('[OpenAI] Error generating workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate workflow',
      error: error.message,
    });
  }
}));

/**
 * POST /api/asi/workflow/refine
 * Refine an existing workflow based on user feedback using OpenAI
 */
router.post('/workflow/refine', vincentHandler(async (req, res) => {
  try {
    const { query, currentWorkflow, conversationHistory = [] } = req.body;
    const { decodedJWT } = req.vincentUser;
    const pkpInfo = getPKPInfo(decodedJWT);
    
    if (!query || !currentWorkflow) {
      return res.status(400).json({
        success: false,
        message: 'Query and current workflow are required',
      });
    }

    console.log(`[OpenAI] Refining workflow for user: ${pkpInfo.ethAddress}`);
    console.log(`   Feedback: "${query}"`);

    const result = await refineWorkflow(query, currentWorkflow, conversationHistory);

    console.log(`[OpenAI] Workflow refined successfully`);

    res.json({
      success: true,
      workflow: result.workflow,
      explanation: result.explanation,
      conversationHistory: result.conversationHistory,
    });
  } catch (error) {
    console.error('[OpenAI] Error refining workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refine workflow',
      error: error.message,
    });
  }
}));

/**
 * GET /api/asi/health
 * Check if OpenAI API is configured
 */
router.get('/health', async (req, res) => {
  try {
    const isConfigured = !!process.env.OPENAI_API_KEY;

    res.json({
      success: true,
      openai_configured: isConfigured,
      message: isConfigured ? 'OpenAI API is configured' : 'OpenAI API key is missing',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check health',
      error: error.message,
    });
  }
});

export default router;
