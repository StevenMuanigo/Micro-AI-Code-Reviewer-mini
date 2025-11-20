// Multi-language code analyzer service

// Language-specific analysis rules
const languageRules = {
  javascript: {
    extensions: ['.js', '.jsx'],
    patterns: {
      asyncAwait: /\basync\s+function\b|\basync\s+\([^)]*\)\s*=>/g,
      promiseChaining: /\.then\(|\.catch\(/g,
      varUsage: /\bvar\b/g,
      consoleLog: /\bconsole\.log\b/g
    }
  },
  typescript: {
    extensions: ['.ts', '.tsx'],
    patterns: {
      anyType: /:\s*any\b/g,
      explicitAny: /<any>/g,
      nonNullAssertion: /!\./g,
      tsIgnore: /@ts-ignore/g
    }
  },
  python: {
    extensions: ['.py'],
    patterns: {
      globalUsage: /\bglobal\b/g,
      execUsage: /\bexec\b/g,
      evalUsage: /\beval\b/g,
      mutableDefault: /def\s+\w+\([^)]*=\s*\[.*\].*\)/g
    }
  },
  java: {
    extensions: ['.java'],
    patterns: {
      systemOut: /System\.out\.print/g,
      rawTypes: /List<\w+>/g,
      stringConcat: /\+\s*"/g,
      nullCheck: /==\s*null/g
    }
  }
};

// Function to detect language from file extension
function detectLanguage(filename) {
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  
  for (const [language, rules] of Object.entries(languageRules)) {
    if (rules.extensions.includes(extension)) {
      return language;
    }
  }
  
  return 'text'; // Default fallback
}

// Function to perform language-specific analysis
function analyzeLanguageSpecific(code, language) {
  const issues = [];
  
  if (languageRules[language]) {
    const rules = languageRules[language];
    
    // Check for language-specific patterns
    for (const [patternName, pattern] of Object.entries(rules.patterns)) {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: patternName,
          description: `Detected ${patternName} pattern`,
          count: matches.length,
          severity: getSeverityForPattern(patternName)
        });
      }
    }
  }
  
  return issues;
}

// Function to get severity for a pattern
function getSeverityForPattern(patternName) {
  const severityMap = {
    varUsage: 'Medium',
    consoleLog: 'Low',
    anyType: 'Medium',
    tsIgnore: 'High',
    execUsage: 'High',
    evalUsage: 'High',
    systemOut: 'Medium',
    mutableDefault: 'Medium'
  };
  
  return severityMap[patternName] || 'Low';
}

// Function to get language support info
function getLanguageSupportInfo() {
  return Object.keys(languageRules);
}

module.exports = {
  detectLanguage,
  analyzeLanguageSpecific,
  getLanguageSupportInfo
};