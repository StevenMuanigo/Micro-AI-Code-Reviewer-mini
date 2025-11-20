#!/usr/bin/env node

// CLI version of the code reviewer

const fs = require('fs');
const path = require('path');
const { analyzeCode } = require('../services/geminiService');
const { getCodeQualityScore, getSecurityIssues, checkDependencies } = require('../services/analysisService');
const { createStructuredOutput } = require('../utils/formatter');
const { detectLanguage } = require('../services/multiLanguageAnalyzer');

// Main CLI function
async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('Usage: code-reviewer <file-path> [options]');
      console.log('Options:');
      console.log('  --format <json|text>  Output format (default: text)');
      console.log('  --language <lang>     Specify language (default: auto-detect)');
      console.log('  --help                Show this help message');
      process.exit(0);
    }
    
    // Parse arguments
    const filePath = args[0];
    const options = parseArguments(args.slice(1));
    
    if (options.help) {
      console.log('Usage: code-reviewer <file-path> [options]');
      console.log('Options:');
      console.log('  --format <json|text>  Output format (default: text)');
      console.log('  --language <lang>     Specify language (default: auto-detect)');
      console.log('  --help                Show this help message');
      process.exit(0);
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File '${filePath}' not found`);
      process.exit(1);
    }
    
    // Read file content
    const code = fs.readFileSync(filePath, 'utf8');
    
    // Detect language if not specified
    const language = options.language || detectLanguage(filePath);
    
    // Perform analysis
    console.log(`Analyzing ${filePath} (${language})...`);
    
    // Perform advanced analysis
    const qualityScore = await getCodeQualityScore(code);
    const securityIssues = await getSecurityIssues(code);
    const dependencyIssues = await checkDependencies(code);
    
    // Get AI review from Gemini
    const aiReview = await analyzeCode(code, language);
    
    // Combine all analysis results
    const result = {
      qualityScore,
      securityIssues,
      dependencyIssues,
      aiReview
    };
    
    // Structure output
    const structuredOutput = createStructuredOutput(result);
    
    // Output results
    if (options.format === 'json') {
      console.log(JSON.stringify(structuredOutput, null, 2));
    } else {
      printTextOutput(structuredOutput, filePath);
    }
  } catch (error) {
    console.error('Code review failed:', error.message);
    process.exit(1);
  }
}

// Function to parse command line arguments
function parseArguments(args) {
  const options = {
    format: 'text',
    language: null
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--format':
        options.format = args[i + 1] || 'text';
        i++; // Skip next argument
        break;
      case '--language':
        options.language = args[i + 1] || null;
        i++; // Skip next argument
        break;
      case '--help':
        options.help = true;
        break;
    }
  }
  
  return options;
}

// Function to print text output
function printTextOutput(analysis, filePath) {
  console.log('\n=== CODE REVIEW RESULTS ===');
  console.log(`File: ${filePath}`);
  console.log(`Quality Score: ${analysis.summary.qualityScore}/100`);
  console.log(`Total Issues: ${analysis.summary.totalIssues}`);
  
  console.log('\n--- Severity Breakdown ---');
  console.log(`High: ${analysis.summary.severityBreakdown.high}`);
  console.log(`Medium: ${analysis.summary.severityBreakdown.medium}`);
  console.log(`Low: ${analysis.summary.severityBreakdown.low}`);
  
  if (analysis.details.security.length > 0) {
    console.log('\n--- Security Issues ---');
    analysis.details.security.forEach(issue => {
      console.log(`[${issue.severity}] ${issue.type}: ${issue.description}`);
    });
  }
  
  if (analysis.details.dependencies.length > 0) {
    console.log('\n--- Dependency Issues ---');
    analysis.details.dependencies.forEach(issue => {
      console.log(`[${issue.severity}] ${issue.type}: ${issue.description}`);
    });
  }
  
  if (analysis.details.ai.bugs.length > 0) {
    console.log('\n--- Potential Bugs ---');
    analysis.details.ai.bugs.forEach(bug => {
      console.log(`[${bug.severity}] ${bug.type}: ${bug.description}`);
    });
  }
  
  if (analysis.details.ai.performance.length > 0) {
    console.log('\n--- Performance Suggestions ---');
    analysis.details.ai.performance.forEach(perf => {
      console.log(`[${perf.severity}] ${perf.type}: ${perf.description}`);
    });
  }
  
  if (analysis.details.ai.refactor.length > 0) {
    console.log('\n--- Refactor Opportunities ---');
    analysis.details.ai.refactor.forEach(refactor => {
      console.log(`[${refactor.severity}] ${refactor.type}: ${refactor.description}`);
    });
  }
}

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = {
  main
};