// Code style enforcement service

const { ESLint } = require('eslint');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to check code style with ESLint
async function checkESLintStyle(code, filePath = null) {
  try {
    // Initialize ESLint
    const eslint = new ESLint({
      useEslintrc: true, // Use .eslintrc config if available
      fix: false
    });
    
    // If we have a file path, lint the file directly
    if (filePath && fs.existsSync(filePath)) {
      const results = await eslint.lintFiles([filePath]);
      return processESLintResults(results);
    } else {
      // Otherwise, lint the code string
      const results = await eslint.lintText(code);
      return processESLintResults(results);
    }
  } catch (error) {
    console.error('ESLint style check error:', error);
    return {
      success: false,
      error: 'Failed to run ESLint check',
      details: error.message
    };
  }
}

// Function to process ESLint results
function processESLintResults(results) {
  const issues = [];
  
  results.forEach(result => {
    result.messages.forEach(message => {
      issues.push({
        type: 'ESLint',
        rule: message.ruleId || 'unknown',
        description: message.message,
        severity: getSeverityFromESLint(message.severity),
        line: message.line,
        column: message.column,
        source: message.source
      });
    });
  });
  
  return {
    success: true,
    issues: issues,
    errorCount: results.reduce((acc, result) => acc + result.errorCount, 0),
    warningCount: results.reduce((acc, result) => acc + result.warningCount, 0)
  };
}

// Function to convert ESLint severity to our format
function getSeverityFromESLint(eslintSeverity) {
  switch (eslintSeverity) {
    case 1: return 'Medium'; // Warning
    case 2: return 'High';   // Error
    default: return 'Low';   // Unknown
  }
}

// Function to check Prettier style
async function checkPrettierStyle(code, filePath = null) {
  try {
    // Create a temporary file if we don't have one
    let tempFilePath = filePath;
    if (!tempFilePath) {
      tempFilePath = path.join(__dirname, '..', 'temp', `temp_${Date.now()}.js`);
      fs.writeFileSync(tempFilePath, code);
    }
    
    // Check if Prettier would make changes
    try {
      const output = execSync(`npx prettier --check "${tempFilePath}"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // If check passes, no issues
      return {
        success: true,
        issues: [],
        formatted: true
      };
    } catch (error) {
      // If check fails, there are formatting issues
      return {
        success: true,
        issues: [{
          type: 'Prettier',
          rule: 'formatting',
          description: 'Code does not match Prettier formatting standards',
          severity: 'Low',
          fixable: true
        }],
        formatted: false
      };
    }
  } catch (error) {
    console.error('Prettier style check error:', error);
    return {
      success: false,
      error: 'Failed to run Prettier check',
      details: error.message
    };
  }
}

// Function to enforce code style rules
async function enforceCodeStyle(code, config = {}) {
  try {
    const results = {
      eslint: null,
      prettier: null,
      customRules: []
    };
    
    // Check ESLint if enabled
    if (config.eslint !== false) {
      results.eslint = await checkESLintStyle(code, config.filePath);
    }
    
    // Check Prettier if enabled
    if (config.prettier !== false) {
      results.prettier = await checkPrettierStyle(code, config.filePath);
    }
    
    // Check custom style rules
    if (config.customRules !== false) {
      results.customRules = checkCustomStyleRules(code, config.language);
    }
    
    return {
      success: true,
      results: results,
      summary: generateStyleSummary(results)
    };
  } catch (error) {
    console.error('Code style enforcement error:', error);
    return {
      success: false,
      error: 'Failed to enforce code style',
      details: error.message
    };
  }
}

// Function to check custom style rules
function checkCustomStyleRules(code, language = 'javascript') {
  const issues = [];
  
  // Common style rules across languages
  const rules = {
    javascript: [
      {
        name: 'no-console',
        pattern: /\bconsole\.(log|warn|error|info|debug)\s*\(/g,
        severity: 'Medium',
        description: 'Avoid using console statements in production code'
      },
      {
        name: 'max-line-length',
        pattern: /.{120,}/g,
        severity: 'Low',
        description: 'Line length exceeds 120 characters'
      },
      {
        name: 'no-var',
        pattern: /\bvar\s+/g,
        severity: 'Medium',
        description: 'Prefer const or let over var'
      }
    ],
    python: [
      {
        name: 'line-length',
        pattern: /.{80,}/g,
        severity: 'Low',
        description: 'Line length exceeds 80 characters'
      },
      {
        name: 'no-exec',
        pattern: /\bexec\s*\(/g,
        severity: 'High',
        description: 'Avoid using exec function'
      }
    ],
    java: [
      {
        name: 'system-out',
        pattern: /System\.(out|err)\.print/g,
        severity: 'Medium',
        description: 'Avoid using System.out.println in production code'
      }
    ]
  };
  
  const languageRules = rules[language] || rules.javascript;
  
  languageRules.forEach(rule => {
    const matches = code.match(rule.pattern);
    if (matches) {
      issues.push({
        type: 'Custom',
        rule: rule.name,
        description: rule.description,
        severity: rule.severity,
        count: matches.length
      });
    }
  });
  
  return issues;
}

// Function to generate style summary
function generateStyleSummary(results) {
  const summary = {
    totalIssues: 0,
    severityBreakdown: {
      high: 0,
      medium: 0,
      low: 0
    }
  };
  
  // Count ESLint issues
  if (results.eslint && results.eslint.success) {
    summary.totalIssues += results.eslint.issues.length;
    results.eslint.issues.forEach(issue => {
      const severity = issue.severity.toLowerCase();
      if (summary.severityBreakdown.hasOwnProperty(severity)) {
        summary.severityBreakdown[severity]++;
      }
    });
  }
  
  // Count Prettier issues
  if (results.prettier && results.prettier.success) {
    summary.totalIssues += results.prettier.issues.length;
    results.prettier.issues.forEach(issue => {
      const severity = issue.severity.toLowerCase();
      if (summary.severityBreakdown.hasOwnProperty(severity)) {
        summary.severityBreakdown[severity]++;
      }
    });
  }
  
  // Count custom rule issues
  summary.totalIssues += results.customRules.length;
  results.customRules.forEach(issue => {
    const severity = issue.severity.toLowerCase();
    if (summary.severityBreakdown.hasOwnProperty(severity)) {
      summary.severityBreakdown[severity]++;
    }
  });
  
  return summary;
}

// Function to generate style fix suggestions
function generateStyleFixSuggestions(issues) {
  return issues.map(issue => {
    return {
      ...issue,
      suggestion: generateFixSuggestion(issue),
      fixable: isIssueFixable(issue)
    };
  });
}

// Function to generate fix suggestion for an issue
function generateFixSuggestion(issue) {
  const suggestions = {
    'no-console': 'Replace console statements with a proper logging library',
    'no-var': 'Replace var with const or let based on variable mutability',
    'system-out': 'Use a logging framework instead of System.out.println',
    'line-length': 'Break long lines into multiple shorter lines',
    'formatting': 'Run Prettier to automatically format the code'
  };
  
  return suggestions[issue.rule] || 'Refer to style guide for proper formatting';
}

// Function to check if an issue is fixable
function isIssueFixable(issue) {
  const fixableRules = ['formatting', 'no-var', 'line-length'];
  return fixableRules.includes(issue.rule);
}

module.exports = {
  checkESLintStyle,
  checkPrettierStyle,
  enforceCodeStyle,
  generateStyleFixSuggestions
};