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

let currentMetrics = {};
let previousDemandType = state.demandType;
let modeButtonClicked = false;
const mainSection = document.querySelector(".main-section");
const canvasMain = document.getElementById("marketCanvas");
const ctxMain = canvas.getContext("2d");
const canvasRevenue = document.getElementById("revenueCanvas");
const ctxRevenue = canvasRevenue.getContext("2d");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
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
const insightsContainer = document.querySelector(".insights-content");
const presetButtons = document.querySelectorAll(".preset-btn");

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
            displayAndStoreMetricValues();
            renderInsights();
        }
        if (state.mode === "demand") {
            state.t = 0;
            taxSlider.value = state.t;
            taxInput.value = state.t;
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
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const raw = e.target.value.trim();
            const value = Number(raw);
            if (raw === "" || isNaN(value)) {
                return;
            }
            for (let slider of sliders) {
                if (slider.id === e.target.id.replace("Value", "")) {
                    slider.value = value;
                    slider.dispatchEvent(new Event("input"));
                }
            }
        }
    });
}


for (let slider of sliders) {
    slider.addEventListener("input", (e) => {
        const value = Number(e.target.value);
        const id = e.target.id;
        state[id] = value;
        for (let input of manualInputs) {
            if (input.id === id + "Value") {
                input.value = value;
            }
        }
        displayAndStoreMetricValues();
        renderInsights();
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
        for (let input of manualInputs) {
            if (input.id === "aNonlinearValue") {
                input.value = state.aNonlinear;
            }
            else if (input.id === "bNonlinearValue") {
                input.value = state.bNonlinear;
            }
        }
    }
    state.demandType = e.target.value;
    const previousDemandElements = document.querySelectorAll('.demand-' + previousDemandType);
    for (let element of previousDemandElements) {
        element.classList.remove('active');
    }
    const currentDemandElements = document.querySelectorAll('.demand-' + state.demandType);
    for (let element of currentDemandElements) {
        element.classList.add('active');
    }
    previousDemandType = state.demandType;
    displayAndStoreMetricValues();
    renderInsights();
});

for (let button of presetButtons) {
    const preset = button.dataset.preset;
    button.addEventListener("click", () => {
        changeParametersPreset(preset);
        for (let input of manualInputs) {
            const key = input.id.replace("Value", "");
            input.value = state[key];
        }

        for (let slider of sliders) {
            slider.value = state[slider.id];
        }

        displayAndStoreMetricValues();
        renderInsights();
        mainSection.scrollIntoView({
            behavior: "smooth"
        });
    });
}

displayAndStoreMetricValues();
modeButtons[0].click();
renderInsights();

//var used because it is function-scoped and allows us to redefine it in different cases without issues. Let is block-scoped and results in having to repeat code for each demand type, which is less efficient.

function displayAndStoreMetricValues() {
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

    currentMetrics = {
        P,
        Q,
        P_max,
        Q_max,
        Q_noTax,
        welfareLoss,
        deadweightLoss
    };

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


function drawCurve(points, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;

    let first = true;

    for (let point of points) {
        const x = point.x * scaleX;
        const y = canvasHeight - point.y * scaleY;

        if (first) {
            ctx.moveTo(x, y);
            first = false;
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
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
    let iterations = 0;
    let maxIterations = 500;
    let tolerance = 0.0001;
    let P_mid = (p_low + P_high) / 2;
    while (Math.abs(f(P_mid)) > tolerance && iterations < maxIterations) {
        if (f(p_low) * f(P_mid) < 0) {
            P_high = P_mid;
        } else {
            p_low = P_mid;
        }
        P_mid = (p_low + P_high) / 2;
        iterations++;
    }
    return [P_mid, c + d * (P_mid - t)];
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

    const [P_max, Q_max] = calculateRevenueMaximizingCoordinatesNonlinear(a, b);

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
    for (let P = 0; P <= 100; P += 0.5) {
        const Q = c + d * P;
        points.push({ x: Q, y: P });
    }
    return points;
}

function generatePlotPointsSupplyWithTax(a, b, c, d, t) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.5) {
        const Q = c + d * (P - t);
        points.push({ x: Q, y: P });
    }
    return points;
}

function generatePlotPointsDemandLinear(a, b) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.5) {
        const Q = a - b * P;
        points.push({ x: Q, y: P });
    }
    return points;
}

