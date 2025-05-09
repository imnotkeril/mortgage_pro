import pandas as pd
import numpy as np
from backend.core.calculators import generate_payment_schedule
from backend.core.forecast import forecast_property_value

def calculate_rent_vs_buy(property_value, down_payment, interest_rate, loan_term_years,
                          monthly_rent, rent_growth_rate, property_growth_rate,
                          maintenance_cost_percent, property_tax_percent,
                          rental_income=0, tax_benefit_rate=0, inflation_rate=0,
                          opportunity_cost_rate=0):
    """
    Calculate rent vs buy comparison over time
    
    Parameters:
    -----------
    property_value : float
        Property value
    down_payment : float
        Down payment amount
    interest_rate : float
        Annual interest rate (percentage)
    loan_term_years : int
        Loan term in years
    monthly_rent : float
        Initial monthly rent
    rent_growth_rate : float
        Annual rent growth rate (percentage)
    property_growth_rate : float
        Annual property growth rate (percentage)
    maintenance_cost_percent : float
        Annual maintenance cost as percentage of property value
    property_tax_percent : float
        Annual property tax as percentage of property value
    rental_income : float, optional
        Monthly rental income if part of property is rented out
    tax_benefit_rate : float, optional
        Tax benefit rate for mortgage interest deduction
    inflation_rate : float, optional
        Annual inflation rate
    opportunity_cost_rate : float, optional
        Annual rate of return on alternative investments
        
    Returns:
    --------
    pandas.DataFrame
        DataFrame with rent vs buy metrics over time
    """
    loan_amount = property_value - down_payment
    loan_term_months = loan_term_years * 12

    # Calculate mortgage schedule
    mortgage_schedule = generate_payment_schedule(loan_amount, interest_rate, loan_term_years)

    # Property value forecast
    property_forecast = forecast_property_value(
        property_value, property_growth_rate, loan_term_years,
        inflation_rate=inflation_rate
    )

    # Monthly metrics
    monthly_maintenance = property_value * maintenance_cost_percent / 100 / 12
    monthly_property_tax = property_value * property_tax_percent / 100 / 12

    # Annual adjustment rates
    monthly_rent_growth = (1 + rent_growth_rate / 100) ** (1 / 12) - 1
    monthly_maintenance_growth = (1 + inflation_rate / 100) ** (1 / 12) - 1
    monthly_opportunity_cost = (1 + opportunity_cost_rate / 100) ** (1 / 12) - 1

    comparison_data = []

    # Initial values
    current_rent = monthly_rent
    current_maintenance = monthly_maintenance
    current_property_tax = monthly_property_tax
    current_rental_income = rental_income

    # Opportunity cost of down payment (what you could have earned by investing it)
    opportunity_value = down_payment

    for month in range(1, loan_term_months + 1):
        # Get mortgage payment for this month
        mortgage_row = mortgage_schedule.iloc[month - 1]
        mortgage_payment = mortgage_row['payment']
        interest_payment = mortgage_row['interest']

        # Update opportunity cost of down payment
        opportunity_value *= (1 + monthly_opportunity_cost)

        # Update rent with growth rate
        current_rent *= (1 + monthly_rent_growth)

        # Update maintenance and property tax with inflation
        current_maintenance *= (1 + monthly_maintenance_growth)
        current_property_tax *= (1 + monthly_maintenance_growth)
        current_rental_income *= (1 + monthly_rent_growth)

        # Tax benefit from mortgage interest deduction
        tax_benefit = interest_payment * tax_benefit_rate / 100

        # Monthly costs for buying
        buy_monthly_cost = mortgage_payment + current_maintenance + current_property_tax - current_rental_income - tax_benefit

        # Monthly costs for renting (rent + opportunity cost of down payment)
        rent_monthly_cost = current_rent + (opportunity_value * monthly_opportunity_cost)

        # Property value for this month
        property_value_current = property_forecast.iloc[month - 1]['nominal_value']
        property_real_value = property_forecast.iloc[month - 1]['real_value']

        # Net equity in the property
        property_equity = property_value_current - mortgage_row['remaining_loan']

        # Net worth difference (property equity vs investment of down payment + saved difference)
        # This is simplified and would need more complex modeling for a full financial model
        net_worth_buy = property_equity
        net_worth_rent = opportunity_value

        # Save the difference between buying and renting costs
        if rent_monthly_cost > buy_monthly_cost:
            # If renting costs more, add the savings to net worth for buying
            net_worth_buy += (rent_monthly_cost - buy_monthly_cost)
        else:
            # If buying costs more, add the savings to net worth for renting
            net_worth_rent += (buy_monthly_cost - rent_monthly_cost)

        # Break-even analysis
        break_even = net_worth_buy >= net_worth_rent

        comparison_data.append({
            'month': month,
            'mortgage_payment': mortgage_payment,
            'property_tax': current_property_tax,
            'maintenance': current_maintenance,
            'rental_income': current_rental_income,
            'tax_benefit': tax_benefit,
            'total_buy_cost': buy_monthly_cost,
            'rent_payment': current_rent,
            'opportunity_cost': opportunity_value * monthly_opportunity_cost,
            'total_rent_cost': rent_monthly_cost,
            'property_value': property_value_current,
            'property_real_value': property_real_value,
            'property_equity': property_equity,
            'investment_value': opportunity_value,
            'net_worth_buy': net_worth_buy,
            'net_worth_rent': net_worth_rent,
            'break_even': break_even
        })

    return pd.DataFrame(comparison_data)