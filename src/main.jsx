import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from '@mui/material/styles';
import { defaultTheme, highContrastTheme, colorblindTheme } from './styles/theme.js';

const themes = {
  default: defaultTheme,
  highContrast: highContrastTheme,
  colorblind: colorblindTheme,
};

function Root() {
  const [theme, setTheme] = React.useState('default');
  return (
    <ThemeProvider theme={themes[theme]}>
      <App setTheme={setTheme} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);