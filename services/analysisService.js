// Advanced code analysis service

// Function to calculate code quality score
async function getCodeQualityScore(code) {
  try {
    // Calculate various metrics
    const linesOfCode = code.split('\n').length;
    const complexity = calculateComplexity(code);
    const duplication = calculateDuplication(code);
    const readability = calculateReadability(code);
    
    // Calculate weighted score (out of 100)
    const qualityScore = Math.round(
      (readability * 0.4) + 
      (complexity * 0.3) + 
      ((100 - duplication) * 0.3)
    );
    
    return {
      score: qualityScore,
      metrics: {
        linesOfCode,
        complexity,
        duplication,
        readability
      }
    };
  } catch (error) {
    console.error('Quality score calculation error:', error);
    return { score: 0, metrics: {} };
  }
}

// Function to identify security issues
async function getSecurityIssues(code) {
  const issues = [];
  
  // Check for common XSS vulnerabilities
  if (code.includes('.innerHTML') || code.includes('eval(')) {
    issues.push({
      type: 'XSS Vulnerability',
      description: 'Potential cross-site scripting vulnerability detected',
      severity: 'High',
      suggestion: 'Use safer alternatives like textContent or sanitize user inputs'
    });
  }
  
  // Check for SQL injection vulnerabilities
  if (code.includes('+') && (code.includes('SELECT') || code.includes('INSERT'))) {
    issues.push({
      type: 'SQL Injection',
      description: 'Potential SQL injection vulnerability detected',
      severity: 'High',
      suggestion: 'Use parameterized queries or ORM methods'
    });
  }
  
  // Check for open redirect vulnerabilities
  if (code.includes('window.location') || code.includes('redirect(')) {
    issues.push({
      type: 'Open Redirect',
      description: 'Potential open redirect vulnerability detected',
      severity: 'Medium',
      suggestion: 'Validate redirect URLs against whitelist'
    });
  }
  
  return issues;
}

// Function to check dependencies for vulnerabilities
async function checkDependencies(code) {
  // In a real implementation, this would check package.json or similar
  // For now, we'll simulate checking for common vulnerable patterns
  const vulnerabilities = [];
  
  // Check for outdated patterns (simulated)
  if (code.includes('new Buffer(')) {
    vulnerabilities.push({
      type: 'Deprecated API',
      description: 'Buffer() constructor is deprecated and unsafe',
      severity: 'High',
      suggestion: 'Use Buffer.alloc() or Buffer.from() instead'
    });
  }
  
  return vulnerabilities;
}

// Helper function to calculate code complexity
function calculateComplexity(code) {
  // Simple cyclomatic complexity estimation
  const controlFlowKeywords = ['if', 'for', 'while', 'case', 'catch'];
  let complexity = 1; // Base complexity
  
  controlFlowKeywords.forEach(keyword => {
    const regex = new RegExp('\\b' + keyword + '\\b', 'g');
    const matches = code.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  });
  
  // Limit to 100 for scoring purposes
  return Math.min(complexity * 10, 100);
}

// Helper function to estimate code duplication
function calculateDuplication(code) {
  // Simplified duplication detection
  const lines = code.split('\n');
  const uniqueLines = new Set(lines);
  const duplicationRate = ((lines.length - uniqueLines.size) / lines.length) * 100;
  return Math.round(duplicationRate);
}

// Helper function to calculate readability score
function calculateReadability(code) {
  // Simplified readability calculation
  const lines = code.split('\n');
  const avgLineLength = code.length / lines.length;
  
  // Score based on average line length (shorter is better)
  let readabilityScore = 100 - Math.min(avgLineLength, 100);
  
  // Adjust for very short lines (may indicate poor formatting)
  if (avgLineLength < 10) {
    readabilityScore -= 20;
  }
  
  return Math.max(Math.round(readabilityScore), 0);
}

module.exports = {
  getCodeQualityScore,
  getSecurityIssues,
  checkDependencies
};