// GitLab integration for MR analysis

const axios = require('axios');

// Function to analyze GitLab merge request
async function analyzeGitLabMR(projectId, mrId, gitlabToken, gitlabUrl = 'https://gitlab.com') {
  try {
    const headers = {
      'PRIVATE-TOKEN': gitlabToken,
      'Accept': 'application/json'
    };
    
    // Get MR details
    const mrResponse = await axios.get(
      `${gitlabUrl}/api/v4/projects/${projectId}/merge_requests/${mrId}`,
      { headers }
    );
    
    const mrDetails = mrResponse.data;
    
    // Get MR changes
    const changesResponse = await axios.get(
      `${gitlabUrl}/api/v4/projects/${projectId}/merge_requests/${mrId}/changes`,
      { headers }
    );
    
    const mrChanges = changesResponse.data;
    
    // Analyze each file change
    const analysisResults = [];
    for (const change of mrChanges.changes) {
      // Skip deleted files
      if (change.deleted_file) continue;
      
      // Get file content (newly added or modified)
      const fileContent = change.content || '';
      
      // Perform code review (this would integrate with our analysis service)
      // For now, we'll simulate the result
      const fileAnalysis = {
        filename: change.new_path,
        oldFilename: change.old_path,
        added: change.added_lines,
        removed: change.removed_lines,
        review: await simulateCodeReview(fileContent)
      };
      
      analysisResults.push(fileAnalysis);
    }
    
    return {
      mr: {
        id: mrDetails.id,
        iid: mrDetails.iid,
        title: mrDetails.title,
        author: mrDetails.author.name,
        url: mrDetails.web_url
      },
      files: analysisResults
    };
  } catch (error) {
    console.error('GitLab MR analysis error:', error);
    throw new Error('Failed to analyze GitLab MR');
  }
}

// Function to post review comments to MR
async function postReviewComments(projectId, mrId, comments, gitlabToken, gitlabUrl = 'https://gitlab.com') {
  try {
    const headers = {
      'PRIVATE-TOKEN': gitlabToken,
      'Accept': 'application/json'
    };
    
    // Post comments for each issue found
    for (const comment of comments) {
      await axios.post(
        `${gitlabUrl}/api/v4/projects/${projectId}/merge_requests/${mrId}/notes`,
        {
          body: comment.body
        },
        { headers }
      );
    }
    
    return { success: true, postedComments: comments.length };
  } catch (error) {
    console.error('Failed to post review comments:', error);
    throw new Error('Failed to post review comments to MR');
  }
}

// Simulate code review (to be replaced with actual analysis)
async function simulateCodeReview(code) {
  // This would integrate with our actual code analysis services
  return {
    issues: [],
    suggestions: []
  };
}

module.exports = {
  analyzeGitLabMR,
  postReviewComments
};