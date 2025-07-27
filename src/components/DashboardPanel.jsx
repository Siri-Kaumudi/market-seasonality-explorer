import { useRef } from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

const DashboardPanel = ({ data, compareData, selectedDate, view }) => {
  const pdfRef = useRef();
  const selectedData = data.find(d => format(d.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));

  // Calculate technical indicators
  const calculateMovingAverage = (data, period = 7) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, d) => sum + d.close, 0) / period;
      result.push({ date: data[i].date, ma: avg });
    }
    return result;
  };

  const movingAverageData = calculateMovingAverage(data);
  const benchmarkPerformance = data.reduce((sum, d) => sum + (d.performance || 0), 0) / (data.length || 1);

  // Export as PDF
  const generatePDF = () => {
    const input = pdfRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`dashboard-${format(selectedDate, 'yyyy-MM-dd')}.pdf`);
    });
  };

  // Export as Image
  const generateImage = () => {
    const input = pdfRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, `dashboard-${format(selectedDate, 'yyyy-MM-dd')}.png`);
      });
    });
  };

  // Export as CSV
  const generateCSV = () => {
    const headers = ['Date', 'Open', 'Close', 'High', 'Low', 'Volume', 'Volatility', 'Std Dev', 'RSI', 'Performance'];
    const csvRows = [headers.join(',')];
    if (selectedData) {
      csvRows.push([
        format(selectedData.date, 'yyyy-MM-dd'),
        selectedData.open.toFixed(2),
        selectedData.close.toFixed(2),
        selectedData.high.toFixed(2),
        selectedData.low.toFixed(2),
        selectedData.volume.toLocaleString(),
        selectedData.volatility.toFixed(2),
        selectedData.stdDev.toFixed(2),
        selectedData.rsi.toFixed(2),
        selectedData.performance.toFixed(2),
      ].join(','));
    }
    compareData.forEach(d => {
      csvRows.push([
        format(d.date, 'yyyy-MM-dd'),
        d.open.toFixed(2),
        d.close.toFixed(2),
        d.high.toFixed(2),
        d.low.toFixed(2),
        d.volume.toLocaleString(),
        d.volatility.toFixed(2),
        d.stdDev.toFixed(2),
        d.rsi.toFixed(2),
        d.performance.toFixed(2),
      ].join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `dashboard-${format(selectedDate, 'yyyy-MM-dd')}.csv`);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', touchAction: 'manipulation' }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button onClick={generatePDF} variant="contained">Export as PDF</Button>
        <Button onClick={generateImage} variant="contained">Export as Image</Button>
        <Button onClick={generateCSV} variant="contained">Export as CSV</Button>
      </Box>
      <Box ref={pdfRef}>
        <Typography variant="h6">Details for {format(selectedDate, 'MMM d, yyyy')}</Typography>
        {selectedData ? (
          <Box>
            <Typography>Open: {selectedData.open.toFixed(2)}</Typography>
            <Typography>Close: {selectedData.close.toFixed(2)}</Typography>
            <Typography>High: {selectedData.high.toFixed(2)}</Typography>
            <Typography>Low: {selectedData.low.toFixed(2)}</Typography>
            <Typography>Volume: {selectedData.volume.toLocaleString()}</Typography>
            <Typography>Volatility: {selectedData.volatility.toFixed(2)}%</Typography>
            <Typography>Std Dev: {selectedData.stdDev.toFixed(2)}</Typography>
            <Typography>RSI: {selectedData.rsi.toFixed(2)}</Typography>
            <Typography>Performance vs Benchmark: {(selectedData.performance - benchmarkPerformance).toFixed(2)}</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={movingAverageData}>
                <XAxis dataKey="date" tickFormatter={(date) => format(date, 'MMM d')} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ma" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
            {compareData.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 2 }}>Comparison Period</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={compareData}>
                    <XAxis dataKey="date" tickFormatter={(date) => format(date, 'MMM d')} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="close" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </Box>
        ) : (
          <Typography>No data available</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default DashboardPanel;