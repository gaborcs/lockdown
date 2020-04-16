import React, { useEffect } from 'react';
const d3Chart = require("./d3-chart");
const { simulate } = require("./simulator");

const initialState = {
    infected: 0.000001,
    recovered: 0,
    dead: 0
};
const dailyTransitionRates = {
    transmissionWithoutLockdown: 0.3,
    transmissionWithLockdown: 0.1,
    recovery: 0.07,
    deathUnderHealthcareCapacity: 0.0007,
    deathOverHealthcareCapacity: 0.0014
};
let healthcareCapacity = 0.1;
const lockdownPeriod = {
    start: 55,
    end: 145
};
const lastDay = 400;
const simulatedStates = simulate(initialState, dailyTransitionRates, healthcareCapacity, lockdownPeriod, lastDay);

function Chart(props) {
  useEffect(() => {
    d3Chart.draw();
    d3Chart.update(simulatedStates, lockdownPeriod);
    window.addEventListener("resize", () => {
      d3Chart.update(simulatedStates, lockdownPeriod);
    });
  });
  return <svg {...props}></svg>;
}

export default Chart;