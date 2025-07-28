Market Seasonality Explorer
Introduction
The Market Seasonality Explorer is a React-based web application that visualizes financial market data (e.g., BTC/USDT, ETH/USDT, BNB/USDT) in a calendar format. It displays metrics like price changes, volatility, volume, standard deviation, and RSI, with interactive features such as date range selection, zoom, and data export.
Table of Contents

Introduction
Features
Technologies Used
Setup Instructions
Running the Project Locally
Running Tests
Assumptions
Data Scenarios and Edge Cases
Video Demonstration
Contributing
License

Features

Calendar View: Displays daily, weekly, or monthly data with color-coded volatility (green: <1%, yellow: 1-2%, red: >2%).
Performance Indicators: Upward (↑) green, downward (↓) red, or neutral (−) gray arrows based on performance.
Interactive Features:
Hover tooltips showing volatility, volume, performance, stdDev, and RSI.
Shift-click for date range selection.
Filters for instruments and metrics.
Zoom in/out functionality.


Dashboard Panel: Shows detailed metrics (open, close, high, low, volume, volatility, stdDev, RSI, benchmark comparison).
Export Options: PDF, CSV, and image exports.
Themes: Default, high-contrast, and colorblind-friendly.
Alerts: Triggers for high volatility (>5%) or performance (>1000).
Historical Patterns: Highlights recurring high-volatility days with purple borders.
Responsive Design: Touch-friendly and optimized for all screen sizes.

Technologies Used

React: ^18.2.0 (UI framework)
Material-UI: ^5.14.18 (components and styling)
date-fns: ^2.30.0 (date manipulation)
axios: ^1.6.2 (API requests)
recharts: ^2.10.3 (charts)
html2canvas: ^1.4.1 (image export)
jspdf: ^2.5.1 (PDF export)
file-saver: ^2.0.5 (CSV/image download)
Jest: ^29.7.0 (unit testing)
React Testing Library: ^14.0.0 (component testing)
Vite: ^5.0.0 (build tool)

Setup Instructions

Install Node.js:

Download and install Node.js (v16 or later) from nodejs.org.
Verify installation: node -v and npm -v.


Clone the Repository:
git clone https://github.com/your-username/market-seasonality-explorer
cd market-seasonality-explorer


Install Dependencies:
npm install



Running the Project Locally

Start the development server:npm run dev


Open http://localhost:5173 in your browser.
Use the interface to:
Switch between daily, weekly, monthly views.
Navigate dates with Previous/Next buttons or arrow keys.
Select instruments (BTC/USDT, ETH/USDT, BNB/USDT) or data scenarios (default, highVolatility, noData, negativePerformance).
Export data as PDF, CSV, or image.
Toggle themes and zoom.



Running Tests

Run unit tests:npm test


Tests cover:
App.jsx: Rendering, view switching, mock data fallback.
CalendarView.jsx: Calendar rendering, volatility colors, keyboard navigation, no data handling.
DashboardPanel.jsx: Metric display, export functionality.
calculateRSI: RSI calculation for various price inputs.



Assumptions

Data Source: The Binance API may fail or return incomplete data, so mock data (mock-data.json, mock-data-scenarios.json) is used as a fallback.
Environment: Users have Node.js and npm installed.
Browser: The app is tested on Chrome, Firefox, and Safari.
Testing: Jest and React Testing Library are sufficient for unit tests; integration tests are not included due to project scope.
Data Scenarios: Mock data covers typical, high volatility, no data, and negative performance cases.
API Limits: Binance API rate limits may affect real-time data; mock data ensures functionality.

Data Scenarios and Edge Cases

Default: 30 days of BTC/USDT data with mixed volatility (0.5-2.5%) and performance (-500 to 500).
High Volatility: 3 days with volatility >15%, triggering red cells and alerts.
No Data: 2 days of data with gaps, showing gray cells and “No Data” labels.
Negative Performance: 3 days with consistent price drops, showing red downward arrows and low RSI (<50).
Edge Cases:
Empty API response: Falls back to mock data.
Invalid prices: Handled by filtering out null/undefined values.
Short price arrays: RSI returns 0 for arrays <14 elements.
Missing days: Displayed as gray with “No Data” in calendar.



Video Demonstration
A video demonstration is available at: [Insert Google Drive/YouTube Link Here]
The video shows:

Navigating views (daily, weekly, monthly).
Switching instruments and data scenarios.
Interacting with calendar (hover, click, date range selection).
Exporting data (PDF, CSV, image).
Theme toggling and zoom functionality.
Handling edge cases (no data, high volatility).
Code review of App.jsx (data fetching), CalendarView.jsx (visualization), and unit tests.

Contributing
Contributions are welcome! Please:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

License
This project is licensed under the MIT License.