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
const ctxMain = canvasMain.getContext("2d");
const canvasRevenue = document.getElementById("revenueCanvas");
const ctxRevenue = canvasRevenue.getContext("2d");
const canvasWidth = canvasMain.width;
const canvasHeight = canvasMain.height;
const maxQ = 100;
const maxP = 100;
const margin = 30;
const scaleX = (canvasWidth - margin) / maxQ;
const scaleY = (canvasHeight - margin) / maxP;
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
            drawCurves();
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
        if (id === "d" && Math.abs(value) < 0.01) {
            state[id] = 0.000001;
        } else {
            state[id] = value;
        }
        for (let input of manualInputs) {
            if (input.id === id + "Value") {
                input.value = value;
            }
        }
        displayAndStoreMetricValues();
        drawCurves();
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
    drawCurves();
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
        drawCurves();
        renderInsights();
        mainSection.scrollIntoView({
            behavior: "smooth"
        });
    });
}
displayAndStoreMetricValues();
modeButtons[0].click();
drawCurves();
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

function drawAxes() {
    ctxMain.beginPath();
    ctxMain.strokeStyle = "black";
    ctxMain.lineWidth = 1;

    //Y-axis (Q = 0 line)
    ctxMain.moveTo(margin, 0);
    ctxMain.lineTo(margin, canvasHeight - margin);

    //X-axis (P = 0 line)
    ctxMain.moveTo(margin, canvasHeight - margin);
    ctxMain.lineTo(canvasWidth, canvasHeight - margin);

    ctxMain.stroke();

    const arrowSize = 6;

    // Y-axis arrow
    ctxMain.beginPath();
    ctxMain.moveTo(margin, 0);
    ctxMain.lineTo(margin - arrowSize, arrowSize);
    ctxMain.lineTo(margin + arrowSize, arrowSize);
    ctxMain.closePath();
    ctxMain.fill();

    //X-axis arrow
    ctxMain.beginPath();
    ctxMain.moveTo(canvasWidth, canvasHeight - margin);
    ctxMain.lineTo(canvasWidth - arrowSize, canvasHeight - margin - arrowSize);
    ctxMain.lineTo(canvasWidth - arrowSize, canvasHeight - margin + arrowSize);
    ctxMain.closePath();
    ctxMain.fill();
}

function labelCurve(points, text, color, right, up) {
    const index = Math.floor(points.length * 0.5);
    const point = points[index];

    const x = margin + point.x * scaleX;
    const y = (canvasHeight - margin) - point.y * scaleY;

    ctxMain.fillStyle = color;
    ctxMain.font = "14px Arial";

    ctxMain.fillText(text, x + right, y - up);
}

function drawCurves() {
    ctxMain.clearRect(0, 0, canvasWidth, canvasHeight);

    drawAxes();

    if (state.mode === "demand") {
        drawDemandModeShading();
    } else {
        drawSupplyModeShading();
    }

    const pointsList = retrievePointsNeededForPlotting(state.mode, state.demandType);

    const colors = (state.mode === "demand") ? ["green", "blue"] : ["green", "red", "blue"];

    for (let i = 0; i < pointsList.length; i++) {
        const points = pointsList[i];

        ctxMain.beginPath();
        ctxMain.strokeStyle = colors[i];

        let first = true;

        for (let point of points) {
            const x = margin + point.x * scaleX;
            const y = (canvasHeight - margin) - point.y * scaleY;

            if (first) {
                ctxMain.moveTo(x, y);
                first = false;
            } else {
                ctxMain.lineTo(x, y);
            }
        }

        ctxMain.stroke();
        if (state.mode === "demand") {
            if (i === 0) labelCurve([points[1]], "Supply (S)", "green", -10, -10);
            if (i === 1) labelCurve(points, "Demand (D)", "blue", 5, 5);
        } else {
            if (i === 0) labelCurve(points, "Supply (S)", "green", 5, 5);
            if (i === 1) labelCurve(points, "Supply with Tax (S + t)", "red", 5, 5);
            if (i === 2) labelCurve(points, "Demand (D)", "blue", 5, 5);
        }
    }
}


