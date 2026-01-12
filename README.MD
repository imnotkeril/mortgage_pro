# Mortgage Calculator Pro

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3+-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-3.3+-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

A comprehensive, professional-grade mortgage calculator application featuring advanced analytical capabilities, multi-scenario analysis, and intuitive user interface. Built with React frontend and Flask backend for optimal performance and user experience.

## 🚀 Live Demo

Experience the full application with all features and real-time calculations.

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
- **AI-Powered Features**:
  - **Intelligent Mortgage Advisor Chatbot**: Get expert mortgage advice and answers to your questions using AI
  - **Smart Scenario Recommendations**: AI analyzes your profile and recommends optimal mortgage parameters
  - **Expense & Income Analyzer**: Automatically extract and categorize expenses from natural language descriptions

## 📖 Overview

Mortgage Calculator Pro is a sophisticated financial planning tool designed for homebuyers, real estate professionals, and financial advisors. The application provides comprehensive mortgage analysis capabilities including payment calculations, property value forecasting, rent vs. buy comparisons, currency analysis, and advanced scenario modeling.

### 🎯 Key Features

- **Advanced Mortgage Calculations**: Annuity and differentiated payment schedules with detailed breakdowns
- **Property Value Forecasting**: Multiple forecasting models including linear, exponential, and machine learning approaches
- **Rent vs. Buy Analysis**: Comprehensive comparison with break-even analysis and net worth projections
- **Multi-Currency Support**: Real-time currency analysis with exchange rate projections
- **Scenario Planning**: Early repayment, restructuring, insurance impact, and central bank rate analysis
- **Professional Reports**: Detailed analytical reports with charts and data exports
- **Dark/Light Themes**: Modern UI with customizable appearance
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and context API
- **TailwindCSS**: Utility-first CSS framework with custom design system
- **Recharts**: Advanced charting library for financial visualizations
- **Axios**: HTTP client for API communication
- **Context API**: Global state management for application data

### Backend Stack
- **Flask**: Lightweight Python web framework
- **NumPy & Pandas**: Numerical computing and data analysis
- **Scikit-learn**: Machine learning algorithms for forecasting
- **Flask-CORS**: Cross-origin resource sharing support
- **Plotly**: Server-side chart generation capabilities

### Development & Deployment
- **Docker**: Containerized development and production environments
- **Nginx**: Production web server with reverse proxy
- **Hot Reload**: Development server with instant updates
- **Environment Configuration**: Flexible configuration management

## 📁 Project Structure

