from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import json

# Import calculation modules
from core.calculators import calculate_annuity_payment, generate_payment_schedule, calculate_total_interest, calculate_total_payments
from core.forecast import forecast_property_value
from core.comparison import calculate_rent_vs_buy
from core.currency import calculate_mortgage_in_multiple_currencies, convert_currency
from core.scenarios import (
    calculate_early_repayment, 
    calculate_restructuring,
    calculate_with_insurance,
    calculate_with_central_bank_rate
)

def create_app():
    # Initialize the application
    app = Flask(__name__)
    CORS(app)  # Allow cross-domain requests
    
    @app.route('/', methods=['GET'])
    def home():
        """Route to check API is working."""
        return jsonify({'message': 'API is running! Welcome to Mortgage Calculator Pro.'})
    
    @app.route('/api/calculate', methods=['POST'])
    def calculate():
        try:
            data = request.json
            
            # Extract parameters from request body
            loan_amount = data.get('loanAmount')
            interest_rate = data.get('interestRate')
            loan_term_years = data.get('loanTermYears')
            payment_type = data.get('paymentType', 'annuity')
            
            if not all([loan_amount, interest_rate, loan_term_years]):
                return jsonify({'error': 'Parameters loanAmount, interestRate, and loanTermYears are required.'}), 400
            
            # Perform calculations
            schedule = generate_payment_schedule(
                loan_amount, interest_rate, loan_term_years, payment_type
            )
            
            # Convert DataFrame to list of dictionaries
            schedule_list = []
            for _, row in schedule.iterrows():
                schedule_list.append({
                    'month': int(row['month']),
                    'payment': float(row['payment']),
                    'principal': float(row['principal']),
                    'interest': float(row['interest']),
                    'remainingLoan': float(row['remaining_loan'])
                })
            
            # Calculate total values
            total_interest = float(calculate_total_interest(schedule))
            total_payments = float(calculate_total_payments(schedule))
            
            return jsonify({
                'schedule': schedule_list,
                'totalInterest': total_interest,
                'totalPayments': total_payments
            })
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    @app.route('/api/forecast', methods=['POST'])
    def property_forecast():
        try:
            data = request.json
            
            # Extract parameters from request body
            initial_value = data.get('initialValue')
            growth_rate = data.get('growthRate')
            years = data.get('years')
            seasonal_factors = data.get('seasonalFactors')
            regional_adjustment = data.get('regionalAdjustment', 0)
            inflation_rate = data.get('inflationRate', 0)
            model = data.get('model', 'linear')
            
            if not all([initial_value, growth_rate, years]):
                return jsonify({'error': 'Parameters initialValue, growthRate and years are required.'}), 400
            
            # Calculate forecast
            forecast_df = forecast_property_value(
                initial_value, growth_rate, years, seasonal_factors,
                regional_adjustment, inflation_rate, model
            )
            
            # Convert DataFrame to list of dictionaries
            forecast_list = []
            for _, row in forecast_df.iterrows():
                forecast_list.append({
                    'month': int(row['month']),
                    'nominalValue': float(row['nominal_value']),
                    'realValue': float(row['real_value'])
                })
            
            # Final values
            final_nominal_value = float(forecast_df.iloc[-1]['nominal_value'])
            final_real_value = float(forecast_df.iloc[-1]['real_value'])
            total_growth = final_nominal_value / initial_value - 1
            real_growth = final_real_value / initial_value - 1
            
            return jsonify({
                'forecast': forecast_list,
                'finalNominalValue': final_nominal_value,
                'finalRealValue': final_real_value,
                'totalGrowth': total_growth,
                'realGrowth': real_growth
            })
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    @app.route('/api/compare', methods=['POST'])
    def rent_vs_buy():
        try:
            data = request.json
            
            # Extract parameters from request body
            property_value = data.get('propertyValue')
            down_payment = data.get('downPayment')
            interest_rate = data.get('interestRate')
            loan_term_years = data.get('loanTermYears')
            monthly_rent = data.get('monthlyRent')
            rent_growth_rate = data.get('rentGrowthRate')
            property_growth_rate = data.get('propertyGrowthRate')
            maintenance_cost_percent = data.get('maintenanceCostPercent')
            property_tax_percent = data.get('propertyTaxPercent')
            rental_income = data.get('rentalIncome', 0)
            tax_benefit_rate = data.get('taxBenefitRate', 0)
            inflation_rate = data.get('inflationRate', 0)
            opportunity_cost_rate = data.get('opportunityCostRate', 0)
            
            if not all([property_value, down_payment, interest_rate, loan_term_years, 
                    monthly_rent, rent_growth_rate, property_growth_rate,
                    maintenance_cost_percent, property_tax_percent]):
                return jsonify({'error': 'Missing required parameters.'}), 400
            
            # Calculate comparison
            comparison_df = calculate_rent_vs_buy(
                property_value, down_payment, interest_rate, loan_term_years,
                monthly_rent, rent_growth_rate, property_growth_rate,
                maintenance_cost_percent, property_tax_percent,
                rental_income, tax_benefit_rate, inflation_rate,
                opportunity_cost_rate
            )
            
            # Convert DataFrame to list of dictionaries
            comparison_list = []
            for _, row in comparison_df.iterrows():
                comparison_list.append({
                    'month': int(row['month']),
                    'mortgagePayment': float(row['mortgage_payment']),
                    'propertyTax': float(row['property_tax']),
                    'maintenance': float(row['maintenance']),
                    'rentalIncome': float(row['rental_income']),
                    'taxBenefit': float(row['tax_benefit']),
                    'totalBuyCost': float(row['total_buy_cost']),
                    'rentPayment': float(row['rent_payment']),
                    'opportunityCost': float(row['opportunity_cost']),
                    'totalRentCost': float(row['total_rent_cost']),
                    'propertyValue': float(row['property_value']),
                    'propertyRealValue': float(row['property_real_value']),
                    'propertyEquity': float(row['property_equity']),
                    'investmentValue': float(row['investment_value']),
                    'netWorthBuy': float(row['net_worth_buy']),
                    'netWorthRent': float(row['net_worth_rent']),
                    'breakEven': bool(row['break_even'])
                })
            
            # Key metrics for the result
            break_even_month = None
            break_even_years = None
            if any(comparison_df['break_even']):
                break_even_month = int(comparison_df[comparison_df['break_even']].iloc[0]['month'])
                break_even_years = break_even_month / 12
            
            total_buy_costs = float(comparison_df['total_buy_cost'].sum())
            total_rent_costs = float(comparison_df['total_rent_cost'].sum())
            
            final_property_value = float(comparison_df.iloc[-1]['property_value'])
            final_investment_value = float(comparison_df.iloc[-1]['investment_value'])
            
            buy_position = final_property_value - total_buy_costs
            rent_position = final_investment_value - total_rent_costs
            
            return jsonify({
                'comparison': comparison_list,
                'breakEvenMonth': break_even_month,
                'breakEvenYears': break_even_years,
                'totalBuyCosts': total_buy_costs,
                'totalRentCosts': total_rent_costs,
                'finalPropertyValue': final_property_value,
                'finalInvestmentValue': final_investment_value,
                'buyPosition': buy_position,
                'rentPosition': rent_position
            })
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    @app.route('/api/currency', methods=['POST'])
    def currency_analysis():
        try:
            data = request.json
            
            loan_amount = data.get('loanAmount')
            interest_rate = data.get('interestRate')
            loan_term_years = data.get('loanTermYears')
            base_currency = data.get('baseCurrency')
            target_currencies = data.get('targetCurrencies')
            currency_annual_change = data.get('currencyAnnualChange')
            
            if not all([loan_amount, interest_rate, loan_term_years, base_currency, target_currencies]):
                return jsonify({'error': 'Missing required parameters.'}), 400
            
            # Calculate multi-currency comparison
            currency_df = calculate_mortgage_in_multiple_currencies(
                loan_amount, interest_rate, loan_term_years,
                base_currency, target_currencies, currency_annual_change
            )
            
            # Convert DataFrame to list of dictionaries
            currency_list = []
            for _, row in currency_df.iterrows():
                entry = {'month': int(row['month'])}
                
                # Add payment, principal, interest, remaining for each currency
                for currency in target_currencies:
                    entry[f'payment_{currency}'] = float(row[f'payment_{currency}'])
                    entry[f'principal_{currency}'] = float(row[f'principal_{currency}'])
                    entry[f'interest_{currency}'] = float(row[f'interest_{currency}'])
                    entry[f'remaining_{currency}'] = float(row[f'remaining_{currency}'])
                    
                    # Add exchange rate for non-base currencies
                    if currency != base_currency and f'rate_{currency}' in currency_df.columns:
                        entry[f'rate_{currency}'] = float(row[f'rate_{currency}'])
                
                currency_list.append(entry)
            
            # Calculate total interest in each currency
            total_interest = {}
            for currency in target_currencies:
                total_interest[currency] = float(currency_df[f'interest_{currency}'].sum())
            
            return jsonify({
                'currencyAnalysis': currency_list,
                'totalInterest': total_interest
            })
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    @app.route('/api/scenarios/early_repayment', methods=['POST'])
    def early_repayment():
        try:
            data = request.json
            
            loan_amount = data.get('loanAmount')
            interest_rate = data.get('interestRate')
            loan_term_years = data.get('loanTermYears')
            early_payments = data.get('earlyPayments', [])
            
            if not all([loan_amount, interest_rate, loan_term_years]):
                return jsonify({'error': 'Missing required parameters.'}), 400
            
            # Calculate schedule with early repayment
            early_schedule = calculate_early_repayment(
                loan_amount, interest_rate, loan_term_years, early_payments
            )
            
            # Calculate regular schedule for comparison
            regular_schedule = generate_payment_schedule(
                loan_amount, interest_rate, loan_term_years
            )
            
            # Convert to lists of dictionaries
            early_list = []
            for _, row in early_schedule.iterrows():
                early_list.append({
                    'month': int(row['month']),
                    'payment': float(row['payment']),
                    'principal': float(row['principal']),
                    'interest': float(row['interest']),
                    'earlyPayment': float(row['early_payment']),
                    'remainingLoan': float(row['remaining_loan']),
                    'monthlyPayment': float(row['monthly_payment'])
                })
            
            regular_list = []
            for _, row in regular_schedule.iterrows():
                regular_list.append({
                    'month': int(row['month']),
                    'payment': float(row['payment']),
                    'principal': float(row['principal']),
                    'interest': float(row['interest']),
                    'remainingLoan': float(row['remaining_loan'])
                })
            
            # Calculate savings
            total_payments_early = float(early_schedule['payment'].sum())
            total_payments_regular = float(regular_schedule['payment'].sum())
            
            total_interest_early = float(early_schedule['interest'].sum())
            total_interest_regular = float(regular_schedule['interest'].sum())
            
            months_saved = len(regular_schedule) - len(early_schedule)
            
            return jsonify({
                'earlySchedule': early_list,
                'regularSchedule': regular_list,
                'totalPaymentsEarly': total_payments_early,
                'totalPaymentsRegular': total_payments_regular,
                'totalInterestEarly': total_interest_early,
                'totalInterestRegular': total_interest_regular,
                'monthsSaved': months_saved
            })
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    @app.route('/api/scenarios/restructuring', methods=['POST'])
    def restructuring():
        try:
            data = request.json
            
            loan_amount = data.get('loanAmount')
            original_interest_rate = data.get('originalInterestRate')
            original_term_years = data.get('originalTermYears')
            months_paid = data.get('monthsPaid')
            new_interest_rate = data.get('newInterestRate')
            new_term_years = data.get('newTermYears')
            
            if not all([loan_amount, original_interest_rate, original_term_years, months_paid]):
                return jsonify({'error': 'Missing required parameters.'}), 400
            
            # Calculate restructuring
            original_schedule, restructured_schedule, comparison = calculate_restructuring(
                loan_amount, original_interest_rate, original_term_years,
                months_paid, new_interest_rate, new_term_years
            )
            
            # Convert to lists of dictionaries
            original_list = []
            for _, row in original_schedule.iterrows():
                original_list.append({
                    'month': int(row['month']),
                    'payment': float(row['payment']),
                    'principal': float(row['principal']),
                    'interest': float(row['interest']),
                    'remainingLoan': float(row['remaining_loan'])
                })
            
            restructured_list = []
            for _, row in restructured_schedule.iterrows():
                restructured_list.append({
                    'month': int(row['month']),
                    'payment': float(row['payment']),
                    'principal': float(row['principal']),
                    'interest': float(row['interest']),
                    'remainingLoan': float(row['remaining_loan'])
                })
            
            comparison_list = []
            for _, row in comparison.iterrows():
                comparison_list.append({
                    'month': int(row['month']),
                    'originalPayment': float(row['original_payment']),
                    'restructuredPayment': float(row['restructured_payment']),
                    'originalRemaining': float(row['original_remaining']),
                    'restructuredRemaining': float(row['restructured_remaining']),
                    'paymentDifference': float(row['payment_difference']),
                    'status': row['status']
                })
            
            # Calculate key metrics
            original_remaining_payments = float(original_schedule.iloc[months_paid:]['payment'].sum())
            restructured_total_payments = float(restructured_schedule['payment'].sum())
            
            original_remaining_interest = float(original_schedule.iloc[months_paid:]['interest'].sum())
            restructured_total_interest = float(restructured_schedule['interest'].sum())
            
            original_monthly = float(original_schedule.iloc[0]['payment'])
            restructured_monthly = float(restructured_schedule.iloc[0]['payment'])
            
            original_remaining_term = len(original_schedule) - months_paid
            restructured_term = len(restructured_schedule)
            
            return jsonify({
                'originalSchedule': original_list,
                'restructuredSchedule': restructured_list,
                'comparison': comparison_list,
                'originalRemainingPayments': original_remaining_payments,
                'restructuredTotalPayments': restructured_total_payments,
                'originalRemainingInterest': original_remaining_interest,
                'restructuredTotalInterest': restructured_total_interest,
                'originalMonthlyPayment': original_monthly,
                'restructuredMonthlyPayment': restructured_monthly,
                'originalRemainingTerm': original_remaining_term,
                'restructuredTerm': restructured_term
            })
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    @app.route('/api/scenarios/insurance', methods=['POST'])
    def insurance_impact():
        try:
            data = request.json
            
            loan_amount = data.get('loanAmount')
            interest_rate = data.get('interestRate')
            loan_term_years = data.get('loanTermYears')
            insurance_rate = data.get('insuranceRate')
            insurance_term_years = data.get('insuranceTermYears')
            
            if not all([loan_amount, interest_rate, loan_term_years, insurance_rate]):
                return jsonify({'error': 'Missing required parameters.'}), 400
            
            # Calculate schedule with insurance
            insurance_schedule = calculate_with_insurance(
                loan_amount, interest_rate, loan_term_years,
                insurance_rate, insurance_term_years
            )
            
            # Calculate regular schedule for comparison
            regular_schedule = generate_payment_schedule(
                loan_amount, interest_rate, loan_term_years
            )
            
            # Convert to list of dictionaries
            insurance_list = []
            for _, row in insurance_schedule.iterrows():
                insurance_list.append({
                    'month': int(row['month']),
                    'payment': float(row['payment']),
                    'principal': float(row['principal']),
                    'interest': float(row['interest']),
                    'insurance': float(row['insurance']),
                    'totalPayment': float(row['total_payment']),
                    'remainingLoan': float(row['remaining_loan'])
                })
            
            # Calculate key metrics
            total_insurance = float(insurance_schedule['insurance'].sum())
            total_payments_with_insurance = float(insurance_schedule['total_payment'].sum())
            total_payments_regular = float(regular_schedule['payment'].sum())
            
            return jsonify({
                'insuranceSchedule': insurance_list,
                'totalInsurance': total_insurance,
                'totalPaymentsWithInsurance': total_payments_with_insurance,
                'totalPaymentsRegular': total_payments_regular,
                'increaseTotalPayments': total_payments_with_insurance - total_payments_regular
            })
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    @app.route('/api/scenarios/central_bank_rate', methods=['POST'])
    def central_bank_rate_impact():
        try:
            data = request.json
            
            loan_amount = data.get('loanAmount')
            base_interest_rate = data.get('baseInterestRate')
            loan_term_years = data.get('loanTermYears')
            central_bank_rate = data.get('centralBankRate')
            margin = data.get('margin')
            predicted_cb_rates = data.get('predictedCbRates', [])
            
            if not all([loan_amount, base_interest_rate, loan_term_years, central_bank_rate, margin]):
                return jsonify({'error': 'Missing required parameters.'}), 400
            
            # Calculate schedule with floating rate
            cb_schedule = calculate_with_central_bank_rate(
                loan_amount, base_interest_rate, loan_term_years,
                central_bank_rate, margin, predicted_cb_rates
            )
            
            # Calculate schedule with fixed rate for comparison
            fixed_schedule = generate_payment_schedule(
                loan_amount, base_interest_rate, loan_term_years
            )
            
            # Convert to lists of dictionaries
            cb_list = []
            for _, row in cb_schedule.iterrows():
                cb_list.append({
                    'month': int(row['month']),
                    'payment': float(row['payment']),
                    'principal': float(row['principal']),
                    'interest': float(row['interest']),
                    'remainingLoan': float(row['remaining_loan']),
                    'cbRate': float(row['cb_rate']),
                    'interestRate': float(row['interest_rate'])
                })
            
            fixed_list = []
            for _, row in fixed_schedule.iterrows():
                fixed_list.append({
                    'month': int(row['month']),
                    'payment': float(row['payment']),
                    'principal': float(row['principal']),
                    'interest': float(row['interest']),
                    'remainingLoan': float(row['remaining_loan'])
                })
            
            # Calculate key metrics
            total_payments_cb = float(cb_schedule['payment'].sum())
            total_payments_fixed = float(fixed_schedule['payment'].sum())
            
            total_interest_cb = float(cb_schedule['interest'].sum())
            total_interest_fixed = float(fixed_schedule['interest'].sum())
            
            return jsonify({
                'cbSchedule': cb_list,
                'fixedSchedule': fixed_list,
                'totalPaymentsCb': total_payments_cb,
                'totalPaymentsFixed': total_payments_fixed,
                'totalInterestCb': total_interest_cb,
                'totalInterestFixed': total_interest_fixed,
                'paymentDifference': total_payments_cb - total_payments_fixed,
                'interestDifference': total_interest_cb - total_interest_fixed
            })
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500
            
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)