function retrievePointsNeededForPlotting(mode, demandType) {
    let points = []
    let pointsList = []
    if (mode === 'demand') {
        points = generatePlotPointsSupplyNoTax(state.c, state.d);
        pointsList.push(points);
        if (demandType === 'linear') {
            points = generatePlotPointsDemandLinear(state.a, state.b);
            pointsList.push(points);
        }
        else if (demandType === 'nonlinear') {
            points = generatePlotPointsDemandNonlinear(state.aNonlinear, state.bNonlinear);
            pointsList.push(points);
        }
        else {
            points = generatePlotPointsDemandIncome(state.k, state.income);
            pointsList.push(points);
        }
    }
    else {
        points = generatePlotPointsSupplyNoTax(state.c, state.d);
        pointsList.push(points);
        points = generatePlotPointsSupplyWithTax(state.c, state.d, state.t);
        pointsList.push(points);
        if (demandType === 'linear') {
            points = generatePlotPointsDemandLinear(state.a, state.b);
            pointsList.push(points);
        }
        else if (demandType === 'nonlinear') {
            points = generatePlotPointsDemandNonlinear(state.aNonlinear, state.bNonlinear);
            pointsList.push(points);
        }
        else {
            points = generatePlotPointsDemandIncome(state.k, state.income);
            pointsList.push(points);
        }
    }
    return pointsList
}

function toCanvas(Q, P) {
    return {
        x: margin + Q * scaleX,
        y: (canvasHeight - margin) - P * scaleY
    };
}

function drawDemandModeShading() {
    const P = currentMetrics.P;
    const Q = currentMetrics.Q;

    if (state.demandType === "linear") {
        drawCSLinear(state.a, state.b, P, Q);
        drawWelfareLossLinear(state.a, state.b, state.c, state.d);
    }
    else if (state.demandType === "nonlinear") {
        drawCSNonlinear(state.aNonlinear, state.bNonlinear, P, Q);
        drawWelfareLossNonlinear(state.aNonlinear, state.bNonlinear, state.c, state.d);
    }
    else {
        drawCSIncome(state.k, state.income, P, Q);
    }
    if (P === 0) {
        return
    }
    else {
        drawPS(state.c, state.d, P, Q);
    }
}

function drawSupplyModeShading() {
    const P = currentMetrics.P;
    const Q = currentMetrics.Q;

    const P_p = P - state.t;

    // NO-TAX equilibrium (must match demand type)
    let Q0;

    if (state.demandType === "linear") {
        [, Q0] = calculateEquilibriumLinear(state.a, state.b, state.c, state.d, 0);

        drawCSLinear(state.a, state.b, P, Q);
        drawPS(state.c, state.d, P_p, Q);
        drawTaxRevenue(P, P_p, Q);
        drawDWLLinearTax(Q0, Q, state.a, state.b, state.c, state.d);
    }

    else if (state.demandType === "nonlinear") {
        [, Q0] = approximateEquilibriumNonlinear(
            state.aNonlinear,
            state.bNonlinear,
            state.c,
            state.d,
            0
        );

        drawCSNonlinear(state.aNonlinear, state.bNonlinear, P, Q);
        drawPS(state.c, state.d, P_p, Q);
        drawTaxRevenue(P, P_p, Q);
        drawDWLNonlinearTax(
            state.aNonlinear,
            state.bNonlinear,
            state.c,
            state.d,
            state.t
        );

        // use nonlinear DWL shading
        drawWelfareLossNonlinear(
            state.aNonlinear,
            state.bNonlinear,
            state.c,
            state.d,
            state.t
        );
    }

    else { // income
        [, Q0] = calculateEquilibriumIncome(
            state.income,
            state.k,
            state.c,
            state.d,
            0
        );

        drawCSIncome(state.k, state.income, P, Q);
        drawPS(state.c, state.d, P_p, Q);
        drawTaxRevenue(P, P_p, Q);
        drawDWLIncomeTax(
            state.k,
            state.income,
            state.c,
            state.d,
            state.t
        );

        // no geometric DWL implemented for income yet
        // optional: skip or add later
    }
}

