// Explainable AI service

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to generate explanation for AI suggestions
async function generateAIExplanation(suggestion, codeContext) {
  try {
    // Select the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt for explanation
    const prompt = `
      You are an expert software engineer explaining code review suggestions. 
      
      A code analysis tool has identified the following issue:
      Type: ${suggestion.type}
      Description: ${suggestion.description}
      Severity: ${suggestion.severity}
      Suggestion: ${suggestion.suggestion}
      
      In the context of this code:
      ${codeContext}
      
      Please provide a clear, concise explanation that includes:
      1. Why this issue is problematic
      2. What potential bugs or issues it could cause
      3. How the suggested fix addresses the problem
      4. Best practices related to this issue
      
      Keep your explanation to 3-4 sentences and avoid technical jargon where possible.
      Format your response as plain text without any markdown or special formatting.
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text();
    
    return explanation.trim();
  } catch (error) {
    console.error('AI explanation error:', error);
    return "Unable to generate explanation at this time. Please refer to the suggestion details.";
  }
}

// Function to generate code example for AI suggestions
async function generateCodeExample(suggestion, codeContext) {
  try {
    // Select the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt for code example
    const prompt = `
      You are an expert software engineer demonstrating code improvements.
      
      A code analysis tool has identified the following issue:
      Type: ${suggestion.type}
      Description: ${suggestion.description}
      Suggestion: ${suggestion.suggestion}
      
      In the context of this code:
      ${codeContext}
      
      Please provide a before and after code example that shows:
      1. The problematic code pattern
      2. The improved version with the suggested fix
      
      Format your response as follows:
      Before:
      \`\`\`
      [problematic code example]
      \`\`\`
      
      After:
      \`\`\`
      [improved code example]
      \`\`\`
      
      Keep your examples concise and focused on the specific issue.
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const example = response.text();
    
    return example.trim();
  } catch (error) {
    console.error('Code example generation error:', error);
    return "Unable to generate code example at this time.";
  }
}

// Function to explain AI reasoning
async function explainAIReasoning(analysisResult, code) {
  try {
    // Select the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt for reasoning explanation
    const prompt = `
      You are an expert software engineer explaining AI code analysis reasoning.
      
      An AI code review tool analyzed the following code:
      ${code}
      
      And produced these findings:
      ${JSON.stringify(analysisResult, null, 2)}
      
      Please explain the AI's reasoning process in simple terms:
      1. What patterns or issues did the AI look for?
      2. How did it prioritize different types of issues?
      3. What factors influenced its severity ratings?
      4. How does it balance false positives with catching real issues?
      
      Keep your explanation to 4-5 sentences and avoid technical jargon where possible.
      Format your response as plain text without any markdown or special formatting.
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text();
    
    return explanation.trim();
  } catch (error) {
    console.error('AI reasoning explanation error:', error);
    return "Unable to explain AI reasoning at this time.";
  }
}

module.exports = {
  generateAIExplanation,
  generateCodeExample,
  explainAIReasoning
};