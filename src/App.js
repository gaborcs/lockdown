import React, { useState } from 'react';
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
import { calculateDailyTransitionRates } from './simulator';

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
    width: 320
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
  let [drawerOpen, setDrawerOpen] = useState(false);
  let [infectedPercentOnDay0, setInfectedPercentOnDay0] = useState("0.0001");
  let [averageRecoveryTime, setAverageRecoveryTime] = useState("14");
  let [r0WithoutLockdown, setR0WithoutLockdown] = useState("2.5");
  let [r0WithLockdown, setR0WithLockdown] = useState("1.3");
  let [ifrPercentUnderHealthcareCapacity, setIfrPercentUnderHealthcareCapacity] = useState("1.0");
  let [ifrPercentOverHealthcareCapacity, setIfrPercentOverHealthcareCapacity] = useState("2.0");
  let [healthcareCapacityPercent, setHealthcareCapacityPercent] = useState("10");
  let [lastDay, setLastDay] = useState("500");
  let dailyTransitionRates = calculateDailyTransitionRates({
    averageRecoveryTime: +averageRecoveryTime,
    r0WithoutLockdown: +r0WithoutLockdown,
    r0WithLockdown: +r0WithLockdown,
    ifrUnderHealthcareCapacity: ifrPercentUnderHealthcareCapacity / 100,
    ifrOverHealthcareCapacity: ifrPercentOverHealthcareCapacity / 100
  });
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
          dailyTransitionRates={dailyTransitionRates}
          healthcareCapacity={healthcareCapacityPercent / 100}
          lastDay={+lastDay}
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
          <PercentageField
            label="Infected on day 0"
            value={infectedPercentOnDay0}
            setValue={setInfectedPercentOnDay0}
          />
          <Field
            label="R0 without lockdown"
            value={r0WithoutLockdown}
            setValue={setR0WithoutLockdown}
          />
          <Field
            label="R0 with lockdown"
            value={r0WithLockdown}
            setValue={setR0WithLockdown}
          />
          <Field
            label="Average recovery time"
            value={averageRecoveryTime}
            setValue={setAverageRecoveryTime}
            InputProps={{
              endAdornment: <InputAdornment position="end">days</InputAdornment>,
            }}
          />
          <PercentageField
            label="Fatality (IFR) under healthcare capacity"
            value={ifrPercentUnderHealthcareCapacity}
            setValue={setIfrPercentUnderHealthcareCapacity}
          />
          <PercentageField
            label="Fatality (IFR) over healthcare capacity"
            value={ifrPercentOverHealthcareCapacity}
            setValue={setIfrPercentOverHealthcareCapacity}
          />
          <PercentageField
            label="Healthcare capacity"
            value={healthcareCapacityPercent}
            setValue={setHealthcareCapacityPercent}
          />
          <Field
            label="Last day of simulation"
            type="number"
            value={lastDay}
            setValue={setLastDay}
          />
        </Drawer>
      </div>
    </ThemeProvider>
  );
}

function PercentageField(props) {
  return (
    <Field
      InputProps={{
        endAdornment: <InputAdornment position="end">%</InputAdornment>,
      }}
      {...props}
    />
  );
}

function Field(props) {
  let { setValue, ...otherProps } = props;
  let classes = useStyles();
  return (
    <TextField
      variant="outlined"
      onChange={changeHandler(setValue)}
      className={classes.textField}
      {...otherProps}
    />
  );
}

const changeHandler = setValue => event => {
  setValue(event.target.value);
};

export default App;
