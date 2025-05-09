import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

def forecast_property_value(initial_value, growth_rate, years,
                            seasonal_factors=None, regional_adjustment=0,
                            inflation_rate=0, model="linear"):
    """
    Forecast property value over time with various growth models
    
    Parameters:
    -----------
    initial_value : float
        Initial property value
    growth_rate : float
        Annual growth rate (percentage)
    years : int
        Number of years to forecast
    seasonal_factors : list, optional
        Seasonal adjustment factors by month (12 values)
    regional_adjustment : float, optional
        Regional growth adjustment (percentage)
    inflation_rate : float, optional
        Annual inflation rate (percentage)
    model : str, optional
        Forecasting model type ("linear", "exponential", "ml")
        
    Returns:
    --------
    pandas.DataFrame
        DataFrame with monthly forecasted values (nominal and real)
    """
    months = years * 12

    # Default seasonal factors if none provided
    if seasonal_factors is None:
        # Slightly higher in spring/summer, lower in winter
        seasonal_factors = [0.997, 1.001, 1.003, 1.005, 1.006, 1.005,
                            1.003, 1.001, 0.999, 0.998, 0.996, 0.995]
                            
    # Adjusted monthly growth rate
    total_growth_rate = growth_rate + regional_adjustment
    monthly_growth_rate = (1 + total_growth_rate / 100) ** (1 / 12) - 1
    monthly_inflation_rate = (1 + inflation_rate / 100) ** (1 / 12) - 1

    forecast_data = []
    current_value = initial_value

    if model == "linear":
        for month in range(1, months + 1):
            month_in_year = (month - 1) % 12
            seasonal_factor = seasonal_factors[month_in_year]

            # Apply growth and seasonal factor
            current_value = current_value * (1 + monthly_growth_rate) * seasonal_factor

            # Apply inflation effect
            real_value = current_value / (1 + monthly_inflation_rate) ** month

            forecast_data.append({
                'month': month,
                'nominal_value': current_value,
                'real_value': real_value
            })

    elif model == "exponential":
        # Exponential growth model with seasonal adjustment
        for month in range(1, months + 1):
            month_in_year = (month - 1) % 12
            seasonal_factor = seasonal_factors[month_in_year]

            # Exponential growth formula
            growth_factor = (1 + monthly_growth_rate) ** month
            current_value = initial_value * growth_factor * seasonal_factor

            # Apply inflation effect
            real_value = current_value / (1 + monthly_inflation_rate) ** month

            forecast_data.append({
                'month': month,
                'nominal_value': current_value,
                'real_value': real_value
            })

    elif model == "ml":
        # Simple ML-based approach using historical data pattern
        # This is a simplified simulation for demonstration
        X = np.array(range(months)).reshape(-1, 1)
        y = np.zeros(months)

        # Generate synthetic historical pattern with some noise
        for i in range(months):
            month_in_year = i % 12
            seasonal_factor = seasonal_factors[month_in_year]
            growth_factor = (1 + monthly_growth_rate) ** i
            noise_factor = 1 + np.random.normal(0, 0.005)  # Random noise

            y[i] = initial_value * growth_factor * seasonal_factor * noise_factor

        # Fit linear regression model
        model = LinearRegression()
        model.fit(X, y)

        # Predict values
        predicted_values = model.predict(X)

        for month in range(1, months + 1):
            nominal_value = predicted_values[month - 1]
            real_value = nominal_value / (1 + monthly_inflation_rate) ** month

            forecast_data.append({
                'month': month,
                'nominal_value': nominal_value,
                'real_value': real_value
            })

    return pd.DataFrame(forecast_data)