export function simulate(initialState, dailyTransitionRates, healthcareCapacity, lockdownPeriod, lastDay) {
  let states = [];
  let state = initialState;
  for (let day = 0; day < lastDay; day++) {
    states.push(state);
    let isLockdownActive = lockdownPeriod.start <= day && day < lockdownPeriod.end;
    state = nextDay(state, dailyTransitionRates, isLockdownActive, healthcareCapacity);
  }
  states.push(state);
  return states;
}

function nextDay(state, dailyTransitionRates, isLockdownActive, healthcareCapacity) {
  let { infected, recovered, dead } = state;
  let susceptible = 1 - infected - recovered - dead;
  let transmissionRate = isLockdownActive
    ? dailyTransitionRates.transmissionWithLockdown
    : dailyTransitionRates.transmissionWithoutLockdown;
  let newInfections = transmissionRate * infected * susceptible;
  let newRecoveries = dailyTransitionRates.recovery * infected;
  let newDeaths = calculateDeaths(infected, dailyTransitionRates, healthcareCapacity);
  return {
    infected: infected + newInfections - newRecoveries - newDeaths,
    recovered: recovered + newRecoveries,
    dead: dead + newDeaths
  };
}

function calculateDeaths(infected, dailyTransitionRates, healthcareCapacity) {
  let { deathUnderHealthcareCapacity, deathOverHealthcareCapacity } = dailyTransitionRates;
  if (infected > healthcareCapacity) {
    let deathsUnderCapacity = deathUnderHealthcareCapacity * healthcareCapacity;
    let deathsOverCapacity = deathOverHealthcareCapacity * (infected - healthcareCapacity);
    return deathsUnderCapacity + deathsOverCapacity;
  }
  return deathUnderHealthcareCapacity * infected;
}
