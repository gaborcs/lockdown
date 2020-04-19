import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Chart from './Chart';

function App() {
  return (
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
      <Chart style={{ flexGrow: 1 }} />
    </div>
  );
}

export default App;
