"""
Intelligent Mortgage Advisor Chatbot
Uses OpenAI API to provide mortgage advice and answer questions
"""

import os
from typing import Dict, Optional
from openai import OpenAI
from backend.core.ai.config import OPENAI_API_KEY, OPENAI_MODEL, MORTGAGE_ADVISOR_PROMPT


class MortgageAdvisorChatbot:
    """
    AI-powered chatbot for mortgage advice and calculations
    """
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize the chatbot
        
        Parameters:
        -----------
        api_key : str, optional
            OpenAI API key (defaults to environment variable)
        model : str, optional
            OpenAI model to use (defaults to gpt-4)
        """
        self.api_key = api_key or OPENAI_API_KEY
        self.model = model or OPENAI_MODEL
        
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable.")
        
        self.client = OpenAI(api_key=self.api_key)
    
    def chat(self, user_message: str, calculator_data: Optional[Dict] = None) -> str:
        """
        Get AI response to user message
        
        Parameters:
        -----------
        user_message : str
            User's question or message
        calculator_data : dict, optional
            Current calculator parameters for context
            
        Returns:
        --------
        str
            AI assistant's response
        """
        try:
            # Build context from calculator data if provided
            context = ""
            if calculator_data:
                context = f"\n\nCurrent calculator context:\n"
                context += f"Loan amount: {calculator_data.get('loanAmount', 'N/A')}\n"
                context += f"Interest rate: {calculator_data.get('interestRate', 'N/A')}%\n"
                context += f"Loan term: {calculator_data.get('loanTermYears', 'N/A')} years\n"
                context += f"Payment type: {calculator_data.get('paymentType', 'N/A')}\n"
            
            # Create messages for chat completion
            messages = [
                {"role": "system", "content": MORTGAGE_ADVISOR_PROMPT},
                {"role": "user", "content": f"{user_message}{context}"}
            ]
            
            # Get response from OpenAI
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Извините, произошла ошибка при обработке вашего запроса: {str(e)}"
    
    def explain_calculation(self, calculation_type: str, parameters: Dict) -> str:
        """
        Explain a specific calculation type
        
        Parameters:
        -----------
        calculation_type : str
            Type of calculation (e.g., 'annuity', 'differentiated', 'early_repayment')
        parameters : dict
            Calculation parameters
            
        Returns:
        --------
        str
            Explanation of the calculation
        """
        explanation_prompt = f"""
        Explain the {calculation_type} mortgage calculation method using these parameters:
        {parameters}
        
        Provide a clear, detailed explanation in Russian.
        """
        
        return self.chat(explanation_prompt)