function generatePlotPointsDemandIncome(income, k) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.5) {
        const Q = k * income / P;
        points.push({ x: Q, y: P });
    }
    return points;
}

function generatePlotPointsDemandNonlinear(a, b) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.5) {
        const Q = a * Math.exp(-b * P);
        points.push({ x: Q, y: P });
    }
    return points;
}

function generatePlotPointsRevenueLinear(a, b) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.5) {
        const Q = a - b * P;
        const R = P * Q;
        points.push({ x: P, y: R });
    }
    return points;
}

function generatePlotPointsRevenueNonlinear(a, b) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.5) {
        const Q = a * Math.exp(-b * P);
        const R = P * Q;
        points.push({ x: P, y: R });
    }
    return points;
}

function generatePlotPointsRevenueIncome(k, income) {
    const R = k * income;

    return [
        { x: 0, y: R },
        { x: 100, y: R }
    ];
}

function generateInsights(state, metrics) {
    const insights = [];

    const {
        P, Q,
        P_max, Q_max,
        Q_noTax,
        welfareLoss,
        deadweightLoss
    } = metrics;

    if (state.mode === "demand") {

        if (state.demandType === "linear") {

            if (state.b < 0.5 && state.a > 70) {
                insights.push(`Strong and elastic demand (b = ${state.b.toFixed(2)}, a = ${state.a.toFixed(2)}) leads to high revenue potential but large sensitivity to price changes.`);
            }

            if (state.b > 2 && state.a < 40) {
                insights.push(`Weak and inelastic demand (b = ${state.b.toFixed(2)}, a = ${state.a.toFixed(2)}) results in low quantity and limited response to pricing.`);
            }

            if (typeof P_max === "number") {
                insights.push(`Revenue maximisation occurs at a higher price (${P_max.toFixed(2)}) and lower quantity (${Q_max.toFixed(2)}) than equilibrium (P = ${P.toFixed(2)}, Q = ${Q.toFixed(2)}).`);
            }

            if (typeof P_max === "number" && (Q - Q_max) > 10) {
                insights.push(`Revenue maximisation significantly reduces output from ${Q.toFixed(2)} to ${Q_max.toFixed(2)}, indicating underproduction.`);
            }

            if (welfareLoss > 5 && state.b < 0.7) {
                insights.push(`Elastic demand (b = ${state.b.toFixed(2)}) amplifies welfare loss (${welfareLoss.toFixed(2)}) from restricting output.`);
            }

            if (welfareLoss < 2 && state.b > 2) {
                insights.push(`Inelastic demand (b = ${state.b.toFixed(2)}) limits welfare loss (${welfareLoss.toFixed(2)}).`);
            }

            if (state.d < 0.5 && state.b < 0.5) {
                insights.push(`Both demand (b = ${state.b.toFixed(2)}) and supply (d = ${state.d.toFixed(2)}) are responsive, making equilibrium highly sensitive to price changes.`);
            }

            if (state.d < 0.5 && state.b > 2) {
                insights.push(`Inelastic demand (b = ${state.b.toFixed(2)}) and supply (d = ${state.d.toFixed(2)}) limit adjustments, stabilising equilibrium.`);
            }

            if (state.a > 70 && welfareLoss > 5) {
                insights.push(`Large market size (a = ${state.a.toFixed(2)}) increases total welfare loss (${welfareLoss.toFixed(2)}).`);
            }
        }

        else if (state.demandType === "nonlinear") {

            if (state.bNonlinear > 1.5 && typeof P_max === "number") {
                insights.push(`High price sensitivity (b = ${state.bNonlinear.toFixed(2)}) causes demand to fall rapidly, making revenue highly sensitive.`);
            }

            if (state.bNonlinear < 0.5 && typeof P_max === "number") {
                insights.push(`Low price sensitivity (b = ${state.bNonlinear.toFixed(2)}) allows higher prices without large quantity reductions.`);
            }

            if (typeof P_max === "number" && (Q - Q_max) > 10) {
                insights.push(`Revenue maximisation reduces quantity from ${Q.toFixed(2)} to ${Q_max.toFixed(2)} under nonlinear demand.`);
            }

            if (welfareLoss > 5 && state.bNonlinear > 1) {
                insights.push(`High sensitivity (b = ${state.bNonlinear.toFixed(2)}) leads to substantial welfare loss (${welfareLoss.toFixed(2)}).`);
            }

            if (welfareLoss < 2 && state.bNonlinear < 0.7) {
                insights.push(`Low sensitivity (b = ${state.bNonlinear.toFixed(2)}) keeps welfare loss small (${welfareLoss.toFixed(2)}).`);
            }

            if (state.aNonlinear > 70 && state.bNonlinear < 0.5) {
                insights.push(`High demand (a = ${state.aNonlinear.toFixed(2)}) and low sensitivity (b = ${state.bNonlinear.toFixed(2)}) support strong revenue.`);
            }

            if (state.aNonlinear > 70 && state.bNonlinear > 1.5) {
                insights.push(`High demand (a = ${state.aNonlinear.toFixed(2)}) with strong sensitivity (b = ${state.bNonlinear.toFixed(2)}) leads to sharp quantity drops.`);
            }

            if (state.d < 0.5 && state.bNonlinear > 1) {
                insights.push(`Limited supply responsiveness (d = ${state.d.toFixed(2)}) and sensitive demand amplify output reductions.`);
            }

            insights.push(`Demand sensitivity varies across the curve (b = ${state.bNonlinear.toFixed(2)}), unlike the linear case.`);
        }

        else {

            insights.push(`Revenue is constant across prices due to fixed expenditure share (k = ${state.k.toFixed(2)}).`);

            if (state.income > 100 && state.k > 0.5) {
                insights.push(`High income (${state.income.toFixed(2)}) and strong preference (k = ${state.k.toFixed(2)}) produce high consumption.`);
            }

            if (state.income < 50 && state.k < 0.3) {
                insights.push(`Low income (${state.income.toFixed(2)}) and weak preference (k = ${state.k.toFixed(2)}) restrict demand.`);
            }

            if (state.income > 100 && state.k < 0.4) {
                insights.push(`High income (${state.income.toFixed(2)}) but low preference (k = ${state.k.toFixed(2)}) limits consumption.`);
            }

            if (state.k > 0.6 && state.income > 60) {
                insights.push(`High expenditure share (k = ${state.k.toFixed(2)}) sustains strong demand.`);
            }

            if (state.k < 0.3 && state.income > 60) {
                insights.push(`Low expenditure share (k = ${state.k.toFixed(2)}) suppresses demand.`);
            }

            insights.push("No unique revenue-maximising price exists under this structure.");
            insights.push("There is no welfare loss from pricing decisions.");
        }
    }

    else {

        if (state.demandType === "linear") {

            if (state.t > 10 && state.b < 0.5) {
                insights.push(`High tax (t = ${state.t.toFixed(2)}) with elastic demand (b = ${state.b.toFixed(2)}) sharply reduces quantity.`);
            }

            if (state.t > 10 && state.b > 2) {
                insights.push(`With inelastic demand (b = ${state.b.toFixed(2)}), a high tax (t = ${state.t.toFixed(2)}) causes a smaller quantity reduction.`);
            }

            if (deadweightLoss > 10 && state.b < 0.7) {
                insights.push(`Elastic demand amplifies deadweight loss (${deadweightLoss.toFixed(2)}).`);
            }

            if (deadweightLoss < 2 && state.b > 2) {
                insights.push(`Inelastic demand keeps deadweight loss low (${deadweightLoss.toFixed(2)}).`);
            }

            if (state.d < 0.5 && state.t > 10) {
                insights.push(`Inelastic supply (d = ${state.d.toFixed(2)}) shifts tax burden to producers.`);
            }

            if (state.d > 2 && state.b < 0.5) {
                insights.push(`Elastic supply (d = ${state.d.toFixed(2)}) and demand lead to large quantity reductions.`);
            }

            if ((Q_noTax - Q) > 10 && state.t > 5) {
                insights.push(`Tax reduces quantity from ${Q_noTax.toFixed(2)} to ${Q.toFixed(2)}.`);
            }

            if (state.t < 5 && deadweightLoss < 2) {
                insights.push(`Small tax (t = ${state.t.toFixed(2)}) creates minimal distortion.`);
            }

            insights.push(`Tax (t = ${state.t.toFixed(2)}) creates a wedge between consumer and producer prices.`);
        }

        else if (state.demandType === "nonlinear") {

            if (state.t > 10 && state.bNonlinear > 1.5) {
                insights.push(`High tax (t = ${state.t.toFixed(2)}) and strong sensitivity (b = ${state.bNonlinear.toFixed(2)}) cause a large drop in quantity.`);
            }

            if (state.t > 10 && state.bNonlinear < 0.5) {
                insights.push(`Low sensitivity (b = ${state.bNonlinear.toFixed(2)}) reduces the impact of tax (${state.t.toFixed(2)}).`);
            }

            if (deadweightLoss > 10 && state.bNonlinear > 1) {
                insights.push(`High sensitivity amplifies deadweight loss (${deadweightLoss.toFixed(2)}).`);
            }

            if (deadweightLoss < 2 && state.bNonlinear < 0.7) {
                insights.push(`Low sensitivity limits deadweight loss (${deadweightLoss.toFixed(2)}).`);
            }

            if ((Q_noTax - Q) > 10 && state.t > 5) {
                insights.push(`Tax reduces output from ${Q_noTax.toFixed(2)} to ${Q.toFixed(2)} under nonlinear demand.`);
            }

            if (state.aNonlinear > 70 && state.t > 10) {
                insights.push(`High demand (a = ${state.aNonlinear.toFixed(2)}) increases total welfare loss.`);
            }

            insights.push("Taxation effects vary across the nonlinear demand curve.");

            if (state.d < 0.5 && state.t > 10) {
                insights.push(`Limited supply response (d = ${state.d.toFixed(2)}) amplifies tax impact.`);
            }
        }

        else {

            if (state.t > 10 && state.income < 50) {
                insights.push(`Low income (${state.income.toFixed(2)}) and high tax (${state.t.toFixed(2)}) sharply reduce consumption.`);
            }

            if (state.t > 10 && state.income > 100) {
                insights.push(`High income (${state.income.toFixed(2)}) cushions the effect of tax (${state.t.toFixed(2)}).`);
            }

            if (state.k > 0.5 && state.t > 10) {
                insights.push(`Strong preference (k = ${state.k.toFixed(2)}) maintains consumption despite taxation.`);
            }

            if (state.k < 0.3 && state.t > 10) {
                insights.push(`Low preference (k = ${state.k.toFixed(2)}) amplifies the reduction in demand.`);
            }

            if (deadweightLoss > 10) {
                insights.push(`Taxation creates large inefficiency (${deadweightLoss.toFixed(2)}).`);
            }

            if (deadweightLoss < 5 && state.t < 10) {
                insights.push(`Distortion is limited with tax (${state.t.toFixed(2)}).`);
            }

            if ((Q_noTax - Q) > 10) {
                insights.push(`Consumption falls significantly from ${Q_noTax.toFixed(2)} to ${Q.toFixed(2)}.`);
            }

            insights.push(`Demand depends on income (${state.income.toFixed(2)}), so tax reduces purchasing power.`);

            if (state.income < 50 && state.k < 0.3) {
                insights.push(`Low income (${state.income.toFixed(2)}) and weak preference (k = ${state.k.toFixed(2)}) suppress demand.`);
            }
        }
    }

    return insights;
}

