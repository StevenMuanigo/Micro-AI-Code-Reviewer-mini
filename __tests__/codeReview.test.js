// Unit tests for code review functionality

const app = require('../index');
const request = require('supertest');

describe('Code Review API', () => {
  describe('POST /api/review', () => {
    it('should return 400 if code is not provided', async () => {
      const response = await request(app)
        .post('/api/review')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Code is required');
    });

    it('should analyze code and return results', async () => {
      const code = `
        function calculateSum(a, b) {
          return a + b;
        }
      `;
      
      const response = await request(app)
        .post('/api/review')
        .send({
          code: code,
          language: 'javascript'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('POST /api/review/interactive', () => {
    it('should return 400 if code is not provided', async () => {
      const response = await request(app)
        .post('/api/review/interactive')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Code is required');
    });

    it('should analyze code and return interactive results', async () => {
      const code = `
        function calculateSum(a, b) {
          return a + b;
        }
      `;
      
      const response = await request(app)
        .post('/api/review/interactive')
        .send({
          code: code,
          language: 'javascript'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bugs');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('refactor');
    });
  });

  describe('POST /api/review/learn', () => {
    it('should return 400 if code is not provided', async () => {
      const response = await request(app)
        .post('/api/review/learn')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Code is required');
    });

    it('should analyze code with learning mode', async () => {
      const code = `
        function calculateSum(a, b) {
          return a + b;
        }
      `;
      
      const response = await request(app)
        .post('/api/review/learn')
        .send({
          code: code,
          language: 'javascript',
          userId: 'test-user-123'
        });
      
      expect(response.status).toBe(200);
      // The response structure depends on the AI, so we just check it's an object
      expect(typeof response.body).toBe('object');
    });
  });

  describe('POST /api/review/feedback', () => {
    it('should return 400 if userId or feedback is not provided', async () => {
      const response = await request(app)
        .post('/api/review/feedback')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User ID and feedback are required');
    });

    it('should store user feedback', async () => {
      const response = await request(app)
        .post('/api/review/feedback')
        .send({
          userId: 'test-user-123',
          feedback: {
            suggestionId: 'test-suggestion',
            approved: true,
            comments: 'This was helpful'
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Feedback stored successfully');
    });
  });
});