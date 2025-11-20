# Micro-AI-Code-Reviewer-mini

# Micro AI Code Reviewer (Mini PR Assistant)

This project is a Gemini AI-based code review assistant. It provides AI-powered feedback to developers to improve code quality, catch potential bugs, and enhance code.

## Features

### 1. Advanced Analysis Layer
- Code quality scoring (readability, complexity, duplication)
- Security recommendations (XSS/SQL Injection/Open Redirect)
- Dependency check and potential vulnerability warnings

### 2. Integration and Workflow
- GitHub/GitLab PR analysis integration
- Local mini code review with pre-commit hook
- Automatic trigger with webhook support after push

### 3. UX and JSON Output Improvements
- Structured JSON format with issues, refactor suggestions, security warnings
- Severity tags: High/Medium/Low
- Interactive feedback: example refactor display when clicking on suggestions

### 4. Senior-level AI Enhancements
- Context-aware reviews: considers surrounding files, not just snippets
- Learning mode: adapts based on user approvals
- Multi-language support: JS, TS, Python, etc.

### 5. Optional Bonus Features
- Performance benchmark: before/after estimates for suggested changes
- Explainable AI: brief explanation of AI suggestions
- CLI version: quick usage via terminal

### 6. 3 New Top-level Features
- **Team Collaboration Insights**: AI analyzes multiple developers' PRs to report common errors or best practice violations.
- **Automated Test Suggestion**: Suggests which unit/integration tests should be added from code snippets.
- **Code Style Enforcement**: Detects and suggests fixes for style guide (ESLint, Prettier, etc.) violations.

## Installation

1. Make sure Node.js is installed
2. Run the following command in the project directory:
   ```
   npm install
   ```

## Usage

### Web API

To start the server:
```
npm start
```

API endpoints:
- `POST /api/review` - Code review
- `POST /api/review/interactive` - Interactive code review
- `POST /api/review/learn` - Code review with learning mode
- `POST /api/review/feedback` - User feedback

### CLI (Command Line Interface)

To use the CLI version:
```
npx code-reviewer <file-path> [options]
```

Options:
- `--format <json|text>`  Output format (default: text)
- `--language <lang>`     Specify language (default: auto-detect)
- `--help`                Show help message


## Requirements

- Node.js v14 or higher
- Internet connection (for AI analysis)

## License

MIT
