// Webhook handler for automatic code review triggering

const express = require('express');
const router = express.Router();
const { analyzeGitHubPR } = require('../integrations/github');
const { analyzeGitLabMR } = require('../integrations/gitlab');
const { structureCodeReviewOutput } = require('../utils/formatter');

// GitHub webhook handler
router.post('/github', async (req, res) => {
  try {
    const event = req.header('X-GitHub-Event');
    const payload = req.body;
    
    // Only process pull request events
    if (event === 'pull_request' && payload.action === 'opened') {
      const { repository, pull_request: pr } = payload;
      
      console.log(`Processing GitHub PR #${pr.number} for ${repository.full_name}`);
      
      // Analyze the PR
      const analysis = await analyzeGitHubPR(
        repository.owner.login,
        repository.name,
        pr.number,
        process.env.GITHUB_TOKEN
      );
      
      // Structure the output
      const formattedAnalysis = structureCodeReviewOutput(analysis);
      
      // In a full implementation, we would post comments back to the PR
      console.log('PR Analysis Complete:', JSON.stringify(formattedAnalysis, null, 2));
      
      return res.status(200).json({ 
        message: 'PR analysis completed', 
        pr: pr.number,
        repository: repository.full_name
      });
    }
    
    res.status(200).json({ message: 'Event received' });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// GitLab webhook handler
router.post('/gitlab', async (req, res) => {
  try {
    const event = req.header('X-Gitlab-Event');
    const payload = req.body;
    
    // Only process merge request events
    if (event === 'Merge Request Hook' && payload.object_attributes.state === 'opened') {
      const { project, object_attributes: mr } = payload;
      
      console.log(`Processing GitLab MR #${mr.iid} for ${project.path_with_namespace}`);
      
      // Analyze the MR
      const analysis = await analyzeGitLabMR(
        project.id,
        mr.iid,
        process.env.GITLAB_TOKEN,
        process.env.GITLAB_URL
      );
      
      // Structure the output
      const formattedAnalysis = structureCodeReviewOutput(analysis);
      
      // In a full implementation, we would post comments back to the MR
      console.log('MR Analysis Complete:', JSON.stringify(formattedAnalysis, null, 2));
      
      return res.status(200).json({ 
        message: 'MR analysis completed', 
        mr: mr.iid,
        project: project.path_with_namespace
      });
    }
    
    res.status(200).json({ message: 'Event received' });
  } catch (error) {
    console.error('GitLab webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Generic webhook handler for other providers
router.post('/generic', async (req, res) => {
  try {
    const payload = req.body;
    
    console.log('Received generic webhook:', JSON.stringify(payload, null, 2));
    
    // In a full implementation, we would determine the provider and process accordingly
    
    res.status(200).json({ message: 'Generic webhook received' });
  } catch (error) {
    console.error('Generic webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

module.exports = router;