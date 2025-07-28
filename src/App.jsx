import { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, Tabs, Tab, Button, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import axios from 'axios';
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, differenceInDays } from 'date-fns';
import CalendarView from './components/CalendarView';
import DashboardPanel from './components/DashboardPanel';
//import mockData from './mock-data.json';
//import mockDataScenarios from './mock-data-scenarios.json';
import './styles/App.css';

export function calculateRSI(prices) {
  if (prices.length < 14) return 0;
  let gains = 0, losses = 0;
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  const rs = avgGain / (avgLoss || 1);
  return 100 - (100 / (1 + rs));
}

function App() {
  const [view, setView] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [data, setData] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState('BTCUSDT');
  const [metricFilter, setMetricFilter] = useState('all');
  const [theme, setTheme] = useState('default');
  const [alerts, setAlerts] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dataScenario, setDataScenario] = useState('default');

  useEffect(() => {
    const fetchData = async (symbol, interval, limit, setDataFunc) => {
      if (dataScenario !== 'default') {
        const scenarioData = mockDataScenarios[dataScenario].map(d => ({ ...d, date: new Date(d.date) }));
        setDataFunc(scenarioData);
        setAlerts([{ date: format(new Date(), 'yyyy-MM-dd'), message: `Using ${dataScenario} scenario data` }]);
        return;
      }
      try {
        const response = await axios.get('https://api.binance.com/api/v3/klines', {
          params: { symbol, interval, limit },
        });
        const formattedData = response.data
          .filter(([timestamp, open, high, low, close, volume]) =>
            timestamp && open && high && low && close && volume
          )
          .map(([timestamp, open, high, low, close, volume]) => {
            const prices = [parseFloat(open), parseFloat(high), parseFloat(low), parseFloat(close)];
            const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
            const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
            return {
              date: new Date(timestamp),
              open: parseFloat(open),
              high: parseFloat(high),
              low: parseFloat(low),
              close: parseFloat(close),
              volume: parseFloat(volume),
              volatility: ((parseFloat(high) - parseFloat(low)) / parseFloat(open)) * 100,
              performance: parseFloat(close) - parseFloat(open),
              stdDev: Math.sqrt(variance),
              rsi: calculateRSI(prices),
            };
          });
        if (formattedData.length === 0) {
          console.warn('No valid data from API, using mock data');
          setDataFunc(mockData.map(d => ({ ...d, date: new Date(d.date) })));
        } else {
          setDataFunc(formattedData);
        }

        const newAlerts = formattedData
          .filter(d => d.volatility > 5 || Math.abs(d.performance) > 1000)
          .map(d => ({
            date: format(d.date, 'yyyy-MM-dd'),
            message: `High ${d.volatility > 5 ? 'volatility' : 'performance'} on ${format(d.date, 'MMM d, yyyy')}`,
          }));
        setAlerts(newAlerts);
      } catch (error) {
        console.error('Error fetching Binance data:', error);
        setAlerts([{ date: format(new Date(), 'yyyy-MM-dd'), message: 'Failed to fetch data, using mock data' }]);
        setDataFunc(mockData.map(d => ({ ...d, date: new Date(d.date) })));
      }
    };

    const interval = view === 'daily' ? '1h' : view === 'weekly' ? '1d' : '1w';
    const limit = view === 'daily' ? 24 : view === 'weekly' ? 7 : 30;
    fetchData(selectedInstrument, interval, limit, setData);
    if (dateRange[0] && dateRange[1]) {
      fetchData(selectedInstrument, interval, differenceInDays(dateRange[1], dateRange[0]) + 1, setCompareData);
    }
  }, [view, selectedInstrument, dateRange, dataScenario]);

  const handleViewChange = (event, newView) => {
    setView(newView);
  };

  const navigateDate = (direction) => {
    if (view === 'daily') {
      setSelectedDate(addDays(selectedDate, direction));
    } else if (view === 'weekly') {
      setSelectedDate(addWeeks(selectedDate, direction));
    } else {
      setSelectedDate(addMonths(selectedDate, direction));
    }
  };

  const handleDateRangeSelect = (range) => {
    setDateRange(range);
  };

  const getAggregatedData = () => {
    if (view === 'daily') return data;
    const aggregated = [];
    const start = view === 'weekly' ? startOfWeek(selectedDate) : startOfMonth(selectedDate);
    const range = view === 'weekly' ? 7 : 30;
    for (let i = 0; i < range; i++) {
      const currentDate = addDays(start, i);
      const dayData = data.filter(d => format(d.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd'));
      if (dayData.length) {
        const avgVolatility = dayData.reduce((sum, d) => sum + (d.volatility || 0), 0) / dayData.length;
        const totalVolume = dayData.reduce((sum, d) => sum + (d.volume || 0), 0);
        const performance = dayData[dayData.length - 1]?.performance || 0;
        aggregated.push({
          date: currentDate,
          volatility: avgVolatility,
          volume: totalVolume,
          performance,
          stdDev: dayData.reduce((sum, d) => sum + (d.stdDev || 0), 0) / dayData.length,
          rsi: dayData.reduce((sum, d) => sum + (d.rsi || 0), 0) / dayData.length,
        });
      } else {
        aggregated.push({
          date: currentDate,
          volatility: 0,
          volume: 0,
          performance: 0,
          stdDev: 0,
          rsi: 0,
        });
      }
    }
    return aggregated;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4, transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
        <Typography variant="h4" gutterBottom>Market Seasonality Explorer</Typography>
        {alerts.map((alert, index) => (
          <Alert key={index} severity="warning" sx={{ mb: 2 }}>{alert.message}</Alert>
        ))}
        <Box sx={{ mb: 2 }}>
          <Tabs value={view} onChange={handleViewChange}>
            <Tab label="Daily" value="daily" />
            <Tab label="Weekly" value="weekly" />
            <Tab label="Monthly" value="monthly" />
          </Tabs>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button onClick={() => navigateDate(-1)}>Previous</Button>
            <Button onClick={() => navigateDate(1)}>Next</Button>
            <Button onClick={() => setTheme(theme === 'default' ? 'highContrast' : theme === 'highContrast' ? 'colorblind' : 'default')}>
              Toggle Theme
            </Button>
            <Button onClick={() => setZoomLevel(zoomLevel + 0.1)}>Zoom In</Button>
            <Button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}>Zoom Out</Button>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Instrument</InputLabel>
              <Select value={selectedInstrument} onChange={(e) => setSelectedInstrument(e.target.value)}>
                <MenuItem value="BTCUSDT">BTC/USDT</MenuItem>
                <MenuItem value="ETHUSDT">ETH/USDT</MenuItem>
                <MenuItem value="BNBUSDT">BNB/USDT</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Metric</InputLabel>
              <Select value={metricFilter} onChange={(e) => setMetricFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="volatility">Volatility</MenuItem>
                <MenuItem value="volume">Volume</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Data Scenario</InputLabel>
              <Select value={dataScenario} onChange={(e) => setDataScenario(e.target.value)}>
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="highVolatility">High Volatility</MenuItem>
                <MenuItem value="noData">No Data</MenuItem>
                <MenuItem value="negativePerformance">Negative Performance</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <CalendarView
                view={view}
                selectedDate={selectedDate}
                dateRange={dateRange}
                onDateRangeSelect={handleDateRangeSelect}
                data={getAggregatedData()}
                compareData={compareData}
                metricFilter={metricFilter}
                theme={theme}
                onDateSelect={setSelectedDate}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <DashboardPanel data={data} compareData={compareData} selectedDate={selectedDate} view={view} />
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
}

export default App;