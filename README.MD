# Mortgage Calculator Pro

A comprehensive mortgage calculator application with advanced analytical capabilities for comparing different mortgage scenarios, analyzing rent vs. buy decisions, and performing currency analysis.

## Features

- **Basic Mortgage Calculations**: Calculate annuity and differentiated payment schedules with detailed visualization
- **Property Value Forecasting**: Project property values over time with different growth models
- **Rent vs. Buy Comparison**: Compare the financial implications of renting versus buying
- **Currency Analysis**: Analyze mortgage payments in different currencies with exchange rate projections
- **Advanced Scenarios**:
  - Early Repayment: Calculate the impact of early payments on your mortgage
  - Restructuring: Compare original mortgage terms with restructured options
  - Insurance: Analyze how insurance costs affect total payments
  - Central Bank Rate: See how changes in central bank rates affect variable-rate mortgages

## Technical Architecture

### Backend

- **Framework**: Flask (Python)
- **Key Libraries**: pandas, numpy, scikit-learn, plotly
- **API**: RESTful JSON API

### Frontend

- **Framework**: React
- **UI Components**: Custom components with Tailwind CSS
- **Visualization**: Recharts library
- **State Management**: React Context API

## Setup and Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the backend server:

```bash
python run.py --mode=api
```

The backend API will be available at http://localhost:5000/.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
yarn start
```

The frontend application will be available at http://localhost:3000/.

## Project Structure

```
mortgage-calculator-pro/
│
├── .gitignore
├── README.md
├── requirements.txt                  # Python dependencies
├── run.py                            # Main entry point
│
├── backend/
│   ├── core/                         # Core calculation modules
│   │   ├── calculators.py            # Basic mortgage calculations
│   │   ├── forecast.py               # Property value forecasting
│   │   ├── comparison.py             # Rent vs. buy comparison
│   │   ├── currency.py               # Currency analysis
│   │   ├── scenarios.py              # Additional scenario calculations
│   │   └── japan_mortgage_data.py    # Japan-specific mortgage data
│   ├── app.py                        # Flask API application
│
└── frontend/
    ├── public/                       # Static assets
    └── src/                          # React source code
        ├── api/                      # API service
        ├── components/               # React components
        │   ├── calculator/           # Basic calculator components
        │   ├── comparison/           # Rent vs. buy components
        │   ├── currency/             # Currency analysis components
        │   ├── forecast/             # Forecasting components
        │   ├── layout/               # Layout components
        │   ├── scenarios/            # Scenario components
        │   └── common/               # Common UI components
        ├── contexts/                 # React context providers
        ├── App.js                    # Main application component
        └── index.js                  # Entry point
```

## API Documentation

### Base URL

`http://localhost:5000/api`

### Endpoints

- `POST /calculate`: Calculate mortgage payment schedule
- `POST /forecast`: Forecast property value
- `POST /compare`: Compare rent vs. buy
- `POST /currency`: Analyze mortgage in multiple currencies
- `POST /scenarios/early_repayment`: Calculate early repayment scenario
- `POST /scenarios/restructuring`: Calculate mortgage restructuring
- `POST /scenarios/insurance`: Calculate insurance impact
- `POST /scenarios/central_bank_rate`: Calculate central bank rate impact

For detailed API documentation, refer to the API section below.

## API Reference

### Basic Mortgage Calculation

**Endpoint**: `POST /api/calculate`

**Request**:
```json
{
  "loanAmount": 10000000,
  "interestRate": 7.5,
  "loanTermYears": 20,
  "paymentType": "annuity"  // or "differentiated"
}
```

**Response**:
```json
{
  "schedule": [
    {
      "month": 1,
      "payment": 80376.32,
      "principal": 17042.98,
      "interest": 63333.33,
      "remainingLoan": 9982957.02
    },
    ...
  ],
  "totalInterest": 9290316.35,
  "totalPayments": 19290316.35
}
```

### Property Value Forecast

**Endpoint**: `POST /api/forecast`

**Request**:
```json
{
  "initialValue": 10000000,
  "growthRate": 4.0,
  "years": 10,
  "inflationRate": 4.0,
  "regionalAdjustment": 0,
  "model": "linear"  // or "exponential", "ml"
}
```

**Response**:
```json
{
  "forecast": [
    {
      "month": 1,
      "nominalValue": 10033333.33,
      "realValue": 10000000.00
    },
    ...
  ],
  "finalNominalValue": 14802443.42,
  "finalRealValue": 10000000.00,
  "totalGrowth": 0.4802,
  "realGrowth": 0.0
}
```

For full API documentation and examples, see the API.md file.

## License

This project is licensed under the MIT License - see the LICENSE file for details.