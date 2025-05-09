import pandas as pd
import numpy as np
from backend.core.calculators import generate_payment_schedule

def convert_currency(amount, from_currency, to_currency):
    """
    Convert amount from one currency to another
    
    Parameters:
    -----------
    amount : float
        Amount to convert
    from_currency : str
        Source currency code (e.g., 'USD')
    to_currency : str
        Target currency code (e.g., 'EUR')
        
    Returns:
    --------
    float
        Converted amount
    """
    try:
        # In a real application, we would use an API for live currency rates
        # For this demo version, we use a static fallback
        conversion_rates = {
            'USD': {'EUR': 0.85, 'RUB': 73.5, 'JPY': 110.0, 'USD': 1.0},
            'EUR': {'USD': 1.18, 'RUB': 86.5, 'JPY': 130.0, 'EUR': 1.0},
            'RUB': {'USD': 0.0136, 'EUR': 0.0116, 'JPY': 1.5, 'RUB': 1.0},
            'JPY': {'USD': 0.0091, 'EUR': 0.0077, 'RUB': 0.67, 'JPY': 1.0}
        }

        return amount * conversion_rates[from_currency][to_currency]
    except KeyError:
        # Handle unsupported currency
        raise ValueError(f"Conversion from {from_currency} to {to_currency} is not supported")
    except Exception as e:
        # Handle other exceptions
        raise Exception(f"Error during currency conversion: {str(e)}")


def calculate_mortgage_in_multiple_currencies(loan_amount, interest_rate, loan_term_years,
                                             base_currency, target_currencies,
                                             currency_annual_change=None):
    """
    Calculate mortgage payments in multiple currencies with projected exchange rates
    
    Parameters:
    -----------
    loan_amount : float
        Loan amount in base currency
    interest_rate : float
        Annual interest rate (percentage)
    loan_term_years : int
        Loan term in years
    base_currency : str
        Base currency code (e.g., 'USD')
    target_currencies : list
        List of target currency codes
    currency_annual_change : dict, optional
        Dictionary of annual currency change rates
        
    Returns:
    --------
    pandas.DataFrame
        DataFrame with payment schedule in multiple currencies
    """
    if currency_annual_change is None:
        # Default annual currency change rates (can be positive or negative)
        currency_annual_change = {
            'USD': {'EUR': -0.01, 'RUB': 0.02, 'JPY': 0.01, 'USD': 0.0},
            'EUR': {'USD': 0.01, 'RUB': 0.03, 'JPY': 0.02, 'EUR': 0.0},
            'RUB': {'USD': -0.02, 'EUR': -0.03, 'JPY': -0.01, 'RUB': 0.0},
            'JPY': {'USD': -0.01, 'EUR': -0.02, 'RUB': 0.01, 'JPY': 0.0}
        }
    
    # Generate payment schedule in base currency
    base_schedule = generate_payment_schedule(loan_amount, interest_rate, loan_term_years)

    # Create empty list for multi-currency comparison
    multi_currency_data = []

    # Monthly change rates
    monthly_change_rates = {}
    for from_curr in currency_annual_change:
        monthly_change_rates[from_curr] = {}
        for to_curr in currency_annual_change[from_curr]:
            annual_rate = currency_annual_change[from_curr][to_curr]
            monthly_change_rates[from_curr][to_curr] = (1 + annual_rate) ** (1 / 12) - 1

    # Current exchange rates
    current_rates = {}
    for currency in target_currencies:
        if currency != base_currency:
            current_rates[currency] = convert_currency(1.0, base_currency, currency)

    # Calculate payments in all currencies for each month
    for month in range(1, len(base_schedule) + 1):
        row = base_schedule.iloc[month - 1]

        payment_data = {
            'month': month,
            f'payment_{base_currency}': row['payment'],
            f'principal_{base_currency}': row['principal'],
            f'interest_{base_currency}': row['interest'],
            f'remaining_{base_currency}': row['remaining_loan']
        }

        # Calculate for target currencies
        for currency in target_currencies:
            if currency != base_currency:
                # Update exchange rate based on projected changes
                if month > 1:
                    monthly_change = monthly_change_rates[base_currency][currency]
                    current_rates[currency] *= (1 + monthly_change)

                rate = current_rates[currency]

                payment_data[f'payment_{currency}'] = row['payment'] * rate
                payment_data[f'principal_{currency}'] = row['principal'] * rate
                payment_data[f'interest_{currency}'] = row['interest'] * rate
                payment_data[f'remaining_{currency}'] = row['remaining_loan'] * rate
                payment_data[f'rate_{currency}'] = rate

        multi_currency_data.append(payment_data)

    return pd.DataFrame(multi_currency_data)