// Team collaboration insights service

// In-memory storage for team insights (in production, this would be a database)
const teamInsightsStorage = new Map();

// Function to analyze team collaboration patterns
function analyzeTeamCollaboration(prData) {
  try {
    // Extract developer information from PR data
    const developers = extractDevelopers(prData);
    
    // Analyze patterns across developers
    const commonIssues = findCommonIssues(developers);
    const bestPracticeViolations = findBestPracticeViolations(developers);
    
    // Generate insights
    const insights = {
      teamId: prData.teamId || 'default',
      analysisPeriod: {
        start: prData.startDate || new Date(Date.now() - 30*24*60*60*1000), // 30 days ago
        end: prData.endDate || new Date()
      },
      developerCount: developers.length,
      commonIssues: commonIssues,
      bestPracticeViolations: bestPracticeViolations,
      recommendations: generateTeamRecommendations(commonIssues, bestPracticeViolations)
    };
    
    // Store insights for future reference
    storeTeamInsights(insights);
    
    return insights;
  } catch (error) {
    console.error('Team collaboration analysis error:', error);
    throw new Error('Failed to analyze team collaboration patterns');
  }
}

// Function to extract developers from PR data
function extractDevelopers(prData) {
  const developers = new Map();
  
  // Process each PR to extract developer information
  prData.pullRequests.forEach(pr => {
    const author = pr.author;
    
    if (!developers.has(author)) {
      developers.set(author, {
        name: author,
        prCount: 0,
        issues: [],
        patterns: new Set()
      });
    }
    
    const devData = developers.get(author);
    devData.prCount++;
    
    // Extract issues from PR
    if (pr.analysis && pr.analysis.issues) {
      devData.issues.push(...pr.analysis.issues);
      
      // Identify patterns
      pr.analysis.issues.forEach(issue => {
        if (issue.type) {
          devData.patterns.add(issue.type);
        }
      });
    }
  });
  
  return Array.from(developers.values());
}

// Function to find common issues across developers
function findCommonIssues(developers) {
  const issueFrequency = new Map();
  
  // Count issue types across all developers
  developers.forEach(dev => {
    dev.issues.forEach(issue => {
      const key = issue.type || 'unknown';
      issueFrequency.set(key, (issueFrequency.get(key) || 0) + 1);
    });
  });
  
  // Filter for issues that appear frequently (more than 30% of developers)
  const commonIssues = [];
  const threshold = Math.ceil(developers.length * 0.3);
  
  issueFrequency.forEach((count, type) => {
    if (count >= threshold) {
      commonIssues.push({
        type: type,
        frequency: count,
        percentage: Math.round((count / developers.length) * 100)
      });
    }
  });
  
  return commonIssues.sort((a, b) => b.frequency - a.frequency);
}

// Function to find best practice violations
function findBestPracticeViolations(developers) {
  const violations = new Map();
  
  // Look for common anti-patterns
  developers.forEach(dev => {
    dev.patterns.forEach(pattern => {
      // Common JavaScript/TypeScript anti-patterns
      const antiPatterns = [
        'varUsage', 'consoleLog', 'anyType', 'tsIgnore',
        'globalUsage', 'execUsage', 'evalUsage', 'systemOut'
      ];
      
      if (antiPatterns.includes(pattern)) {
        violations.set(pattern, (violations.get(pattern) || 0) + 1);
      }
    });
  });
  
  // Convert to array and sort
  const violationArray = Array.from(violations.entries()).map(([type, count]) => ({
    type: type,
    count: count,
    percentage: Math.round((count / developers.length) * 100)
  }));
  
  return violationArray.sort((a, b) => b.count - a.count);
}

// Function to generate team recommendations
function generateTeamRecommendations(commonIssues, bestPracticeViolations) {
  const recommendations = [];
  
  // Recommendations based on common issues
  commonIssues.forEach(issue => {
    recommendations.push({
      type: 'common_issue',
      priority: issue.percentage > 50 ? 'high' : 'medium',
      description: `Team-wide issue: ${issue.type} appears in ${issue.percentage}% of developers' code`,
      suggestion: `Conduct a team training session on ${issue.type} best practices`
    });
  });
  
  // Recommendations based on best practice violations
  bestPracticeViolations.forEach(violation => {
    recommendations.push({
      type: 'best_practice',
      priority: violation.percentage > 40 ? 'high' : 'medium',
      description: `Best practice violation: ${violation.type} found in ${violation.percentage}% of developers`,
      suggestion: `Update team coding standards to explicitly prohibit ${violation.type}`
    });
  });
  
  return recommendations;
}

// Function to store team insights
function storeTeamInsights(insights) {
  const teamId = insights.teamId;
  
  if (!teamInsightsStorage.has(teamId)) {
    teamInsightsStorage.set(teamId, []);
  }
  
  const teamHistory = teamInsightsStorage.get(teamId);
  teamHistory.push({
    timestamp: new Date().toISOString(),
    ...insights
  });
  
  // Keep only the last 10 insights for each team
  if (teamHistory.length > 10) {
    teamInsightsStorage.set(teamId, teamHistory.slice(-10));
  }
}

// Function to get team insights history
function getTeamInsightsHistory(teamId) {
  return teamInsightsStorage.get(teamId) || [];
}

// Function to generate collaboration report
function generateCollaborationReport(insights) {
  return {
    title: `Team Collaboration Insights - ${insights.teamId}`,
    generated: new Date().toISOString(),
    summary: {
      developerCount: insights.developerCount,
      commonIssuesCount: insights.commonIssues.length,
      bestPracticeViolationsCount: insights.bestPracticeViolations.length
    },
    details: {
      commonIssues: insights.commonIssues,
      bestPracticeViolations: insights.bestPracticeViolations,
      recommendations: insights.recommendations
    }
  };
}

module.exports = {
  analyzeTeamCollaboration,
  getTeamInsightsHistory,
  generateCollaborationReport
};