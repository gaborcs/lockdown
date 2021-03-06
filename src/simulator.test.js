import { calculateDailyTransitionRates, simulate } from "./simulator";

test("calculates daily transition rates", () => {
  let {
    recovery,
    transmissionWithoutLockdown,
    transmissionWithLockdown,
    deathUnderHealthcareCapacity,
    deathOverHealthcareCapacity
  } = calculateDailyTransitionRates({
    averageRecoveryTime: 14,
    r0WithoutLockdown: 2.5,
    r0WithLockdown: 1.2,
    ifrUnderHealthcareCapacity: 0.01,
    ifrOverHealthcareCapacity: 0.02
  });
  expect(14 * recovery).toBe(1);
  expect(14 * transmissionWithoutLockdown).toBe(2.5);
  expect(14 * transmissionWithLockdown).toBe(1.2);
  expect(deathUnderHealthcareCapacity / (recovery + deathUnderHealthcareCapacity)).toBeCloseTo(0.01, 10);
  expect(deathOverHealthcareCapacity / (recovery + deathOverHealthcareCapacity)).toBeCloseTo(0.02, 10);
});

test("can do the simulation indefinitely", () => {
  let initialState = { infected: 0.1, recovered: 0.01, dead: 0.001 };
  let dailyTransitionRates = {
    transmissionWithoutLockdown: 0,
    transmissionWithLockdown: 0,
    recovery: 0,
    deathUnderHealthcareCapacity: 0,
    deathOverHealthcareCapacity: 0
  };
  let healthcareCapacity = 0;
  let lockdownPeriod = { start: 1, end: 2 };
  let expectedStatesAfterInitial = [initialState, initialState, initialState, initialState];
  checkSimulate(
    initialState,
    dailyTransitionRates,
    healthcareCapacity,
    lockdownPeriod,
    expectedStatesAfterInitial);
});

test("applies a different transmission rate within the lockdown period", () => {
  let infectedOnDay0 = 0.1;
  let initialState = { infected: infectedOnDay0, recovered: 0, dead: 0 };
  let transmissionWithoutLockdown = 0.3;
  let transmissionWithLockdown = 0.1;
  let dailyTransitionRates = {
    transmissionWithoutLockdown,
    transmissionWithLockdown,
    recovery: 0,
    deathUnderHealthcareCapacity: 0,
    deathOverHealthcareCapacity: 0
  };
  let healthcareCapacity = 0;
  let lockdownPeriod = { start: 1, end: 2 };
  let infectedOnDay1 = infectedOnDay0 + transmissionWithoutLockdown * infectedOnDay0 * (1 - infectedOnDay0);
  let infectedOnDay2 = infectedOnDay1 + transmissionWithLockdown * infectedOnDay1 * (1 - infectedOnDay1);
  let infectedOnDay3 = infectedOnDay2 + transmissionWithoutLockdown * infectedOnDay2 * (1 - infectedOnDay2);
  let expectedStatesAfterInitial = [
    { infected: infectedOnDay1, recovered: 0, dead: 0 },
    { infected: infectedOnDay2, recovered: 0, dead: 0 },
    { infected: infectedOnDay3, recovered: 0, dead: 0 }
  ];
  checkSimulate(
    initialState,
    dailyTransitionRates,
    healthcareCapacity,
    lockdownPeriod,
    expectedStatesAfterInitial);
});

test("applies a normal death rate under the healthcare system capacity", () => {
  let infectedOnDay0 = 0.1;
  let deadOnDay0 = 0.001;
  let initialState = { infected: infectedOnDay0, recovered: 0, dead: deadOnDay0 };
  let deathUnderHealthcareCapacity = 0.01;
  let deathOverHealthcareCapacity = 0.02;
  let dailyTransitionRates = {
    transmissionWithoutLockdown: 0,
    transmissionWithLockdown: 0,
    recovery: 0,
    deathUnderHealthcareCapacity,
    deathOverHealthcareCapacity
  };
  let healthcareCapacity = 0.2
  let lockdownPeriod = { start: 0, end: 0 };
  let infectedOnDay1 = infectedOnDay0 * (1 - deathUnderHealthcareCapacity);
  let deadOnDay1 = deadOnDay0 + deathUnderHealthcareCapacity * infectedOnDay0;
  let expectedStatesAfterInitial = [
    { infected: infectedOnDay1, recovered: 0, dead: deadOnDay1 }
  ];
  checkSimulate(
    initialState,
    dailyTransitionRates,
    healthcareCapacity,
    lockdownPeriod,
    expectedStatesAfterInitial);
});

