import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import mockData from './mock-data.json';
import axios from 'axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

jest.mock('axios');

describe('App Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: mockData.map(d => [
        new Date(d.date).getTime(),
        d.open,
        d.high,
        d.low,
        d.close,
        d.volume,
      ]),
    });
  });

  test('renders Market Seasonality Explorer title', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <App />
      </LocalizationProvider>
    );
    expect(screen.getByText('Market Seasonality Explorer')).toBeInTheDocument();
  });

  test('switches views when tabs are clicked', async () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <App />
      </LocalizationProvider>
    );
    fireEvent.click(screen.getByText('Weekly'));
    expect(screen.getByText('Weekly')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByText('Monthly'));
    expect(screen.getByText('Monthly')).toHaveAttribute('aria-selected', 'true');
  });

  test('displays mock data when API fails', async () => {
    axios.get.mockRejectedValue(new Error('API failure'));
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <App />
      </LocalizationProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data, using mock data/)).toBeInTheDocument();
    });
  });
});