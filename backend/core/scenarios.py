import pandas as pd
import numpy as np
from backend.core.calculators import calculate_annuity_payment, generate_payment_schedule

def calculate_early_repayment(loan_amount, interest_rate, loan_term_years,
                              early_payments=None):
    """
    Calculate mortgage with early repayments
    
    Parameters:
    -----------
    loan_amount : float
        Loan amount
    interest_rate : float
        Annual interest rate (percentage)
    loan_term_years : int
        Loan term in years
    early_payments : list of dict, optional
        List of early payments with format:
        [{'month': month_number, 'amount': payment_amount, 'type': 'reduce_term'/'reduce_payment'}]
        
    Returns:
    --------
    pandas.DataFrame
        DataFrame with payment schedule including early repayments
    """
    if early_payments is None:
        early_payments = []

    # Sort early payments by month
    early_payments = sorted(early_payments, key=lambda x: x['month'])

    schedule = []
    loan_term_months = loan_term_years * 12
    monthly_rate = interest_rate / 100 / 12

    remaining_loan = loan_amount
    monthly_payment = calculate_annuity_payment(loan_amount, interest_rate, loan_term_years)

    month = 1
    early_payment_idx = 0

    while remaining_loan > 0 and month <= loan_term_months:
        # Calculate regular payment components
        interest_payment = remaining_loan * monthly_rate
        principal_payment = min(monthly_payment - interest_payment, remaining_loan)

        # Check if there's an early payment this month
        early_payment_amount = 0
        early_payment_type = None

        while (early_payment_idx < len(early_payments) and
               early_payments[early_payment_idx]['month'] == month):
            early_payment = early_payments[early_payment_idx]
            early_payment_amount += early_payment['amount']
            early_payment_type = early_payment['type']
            early_payment_idx += 1

        # Apply early payment
        if early_payment_amount > 0:
            # Limit early payment to remaining loan
            early_payment_amount = min(early_payment_amount, remaining_loan)

            # Update remaining loan
            remaining_loan -= early_payment_amount

            # Recalculate monthly payment if type is reduce_payment
            if early_payment_type == 'reduce_payment' and remaining_loan > 0:
                remaining_months = loan_term_months - month
                monthly_payment = calculate_annuity_payment(remaining_loan, interest_rate, remaining_months / 12)

        # Record the payment for this month
        schedule.append({
            'month': month,
            'payment': monthly_payment + early_payment_amount,
            'principal': principal_payment + early_payment_amount,
            'interest': interest_payment,
            'early_payment': early_payment_amount,
            'remaining_loan': remaining_loan - principal_payment,
            'monthly_payment': monthly_payment
        })

        # Update remaining loan for next month
        remaining_loan -= principal_payment

        # Ensure the remaining loan doesn't go below zero
        if remaining_loan < 0:
            remaining_loan = 0

        # Break if loan is fully paid
        if remaining_loan == 0:
            break

        month += 1

    return pd.DataFrame(schedule)


def calculate_restructuring(loan_amount, original_interest_rate, original_term_years,
                            months_paid, new_interest_rate=None, new_term_years=None):
    """
    Calculate mortgage restructuring options
    
    Parameters:
    -----------
    loan_amount : float
        Original loan amount
    original_interest_rate : float
        Original annual interest rate (percentage)
    original_term_years : int
        Original loan term in years
    months_paid : int
        Number of months already paid
    new_interest_rate : float, optional
        New annual interest rate (percentage)
    new_term_years : float, optional
        New loan term in years
        
    Returns:
    --------
    tuple
        (original_schedule, restructured_schedule, comparison)
    """
    # Generate original schedule
    original_schedule = generate_payment_schedule(
        loan_amount, original_interest_rate, original_term_years)

    # Calculate remaining loan amount after months_paid
    if months_paid >= len(original_schedule):
        return original_schedule, pd.DataFrame(), pd.DataFrame()

    remaining_loan = original_schedule.iloc[months_paid]['remaining_loan']

    # Use original values if new ones not provided
    if new_interest_rate is None:
        new_interest_rate = original_interest_rate

    if new_term_years is None:
        # Calculate remaining term in years
        remaining_months = original_term_years * 12 - months_paid
        new_term_years = remaining_months / 12

    # Generate restructured schedule
    restructured_schedule = generate_payment_schedule(
        remaining_loan, new_interest_rate, new_term_years)

    # Create comparison DataFrame
    comparison_data = []

    # First add the already paid months from original schedule
    for month in range(months_paid):
        row = original_schedule.iloc[month]
        comparison_data.append({
            'month': month + 1,
            'original_payment': row['payment'],
            'restructured_payment': row['payment'],
            'original_remaining': row['remaining_loan'],
            'restructured_remaining': row['remaining_loan'],
            'payment_difference': 0,
            'status': 'paid'
        })

    # Then add the future months with both original and restructured payments
    for month in range(max(len(original_schedule) - months_paid, len(restructured_schedule))):
        orig_month = month + months_paid

        if orig_month < len(original_schedule):
            orig_row = original_schedule.iloc[orig_month]
            orig_payment = orig_row['payment']
            orig_remaining = orig_row['remaining_loan']
        else:
            orig_payment = 0
            orig_remaining = 0

        if month < len(restructured_schedule):
            restr_row = restructured_schedule.iloc[month]
            restr_payment = restr_row['payment']
            restr_remaining = restr_row['remaining_loan']
        else:
            restr_payment = 0
            restr_remaining = 0

        comparison_data.append({
            'month': orig_month + 1,
            'original_payment': orig_payment,
            'restructured_payment': restr_payment,
            'original_remaining': orig_remaining,
            'restructured_remaining': restr_remaining,
            'payment_difference': restr_payment - orig_payment,
            'status': 'future'
        })

    return original_schedule, restructured_schedule, pd.DataFrame(comparison_data)


