const state = {
    mode: "demand",
    demandType: "linear",
    supplyType: "linear",
    wedge: 0,
    a: 50,
    b: 1,
    income: 500,
    k: 0.5,
    aNonlinear: 50,
    bNonlinear: 0.2,
    c: 0,
    d: 1
};


const demandDefaults = {
    linear: {
        a: 50,
        b: 1
    },

    income: {
        income: 500,
        k: 0.5
    },

    nonlinear: {
        aNonlinear: 50,
        bNonlinear: 0.2
    }
};

let previousDemandType = state.demandType;
const equilibriumPriceElement = document.getElementById("equilibriumPrice");
const equilibriumQuantityElement = document.getElementById("equilibriumQuantity");
const revenueMaximizingPriceElement = document.getElementById("revenueMaximizingPrice");
const revenueMaximizingQuantityElement = document.getElementById("revenueMaximizingQuantity");
const demandType = document.getElementById("demandType");
const supplyType = document.getElementById("supplyType");
const sliders = document.querySelectorAll(".slider-group input[type='range']");
const manualInputs = document.querySelectorAll(".slider-group input[type='number']");

for (let input of manualInputs) {
    input.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        for (let slider of sliders) {
            if (slider.id === e.target.id.replace("Value", "")) {
                slider.value = value;
            }
        }
    });
}

for (let slider of sliders) {
    slider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        const id = e.target.id;
        state[id] = value;
        console.log(value);
        for (let input of manualInputs) {
            if (input.id === id + "Value") {
                input.value = value;
            }
        }
        displayEquilibriumValues();
    });
}

demandType.addEventListener("change", (e) => {
    if (previousDemandType === "linear") {
        state.a = demandDefaults.linear.a;
        state.b = demandDefaults.linear.b;
        for (let input of manualInputs) {
            if (input.id === "aValue") {
                input.value = state.a;
            }
            else if (input.id === "bValue") {
                input.value = state.b;
            }
        }
    }
    else if (previousDemandType === "income") {
        state.income = demandDefaults.income.income;
        state.k = demandDefaults.income.k;
        for (let input of manualInputs) {
            if (input.id === "incomeValue") {
                input.value = state.income;
            }
            else if (input.id === "kValue") {
                input.value = state.k;
            }
        }
    }
    else {
        state.aNonlinear = demandDefaults.nonlinear.aNonlinear;
        state.bNonlinear = demandDefaults.nonlinear.bNonlinear;
    }
    state.demandType = e.target.value;
    previousDemandType = state.demandType;
    displayEquilibriumValues();
});

//var used because it is function-scoped and allows us to redefine it in different cases without issues. Let is block-scoped and results in having to repeat code for each demand type, which is less efficient.

function displayEquilibriumValues() {
    if (state.demandType === "linear") {
        var [P, Q] = calculateEquilibriumLinear(state.a, state.b, state.c, state.d);
        var [P_max, Q_max] = calculateRevenueMaximizingCoordinatesLinear(state.a, state.b);
    }
    else if (state.demandType === "income") {
        var [P, Q] = calculateEquilibriumIncome(state.income, state.k, state.c, state.d);
        var [P_max, Q_max] = calculateRevenueMaximizingCoordinatesIncome(state.income, state.k);
    }
    else {
        var [P, Q] = approximateEquilibriumNonlinear(state.aNonlinear, state.bNonlinear, state.c, state.d);
        var [P_max, Q_max] = calculateRevenueMaximizingCoordinatesNonlinear(state.aNonlinear, state.bNonlinear);
    }
    equilibriumPriceElement.textContent = P.toFixed(2);
    equilibriumQuantityElement.textContent = Q.toFixed(2);
    revenueMaximizingPriceElement.textContent = P_max.toFixed(2);
    revenueMaximizingQuantityElement.textContent = Q_max.toFixed(2);
}

function calculateEquilibriumLinear(a, b, c, d) {
    const P = (a - c) / (b + d);
    const Q = c + b * P;
    return [P, Q];
}

function calculateEquilibriumIncome(income, k, c, d) {
    const P = (-c + Math.sqrt(c * c + 4 * d * k * income)) / (2 * d);
    const Q = c + d * P;
    return [P, Q];
}

function approximateEquilibriumNonlinear() {

}

function calculateRevenueMaximizingCoordinatesLinear(a, b) {
    const P = a / (2 * b);
    const Q = a - b * P;
    return [P, Q]
}

function calculateRevenueMaximizingCoordinatesNonlinear(aNonlinear, bNonlinear) {
    const P = 1 / bNonlinear;
    const Q = aNonlinear * Math.exp(-bNonlinear * P);
    return [P, Q]
}