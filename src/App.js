import React from 'react';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import SettingsIcon from '@material-ui/icons/Settings';
import Chart from './Chart';

const theme = createMuiTheme({
  palette: {
    background: {
      default: "white"
    }
  }
});

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  title: {
    flexGrow: 1,
  },
  chart: {
    flexGrow: 1,
    position: "relative",
    overflow: "hidden"
  },
  drawerPaper: {
    width: 250
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
  textField: {
    margin: theme.spacing(2, 2),
  }
}));

function App() {
  let classes = useStyles();
  let [drawerOpen, setDrawerOpen] = React.useState(false);
  let [infectedPercentOnDay0, setInfectedPercentOnDay0] = React.useState("0.0001");
  let [lastDay, setLastDay] = React.useState(400);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Lockdown: Impact on an epidemic curve
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => {
                setDrawerOpen(true);
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Chart
          infectedOnDay0={infectedPercentOnDay0 / 100}
          lastDay={lastDay}
          className={classes.chart}
        />
        <Drawer
          variant="persistent"
          anchor="right"
          open={drawerOpen}
          classes={{
            paper: classes.drawerPaper
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton
              onClick={() => {
                setDrawerOpen(false);
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
          <Divider />
          <TextField
            label="Infected on day 0"
            variant="outlined"
            value={infectedPercentOnDay0}
            onChange={event => {
              setInfectedPercentOnDay0(event.target.value);
            }}
            className={classes.textField}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
          <TextField
            label="Last day of simulation"
            type="number"
            variant="outlined"
            value={lastDay}
            onChange={event => {
              setLastDay(event.target.value)
            }}
            className={classes.textField}
          />
        </Drawer>
      </div>
    </ThemeProvider>
  );
}

export default App;