def calculate_with_insurance(loan_amount, interest_rate, loan_term_years,
                             insurance_rate, insurance_term_years=None):
    """
    Calculate mortgage with insurance costs
    
    Parameters:
    -----------
    loan_amount : float
        Loan amount
    interest_rate : float
        Annual interest rate (percentage)
    loan_term_years : int
        Loan term in years
    insurance_rate : float
        Annual insurance rate as percentage of loan amount
    insurance_term_years : int, optional
        Insurance term in years (defaults to loan term)
        
    Returns:
    --------
    pandas.DataFrame
        DataFrame with payment schedule including insurance
    """
    if insurance_term_years is None:
        insurance_term_years = loan_term_years

    # Generate regular mortgage schedule
    base_schedule = generate_payment_schedule(loan_amount, interest_rate, loan_term_years)

    # Calculate insurance
    insurance_term_months = min(insurance_term_years * 12, loan_term_years * 12)
    monthly_insurance = loan_amount * insurance_rate / 100 / 12

    # Add insurance to payment schedule
    schedule_with_insurance = base_schedule.copy()
    schedule_with_insurance['insurance'] = 0.0
    schedule_with_insurance['total_payment'] = schedule_with_insurance['payment']

    # Add insurance for the insurance term
    for month in range(insurance_term_months):
        schedule_with_insurance.loc[month, 'insurance'] = monthly_insurance
        schedule_with_insurance.loc[month, 'total_payment'] += monthly_insurance

    return schedule_with_insurance


def calculate_with_central_bank_rate(loan_amount, base_interest_rate, loan_term_years,
                                     central_bank_rate, margin,
                                     predicted_cb_rates=None):
    """
    Calculate mortgage with floating rate tied to central bank rate
    
    Parameters:
    -----------
    loan_amount : float
        Loan amount
    base_interest_rate : float
        Initial annual interest rate (percentage)
    loan_term_years : int
        Loan term in years
    central_bank_rate : float
        Current central bank rate (percentage)
    margin : float
        Margin above central bank rate (percentage points)
    predicted_cb_rates : list, optional
        List of predicted central bank rates for future periods
        Format: [{'month': month_number, 'rate': cb_rate}]
        
    Returns:
    --------
    pandas.DataFrame
        DataFrame with payment schedule using variable rates
    """
    if predicted_cb_rates is None:
        # Default prediction - no change
        predicted_cb_rates = [{'month': 1, 'rate': central_bank_rate}]
    else:
        # Ensure the list starts with month 1
        if not any(rate['month'] == 1 for rate in predicted_cb_rates):
            predicted_cb_rates.insert(0, {'month': 1, 'rate': central_bank_rate})

        # Sort by month
        predicted_cb_rates = sorted(predicted_cb_rates, key=lambda x: x['month'])

    loan_term_months = loan_term_years * 12
    schedule = []

    remaining_loan = loan_amount
    current_month = 1

    # Initialize with the first rate period
    current_cb_rate = predicted_cb_rates[0]['rate']
    current_interest_rate = current_cb_rate + margin
    next_rate_change_idx = 1

    while current_month <= loan_term_months and remaining_loan > 0:
        # Check if we need to update the interest rate
        if (next_rate_change_idx < len(predicted_cb_rates) and
                predicted_cb_rates[next_rate_change_idx]['month'] == current_month):
            current_cb_rate = predicted_cb_rates[next_rate_change_idx]['rate']
            current_interest_rate = current_cb_rate + margin
            next_rate_change_idx += 1

        # Calculate payment for this month based on current rate
        remaining_months = loan_term_months - current_month + 1
        monthly_payment = calculate_annuity_payment(
            remaining_loan, current_interest_rate, remaining_months / 12)

        # Calculate interest and principal components
        monthly_rate = current_interest_rate / 100 / 12
        interest_payment = remaining_loan * monthly_rate
        principal_payment = monthly_payment - interest_payment

        # Ensure we don't overpay in the last month
        if principal_payment > remaining_loan:
            principal_payment = remaining_loan
            monthly_payment = principal_payment + interest_payment

        # Record the payment
        schedule.append({
            'month': current_month,
            'payment': monthly_payment,
            'principal': principal_payment,
            'interest': interest_payment,
            'remaining_loan': remaining_loan - principal_payment,
            'cb_rate': current_cb_rate,
            'interest_rate': current_interest_rate
        })

        # Update remaining loan for next month
        remaining_loan -= principal_payment
        current_month += 1

    return pd.DataFrame(schedule)