"""
AI module for Mortgage Pro
Provides intelligent features: chatbot, recommendations, and expense analysis
"""

from backend.core.ai.chatbot import MortgageAdvisorChatbot
from backend.core.ai.recommender import ScenarioRecommender
from backend.core.ai.expense_analyzer import ExpenseAnalyzer

__all__ = [
    'MortgageAdvisorChatbot',
    'ScenarioRecommender',
    'ExpenseAnalyzer'
]
