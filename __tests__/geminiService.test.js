// Unit tests for Gemini AI service

const { 
  analyzeCode, 
  analyzeCodeWithContext, 
  analyzeCodeWithLearning,
  storeUserFeedback,
  getUserFeedbackHistory 
} = require('../services/geminiService');

describe('Gemini AI Service', () => {
  describe('analyzeCode', () => {
    it('should analyze code and return results', async () => {
      const code = `
        function calculateSum(a, b) {
          return a + b;
        }
      `;
      
      // Mock the Gemini API response
      jest.mock('@google/generative-ai', () => {
        return {
          GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
              getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockResolvedValue({
                  response: {
                    text: jest.fn().mockResolvedValue(JSON.stringify({
                      bugs: [],
                      performance: [],
                      refactor: []
                    }))
                  }
                })
              })
            };
          })
        };
      });
      
      const result = await analyzeCode(code, 'javascript');
      
      expect(result).toHaveProperty('bugs');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('refactor');
    });

    it('should handle API errors gracefully', async () => {
      const code = `
        function calculateSum(a, b) {
          return a + b;
        }
      `;
      
      // Mock the Gemini API to throw an error
      jest.mock('@google/generative-ai', () => {
        return {
          GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
              getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockRejectedValue(new Error('API Error'))
              })
            };
          })
        };
      });
      
      await expect(analyzeCode(code, 'javascript')).rejects.toThrow('Failed to analyze code with AI');
    });
  });

  describe('analyzeCodeWithContext', () => {
    it('should analyze code with context files', async () => {
      const code = `
        function calculateSum(a, b) {
          return a + b;
        }
      `;
      
      const contextFiles = [
        {
          name: 'helpers.js',
          content: `
            function validateNumber(num) {
              return typeof num === 'number';
            }
          `
        }
      ];
      
      // Mock the Gemini API response
      jest.mock('@google/generative-ai', () => {
        return {
          GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
              getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockResolvedValue({
                  response: {
                    text: jest.fn().mockResolvedValue(JSON.stringify({
                      bugs: [],
                      performance: [],
                      refactor: []
                    }))
                  }
                })
              })
            };
          })
        };
      });
      
      const result = await analyzeCodeWithContext(code, 'javascript', contextFiles);
      
      expect(result).toHaveProperty('bugs');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('refactor');
    });
  });

  describe('analyzeCodeWithLearning', () => {
    it('should analyze code with learning mode', async () => {
      const code = `
        function calculateSum(a, b) {
          return a + b;
        }
      `;
      
      // Mock the Gemini API response
      jest.mock('@google/generative-ai', () => {
        return {
          GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
              getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockResolvedValue({
                  response: {
                    text: jest.fn().mockResolvedValue(JSON.stringify({
                      bugs: [],
                      performance: [],
                      refactor: []
                    }))
                  }
                })
              })
            };
          })
        };
      });
      
      const result = await analyzeCodeWithLearning(code, 'javascript', 'test-user-123');
      
      expect(result).toHaveProperty('bugs');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('refactor');
    });
  });

  describe('storeUserFeedback', () => {
    it('should store user feedback', () => {
      const userId = 'test-user-123';
      const feedback = {
        suggestionId: 'test-suggestion',
        approved: true,
        comments: 'This was helpful'
      };
      
      // Clear any existing feedback
      const storage = require('../services/geminiService').userFeedbackStorage;
      storage.clear();
      
      storeUserFeedback(userId, feedback);
      
      const history = getUserFeedbackHistory(userId);
      expect(history).toHaveProperty('feedback');
      expect(history.feedback).toHaveLength(1);
      expect(history.feedback[0]).toMatchObject(feedback);
    });
  });

  describe('getUserFeedbackHistory', () => {
    it('should return user feedback history', () => {
      const userId = 'test-user-123';
      
      // Clear any existing feedback
      const storage = require('../services/geminiService').userFeedbackStorage;
      storage.clear();
      
      const feedback = {
        suggestionId: 'test-suggestion',
        approved: true,
        comments: 'This was helpful'
      };
      
      storeUserFeedback(userId, feedback);
      
      const history = getUserFeedbackHistory(userId);
      expect(history).toHaveProperty('feedback');
      expect(history.feedback).toHaveLength(1);
      expect(history.feedback[0]).toMatchObject(feedback);
    });

    it('should return empty object for user with no feedback', () => {
      const userId = 'new-user-456';
      
      // Clear any existing feedback
      const storage = require('../services/geminiService').userFeedbackStorage;
      storage.clear();
      
      const history = getUserFeedbackHistory(userId);
      expect(Object.keys(history)).toHaveLength(0);
    });
  });
});