import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const highContrastTheme = createTheme({
  palette: {
    primary: { main: '#0000ff' },
    secondary: { main: '#ff0000' },
    background: { default: '#000', paper: '#fff' },
    text: { primary: '#fff', secondary: '#ccc' },
  },
});

const colorblindTheme = createTheme({
  palette: {
    primary: { main: '#1b9e77' },
    secondary: { main: '#d95f02' },
    background: { default: '#f5f5f5', paper: '#fff' },
    text: { primary: '#000', secondary: '#666' },
  },
});

export { defaultTheme, highContrastTheme, colorblindTheme };