function drawCSLinear(a, b, P_eq, Q_eq) {
    const ctx = ctxMain;

    const isVerticalDemand = Math.abs(b) < 0.00001;
    const isVerticalSupply = Math.abs(state.d) < 0.01;

    //VERTICAL DEMAND CASE
    if (isVerticalDemand) {

        const Q = Q_eq;

        const topLeft = toCanvas(0, maxP);
        const topRight = toCanvas(Q, maxP);
        const bottomRight = toCanvas(Q, P_eq);
        const bottomLeft = toCanvas(0, P_eq);

        ctx.beginPath();
        ctx.moveTo(topLeft.x, topLeft.y);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.lineTo(bottomRight.x, bottomRight.y);
        ctx.lineTo(bottomLeft.x, bottomLeft.y);
        ctx.closePath();

        ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
        ctx.fill();

        return;
    }

    //NORMAL / VERTICAL SUPPLY CASE
    const Q_start = isVerticalSupply ? state.c : 0;

    const top = toCanvas(Q_start, (a - Q_start) / b);
    const eq = toCanvas(Q_eq, P_eq);
    const left = toCanvas(Q_start, P_eq);

    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(eq.x, eq.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();

    ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
    ctx.fill();
}


function drawCSNonlinear(a, b, P_eq, Q_eq) {
    ctxMain.beginPath();

    const isVerticalDemand = b < 0.01;
    const isVerticalSupply = Math.abs(state.d) < 0.01;

    if (isVerticalDemand) {

        const Q = Q_eq;

        const top = toCanvas(Q, maxP);     // extend up
        const bottom = toCanvas(Q, P_eq);  // down to price
        const leftBottom = toCanvas(0, P_eq);
        const leftTop = toCanvas(0, maxP);

        ctxMain.moveTo(leftTop.x, leftTop.y);
        ctxMain.lineTo(top.x, top.y);
        ctxMain.lineTo(bottom.x, bottom.y);
        ctxMain.lineTo(leftBottom.x, leftBottom.y);

        ctxMain.closePath();
        ctxMain.fillStyle = "rgba(0, 0, 255, 0.2)";
        ctxMain.fill();

        return;
    }

    const Q_start = isVerticalSupply ? state.c : 0.1;

    let started = false;

    // TOP: demand curve
    for (let Q = Q_start; Q <= Q_eq; Q += 0.1) {
        let P = -(1 / b) * Math.log(Q / a);

        if (P < P_eq || P < 0) continue;

        const pt = toCanvas(Q, P);

        if (!started) {
            ctxMain.moveTo(pt.x, pt.y);
            started = true;
        } else {
            ctxMain.lineTo(pt.x, pt.y);
        }
    }

    // equilibrium point
    const eq = toCanvas(Q_eq, P_eq);
    ctxMain.lineTo(eq.x, eq.y);

    // bottom (price line)
    for (let Q = Q_eq; Q >= Q_start; Q -= 0.1) {
        const pt = toCanvas(Q, P_eq);
        ctxMain.lineTo(pt.x, pt.y);
    }

    ctxMain.closePath();
    ctxMain.fillStyle = "rgba(0, 0, 255, 0.2)";
    ctxMain.fill();
}


function drawCSIncome(k, income, P_eq, Q_eq) {
    ctxMain.beginPath();

    let started = false;

    // TOP: demand (Q-loop, not P-loop)
    for (let Q = 0.1; Q <= Q_eq; Q += 0.1) {
        let P = (k * income) / Q;

        if (P < P_eq) continue;

        const { x, y } = toCanvas(Q, P);

        if (!started) {
            ctxMain.moveTo(x, y);
            started = true;
        } else {
            ctxMain.lineTo(x, y);
        }
    }

    // equilibrium point
    const eq = toCanvas(Q_eq, P_eq);
    ctxMain.lineTo(eq.x, eq.y);

    // back along price line
    for (let Q = Q_eq; Q >= 0; Q -= 0.1) {
        const { x, y } = toCanvas(Q, P_eq);
        ctxMain.lineTo(x, y);
    }

    ctxMain.closePath();
    ctxMain.fillStyle = "rgba(0, 0, 255, 0.2)";
    ctxMain.fill();
}


function drawPS(c, d, P_eq, Q_eq) {

    const P_s_at_Q = (Q_eq - c) / d;
    if (P_s_at_Q < 0) return;


    ctxMain.beginPath();

    // 1. start at price on axis
    const leftTop = toCanvas(0, P_eq);
    ctxMain.moveTo(leftTop.x, leftTop.y);

    // 2. go to equilibrium
    const eqTop = toCanvas(Q_eq, P_eq);
    ctxMain.lineTo(eqTop.x, eqTop.y);

    // 3. follow supply curve down until it hits axis
    for (let Q = Q_eq; Q >= c; Q -= 0.5) {

        let P_s = (Q - c) / d;

        if (P_s <= 0) {
            // ✅ switch to axis (THIS is the only fix you needed)
            const axisPoint = toCanvas(Q, 0);
            ctxMain.lineTo(axisPoint.x, axisPoint.y);
        } else {
            const pt = toCanvas(Q, P_s);
            ctxMain.lineTo(pt.x, pt.y);
        }
    }

    // 4. straight back along axis to origin
    const intercept = toCanvas(c, 0);
    ctxMain.lineTo(intercept.x, intercept.y);

    const origin = toCanvas(0, 0);
    ctxMain.lineTo(origin.x, origin.y);

    ctxMain.closePath();
    ctxMain.fillStyle = "rgba(0, 255, 0, 0.2)";
    ctxMain.fill();
}


function drawWelfareLossLinear(a, b, c, d) {
    const [P_eq, Q_eq] = calculateEquilibriumLinear(a, b, c, d, 0);
    const [P_max, Q_max] = calculateRevenueMaximizingCoordinatesLinear(a, b);

    ctxMain.beginPath();

    let started = false;

    // TOP: demand curve (Q_max → Q_eq)
    for (let Q = Q_max; Q <= Q_eq; Q += 0.1) {
        let P_d = (a - Q) / b;

        if (P_d < 0) continue;

        const { x, y } = toCanvas(Q, P_d);

        if (!started) {
            ctxMain.moveTo(x, y);
            started = true;
        } else {
            ctxMain.lineTo(x, y);
        }
    }

    // BOTTOM: switch axis → supply (same rule as PS)
    for (let Q = Q_eq; Q >= Q_max; Q -= 0.1) {
        let P_s = (Q - c) / d;

        if (P_s <= 0) {
            const axisPoint = toCanvas(Q, 0);
            ctxMain.lineTo(axisPoint.x, axisPoint.y);
        } else {
            const { x, y } = toCanvas(Q, P_s);
            ctxMain.lineTo(x, y);
        }
    }

    ctxMain.closePath();
    ctxMain.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctxMain.fill();
}

function drawWelfareLossNonlinear(a, b, c, d) {

    const [, Q_eq] = approximateEquilibriumNonlinear(a, b, c, d, 0);
    const [, Q_max] = calculateRevenueMaximizingCoordinatesNonlinear(a, b);

    if (!Q_eq || Q_max >= Q_eq) return;

    ctxMain.beginPath();

    let started = false;

    // TOP: demand curve
    for (let Q = Q_max; Q <= Q_eq; Q += 0.1) {
        let P_d = -(1 / b) * Math.log(Q / a);

        if (P_d < 0) continue;

        const { x, y } = toCanvas(Q, P_d);

        if (!started) {
            ctxMain.moveTo(x, y);
            started = true;
        } else {
            ctxMain.lineTo(x, y);
        }
    }

    // BOTTOM: supply curve (reverse direction)
    for (let Q = Q_eq; Q >= Q_max; Q -= 0.1) {
        let P_s = (Q - c) / d;

        if (P_s < 0) P_s = 0;

        const { x, y } = toCanvas(Q, P_s);
        ctxMain.lineTo(x, y);
    }

    ctxMain.closePath();
    ctxMain.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctxMain.fill();
}


function drawTaxRevenue(P_c, P_p, Q) {

    const P_p_clipped = Math.max(0, P_p); // ✅ FIX

    const topLeft = toCanvas(0, P_c);
    const topRight = toCanvas(Q, P_c);
    const botRight = toCanvas(Q, P_p_clipped);
    const botLeft = toCanvas(0, P_p_clipped);

    ctxMain.beginPath();
    ctxMain.moveTo(topLeft.x, topLeft.y);
    ctxMain.lineTo(topRight.x, topRight.y);
    ctxMain.lineTo(botRight.x, botRight.y);
    ctxMain.lineTo(botLeft.x, botLeft.y);
    ctxMain.closePath();

    ctxMain.fillStyle = "rgba(255, 165, 0, 0.3)";
    ctxMain.fill();
}


function drawDWLLinearTax(Q0, Q_t, a, b, c, d) {

    const isVerticalDemand = Math.abs(b) < 0.00001;
    if (isVerticalDemand) return;

    ctxMain.beginPath();

    // ────────── TOP: demand curve (Q_t → Q0) ──────────
    for (let Q = Q_t; Q <= Q0; Q += 0.1) {
        let P_d = (a - Q) / b;

        if (P_d < 0) continue;

        const { x, y } = toCanvas(Q, P_d);

        if (Q === Q_t) {
            ctxMain.moveTo(x, y);
        } else {
            ctxMain.lineTo(x, y);
        }
    }

    // ────────── BOTTOM: supply OR axis (SWITCH LOGIC) ──────────
    for (let Q = Q0; Q >= Q_t; Q -= 0.1) {

        let P_s = (Q - c) / d;

        if (P_s <= 0) {
            // ✅ SWITCH TO AXIS
            const pt = toCanvas(Q, 0);
            ctxMain.lineTo(pt.x, pt.y);
        } else {
            // ✅ NORMAL SUPPLY
            const pt = toCanvas(Q, P_s);
            ctxMain.lineTo(pt.x, pt.y);
        }
    }

    ctxMain.closePath();
    ctxMain.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctxMain.fill();
}

function drawDWLNonlinearTax(a, b, c, d, t) {

    const [, Q0] = approximateEquilibriumNonlinear(a, b, c, d, 0);
    const [, Q_t] = approximateEquilibriumNonlinear(a, b, c, d, t);

    if (!Q0 || !Q_t || Q_t >= Q0) return;

    ctxMain.beginPath();

    let started = false;

    // ───── TOP: demand curve ─────
    for (let Q = Q_t; Q <= Q0; Q += 0.1) {

        let P_d = -(1 / b) * Math.log(Q / a);

        if (P_d < 0) continue;

        const { x, y } = toCanvas(Q, P_d);

        if (!started) {
            ctxMain.moveTo(x, y);
            started = true;
        } else {
            ctxMain.lineTo(x, y);
        }
    }

    // ───── BOTTOM: supply OR axis ─────
    for (let Q = Q0; Q >= Q_t; Q -= 0.1) {

        let P_s = (Q - c) / d;

        if (P_s <= 0) {
            const pt = toCanvas(Q, 0); // ✅ axis switch
            ctxMain.lineTo(pt.x, pt.y);
        } else {
            const pt = toCanvas(Q, P_s);
            ctxMain.lineTo(pt.x, pt.y);
        }
    }

    ctxMain.closePath();
    ctxMain.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctxMain.fill();
}

function drawDWLIncomeTax(k, income, c, d, t) {

    const [, Q0] = calculateEquilibriumIncome(income, k, c, d, 0);
    const [, Q_t] = calculateEquilibriumIncome(income, k, c, d, t);

    if (!Q0 || !Q_t || Q_t >= Q0) return;

    ctxMain.beginPath();

    let started = false;

    // ───── TOP: demand curve ─────
    for (let Q = Q_t; Q <= Q0; Q += 0.1) {
        let P_d = (k * income) / Q;

        const { x, y } = toCanvas(Q, P_d);

        if (!started) {
            ctxMain.moveTo(x, y);
            started = true;
        } else {
            ctxMain.lineTo(x, y);
        }
    }

    // ───── BOTTOM: supply curve ─────
    for (let Q = Q0; Q >= Q_t; Q -= 0.1) {
        let P_s = (Q - c) / d;
        if (P_s < 0) P_s = 0;

        const { x, y } = toCanvas(Q, P_s);
        ctxMain.lineTo(x, y);
    }

    ctxMain.closePath();
    ctxMain.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctxMain.fill();
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
    if (d === 0) {
        const Q = c;
        const P = (income * k) / Q;
        return [P, Q]
    }
    const term = c - d * t;
    const P = (-term + Math.sqrt(term * term + 4 * d * k * income)) / (2 * d);
    const Q = c + d * (P - t);
    return [P, Q];
}


function approximateEquilibriumNonlinear(a, b, c, d, t) {

    // Inverse demand: P(Q)
    function Pd(Q) {
        return -(1 / b) * Math.log(Q / a);
    }

    if (Math.abs(d) === 0) {
        const Q = c;
        const P = Math.max(0, Pd(Q));   // ALWAYS use demand here
        return [P, Q];
    }


    // Inverse supply: P(Q)
    function Ps(Q) {
        return (Q - c) / d + t;
    }

    function f(Q) {
        return Pd(Q) - Ps(Q);
    }

    // Avoid log(0)
    let Q_low = 1e-6;
    let Q_high = a;

    let f_low = f(Q_low);
    let f_high = f(Q_high);

    //NO ROOT → CORNER SOLUTION
    if (f_low * f_high > 0) {
        const Qd0 = a;
        const Qs0 = c - d * t;
        return [0, Math.min(Qd0, Qs0)];
    }

    let Q_mid;

    for (let i = 0; i < 100; i++) {
        Q_mid = 0.5 * (Q_low + Q_high);
        let f_mid = f(Q_mid);

        if (Math.abs(f_mid) < 1e-6) break;

        if (f_low * f_mid < 0) {
            Q_high = Q_mid;
            f_high = f_mid;
        } else {
            Q_low = Q_mid;
            f_low = f_mid;
        }
    }

    const Q = Q_mid;

    //always compute P from supply (numerically stable)
    const P = Math.max(0, (Q - c) / d + t);

    return [P, Q];
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

function generatePlotPointsSupplyNoTax(c, d) {
    // always include origin-side intercept
    const xIntercept = { x: c, y: 0 };

    // pick another valid point (e.g. maxP)
    let P2 = maxP;
    let Q2
    if (c + d * P2 > maxQ) {
        Q2 = maxQ;
        P2 = (maxQ - c) / d
    }
    else {
        Q2 = c + d * P2
    }

    const endPoint = { x: Q2, y: P2 };

    return [xIntercept, endPoint];
}


function generatePlotPointsSupplyWithTax(c, d, t) {
    let firstPoint

    if (-(c / d) + t > 0) {
        firstPoint = { x: 0, y: -(c / d) + t };
    }
    else {
        firstPoint = { x: c - d * t, y: 0 };
    }

    let P2 = maxP;
    let Q2
    if (c + d * (P2 - t) > maxQ) {
        Q2 = maxQ;
        P2 = ((maxQ - c) / d) + t
    }
    else {
        Q2 = c + d * (P2 - t)
    }

    const endPoint = { x: Q2, y: P2 };

    return [firstPoint, endPoint];
}



function generatePlotPointsDemandLinear(a, b) {

    //HANDLE VERTICAL DEMAND
    if (Math.abs(b) < 0.00001) {
        return [
            { x: a, y: 0 },
            { x: a, y: maxP }  // vertical line
        ];
    }

    //NORMAL CASE
    return [
        { x: a, y: 0 },
        { x: 0, y: a / b }
    ];
}



function generatePlotPointsDemandIncome(income, k) {
    const points = [];
    for (let P = 0; P <= 100; P += 0.5) {
        if (P === 0) {
            continue
        }
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