import { useState, useEffect } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { format, isSameDay, isSameWeek, isSameMonth, addDays, startOfWeek, startOfMonth } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CalendarView = ({ view, selectedDate, dateRange, onDateRangeSelect, data, compareData, metricFilter, theme, onDateSelect }) => {
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectingRange, setSelectingRange] = useState(false);
  const [tempRangeStart, setTempRangeStart] = useState(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        onDateSelect(addDays(selectedDate, -1));
      } else if (e.key === 'ArrowRight') {
        onDateSelect(addDays(selectedDate, 1));
      } else if (e.key === 'Escape') {
        setSelectingRange(false);
        setTempRangeStart(null);
        onDateRangeSelect([new Date(), new Date()]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate, onDateSelect]);

  // Detect historical patterns
  const detectPatterns = (data) => {
    const highVolDays = data.filter(d => d.volatility > 5).map(d => format(d.date, 'yyyy-MM-dd'));
    return data.map(d => ({
      ...d,
      isPattern: highVolDays.filter(date => date === format(d.date, 'yyyy-MM-dd')).length > 1,
    }));
  };

  const enhancedData = detectPatterns(data);

  // Generate calendar grid
  const renderCalendar = () => {
    const days = [];
    const start = view === 'daily' ? selectedDate : view === 'weekly' ? startOfWeek(selectedDate) : startOfMonth(selectedDate);
    const range = view === 'daily' ? 1 : view === 'weekly' ? 7 : 30;
    for (let i = 0; i < range; i++) {
      const date = addDays(start, i);
      const dayData = enhancedData.find(d =>
        d.date &&
        (isSameDay(d.date, date) ||
         (view === 'weekly' && isSameWeek(d.date, date)) ||
         (view === 'monthly' && isSameMonth(d.date, date))
        )
      );
      const isInRange = dateRange[0] && dateRange[1] &&
        date >= dateRange[0] && date <= dateRange[1];
      const volatilityColor = dayData?.volatility != null && (metricFilter === 'all' || metricFilter === 'volatility')
        ? getVolatilityColor(dayData.volatility, theme)
        : '#e0e0e0'; // Gray for missing data
      const performanceIndicator = dayData?.performance != null && (metricFilter === 'all' || metricFilter === 'performance')
        ? getPerformanceIndicator(dayData.performance)
        : '';
      const volumeSize = dayData?.volume != null && (metricFilter === 'all' || metricFilter === 'volume')
        ? Math.min(dayData.volume / 1000000, 20)
        : 5;

      days.push(
        <Box
          key={i}
          sx={{
            width: view === 'daily' ? '100%' : '14%',
            height: '100px',
            background: volatilityColor,
            border: isSameDay(date, new Date())
              ? '3px solid blue'
              : isInRange
              ? '2px dashed green'
              : dayData?.isPattern
              ? '2px solid purple'
              : '1px solid #ccc',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': { background: darkenColor(volatilityColor) },
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.3s ease, transform 0.2s ease',
            backgroundImage: dayData?.isPattern ? 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%)' : 'none',
            backgroundSize: '20px 20px',
          }}
          onClick={(e) => {
            if (e.shiftKey) {
              if (!selectingRange) {
                setSelectingRange(true);
                setTempRangeStart(date);
                onDateRangeSelect([date, date]);
              } else {
                setSelectingRange(false);
                onDateRangeSelect([tempRangeStart, date]);
              }
            } else {
              onDateSelect(date);
            }
          }}
          onMouseEnter={() => dayData && setHoveredDate(dayData)}
          onMouseLeave={() => setHoveredDate(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onDateSelect(date);
          }}
        >
          <Typography>{format(date, 'd')}</Typography>
          <Box sx={{ fontSize: `${volumeSize}px`, color: getPerformanceColor(dayData?.performance, theme) }}>
            {performanceIndicator}
            {!dayData && <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>No Data</Typography>}
          </Box>
        </Box>
      );
    }
    return days;
  };

  const getVolatilityColor = (volatility, theme) => {
    if (volatility == null || volatility === 0) return '#e0e0e0'; // Explicitly gray for no data
    if (theme === 'colorblind') {
      return volatility < 1 ? '#1b9e77' : volatility < 2 ? '#d95f02' : '#7570b3';
    }
    if (theme === 'highContrast') {
      return volatility < 1 ? '#00ff00' : volatility < 2 ? '#ffff00' : '#ff0000';
    }
    return volatility < 1 ? '#4caf50' : volatility < 2 ? '#ffeb3b' : '#f44336';
  };

  const getPerformanceIndicator = (performance) => {
    if (performance == null) return '';
    return performance > 0 ? '↑' : performance < 0 ? '↓' : '−';
  };

  const getPerformanceColor = (performance, theme) => {
    if (performance == null) return theme === 'colorblind' ? '#999999' : '#808080';
    if (theme === 'colorblind') {
      return performance > 0 ? '#1b9e77' : performance < 0 ? '#d95f02' : '#999999';
    }
    return performance > 0 ? '#4caf50' : performance < 0 ? '#f44336' : '#808080';
  };

  const darkenColor = (color) => {
    return color === '#e0e0e0' ? '#d0d0d0' : color.replace(/#(.{2})(.{2})(.{2})/, (m, r, g, b) => {
      const darker = (hex) => Math.max(0, parseInt(hex, 16) - 30).toString(16).padStart(2, '0');
      return `#${darker(r)}${darker(g)}${darker(b)}`;
    });
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ position: 'relative' }}>
        <Typography variant="h6">{format(selectedDate, 'MMMM yyyy')}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{renderCalendar()}</Box>
        {hoveredDate && hoveredDate.volatility != null && hoveredDate.volume != null && hoveredDate.performance != null ? (
          <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, background: '#fff', border: '1px solid #ccc', zIndex: 10 }}>
            <Typography>Volatility: {(hoveredDate.volatility || 0).toFixed(2)}%</Typography>
            <Typography>Volume: {(hoveredDate.volume || 0).toLocaleString()}</Typography>
            <Typography>Performance: {(hoveredDate.performance || 0).toFixed(2)}</Typography>
            <Typography>Std Dev: {(hoveredDate.stdDev || 0).toFixed(2)}</Typography>
            <Typography>RSI: {(hoveredDate.rsi || 0).toFixed(2)}</Typography>
          </Box>
        ) : (
          <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, background: '#fff', border: '1px solid #ccc', zIndex: 10 }}>
            <Typography>No data available</Typography>
          </Box>
        )}
        {view === 'daily' && data.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <XAxis dataKey="date" tickFormatter={(date) => format(date, 'HH:mm')} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="close" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Fade>
  );
};

export default CalendarView;