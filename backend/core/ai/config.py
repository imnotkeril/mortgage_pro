"""
Configuration for AI services
"""

import os
from dotenv import load_dotenv

# Load .env file from backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4')

# System prompts
MORTGAGE_ADVISOR_PROMPT = """You are an expert mortgage advisor with deep knowledge of real estate finance, 
loan calculations, and financial planning. Your role is to help users understand mortgage calculations, 
provide recommendations, and answer questions about their mortgage scenarios.

Key responsibilities:
- Explain mortgage calculation processes clearly
- Provide recommendations based on user's financial profile
- Answer questions about loan terms, interest rates, payment types (annuity vs differentiated)
- Help users understand the implications of different mortgage scenarios
- Provide financial advice in the context of mortgage calculations

Always respond in English language, be professional, accurate, and helpful. 
When providing calculations or specific numbers, be precise and explain your reasoning.
If you need more information to provide accurate advice, ask clarifying questions."""

# Expense categories for NLP analysis
EXPENSE_CATEGORIES = {
    'utilities': ['коммунальные', 'электричество', 'газ', 'вода', 'отопление', 'интернет', 'телефон'],
    'transportation': ['транспорт', 'машина', 'автомобиль', 'бензин', 'топливо', 'парковка', 'такси', 'метро'],
    'food': ['еда', 'продукты', 'ресторан', 'кафе', 'обед', 'ужин', 'завтрак', 'продукты питания'],
    'entertainment': ['развлечения', 'кино', 'театр', 'концерт', 'хобби', 'спорт', 'фитнес'],
    'healthcare': ['здоровье', 'медицина', 'врач', 'лекарства', 'страховка', 'больница'],
    'education': ['образование', 'школа', 'университет', 'курсы', 'обучение'],
    'shopping': ['покупки', 'одежда', 'обувь', 'техника', 'электроника'],
    'other': []
}
