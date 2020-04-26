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
  let [drawerOpen, setDrawerOpen] = React.useState(false);
  let [infectedPercentOnDay0, setInfectedPercentOnDay0] = React.useState("0.0001");
  let [dailyTransitionRates, setDailyTransitionRates] = React.useState({
    transmissionWithoutLockdown: "0.3",
    transmissionWithLockdown: "0.1",
    recovery: "0.07",
    deathUnderHealthcareCapacity: "0.0007",
    deathOverHealthcareCapacity: "0.0014"
  });
  let [healthcareCapacityPercent, setHealthcareCapacityPercent] = React.useState("10");
  let [lastDay, setLastDay] = React.useState(400);
  let renderTransitionRateField = (key, label) => (
    <Field
      label={label}
      value={dailyTransitionRates[key]}
      setValue={transitionRateSetter(key)}
    />
  );
  let transitionRateSetter = key => value => {
    setDailyTransitionRates({
      ...dailyTransitionRates,
      [key]: value
    });
  };
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
          <PercentageField
            label="Infected on day 0"
            value={infectedPercentOnDay0}
            setValue={setInfectedPercentOnDay0}
          />
          {renderTransitionRateField("transmissionWithoutLockdown", "Transmission rate without lockdown")}
          {renderTransitionRateField("transmissionWithLockdown", "Transmission rate with lockdown")}
          {renderTransitionRateField("recovery", "Recovery rate")}
          {renderTransitionRateField("deathUnderHealthcareCapacity", "Death rate under healthcare capacity")}
          {renderTransitionRateField("deathOverHealthcareCapacity", "Death rate over healthcare capacity")}
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
