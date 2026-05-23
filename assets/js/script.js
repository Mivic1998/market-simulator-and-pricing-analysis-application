const state = {
    mode: "demand",
    demandType: "linear",
    supplyType: "linear",
    t: 0,
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
let modeButtonClicked = false;
const equilibriumPriceElement = document.getElementById("equilibriumPrice");
const equilibriumQuantityElement = document.getElementById("equilibriumQuantity");
const revenueMaximizingPriceElement = document.getElementById("revenueMaximizingPrice");
const revenueMaximizingQuantityElement = document.getElementById("revenueMaximizingQuantity");
const demandType = document.getElementById("demandType");
const supplyType = document.getElementById("supplyType");
const sliders = document.querySelectorAll(".slider-group input[type='range']");
const manualInputs = document.querySelectorAll(".slider-group input[type='number']");
const demandModeButton = document.getElementById("demand-mode");
const supplyModeButton = document.getElementById("supply-mode");
const modeButtons = document.querySelectorAll(".mode-button");
const supplyOnlyElements = document.querySelectorAll(".supply-only");
const demandOnlyElements = document.querySelectorAll(".demand-only");
const taxSlider = document.getElementById('t');
const taxInput = document.getElementById('tValue');

//e.target.innerText.split("-")[0].toLowerCase()
for(let button of modeButtons) {
    button.addEventListener("click", (e) => {
        const newMode = e.target.dataset.mode;
        if(state.mode === newMode && modeButtonClicked) {
            return;
        }
        else {
            state.mode = newMode;
            modeButtonClicked = true;
        }
        if(state.mode === "demand") {
            state.t = 0;
            taxSlider.value = state.t;
            taxInput.value = state.t;
            displayEquilibriumValues();
            for(let element of supplyOnlyElements) {
                element.classList.remove("active");
            }
            for(let element of demandOnlyElements) {
                element.classList.add("active");
            }
        }
        else {
            for(let element of demandOnlyElements) {
                element.classList.remove("active");
            }
            for(let element of supplyOnlyElements) {
                element.classList.add("active");
            }
        }

    });
}

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
    document.querySelector('.demand-' + previousDemandType).classList.remove('active');
    document.querySelector('.demand-' + state.demandType).classList.add('active');
    previousDemandType = state.demandType;
    displayEquilibriumValues();
});

displayEquilibriumValues();
modeButtons[0].click();

//var used because it is function-scoped and allows us to redefine it in different cases without issues. Let is block-scoped and results in having to repeat code for each demand type, which is less efficient.

function displayEquilibriumValues() {
    if (state.demandType === "linear") {
        var [P, Q] = calculateEquilibriumLinear(state.a, state.b, state.c, state.d, state.t);
        var [P_max, Q_max] = calculateRevenueMaximizingCoordinatesLinear(state.a, state.b);
    }
    else if (state.demandType === "income") {
        var [P, Q] = calculateEquilibriumIncome(state.income, state.k, state.c, state.d, state.t);
    }
    else {
        var [P, Q] = approximateEquilibriumNonlinear(state.aNonlinear, state.bNonlinear, state.c, state.d, state.t);
        var [P_max, Q_max] = calculateRevenueMaximizingCoordinatesNonlinear(state.aNonlinear, state.bNonlinear);
    }
    equilibriumPriceElement.textContent = P.toFixed(2);
    equilibriumQuantityElement.textContent = Q.toFixed(2);
    revenueMaximizingPriceElement.textContent = P_max.toFixed(2);
    revenueMaximizingQuantityElement.textContent = Q_max.toFixed(2);
}

function calculateEquilibriumLinear(a, b, c, d, t) {
  const P = (a - c + d * t) / (b + d);
  const Q = a - b * P;
  const chokePrice = a / b;
  if(Q < 0) {
    return [chokePrice, 0];
  }
  else {
    return [P, Q];
  }
}

function calculateEquilibriumIncome(income, k, c, d, t) {
  const term = c - d * t;
  const P = (-term + Math.sqrt(term * term + 4 * d * k * income)) / (2 * d);
  const Q = c + d * (P - t);
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