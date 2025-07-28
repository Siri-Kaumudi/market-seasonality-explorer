import { render, screen, fireEvent } from '@testing-library/react';
import CalendarView from './CalendarView';
import { format, addDays } from 'date-fns';

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

describe('CalendarView Component', () => {
  const defaultProps = {
    view: 'daily',
    selectedDate: new Date('2025-07-27'),
    dateRange: [new Date('2025-07-27'), new Date('2025-07-27')],
    onDateRangeSelect: jest.fn(),
    data: mockData,
    compareData: [],
    metricFilter: 'all',
    theme: 'default',
    onDateSelect: jest.fn(),
  };

  test('renders calendar with correct date', () => {
    render(<CalendarView {...defaultProps} />);
    expect(screen.getByText('27')).toBeInTheDocument();
    expect(screen.getByText('July 2025')).toBeInTheDocument();
  });

  test('displays correct volatility color', () => {
    render(<CalendarView {...defaultProps} />);
    const cell = screen.getByText('27').parentElement;
    expect(cell).toHaveStyle('background: #ffeb3b'); // Yellow for volatility 1.81
  });

  test('shows tooltip on hover', () => {
    render(<CalendarView {...defaultProps} />);
    fireEvent.mouseEnter(screen.getByText('27').parentElement);
    expect(screen.getByText('Volatility: 1.81%')).toBeInTheDocument();
  });

  test('handles keyboard navigation', () => {
    render(<CalendarView {...defaultProps} />);
    const cell = screen.getByText('27').parentElement;
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(defaultProps.onDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  test('displays no data message for missing data', () => {
    render(<CalendarView {...defaultProps} data={[]} />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });
});