```
mortgage-calculator-pro/
├── 🌐 frontend/                    # React application
│   ├── public/                     # Static assets
│   │   ├── index.html              # Main HTML template
│   │   └── manifest.json           # PWA configuration
│   ├── src/                        # Source code
│   │   ├── components/             # React components
│   │   │   ├── calculator/         # Mortgage calculator components
│   │   │   ├── comparison/         # Rent vs buy comparison
│   │   │   ├── currency/           # Currency analysis
│   │   │   ├── forecast/           # Property value forecasting
│   │   │   ├── scenarios/          # Advanced scenarios
│   │   │   ├── layout/             # Layout components
│   │   │   └── common/             # Shared components
│   │   ├── contexts/               # React contexts
│   │   │   ├── AppContext.js       # Application state
│   │   │   └── CurrencyContext.js  # Currency management
│   │   ├── api/                    # API communication
│   │   ├── utils/                  # Utility functions
│   │   ├── App.js                  # Main application component
│   │   └── index.js                # Application entry point
│   ├── package.json                # Frontend dependencies
│   ├── tailwind.config.js          # TailwindCSS configuration
│   └── Dockerfile                  # Frontend container
│
├── 🐍 backend/                     # Flask API server
│   ├── api/                        # API application
│   │   ├── app.py                  # Flask application
│   │   ├── routes/                 # API routes
│   │   └── utils/                  # API utilities
│   ├── core/                       # Core calculation modules
│   │   ├── calculators.py          # Mortgage calculations
│   │   ├── forecast.py             # Property value forecasting
│   │   ├── comparison.py           # Rent vs buy analysis
│   │   ├── currency.py             # Currency analysis
│   │   └── scenarios.py            # Advanced scenarios
│   ├── tests/                      # Test suite
│   ├── requirements.txt            # Python dependencies
│   ├── run.py                      # Application runner
│   └── Dockerfile                  # Backend container
│
├── 🐳 docker-compose.yml           # Development environment
├── 📄 nginx.conf                   # Nginx configuration
├── 📋 README.md                    # Project documentation
└── 📜 LICENSE                      # MIT License
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 16.0 or higher
- **Python**: 3.9 or higher
- **Docker**: Optional but recommended for easy setup

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/imnotkeril/mortgage_pro.git
   cd mortgage_pro
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api

### Manual Installation

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python run.py --mode=api
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 💡 Core Features

### 🏠 Mortgage Calculator
**Comprehensive mortgage payment analysis with multiple calculation methods**

- **Payment Types**: Annuity (fixed) and differentiated payment schedules
- **Flexible Parameters**: Loan amount, interest rate, term, and down payment
- **Visual Analytics**: Interactive charts showing payment structure and remaining balance
- **Payment Schedule**: Detailed month-by-month breakdown with annual summaries
- **Real-time Calculations**: Instant updates as parameters change

### 📊 Property Value Forecast
**Advanced property value projection using multiple modeling approaches**

- **Forecasting Models**: Linear, exponential, and machine learning-based predictions
- **Economic Factors**: Inflation adjustment and regional market variations
- **Seasonal Analysis**: Monthly fluctuations and market cycle considerations
- **Growth Scenarios**: Multiple growth rate scenarios with confidence intervals
- **Visual Projections**: Interactive charts comparing nominal vs. real value growth

### ⚖️ Rent vs. Buy Analysis
**Comprehensive financial comparison between renting and buying**

- **Break-even Analysis**: Calculate when buying becomes more advantageous
- **Net Worth Comparison**: Track wealth accumulation under both scenarios
- **Opportunity Cost**: Consider alternative investment returns on down payment
- **Tax Benefits**: Mortgage interest deduction and property tax considerations
- **Market Dynamics**: Rent growth rates and property appreciation modeling

### 💱 Multi-Currency Analysis
**Advanced currency analysis for international mortgage planning**

- **Multi-Currency Support**: RUB, USD, EUR, JPY with real-time conversion
- **Exchange Rate Projections**: Custom annual change rate modeling
- **Payment Comparison**: Side-by-side analysis in different currencies
- **Risk Assessment**: Currency fluctuation impact on total mortgage costs
- **Interactive Charts**: Exchange rate trends and payment evolution

### 🎭 Advanced Scenarios
**Sophisticated modeling for complex mortgage situations**

#### Early Repayment Analysis
- **Strategy Options**: Reduce term vs. reduce payment amount
- **Multiple Payments**: Schedule multiple early payments throughout loan term
- **Savings Calculator**: Interest savings and term reduction analysis
- **Visual Comparison**: Chart comparing standard vs. accelerated schedules

#### Mortgage Restructuring
- **Rate Changes**: Compare original vs. new interest rates
- **Term Modifications**: Analyze impact of changing loan duration
- **Payment Impact**: Monthly payment changes and total cost comparison
- **Timeline Analysis**: Visual representation of before/after scenarios

#### Insurance Impact
- **PMI Analysis**: Private mortgage insurance cost modeling
- **Coverage Periods**: Flexible insurance term configurations
- **Cost Breakdown**: Detailed analysis of insurance impact on total payments
- **Payment Structure**: Visual breakdown of mortgage + insurance costs

#### Central Bank Rate Impact
- **Variable Rate Modeling**: Floating rate mortgage analysis
- **Rate Projections**: Custom central bank rate forecasting
- **Payment Volatility**: Analysis of payment changes over time
- **Risk Assessment**: Compare fixed vs. variable rate strategies

## 🎨 User Interface

### Modern Design System
- **Dark/Light Themes**: Professional appearance with user preference support
- **Responsive Layout**: Optimized for all screen sizes and devices
- **Interactive Elements**: Smooth animations and hover effects
- **Accessibility**: WCAG compliant with keyboard navigation support

### Advanced Visualizations
- **Interactive Charts**: Recharts-powered financial visualizations
- **Real-time Updates**: Dynamic chart updates as parameters change
- **Multiple Chart Types**: Line charts, bar charts, pie charts, and area charts
- **Data Export**: Download charts and data for external analysis

### Intuitive Navigation
- **Sidebar Navigation**: Easy access to all application features
- **Tabbed Interface**: Organized content with clear section separation
- **Breadcrumb Navigation**: Clear indication of current location
- **Mobile Optimization**: Touch-friendly interface for mobile devices

## 🔧 API Documentation

### RESTful API Endpoints

The application provides a comprehensive REST API for all mortgage calculation and analysis features:

- **Mortgage Calculations**: Basic and advanced payment schedule generation
- **Property Forecasting**: Multiple forecasting models with economic factors
- **Rent vs Buy Analysis**: Comprehensive financial comparison with break-even calculations
- **Currency Analysis**: Multi-currency mortgage analysis with exchange rate projections
- **Scenario Modeling**: Advanced scenarios including early repayment, restructuring, insurance impact, and central bank rate analysis

All endpoints accept JSON requests and return structured JSON responses with detailed calculation results and metadata.

## 📊 Financial Calculations

### Financial Methodology
- **Annuity Payments**: Fixed monthly payments with varying principal/interest ratio
- **Differentiated Payments**: Decreasing payments with fixed principal amounts
- **Risk Assessment**: Comprehensive loan-to-value and debt-to-income analysis
- **Market Analysis**: Property appreciation and rental market dynamics

### Risk Metrics
- **Loan-to-Value Ratio**: Down payment percentage analysis
- **Debt-to-Income Ratio**: Monthly payment affordability
- **Payment Shock Analysis**: Impact of rate changes on payments
- **Prepayment Risk**: Early repayment scenario modeling

## 🧪 Testing & Quality Assurance

### Comprehensive Testing Suite
- **Backend Testing**: Python unittest framework with 90%+ coverage
- **Frontend Testing**: Jest and React Testing Library for component testing
- **Integration Testing**: End-to-end testing with Docker Compose
- **API Testing**: Automated testing of all endpoints and edge cases

### Code Quality Standards
- **Linting**: ESLint for JavaScript and Black for Python
- **Type Safety**: PropTypes validation and consistent coding patterns
- **Performance**: Optimized calculations and efficient rendering
- **Accessibility**: WCAG compliance and keyboard navigation support

## 🚀 Deployment

### Production-Ready Deployment
The application supports multiple deployment strategies:

- **Docker Deployment**: Complete containerized solution with Nginx reverse proxy
- **Cloud Deployment**: Ready for AWS, GCP, or Azure with minimal configuration
- **Environment Management**: Flexible configuration for development, staging, and production
- **Scalability**: Horizontal scaling support for high-traffic scenarios

### Infrastructure Requirements
- **Frontend**: Static file hosting or CDN distribution
- **Backend**: Python WSGI server (Gunicorn recommended)
- **Database**: Optional PostgreSQL for persistent storage
- **Caching**: Redis for session management and performance optimization

## 🔧 Configuration

### Currency Configuration
The application supports multiple currencies with configurable exchange rates and real-time conversion capabilities.

### Theme Configuration
Custom design system with professional dark and light modes optimized for financial data visualization.

## 📈 Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components for faster initial load
- **Memoization**: React.memo and useMemo for expensive calculations
- **Debounced Inputs**: Optimized user input handling
- **Chart Optimization**: Efficient data sampling for large datasets

### Backend Optimizations
- **Vectorized Calculations**: NumPy-based mathematical operations
- **Caching**: Intelligent caching of computation-intensive results
- **Async Processing**: Non-blocking API responses
- **Data Validation**: Input sanitization and validation

## 🤝 Contributing

We welcome contributions from the financial technology community!

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed
4. **Test your changes**
   ```bash
   npm test  # Frontend tests
   pytest    # Backend tests
   ```
5. **Submit a pull request**

### Contribution Guidelines
- **Code Quality**: Follow ESLint and Black formatting standards
- **Testing**: Maintain test coverage above 80%
- **Documentation**: Update README and API docs for new features
- **Performance**: Ensure changes don't degrade application performance

## 📋 Roadmap

### Upcoming Features
- [ ] **Advanced Analytics**: Monte Carlo simulations and stress testing
- [ ] **Report Generation**: PDF export of analysis results
- [ ] **API Integrations**: Real-time interest rates and property values
- [ ] **User Accounts**: Save and compare multiple scenarios
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **Advanced Charts**: 3D visualizations and interactive dashboards

### Technical Improvements
- [ ] **WebSocket Integration**: Real-time collaborative analysis
- [ ] **Progressive Web App**: Offline functionality and push notifications
- [ ] **Microservices**: Split backend into specialized services
- [ ] **Database Integration**: PostgreSQL for data persistence
- [ ] **Machine Learning**: Enhanced forecasting models
- [ ] **Internationalization**: Multi-language support


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Technical Stack
- **React Team**: For the excellent frontend framework
- **Flask Community**: For the lightweight and powerful backend framework
- **Scientific Python**: NumPy, Pandas, and Scikit-learn ecosystems
- **Recharts**: Beautiful charting library for React applications

### Financial Expertise
- **Modern Portfolio Theory**: Mathematical foundations for financial calculations
- **Real Estate Finance**: Industry best practices for mortgage analysis
- **Risk Management**: Professional risk assessment methodologies
- **Currency Analysis**: International finance and exchange rate modeling

### Design Inspiration
- **Modern Web Design**: Contemporary UI/UX patterns and practices
- **Financial Software**: Professional financial analysis tools
- **Data Visualization**: Best practices in financial data presentation

---
