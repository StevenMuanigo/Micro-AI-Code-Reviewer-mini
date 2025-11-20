const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// In-memory storage for learning mode (in production, this would be a database)
const userFeedbackStorage = new Map();

// Function to analyze code using Gemini AI
async function analyzeCode(code, language = 'javascript') {
  try {
    // Select the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt for code analysis
    const prompt = `
      Analyze the following ${language} code and provide detailed feedback in the following JSON format:
      
      {
        "bugs": [
          {
            "type": "bug_type",
            "description": "detailed_description",
            "line": "line_number_if_applicable",
            "severity": "High/Medium/Low",
            "suggestion": "how_to_fix"
          }
        ],
        "performance": [
          {
            "type": "performance_issue",
            "description": "detailed_description",
            "severity": "High/Medium/Low",
            "suggestion": "optimization_suggestion"
          }
        ],
        "refactor": [
          {
            "type": "refactor_opportunity",
            "description": "detailed_description",
            "severity": "High/Medium/Low",
            "suggestion": "refactor_suggestion_with_example"
          }
        ]
      }
      
      Code to analyze:
      ${code}
      
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
    console.error('Gemini AI analysis error:', error);
    throw new Error('Failed to analyze code with AI');
  }
}

// Enhanced function to analyze code with context awareness
async function analyzeCodeWithContext(code, language = 'javascript', contextFiles = []) {
  try {
    // Select the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt with context awareness
    let prompt = `
      Analyze the following ${language} code and provide detailed feedback in the following JSON format:
      
      {
        "bugs": [
          {
            "type": "bug_type",
            "description": "detailed_description",
            "line": "line_number_if_applicable",
            "severity": "High/Medium/Low",
            "suggestion": "how_to_fix"
          }
        ],
        "performance": [
          {
            "type": "performance_issue",
            "description": "detailed_description",
            "severity": "High/Medium/Low",
            "suggestion": "optimization_suggestion"
          }
        ],
        "refactor": [
          {
            "type": "refactor_opportunity",
            "description": "detailed_description",
            "severity": "High/Medium/Low",
            "suggestion": "refactor_suggestion_with_example"
          }
        ]
      }
      
      Main code to analyze:
      ${code}
    `;
    
    // Add context files if provided
    if (contextFiles.length > 0) {
      prompt += "\n\nContext files for better understanding:\n";
      contextFiles.forEach((file, index) => {
        prompt += `\n--- Context File ${index + 1}: ${file.name} ---\n${file.content}\n`;
      });
    }
    
    prompt += "\nProvide your response in valid JSON format only, without any additional text.";
    
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
    console.error('Gemini AI analysis error:', error);
    throw new Error('Failed to analyze code with AI');
  }
}

// Function to analyze code with learning mode
async function analyzeCodeWithLearning(code, language = 'javascript', userId = null) {
  try {
    // Select the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Get user preferences from storage if userId is provided
    let userPreferences = {};
    if (userId && userFeedbackStorage.has(userId)) {
      userPreferences = userFeedbackStorage.get(userId);
    }
    
    // Create prompt with learning mode
    let prompt = `
      Analyze the following ${language} code and provide detailed feedback in the following JSON format:
      
      {
        "bugs": [
          {
            "type": "bug_type",
            "description": "detailed_description",
            "line": "line_number_if_applicable",
            "severity": "High/Medium/Low",
            "suggestion": "how_to_fix"
          }
        ],
        "performance": [
          {
            "type": "performance_issue",
            "description": "detailed_description",
            "severity": "High/Medium/Low",
            "suggestion": "optimization_suggestion"
          }
        ],
        "refactor": [
          {
            "type": "refactor_opportunity",
            "description": "detailed_description",
            "severity": "High/Medium/Low",
            "suggestion": "refactor_suggestion_with_example"
          }
        ]
      }
      
      Code to analyze:
      ${code}
    `;
    
    // Add user preferences to prompt if available
    if (Object.keys(userPreferences).length > 0) {
      prompt += `

User preferences and past feedback:
${JSON.stringify(userPreferences, null, 2)}
`;
      prompt += "Please tailor your analysis based on these preferences.\n";
    }
    
    prompt += "\nProvide your response in valid JSON format only, without any additional text.";
    
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
    console.error('Gemini AI analysis error:', error);
    throw new Error('Failed to analyze code with AI');
  }
}

// Function to store user feedback for learning mode
function storeUserFeedback(userId, feedback) {
  if (!userFeedbackStorage.has(userId)) {
    userFeedbackStorage.set(userId, {});
  }
  
  const userData = userFeedbackStorage.get(userId);
  
  // Store feedback
  if (!userData.feedback) {
    userData.feedback = [];
  }
  
  userData.feedback.push({
    timestamp: new Date().toISOString(),
    ...feedback
  });
  
  // Update user preferences based on feedback
  if (feedback.preferences) {
    userData.preferences = { ...userData.preferences, ...feedback.preferences };
  }
  
  userFeedbackStorage.set(userId, userData);
}

// Function to get user feedback history
function getUserFeedbackHistory(userId) {
  return userFeedbackStorage.get(userId) || {};
}

module.exports = { 
  analyzeCode, 
  analyzeCodeWithContext, 
  analyzeCodeWithLearning,
  storeUserFeedback,
  getUserFeedbackHistory
};