test("applies an increased death rate over the healthcare system capacity", () => {
  let infectedOnDay0 = 0.3;
  let deadOnDay0 = 0.001;
  let initialState = { infected: infectedOnDay0, recovered: 0, dead: deadOnDay0 };
  let deathUnderHealthcareCapacity = 0.01;
  let deathOverHealthcareCapacity = 0.02;
  let dailyTransitionRates = {
    transmissionWithoutLockdown: 0,
    transmissionWithLockdown: 0,
    recovery: 0,
    deathUnderHealthcareCapacity,
    deathOverHealthcareCapacity
  };
  let healthcareCapacity = 0.2
  let lockdownPeriod = { start: 0, end: 0 };
  let newDeaths =
    deathUnderHealthcareCapacity * healthcareCapacity +
    deathOverHealthcareCapacity * (infectedOnDay0 - healthcareCapacity);
  let infectedOnDay1 = infectedOnDay0 - newDeaths;
  let deadOnDay1 = deadOnDay0 + newDeaths;
  let expectedStatesAfterInitial = [
    { infected: infectedOnDay1, recovered: 0, dead: deadOnDay1 }
  ];
  checkSimulate(
    initialState,
    dailyTransitionRates,
    healthcareCapacity,
    lockdownPeriod,
    expectedStatesAfterInitial);
});

test("calculates recovery too", () => {
  let infectedOnDay0 = 0.1;
  let recoveredOnDay0 = 0.01;
  let deadOnDay0 = 0.001;
  let initialState = { infected: infectedOnDay0, recovered: recoveredOnDay0, dead: deadOnDay0 };
  let recoveryRate = 0.2;
  let dailyTransitionRates = {
    transmissionWithoutLockdown: 0,
    transmissionWithLockdown: 0,
    recovery: recoveryRate,
    deathUnderHealthcareCapacity: 0,
    deathOverHealthcareCapacity: 0
  };
  let healthcareCapacity = 0;
  let lockdownPeriod = { start: 0, end: 0 };
  let infectedOnDay1 = infectedOnDay0 * (1 - recoveryRate);
  let recoveredOnDay1 = recoveredOnDay0 + recoveryRate * infectedOnDay0;
  let infectedOnDay2 = infectedOnDay1 * (1 - recoveryRate);
  let recoveredOnDay2 = recoveredOnDay1 + recoveryRate * infectedOnDay1;
  let expectedStatesAfterInitial = [
    { infected: infectedOnDay1, recovered: recoveredOnDay1, dead: deadOnDay0 },
    { infected: infectedOnDay2, recovered: recoveredOnDay2, dead: deadOnDay0 }
  ];
  checkSimulate(
    initialState,
    dailyTransitionRates,
    healthcareCapacity,
    lockdownPeriod,
    expectedStatesAfterInitial);
});

function checkSimulate(initialState, dailyTransitionRates, healthcareCapacity, lockdownPeriod, expectedStatesAfterInitial) {
  let expectedStates = [initialState].concat(expectedStatesAfterInitial);
  let lastDay = expectedStatesAfterInitial.length;
  let states = simulate(initialState, dailyTransitionRates, healthcareCapacity, lockdownPeriod, lastDay);
  expect(states.length).toBe(expectedStates.length);
  for (let i = 0; i < expectedStates.length; i++) {
    expectClose(states[i], expectedStates[i]);
  }
}

function expectClose(state, expectedState) {
  let numDigits = 10;
  expect(state.infected).toBeCloseTo(expectedState.infected, numDigits);
  expect(state.recovered).toBeCloseTo(expectedState.recovered, numDigits);
  expect(state.dead).toBeCloseTo(expectedState.dead, numDigits);
}
