import React, { useEffect, useRef, useState } from 'react';
const d3Chart = require("./d3-chart");
const { simulate } = require("./simulator");

let healthcareCapacity = 0.1;

function Chart(props) {
  let { infectedOnDay0, dailyTransitionRates, lastDay, ...otherProps } = props;
  const initialState = {
    infected: infectedOnDay0,
    recovered: 0,
    dead: 0
  };
  const [lockdownPeriod, setLockdownPeriod] = useState({
    start: 55,
    end: 145
  });
  const simulatedStates = simulate(initialState, dailyTransitionRates, healthcareCapacity, lockdownPeriod, lastDay);
  const ref = useRef();
  function render() {
    d3Chart.render(ref.current, simulatedStates, lockdownPeriod, setLockdownPeriod);
  }
  useEffect(() => {
    render();
    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("resize", render);
    }
  });
  return <div ref={ref} {...otherProps}></div>;
}

export default Chart;
