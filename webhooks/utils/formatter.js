// Utility functions for formatting code review results

// Function to format issues with severity tags
function formatIssuesWithSeverity(issues) {
  return issues.map(issue => ({
    ...issue,
    severityTag: `[${issue.severity}]`
  }));
}

// Function to structure JSON output for code review
function structureCodeReviewOutput(reviewData) {
  const {
    qualityScore,
    securityIssues,
    dependencyIssues,
    aiReview
  } = reviewData;
  
  return {
    summary: {
      qualityScore: qualityScore.score,
      totalIssues: (securityIssues.length + dependencyIssues.length + 
                   (aiReview.bugs ? aiReview.bugs.length : 0))
    },
    qualityMetrics: qualityScore.metrics,
    security: formatIssuesWithSeverity(securityIssues),
    dependencies: formatIssuesWithSeverity(dependencyIssues),
    aiAnalysis: {
      bugs: aiReview.bugs ? formatIssuesWithSeverity(aiReview.bugs) : [],
      performance: aiReview.performance ? formatIssuesWithSeverity(aiReview.performance) : [],
      refactor: aiReview.refactor ? formatIssuesWithSeverity(aiReview.refactor) : []
    }
  };
}

// Function to generate interactive feedback format
function generateInteractiveFeedback(issues) {
  return issues.map(issue => ({
    ...issue,
    interactiveExample: issue.suggestion.includes('example') ? 
      generateExampleCode(issue) : 
      'No example available',
    // Add click handler for interactive UI
    onClick: `showExample('${issue.type}', '${issue.description}')`
  }));
}

// Enhanced function to generate example code for refactor suggestions
function generateExampleCode(issue) {
  // This would be enhanced in a full implementation
  return `// Example for fixing: ${issue.type}\n// Original code pattern detected\n// Suggested improvement based on best practices`;
}

// Function to create structured JSON output with severity tags
function createStructuredOutput(analysis) {
  return {
    id: `review_${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: analysis.summary.totalIssues,
      qualityScore: analysis.summary.qualityScore,
      severityBreakdown: {
        high: countIssuesBySeverity(analysis, 'High'),
        medium: countIssuesBySeverity(analysis, 'Medium'),
        low: countIssuesBySeverity(analysis, 'Low')
      }
    },
    details: {
      quality: analysis.qualityMetrics,
      security: analysis.security.map(issue => ({
        ...issue,
        severity: issue.severity,
        type: 'Security'
      })),
      dependencies: analysis.dependencies.map(issue => ({
        ...issue,
        severity: issue.severity,
        type: 'Dependency'
      })),
      ai: {
        bugs: analysis.aiAnalysis.bugs.map(issue => ({
          ...issue,
          severity: issue.severity,
          type: 'Bug'
        })),
        performance: analysis.aiAnalysis.performance.map(issue => ({
          ...issue,
          severity: issue.severity,
          type: 'Performance'
        })),
        refactor: analysis.aiAnalysis.refactor.map(issue => ({
          ...issue,
          severity: issue.severity,
          type: 'Refactor'
        }))
      }
    }
  };
}

// Helper function to count issues by severity
function countIssuesBySeverity(analysis, severity) {
  let count = 0;
  count += analysis.security.filter(i => i.severity === severity).length;
  count += analysis.dependencies.filter(i => i.severity === severity).length;
  count += analysis.aiAnalysis.bugs.filter(i => i.severity === severity).length;
  count += analysis.aiAnalysis.performance.filter(i => i.severity === severity).length;
  count += analysis.aiAnalysis.refactor.filter(i => i.severity === severity).length;
  return count;
}

module.exports = {
  formatIssuesWithSeverity,
  structureCodeReviewOutput,
  generateInteractiveFeedback,
  createStructuredOutput
};