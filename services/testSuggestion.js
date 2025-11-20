// Automated test suggestion service

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to suggest tests for code snippet
async function suggestTestsForCode(code, language = 'javascript') {
  try {
    // Select the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt for test suggestions
    const prompt = `
      Analyze the following ${language} code and suggest appropriate unit and integration tests.
      
      Code to analyze:
      ${code}
      
      Please provide test suggestions in the following JSON format:
      {
        "unitTests": [
          {
            "functionName": "name_of_function_to_test",
            "testName": "descriptive_test_name",
            "description": "what_this_test_verifies",
            "testType": "unit",
            "suggestion": "detailed_test_implementation_suggestion"
          }
        ],
        "integrationTests": [
          {
            "componentName": "name_of_component_to_test",
            "testName": "descriptive_integration_test_name",
            "description": "what_this_integration_test_verifies",
            "testType": "integration",
            "suggestion": "detailed_integration_test_implementation_suggestion"
          }
        ]
      }
      
      Focus on:
      1. Edge cases and error conditions
      2. Business logic validation
      3. Input/output validation
      4. Asynchronous behavior if present
      5. Integration points with external services
      
      Provide your response in valid JSON format only, without any additional text.
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // If parsing fails, return the raw text
      return { rawResponse: text };
    }
  } catch (error) {
    console.error('Test suggestion error:', error);
    throw new Error('Failed to suggest tests for code');
  }
}

// Function to generate test code templates
async function generateTestCodeTemplates(testSuggestions, language = 'javascript') {
  try {
    // Select the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt for test code generation
    const prompt = `
      Based on these test suggestions for ${language}:
      ${JSON.stringify(testSuggestions, null, 2)}
      
      Please generate actual test code templates for each suggestion.
      
      For each test, provide:
      1. The complete test function with proper structure
      2. Example assertions
      3. Mock setup if needed
      4. Comments explaining key parts
      
      Format your response as a JSON object where keys are test names and values are the test code.
      Provide your response in valid JSON format only, without any additional text.
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // If parsing fails, return the raw text
      return { rawResponse: text };
    }
  } catch (error) {
    console.error('Test code generation error:', error);
    throw new Error('Failed to generate test code templates');
  }
}

// Function to prioritize test suggestions
function prioritizeTestSuggestions(testSuggestions) {
  // Add priority based on importance
  const prioritized = {
    unitTests: [],
    integrationTests: []
  };
  
  // Prioritize unit tests
  if (testSuggestions.unitTests) {
    prioritized.unitTests = testSuggestions.unitTests.map(test => ({
      ...test,
      priority: calculateTestPriority(test),
      estimatedEffort: estimateTestEffort(test)
    }));
  }
  
  // Prioritize integration tests
  if (testSuggestions.integrationTests) {
    prioritized.integrationTests = testSuggestions.integrationTests.map(test => ({
      ...test,
      priority: calculateTestPriority(test),
      estimatedEffort: estimateTestEffort(test)
    }));
  }
  
  return prioritized;
}

// Function to calculate test priority
function calculateTestPriority(test) {
  // High priority for critical functionality
  const criticalKeywords = ['validate', 'authenticate', 'authorize', 'payment', 'security'];
  const mediumKeywords = ['calculate', 'transform', 'format', 'filter'];
  
  const description = (test.description || '').toLowerCase();
  
  if (criticalKeywords.some(keyword => description.includes(keyword))) {
    return 'high';
  } else if (mediumKeywords.some(keyword => description.includes(keyword))) {
    return 'medium';
  } else {
    return 'low';
  }
}

// Function to estimate test effort
function estimateTestEffort(test) {
  // Simple estimation based on test complexity
  const complexKeywords = ['async', 'database', 'api', 'external', 'integration'];
  const simpleKeywords = ['validate', 'check', 'verify'];
  
  const description = (test.description || '').toLowerCase();
  
  if (complexKeywords.some(keyword => description.includes(keyword))) {
    return 'high';
  } else if (simpleKeywords.some(keyword => description.includes(keyword))) {
    return 'low';
  } else {
    return 'medium';
  }
}

module.exports = {
  suggestTestsForCode,
  generateTestCodeTemplates,
  prioritizeTestSuggestions
};