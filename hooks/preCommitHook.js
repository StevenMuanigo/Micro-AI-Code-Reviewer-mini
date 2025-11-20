// Pre-commit hook for local code review

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { analyzeCode } = require('../services/geminiService');
const { getCodeQualityScore, getSecurityIssues } = require('../services/analysisService');

// Function to run pre-commit code review
async function runPreCommitReview() {
  try {
    console.log('Running pre-commit code review...');
    
    // Get staged files
    const stagedFiles = getStagedFiles();
    
    if (stagedFiles.length === 0) {
      console.log('No staged files to review.');
      return { success: true, issues: [] };
    }
    
    const allIssues = [];
    
    // Analyze each staged file
    for (const file of stagedFiles) {
      if (isSupportedFileType(file)) {
        const filePath = path.join(process.cwd(), file);
        
        // Check if file exists and is not too large
        if (fs.existsSync(filePath) && fs.statSync(filePath).size < 1000000) { // 1MB limit
          const code = fs.readFileSync(filePath, 'utf8');
          
          // Perform analysis
          const qualityScore = await getCodeQualityScore(code);
          const securityIssues = await getSecurityIssues(code);
          
          // Get AI review for significant changes
          if (qualityScore.score < 80 || securityIssues.length > 0) {
            const aiReview = await analyzeCode(code, getFileLanguage(file));
            
            const fileIssues = {
              file,
              qualityScore: qualityScore.score,
              securityIssues,
              aiReview
            };
            
            allIssues.push(fileIssues);
          }
        }
      }
    }
    
    // Report issues
    if (allIssues.length > 0) {
      console.log('\n=== CODE REVIEW ISSUES FOUND ===');
      allIssues.forEach(issue => {
        console.log(`\nFile: ${issue.file}`);
        console.log(`Quality Score: ${issue.qualityScore}/100`);
        
        if (issue.securityIssues.length > 0) {
          console.log('Security Issues:');
          issue.securityIssues.forEach(secIssue => {
            console.log(`  - ${secIssue.type}: ${secIssue.description} [${secIssue.severity}]`);
          });
        }
        
        if (issue.aiReview.bugs && issue.aiReview.bugs.length > 0) {
          console.log('Potential Bugs:');
          issue.aiReview.bugs.forEach(bug => {
            console.log(`  - ${bug.type}: ${bug.description} [${bug.severity}]`);
          });
        }
      });
      
      console.log('\nPlease address these issues before committing.');
      process.exit(1); // Prevent commit
    } else {
      console.log('✅ Code review passed. No critical issues found.');
      return { success: true, issues: [] };
    }
  } catch (error) {
    console.error('Pre-commit review error:', error);
    // Don't prevent commit on tool failure
    console.log('⚠️  Code review tool failed. Proceeding with commit.');
    return { success: false, error: error.message };
  }
}

// Function to get staged files from git
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Failed to get staged files:', error);
    return [];
  }
}

// Function to check if file type is supported
function isSupportedFileType(filename) {
  const supportedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c'];
  return supportedExtensions.some(ext => filename.endsWith(ext));
}

// Function to determine file language
function getFileLanguage(filename) {
  const extensionMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c'
  };
  
  const ext = path.extname(filename);
  return extensionMap[ext] || 'text';
}

module.exports = {
  runPreCommitReview
};