function renderInsights() {
    const insights = generateInsights(state, currentMetrics);
    insightsContainer.innerHTML = insights.map(insight => `<p>${insight}</p>`).join("");
}

function changeParametersPreset(preset) {

    state.c = 0;
    state.d = 1;
    state.t = 0;

    if (preset === "demandModeLinearOne") {
        state.a = 80;
        state.b = 0.3;
    }
    else if (preset === "demandModeLinearTwo") {
        state.a = 50;
        state.b = 3;
    }
    else if (preset === "demandModeLinearThree") {
        state.a = 50;
        state.b = 1;
    }
    else if (preset === "demandModeLinearFour") {
        state.a = 100;
        state.b = 1;
    }
    else if (preset === "demandModeNonlinearOne") {
        state.aNonlinear = 60;
        state.bNonlinear = 2;
    }
    else if (preset === "demandModeNonlinearTwo") {
        state.aNonlinear = 60;
        state.bNonlinear = 0.3;
    }
    else if (preset === "demandModeNonlinearThree") {
        state.aNonlinear = 100;
        state.bNonlinear = 1.8;
    }
    else if (preset === "demandModeNonlinearFour") {
        state.aNonlinear = 100;
        state.bNonlinear = 0.4;
    }
    else if (preset === "demandModeIncomeOne") {
        state.income = 200;
        state.k = 0.7;
    }
    else if (preset === "demandModeIncomeTwo") {
        state.income = 40;
        state.k = 0.2;
    }
    else if (preset === "demandModeIncomeThree") {
        state.income = 200;
        state.k = 0.3;
    }
    else if (preset === "demandModeIncomeFour") {
        state.income = 100;
        state.k = 0.5;
    }
    else if (preset === "supplyModeLinearOne") {
        state.a = 60;
        state.b = 0.4;
        state.t = 15;
    }
    else if (preset === "supplyModeLinearTwo") {
        state.a = 60;
        state.b = 3;
        state.t = 15;
    }
    else if (preset === "supplyModeLinearThree") {
        state.a = 60;
        state.b = 1;
        state.d = 0.3;
        state.t = 12;
    }
    else if (preset === "supplyModeLinearFour") {
        state.a = 50;
        state.b = 1;
        state.t = 2;
    }
    else if (preset === "supplyModeNonlinearOne") {
        state.aNonlinear = 60;
        state.bNonlinear = 2;
        state.t = 15;
    }
    else if (preset === "supplyModeNonlinearTwo") {
        state.aNonlinear = 60;
        state.bNonlinear = 0.3;
        state.t = 15;
    }
    else if (preset === "supplyModeNonlinearThree") {
        state.aNonlinear = 100;
        state.bNonlinear = 1;
        state.t = 12;
    }
    else if (preset === "supplyModeNonlinearFour") {
        state.aNonlinear = 60;
        state.bNonlinear = 1;
        state.d = 0.3;
        state.t = 10;
    }
    else if (preset === "supplyModeIncomeOne") {
        state.income = 30;
        state.k = 0.2;
        state.t = 15;
    }
    else if (preset === "supplyModeIncomeTwo") {
        state.income = 150;
        state.k = 0.6;
        state.t = 15;
    }
    else if (preset === "supplyModeIncomeThree") {
        state.income = 100;
        state.k = 0.8;
        state.t = 10;
    }
    else if (preset === "supplyModeIncomeFour") {
        state.income = 100;
        state.k = 0.3;
        state.t = 10;
    }
}