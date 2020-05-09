import React, { useState } from 'react';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
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
  appBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline"
  },
  title: {
    flexGrow: 1,
    padding: "8px 16px"
  },
  button: {
    flexShrink: 0,
    marginRight: 8,
    color: "white"
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
    padding: theme.spacing(0, 1),
  },
  drawerBody: {
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    overflow: "auto"
  },
  textField: {
    marginBottom: 16,
  },
  explainers: {
    marginTop: 8
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
  let [healthcareCapacityPercent, setHealthcareCapacityPercent] = useState("5");
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
        <AppBar position="static" className={classes.appBar}>
          <Typography variant="h6" className={classes.title}>
            Lockdown: Impact on an epidemic
          </Typography>
          <Button
            onClick={() => {
              setDrawerOpen(true);
            }}
            className={classes.button}
          >
            Parameters
          </Button>
        </AppBar>
        <Chart
          infectedOnDay0={infectedPercentOnDay0 / 100}
          dailyTransitionRates={dailyTransitionRates}
          healthcareCapacity={healthcareCapacityPercent / 100}
          lastDay={+lastDay}
          className={classes.chart}
        />
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
          }}
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
          <div className={classes.drawerBody}>
            <PercentageField
              label="Infected on day 0"
              value={infectedPercentOnDay0}
              setValue={setInfectedPercentOnDay0}
              step={0.0001}
            />
            <Field
              label="R0 without lockdown"
              value={r0WithoutLockdown}
              setValue={setR0WithoutLockdown}
              step={0.1}
              min={0}
            />
            <Field
              label="R0 with lockdown"
              value={r0WithLockdown}
              setValue={setR0WithLockdown}
              step={0.1}
              min={0}
            />
            <Field
              label="Average recovery time"
              value={averageRecoveryTime}
              setValue={setAverageRecoveryTime}
              step={1}
              min={0}
              InputProps={{
                endAdornment: <InputAdornment position="end">days</InputAdornment>,
              }}
            />
            <PercentageField
              label="Fatality (IFR) under healthcare capacity"
              value={ifrPercentUnderHealthcareCapacity}
              setValue={setIfrPercentUnderHealthcareCapacity}
              step={0.1}
            />
            <PercentageField
              label="Fatality (IFR) over healthcare capacity"
              value={ifrPercentOverHealthcareCapacity}
              setValue={setIfrPercentOverHealthcareCapacity}
              step={0.1}
            />
            <PercentageField
              label="Healthcare capacity"
              value={healthcareCapacityPercent}
              setValue={setHealthcareCapacityPercent}
              step={1}
            />
            <Field
              label="Last day of simulation"
              value={lastDay}
              setValue={setLastDay}
              step={1}
              min={10}
            />
            <div className={classes.explainers}>
              <Typography variant="caption" paragraph>
                <b>R0 (basic reproduction number)</b>:
                number of cases directly generated by one case in a population where all individuals are susceptible to infection
              </Typography>
              <Typography variant="caption" paragraph>
                <b>IFR (infection fatality rate)</b>:
                proportion of deaths among all the infected individuals (including asymptomatic and undiagnosed infections)
              </Typography>
              <Typography variant="caption">
                The simulation is based on the <SirModelLink>SIR model</SirModelLink>.
                This is a really simple model, and like all models, it is inaccurate, so the results shouldn't be taken too seriously.
                For details, feel free to check the <SimulatorCodeLink>code</SimulatorCodeLink>.
              </Typography>
            </div>
          </div>
        </Drawer>
      </div>
    </ThemeProvider>
  );
}

function PercentageField(props) {
  return (
    <Field
      min={0}
      max={100}
      InputProps={{
        endAdornment: <InputAdornment position="end">%</InputAdornment>,
      }}
      {...props}
    />
  );
}

function Field(props) {
  let { value, setValue, step, min, max, ...otherProps } = props;
  let classes = useStyles();
  return (
    <TextField
      type="number"
      variant="outlined"
      value={value}
      onChange={changeHandler(setValue)}
      inputProps={{ step, min, max }}
      error={value < min || value > max}
      className={classes.textField}
      {...otherProps}
    />
  );
}

const changeHandler = setValue => event => {
  setValue(event.target.value);
};

const SirModelLink = props => (
  <Link
    href="https://en.wikipedia.org/wiki/Compartmental_models_in_epidemiology#The_SIR_model"
    target="_blank"
  >
    {props.children}
  </Link>
);

const SimulatorCodeLink = props => (
  <Link
    href="https://github.com/gaborcs/lockdown/blob/master/src/simulator.js"
    target="_blank"
  >
    {props.children}
  </Link>
);

export default App;
