export function nextDay(state, transitionRates) {
    let { infected, recovered, dead } = state;
    let { transmission: transmissionRate, recovery: recoveryRate, death: deathRate } = transitionRates;
    let susceptible = 1 - infected - recovered - dead;
    let newInfections = transmissionRate * infected * susceptible;
    let newRecoveries = recoveryRate * infected;
    let newDeaths = deathRate * infected;
    return {
        infected: infected + newInfections - newRecoveries - newDeaths,
        recovered: recovered + newRecoveries,
        dead: dead + newDeaths
    };
}

export function simulate(initialState, dailyTransitionRates, healthcareCapacity, lockdownPeriod, lastDay) {
    let {
        transmissionWithoutLockdown,
        transmissionWithLockdown,
        recovery,
        deathUnderHealthcareCapacity,
        deathOverHealthcareCapacity
    } = dailyTransitionRates;
    let states = [];
    let state = initialState;
    for (let day = 0; day < lastDay; day++) {
        states.push(state);
        let isLockdownActive = lockdownPeriod.start <= day && day < lockdownPeriod.end;
        let transmission = isLockdownActive ? transmissionWithLockdown : transmissionWithoutLockdown;
        let death = calculateDeathRate(
            state.infected,
            healthcareCapacity,
            deathUnderHealthcareCapacity,
            deathOverHealthcareCapacity);
        let transitionRates = { transmission, recovery, death };
        state = nextDay(state, transitionRates);
    }
    states.push(state);
    return states;
}

function calculateDeathRate(infected, capacity, rateUnderCapacity, rateOverCapacity) {
    if (infected > capacity) {
        return (capacity * rateUnderCapacity + (infected - capacity) * rateOverCapacity) / infected;
    }
    return rateUnderCapacity;
}
