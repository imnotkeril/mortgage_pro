"""
Smart Scenario Recommendations
Uses ML models to recommend optimal mortgage scenarios based on user profile
"""

import numpy as np
from typing import Dict, List, Optional
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pickle
import os


class ScenarioRecommender:
    """
    ML-based recommender for mortgage scenarios
    """
    
    def __init__(self):
        """Initialize the recommender with trained models"""
        self.scaler = StandardScaler()
        self.loan_amount_model = None
        self.term_model = None
        self.payment_type_model = None
        self._initialize_models()
    
    def _initialize_models(self):
        """
        Initialize or train ML models
        For production, these would be pre-trained and loaded from files
        """
        # Simple rule-based models for now (can be replaced with trained models)
        # In production, load pre-trained models:
        # with open('models/loan_amount_model.pkl', 'rb') as f:
        #     self.loan_amount_model = pickle.load(f)
        
        # For demo purposes, we'll use heuristic-based recommendations
        # that can be replaced with actual ML models trained on real data
        pass
    
    def recommend(self, user_profile: Dict) -> Dict:
        """
        Recommend optimal mortgage scenario based on user profile
        
        Parameters:
        -----------
        user_profile : dict
            User profile containing:
            - age: int
            - annual_income: float
            - down_payment: float
            - monthly_expenses: float
            - children: int (optional)
            - employment_type: str (optional)
            - credit_score: int (optional)
            
        Returns:
        --------
        dict
            Recommendations with:
            - optimal_loan_amount: float
            - suggested_term: int (years)
            - payment_type: str ('annuity' or 'differentiated')
            - confidence_score: float
            - reasoning: str
        """
        try:
            # Extract features
            age = user_profile.get('age', 35)
            annual_income = user_profile.get('annual_income', 0)
            down_payment = user_profile.get('down_payment', 0)
            monthly_expenses = user_profile.get('monthly_expenses', 0)
            children = user_profile.get('children', 0)
            credit_score = user_profile.get('credit_score', 700)
            
            # Calculate monthly income
            monthly_income = annual_income / 12 if annual_income > 0 else 0
            
            # Calculate available monthly payment (30% of income rule)
            max_monthly_payment = monthly_income * 0.3 if monthly_income > 0 else 0
            
            # Estimate optimal loan amount based on income and expenses
            # Conservative approach: monthly payment should not exceed 30% of income
            # and leave room for expenses
            available_for_mortgage = max_monthly_payment - (monthly_expenses * 0.1)
            
            # Estimate loan amount (rough calculation with 7% interest, 20 years)
            # This is a simplified calculation - in production, use iterative approach
            if available_for_mortgage > 0:
                # Approximate loan amount using annuity formula
                monthly_rate = 0.07 / 12
                term_months = 20 * 12
                if monthly_rate > 0:
                    optimal_loan_amount = available_for_mortgage * (
                        (1 + monthly_rate) ** term_months - 1
                    ) / (monthly_rate * (1 + monthly_rate) ** term_months)
                else:
                    optimal_loan_amount = available_for_mortgage * term_months
                
                # Add down payment to get property value estimate
                optimal_loan_amount = min(optimal_loan_amount, annual_income * 5)  # Cap at 5x annual income
            else:
                optimal_loan_amount = annual_income * 3  # Fallback: 3x annual income
            
            # Recommend term based on age
            if age < 30:
                suggested_term = 25
            elif age < 40:
                suggested_term = 20
            elif age < 50:
                suggested_term = 15
            else:
                suggested_term = 10
            
            # Recommend payment type based on income stability and preferences
            # Differentiated is better for those who can handle higher initial payments
            if monthly_income > monthly_expenses * 2 and age < 45:
                payment_type = 'differentiated'
                payment_reason = "Your income allows you to start with higher payments"
            else:
                payment_type = 'annuity'
                payment_reason = "Annuity payments will provide budget stability"
            
            # Calculate confidence score based on data completeness
            confidence_score = 0.7
            if all([annual_income > 0, monthly_expenses > 0, down_payment > 0]):
                confidence_score = 0.9
            elif annual_income > 0:
                confidence_score = 0.8
            
            # Build reasoning
            reasoning = f"""
            Recommendations based on your profile:
            - Annual income: {annual_income:,.0f}
            - Available payment: {available_for_mortgage:,.0f}/month
            - Age: {age} years
            
            {payment_reason}
            """
            
            return {
                'optimal_loan_amount': round(optimal_loan_amount, 2),
                'suggested_term': suggested_term,
                'payment_type': payment_type,
                'confidence_score': round(confidence_score, 2),
                'reasoning': reasoning.strip(),
                'max_monthly_payment': round(available_for_mortgage, 2)
            }
            
        except Exception as e:
            return {
                'error': f'Error generating recommendations: {str(e)}',
                'optimal_loan_amount': 0,
                'suggested_term': 20,
                'payment_type': 'annuity',
                'confidence_score': 0.0,
                'reasoning': 'Failed to generate recommendations'
            }
    
    def compare_scenarios(self, user_profile: Dict, scenarios: List[Dict]) -> Dict:
        """
        Compare multiple mortgage scenarios and recommend the best one
        
        Parameters:
        -----------
        user_profile : dict
            User profile
        scenarios : list of dict
            List of scenarios to compare
            
        Returns:
        --------
        dict
            Comparison results with best scenario recommendation
        """
        try:
            recommendations = []
            
            for scenario in scenarios:
                # Calculate affordability score for each scenario
                monthly_payment = scenario.get('monthly_payment', 0)
                annual_income = user_profile.get('annual_income', 0)
                monthly_income = annual_income / 12
                
                # Score based on payment-to-income ratio
                if monthly_income > 0:
                    payment_ratio = monthly_payment / monthly_income
                    if payment_ratio <= 0.3:
                        score = 1.0
                    elif payment_ratio <= 0.4:
                        score = 0.7
                    else:
                        score = 0.3
                else:
                    score = 0.5
                
                recommendations.append({
                    'scenario': scenario,
                    'score': score,
                    'payment_ratio': payment_ratio if monthly_income > 0 else 0
                })
            
            # Sort by score
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            return {
                'best_scenario': recommendations[0]['scenario'] if recommendations else None,
                'all_recommendations': recommendations,
                'reasoning': f"Best scenario selected based on payment-to-income ratio"
            }
            
        except Exception as e:
            return {
                'error': f'Error comparing scenarios: {str(e)}',
                'best_scenario': None,
                'reasoning': 'Failed to compare scenarios'
            }
