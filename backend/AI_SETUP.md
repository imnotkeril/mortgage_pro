# AI Features Setup Guide

## Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key to use the AI features.
   - Sign up at https://platform.openai.com/
   - Get your API key from https://platform.openai.com/api-keys
   - Note: API usage is billed per request. Check OpenAI pricing at https://openai.com/pricing

## Configuration

1. **Create environment file**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` file** and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   OPENAI_MODEL=gpt-4
   ```

   You can also use `gpt-3.5-turbo` for lower costs:
   ```
   OPENAI_MODEL=gpt-3.5-turbo
   ```

3. **Install Python dependencies** (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

## Available AI Features

### 1. Intelligent Mortgage Advisor Chatbot
- **Location**: Frontend → AI Assistant → AI Консультант
- **Functionality**: Ask questions about mortgages, calculations, and get expert advice
- **API Endpoint**: `POST /api/ai/chat`

### 2. Smart Scenario Recommendations
- **Location**: Frontend → AI Assistant → Рекомендации
- **Functionality**: AI analyzes your profile and recommends optimal mortgage parameters
- **API Endpoint**: `POST /api/ai/recommend`

### 3. Expense & Income Analyzer
- **Location**: Frontend → AI Assistant → Анализ расходов
- **Functionality**: Extract and categorize expenses from natural language text
- **API Endpoint**: `POST /api/ai/analyze-expenses`

## Testing

1. **Start the backend server**:
   ```bash
   python run.py --mode=api
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Navigate to AI Assistant** tab in the application

## Troubleshooting

### Error: "OpenAI API key is required"
- Make sure you've created `.env` file in the `backend` directory
- Verify that `OPENAI_API_KEY` is set correctly
- Restart the backend server after changing `.env`

### Error: "Rate limit exceeded"
- You've hit OpenAI's rate limit
- Wait a few minutes and try again
- Consider upgrading your OpenAI plan

### Error: "Insufficient quota"
- Your OpenAI account has insufficient credits
- Add credits at https://platform.openai.com/account/billing

## Cost Optimization

- Use `gpt-3.5-turbo` instead of `gpt-4` for lower costs (edit `.env`)
- Implement caching for repeated queries
- Add rate limiting on the frontend to prevent excessive API calls

## Security Notes

- **Never commit `.env` file to version control**
- The `.env` file is already in `.gitignore`
- Keep your API key secure and don't share it publicly
