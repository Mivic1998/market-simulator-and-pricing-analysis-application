const state = {
    mode: "demand",
    demandType: "linear",
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
const revenueAtEquilibriumElement = document.getElementById("totalRevenueEquilibrium");
const revenueAtMaxElement = document.getElementById("totalRevenueMax");
const welfareLossElement = document.getElementById("welfareLoss");
const priceNoTaxElement = document.getElementById("priceNoTax");
const quantityNoTaxElement = document.getElementById("quantityNoTax");
const consumerPriceElement = document.getElementById("pricePaid");
const producerPriceElement = document.getElementById("priceReceived");
const quantityAfterTaxElement = document.getElementById("quantityAfterTax");
const taxRevenueElement = document.getElementById("taxRevenue");
const deadweightLossElement = document.getElementById("deadweightLoss");
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
for (let button of modeButtons) {
    button.addEventListener("click", (e) => {
        const newMode = e.target.dataset.mode;
        if (state.mode === newMode && modeButtonClicked) {
            return;
        }
        else {
            state.mode = newMode;
            modeButtonClicked = true;
            displayMetricValues();
        }
        if (state.mode === "demand") {
            state.t = 0;
            taxSlider.value = state.t;
            taxInput.value = state.t;
            displayMetricValues();
            for (let element of supplyOnlyElements) {
                element.classList.remove("active");
            }
            for (let element of demandOnlyElements) {
                element.classList.add("active");
            }
        }
        else {
            for (let element of demandOnlyElements) {
                element.classList.remove("active");
            }
            for (let element of supplyOnlyElements) {
                element.classList.add("active");
            }
        }

    });
}

for (let input of manualInputs) {
    input.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        if (isNaN(value)) {
            return;
        }
        for (let slider of sliders) {
            if (slider.id === e.target.id.replace("Value", "")) {
                slider.value = value;
                slider.dispatchEvent(new Event("input"));
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
        displayMetricValues();
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
    displayMetricValues();
});

displayMetricValues();
modeButtons[0].click();

//var used because it is function-scoped and allows us to redefine it in different cases without issues. Let is block-scoped and results in having to repeat code for each demand type, which is less efficient.

function displayMetricValues() {
    if (state.demandType === "linear") {
        var [P, Q] = calculateEquilibriumLinear(state.a, state.b, state.c, state.d, state.t);
        if (state.mode === "demand") {
            var [P_max, Q_max] = calculateRevenueMaximizingCoordinatesLinear(state.a, state.b);
            var revenueAtEquilibrium = calculateTotalRevenue(P, Q);
            var revenueAtMax = calculateTotalRevenue(P_max, Q_max);
            var welfareLoss = calculateWelfareLossLinear(state.a, state.b, state.c, state.d, P, Q);
        }
        else {
            var [P_noTax, Q_noTax] = calculateEquilibriumLinear(state.a, state.b, state.c, state.d, 0);
            var taxRevenue = calculateTaxRevenue(state.t, Q);
            var priceReceived = calculatePriceReceived(P, state.t);
            var deadweightLoss = calculateDWLLinear(state.a, state.b, state.c, state.d, state.t);
        }
    }
    else if (state.demandType === "nonlinear") {
        var [P, Q] = approximateEquilibriumNonlinear(state.aNonlinear, state.bNonlinear, state.c, state.d, state.t);
        if (state.mode === "demand") {
            var [P_max, Q_max] = calculateRevenueMaximizingCoordinatesNonlinear(state.aNonlinear, state.bNonlinear);
            var revenueAtEquilibrium = calculateTotalRevenue(P, Q);
            var revenueAtMax = calculateTotalRevenue(P_max, Q_max);
            var welfareLoss = calculateWelfareLossNonlinearRevenueMax(state.aNonlinear, state.bNonlinear, state.c, state.d);
        }
        else {
            var [P_noTax, Q_noTax] = approximateEquilibriumNonlinear(state.aNonlinear, state.bNonlinear, state.c, state.d, 0);
            var taxRevenue = calculateTaxRevenue(state.t, Q);
            var priceReceived = calculatePriceReceived(P, state.t);
            var deadweightLoss = calculateDWLNonlinear(state.aNonlinear, state.bNonlinear, state.c, state.d, state.t);
        }
    }
    else {
        var [P, Q] = calculateEquilibriumIncome(state.income, state.k, state.c, state.d, state.t);
        if (state.mode === "demand") {
            var [P_max, Q_max] = ['No Unique Revenue Maximizing Price', 'No Unique Revenue Maximizing Quantity'];
            var revenueAtEquilibrium = calculateTotalRevenue(P, Q);
            var revenueAtMax = 'Maximising Coordinates Not Defined for Income-Based Demand Due to Constant Elasticity';
            var welfareLoss = 'Welfare Loss Not Defined for Income-Based Demand Due to Constant Elasticity';
        }
        else {
            var [P_noTax, Q_noTax] = calculateEquilibriumIncome(state.income, state.k, state.c, state.d, 0);
            var taxRevenue = calculateTaxRevenue(state.t, Q);
            var priceReceived = calculatePriceReceived(P, state.t);
            var deadweightLoss = calculateDWLIncome(state.income, state.k, state.c, state.d, state.t);
        }
    }
    setMetric(equilibriumPriceElement, P, state.mode === "demand");
    setMetric(equilibriumQuantityElement, Q, state.mode === "demand");

    setMetric(revenueMaximizingPriceElement, P_max, state.mode === "demand");
    setMetric(revenueMaximizingQuantityElement, Q_max, state.mode === "demand");
    setMetric(revenueAtEquilibriumElement, revenueAtEquilibrium, state.mode === "demand");
    setMetric(revenueAtMaxElement, revenueAtMax, state.mode === "demand");
    setMetric(welfareLossElement, welfareLoss, state.mode === "demand");

    setMetric(priceNoTaxElement, P_noTax, state.mode === "supply");
    setMetric(quantityNoTaxElement, Q_noTax, state.mode === "supply");
    setMetric(consumerPriceElement, P, state.mode === "supply");
    setMetric(producerPriceElement, priceReceived, state.mode === "supply");
    setMetric(quantityAfterTaxElement, Q, state.mode === "supply");
    setMetric(taxRevenueElement, taxRevenue, state.mode === "supply");
    setMetric(deadweightLossElement, deadweightLoss, state.mode === "supply");
}

function formatValue(value) {
    return typeof value === "number" ? value.toFixed(2) : value;
}

function setMetric(element, value, condition) {
    element.textContent = condition ? formatValue(value) : "";
}

function calculateEquilibriumLinear(a, b, c, d, t) {
    const P = (a - c + d * t) / (b + d);
    const Q = a - b * P;
    const chokePrice = a / b;
    const maxQuantity = a;
    if (Q < 0) {
        return [chokePrice, 0];
    }
    else if (P < 0) {
        return [0, maxQuantity];
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


function approximateEquilibriumNonlinear(a, b, c, d, t) {
    function f(P) {
        return a * Math.exp(-b * P) - (c + d * (P - t));
    }
    let p_low = 0;
    const epsilon = 0.01;
    let P_high = (1 / b) * Math.log(a / epsilon);
    while (f(P_high) > 0) {
        P_high *= 2;
    }
    let tolerance = 0.0001;
    let P_mid = (p_low + P_high) / 2;
    while (Math.abs(f(P_mid)) > tolerance) {
        if (f(p_low) * f(P_mid) < 0) {
            P_high = P_mid;
        } else {
            p_low = P_mid;
        }
        P_mid = (p_low + P_high) / 2;
    }
    return [P_mid, f(P_mid)];
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

function calculateTotalRevenue(P, Q) {
    return P * Q;
}


function calculateWelfareLossLinear(a, b, c, d, P_eq, Q_eq) {
    const [P_max, Q_max] = calculateRevenueMaximizingCoordinatesLinear(a, b);

    const Pd_eq = a - b * P_eq === Q_eq ? P_eq : (a - Q_eq) / b;
    const MC_eq = (Q_eq - c) / d;

    return 0.5 * (Q_max - Q_eq) * (Pd_eq - MC_eq);
}

function calculateWelfareLossNonlinearRevenueMax(a, b, c, d) {

    const [P_eq, Q_eq] = approximateEquilibriumNonlinear(a, b, c, d, 0);

    const [P_max, Q_max] = getRevenueMaxNonlinear(a, b);

    const demand_eq = Q_eq * Math.log(Q_eq) - Q_eq - Q_eq * Math.log(a);
    const demand_max = Q_max * Math.log(Q_max) - Q_max - Q_max * Math.log(a);

    const term1 = -(1 / b) * (demand_eq - demand_max);

    const term2 = (1 / d) * ((Q_eq * Q_eq - Q_max * Q_max) / 2 - c * (Q_eq - Q_max));

    return term1 - term2;
}


function calculatePriceReceived(P, t) {
    return P - t;
}

function calculateTaxRevenue(t, Q) {
    return t * Q;
}

function calculateDWLLinear(a, b, c, d, t) {
    const Q0 = calculateEquilibriumLinear(a, b, c, d, 0)[1];
    const Qt = calculateEquilibriumLinear(a, b, c, d, t)[1];

    return 0.5 * t * (Q0 - Qt);
}

function calculateDWLIncome(income, k, c, d, t) {
    const Q0 = calculateEquilibriumIncome(income, k, c, d, 0)[1];
    const Qt = calculateEquilibriumIncome(income, k, c, d, t)[1];

    const term1 = k * income * Math.log(Q0 / Qt);
    const term2 = (1 / d) * ((Q0 * Q0 - Qt * Qt) / 2 - c * (Q0 - Qt));

    return term1 - term2;
}

function calculateDWLNonlinear(a, b, c, d, t) {
    const Q0 = approximateEquilibriumNonlinear(a, b, c, d, 0)[1];
    const Qt = approximateEquilibriumNonlinear(a, b, c, d, t)[1];

    const demand0 = Q0 * Math.log(Q0) - Q0 - Q0 * Math.log(a);
    const demandT = Qt * Math.log(Qt) - Qt - Qt * Math.log(a);

    const term1 = -(1 / b) * (demand0 - demandT);
    const term2 = (1 / d) * ((Q0 * Q0 - Qt * Qt) / 2 - c * (Q0 - Qt));

    return term1 - term2;
}

function generatePlotPointsSupplyNoTax(a, b, c, d) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.001) {
        const Q = c + d * P;
        points.push({ x: Q, y: P });
    }
    return points;
}

function generatePlotPointsSupplyWithTax(a, b, c, d, t) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.001) {
        const Q = canvasHeight - (c + d * (P - t)) * (canvasHeight / 100);
        points.push({ x: Q, y: P });
    }
    return points;
}

function generatePlotPointsDemandLinear(a, b) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.001) {
        const Q = canvasHeight - (a - b * P) * (canvasHeight / 100);
        points.push({ x: Q, y: P });
    }       
    return points;
}

function generatePlotPointsDemandIncome(income, k) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.001) {
        const Q = canvasHeight - (k * income / P) * (canvasHeight / 100);
        points.push({ x: Q, y: P });
    }
    return points;
}

function generatePlotPointsDemandNonlinear(a, b) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.001) {
        const Q = canvasHeight - (a * Math.exp(-b * P)) * (canvasHeight / 100);
        points.push({ x: Q, y: P });
    }
    return points;
}