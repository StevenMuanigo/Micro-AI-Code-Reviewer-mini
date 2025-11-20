const express = require('express');
const router = express.Router();
const { analyzeCode, analyzeCodeWithContext, analyzeCodeWithLearning } = require('../services/geminiService');
const { getCodeQualityScore, getSecurityIssues, checkDependencies } = require('../services/analysisService');
const { createStructuredOutput } = require('../utils/formatter');

// Code review endpoint
router.post('/', async (req, res) => {
  try {
    const { code, language, contextFiles } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // Perform advanced analysis
    const qualityScore = await getCodeQualityScore(code);
    const securityIssues = await getSecurityIssues(code);
    const dependencyIssues = await checkDependencies(code);
    
    // Get AI review from Gemini
    let aiReview;
    if (contextFiles && contextFiles.length > 0) {
      // Use context-aware analysis if context files are provided
      aiReview = await analyzeCodeWithContext(code, language, contextFiles);
    } else {
      // Use basic analysis
      aiReview = await analyzeCode(code, language);
    }
    
    // Combine all analysis results
    const result = {
      qualityScore,
      securityIssues,
      dependencyIssues,
      aiReview
    };
    
    // Structure output with severity tags and interactive feedback
    const structuredOutput = createStructuredOutput(result);
    
    res.json(structuredOutput);
  } catch (error) {
    console.error('Code review error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

// Endpoint for interactive feedback
router.post('/interactive', async (req, res) => {
  try {
    const { code, language, contextFiles } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // Get AI review from Gemini with context awareness
    let aiReview;
    if (contextFiles && contextFiles.length > 0) {
      aiReview = await analyzeCodeWithContext(code, language, contextFiles);
    } else {
      aiReview = await analyzeCode(code, language);
    }
    
    // Return AI review with interactive feedback
    res.json(aiReview);
  } catch (error) {
    console.error('Interactive code review error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

// Endpoint for learning mode
router.post('/learn', async (req, res) => {
  try {
    const { code, language, userId } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // Get AI review from Gemini with learning mode
    const aiReview = await analyzeCodeWithLearning(code, language, userId);
    
    // Return AI review with learning mode
    res.json(aiReview);
  } catch (error) {
    console.error('Learning mode code review error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

// Endpoint to store user feedback
router.post('/feedback', (req, res) => {
  try {
    const { userId, feedback } = req.body;
    
    if (!userId || !feedback) {
      return res.status(400).json({ error: 'User ID and feedback are required' });
    }
    
    // Store user feedback
    require('../services/geminiService').storeUserFeedback(userId, feedback);
    
    res.json({ success: true, message: 'Feedback stored successfully' });
  } catch (error) {
    console.error('Feedback storage error:', error);
    res.status(500).json({ error: 'Failed to store feedback' });
  }
});

module.exports = router;