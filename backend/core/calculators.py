import pandas as pd
import numpy as np

def calculate_annuity_payment(loan_amount, interest_rate, loan_term_years):
    """
    Calculate monthly annuity payment
    
    Parameters:
    -----------
    loan_amount : float
        Principal loan amount
    interest_rate : float
        Annual interest rate (percentage)
    loan_term_years : float
        Loan term in years
        
    Returns:
    --------
    float
        Monthly payment amount
    """
    monthly_rate = interest_rate / 100 / 12
    loan_term_months = loan_term_years * 12
    
    # Handle edge case of 0% interest rate
    if monthly_rate == 0:
        return loan_amount / loan_term_months
    
    # Standard annuity payment formula
    annuity_payment = loan_amount * monthly_rate * (1 + monthly_rate) ** loan_term_months / (
                (1 + monthly_rate) ** loan_term_months - 1)
                
    return annuity_payment


def calculate_differentiated_payment(loan_amount, interest_rate, loan_term_years, month):
    """
    Calculate differentiated payment for a specific month
    
    Parameters:
    -----------
    loan_amount : float
        Principal loan amount
    interest_rate : float
        Annual interest rate (percentage)
    loan_term_years : float
        Loan term in years
    month : int
        Month number (1-based) for which to calculate the payment
        
    Returns:
    --------
    float
        Monthly payment amount for the specified month
    """
    loan_term_months = loan_term_years * 12
    monthly_rate = interest_rate / 100 / 12
    
    # Principal payment is constant
    principal_payment = loan_amount / loan_term_months
    
    # Calculate remaining loan amount at the beginning of the month
    remaining_loan = loan_amount - (principal_payment * (month - 1))
    
    # Calculate interest on remaining loan
    interest_payment = remaining_loan * monthly_rate
    
    return principal_payment + interest_payment


def generate_payment_schedule(loan_amount, interest_rate, loan_term_years, payment_type="annuity"):
    """
    Generate complete payment schedule
    
    Parameters:
    -----------
    loan_amount : float
        Principal loan amount
    interest_rate : float
        Annual interest rate (percentage)
    loan_term_years : float
        Loan term in years
    payment_type : str, optional
        Payment type: 'annuity' or 'differentiated'
        
    Returns:
    --------
    pandas.DataFrame
        DataFrame with complete payment schedule
    """
    schedule = []
    loan_term_months = loan_term_years * 12
    monthly_rate = interest_rate / 100 / 12

    remaining_loan = loan_amount

    if payment_type == "annuity":
        monthly_payment = calculate_annuity_payment(loan_amount, interest_rate, loan_term_years)

        for month in range(1, loan_term_months + 1):
            interest_payment = remaining_loan * monthly_rate
            principal_payment = monthly_payment - interest_payment

            # Ensure we don't overpay in the last month due to rounding
            if month == loan_term_months:
                principal_payment = remaining_loan
                monthly_payment = principal_payment + interest_payment

            # Record the payment for this month
            schedule.append({
                'month': month,
                'payment': monthly_payment,
                'principal': principal_payment,
                'interest': interest_payment,
                'remaining_loan': remaining_loan - principal_payment
            })
            
            # Update remaining loan for next month
            remaining_loan -= principal_payment

            # Ensure the remaining loan doesn't go below zero
            if remaining_loan < 0:
                remaining_loan = 0
    else:  # differentiated
        for month in range(1, loan_term_months + 1):
            principal_payment = loan_amount / loan_term_months
            interest_payment = remaining_loan * monthly_rate
            monthly_payment = principal_payment + interest_payment

            # Record the payment for this month
            schedule.append({
                'month': month,
                'payment': monthly_payment,
                'principal': principal_payment,
                'interest': interest_payment,
                'remaining_loan': remaining_loan - principal_payment
            })
            
            # Update remaining loan for next month
            remaining_loan -= principal_payment

            # Ensure the remaining loan doesn't go below zero
            if remaining_loan < 0:
                remaining_loan = 0

    return pd.DataFrame(schedule)


def calculate_total_interest(schedule):
    """
    Calculate total interest paid over the loan term
    
    Parameters:
    -----------
    schedule : pandas.DataFrame
        Payment schedule DataFrame
        
    Returns:
    --------
    float
        Total interest paid
    """
    return schedule['interest'].sum()


def calculate_total_payments(schedule):
    """
    Calculate total payments over the loan term
    
    Parameters:
    -----------
    schedule : pandas.DataFrame
        Payment schedule DataFrame
        
    Returns:
    --------
    float
        Total amount paid (principal + interest)
    """
    return schedule['payment'].sum()