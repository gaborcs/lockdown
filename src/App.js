import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Chart from './Chart';

const theme = createMuiTheme({
  palette: {
    background: {
      default: "white"
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">
              Lockdown: Impact on an epidemic curve
            </Typography>
          </Toolbar>
        </AppBar>
        <Chart style={{ flexGrow: 1, position: "relative", overflow: "hidden" }} />
      </div>
    </ThemeProvider>
  );
}

export default App;
