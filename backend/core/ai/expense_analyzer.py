"""
Expense & Income Analyzer
Uses NLP to extract and categorize expenses from text descriptions
"""

import re
import json
from typing import Dict, List, Optional
from openai import OpenAI
from backend.core.ai.config import OPENAI_API_KEY, OPENAI_MODEL, EXPENSE_CATEGORIES


class ExpenseAnalyzer:
    """
    NLP-based expense analyzer for extracting and categorizing expenses
    """
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize the expense analyzer
        
        Parameters:
        -----------
        api_key : str, optional
            OpenAI API key (defaults to environment variable)
        model : str, optional
            OpenAI model to use
        """
        self.api_key = api_key or OPENAI_API_KEY
        self.model = model or OPENAI_MODEL
        
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable.")
        
        self.client = OpenAI(api_key=self.api_key)
    
    def extract_expenses_from_text(self, text: str) -> Dict:
        """
        Extract expenses from natural language text
        
        Parameters:
        -----------
        text : str
            Text description of expenses (e.g., "я трачу $500 на машину, $300 на еду...")
            
        Returns:
        --------
        dict
            Extracted expenses by category:
            {
                'utilities': float,
                'transportation': float,
                'food': float,
                'entertainment': float,
                'healthcare': float,
                'education': float,
                'shopping': float,
                'other': float,
                'total': float,
                'raw_data': list
            }
        """
        try:
            # Use LLM to extract and categorize expenses
            prompt = f"""
            Extract expense categories and amounts from the following text:
            
            "{text}"
            
            Return the result in JSON format with the following categories:
            - utilities (utilities, electricity, gas, water, heating, internet, phone)
            - transportation (transport, car, automobile, gasoline, fuel, parking, taxi, metro)
            - food (food, groceries, restaurant, cafe, lunch, dinner, breakfast)
            - entertainment (entertainment, cinema, theater, concert, hobby, sports, fitness)
            - healthcare (health, medicine, doctor, medication, insurance, hospital)
            - education (education, school, university, courses, training)
            - shopping (shopping, clothing, shoes, electronics, appliances)
            - other (other expenses)
            
            For each category, specify the amount as a number. If a category is not mentioned, specify 0.
            Also return a "raw_data" array with objects {{"category": "name", "amount": number, "description": "description"}}.
            
            The response format must be valid JSON without additional text.
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a financial data extraction assistant. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            # Parse JSON response
            response_text = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```'):
                response_text = re.sub(r'^```(?:json)?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)
            
            expenses = json.loads(response_text)
            
            # Ensure all categories exist
            default_expenses = {
                'utilities': 0,
                'transportation': 0,
                'food': 0,
                'entertainment': 0,
                'healthcare': 0,
                'education': 0,
                'shopping': 0,
                'other': 0
            }
            
            for category in default_expenses:
                if category not in expenses:
                    expenses[category] = 0
            
            # Calculate total
            expenses['total'] = sum([
                expenses.get('utilities', 0),
                expenses.get('transportation', 0),
                expenses.get('food', 0),
                expenses.get('entertainment', 0),
                expenses.get('healthcare', 0),
                expenses.get('education', 0),
                expenses.get('shopping', 0),
                expenses.get('other', 0)
            ])
            
            return expenses
            
        except Exception as e:
            # Fallback: try simple regex extraction
            return self._simple_extraction(text)
    
    def _simple_extraction(self, text: str) -> Dict:
        """
        Simple regex-based extraction as fallback
        """
        expenses = {
            'utilities': 0,
            'transportation': 0,
            'food': 0,
            'entertainment': 0,
            'healthcare': 0,
            'education': 0,
            'shopping': 0,
            'other': 0,
            'total': 0,
            'raw_data': []
        }
        
        # Extract numbers and currency symbols
        # Pattern: number followed by currency or category keywords
            patterns = {
            'utilities': r'(\d+(?:\.\d+)?)\s*(?:usd|\$|eur|€|gbp|£|rub|₽|руб).*?(?:utilities|electricity|gas|water|heating|internet|phone)',
            'transportation': r'(\d+(?:\.\d+)?)\s*(?:usd|\$|eur|€|gbp|£|rub|₽|руб).*?(?:car|automobile|transport|gasoline|fuel|parking|taxi|metro)',
            'food': r'(\d+(?:\.\d+)?)\s*(?:usd|\$|eur|€|gbp|£|rub|₽|руб).*?(?:food|groceries|restaurant|cafe)',
        }
        
        for category, pattern in patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                expenses[category] = sum([float(m) for m in matches])
        
        expenses['total'] = sum([
            expenses['utilities'],
            expenses['transportation'],
            expenses['food'],
            expenses['entertainment'],
            expenses['healthcare'],
            expenses['education'],
            expenses['shopping'],
            expenses['other']
        ])
        
        return expenses
    
    def calculate_debt_to_income_ratio(self, monthly_income: float, expenses: Dict) -> Dict:
        """
        Calculate debt-to-income ratio and mortgage affordability
        
        Parameters:
        -----------
        monthly_income : float
            Monthly income
        expenses : dict
            Expenses dictionary from extract_expenses_from_text
            
        Returns:
        --------
        dict
            Affordability metrics:
            {
                'debt_to_income_ratio': float,
                'available_for_mortgage': float,
                'max_monthly_payment': float,
                'recommendation': str
            }
        """
        try:
            total_monthly_expenses = expenses.get('total', 0)
            
            # Calculate debt-to-income ratio
            if monthly_income > 0:
                debt_to_income = (total_monthly_expenses / monthly_income) * 100
            else:
                debt_to_income = 0
            
            # Calculate available for mortgage (30% rule)
            available_for_mortgage = monthly_income * 0.3 - (total_monthly_expenses * 0.1)
            available_for_mortgage = max(0, available_for_mortgage)
            
            # Recommendation
            if debt_to_income < 30:
                recommendation = "Excellent debt-to-income ratio. You can afford a mortgage."
            elif debt_to_income < 40:
                recommendation = "Good ratio. Consider a mortgage with caution."
            elif debt_to_income < 50:
                recommendation = "High ratio. It's recommended to reduce expenses before applying for a mortgage."
            else:
                recommendation = "Very high ratio. Not recommended to apply for a mortgage until expenses are reduced."
            
            return {
                'debt_to_income_ratio': round(debt_to_income, 2),
                'total_monthly_expenses': round(total_monthly_expenses, 2),
                'monthly_income': round(monthly_income, 2),
                'available_for_mortgage': round(available_for_mortgage, 2),
                'max_monthly_payment': round(available_for_mortgage, 2),
                'recommendation': recommendation
            }
            
        except Exception as e:
            return {
                'error': f'Error calculating affordability: {str(e)}',
                'debt_to_income_ratio': 0,
                'available_for_mortgage': 0
            }
