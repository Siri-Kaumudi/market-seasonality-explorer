import { render, screen, fireEvent } from '@testing-library/react';
import DashboardPanel from './DashboardPanel';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

jest.mock('html2canvas');
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

describe('DashboardPanel Component', () => {
  const mockData = [
    {
      date: new Date('2025-07-27'),
      open: 66300,
      high: 67000,
      low: 65800,
      close: 66500,
      volume: 1100000,
      volatility: 1.81,
      performance: 200,
      stdDev: 210,
      rsi: 62,
    },
  ];

  const defaultProps = {
    data: mockData,
    compareData: [],
    selectedDate: new Date('2025-07-27'),
    view: 'daily',
  };

  test('renders dashboard with correct metrics', () => {
    render(<DashboardPanel {...defaultProps} />);
    expect(screen.getByText('Close: 66500.00')).toBeInTheDocument();
    expect(screen.getByText('Volatility: 1.81%')).toBeInTheDocument();
    expect(screen.getByText('RSI: 62.00')).toBeInTheDocument();
  });

  test('triggers CSV export', () => {
    render(<DashboardPanel {...defaultProps} />);
    const csvButton = screen.getByText('Export as CSV');
    fireEvent.click(csvButton);
    expect(saveAs).toHaveBeenCalled();
  });

  test('displays no data message when data is empty', () => {
    render(<DashboardPanel {...defaultProps} data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});