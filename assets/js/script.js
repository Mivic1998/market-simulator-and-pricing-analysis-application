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

const supplyDefaults = {
    c: 0,
    d: 1
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
const marginX = 80;
const revenueMarginX = 140;
const marginBottom = 40;
const scaleX = (canvasWidth - marginX) / maxQ;
const scaleY = (canvasHeight - marginBottom) / maxP;
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
const sliders = document.querySelectorAll(".slider-group input[type='range']");
const manualInputs = document.querySelectorAll(".slider-group input[type='number']");
const modeButtons = document.querySelectorAll(".mode-button");
const supplyOnlyElements = document.querySelectorAll(".supply-only");
const demandOnlyElements = document.querySelectorAll(".demand-only");
const taxSlider = document.getElementById('t');
const taxInput = document.getElementById('tValue');
const insightsContainer = document.querySelector(".insights-content");
const insightsKeyContainer = document.querySelector('.insights-key');
const presetButtons = document.querySelectorAll(".preset-btn");
const darkModeToggle = document.getElementById("darkModeToggle");
const supplySliderC = document.getElementById("c");
const supplyInputC = document.getElementById("cValue");
const supplySliderD = document.getElementById("d");
const supplyInputD = document.getElementById("dValue");

document.body.classList.remove("dark-mode");

darkModeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const isDark =
        document.body.classList.contains("dark-mode");

    darkModeToggle.textContent =
        isDark ? "Light Mode" : "Dark Mode";

    displayAndStoreMetricValues();
    drawCurves();
    drawRevenue();
    renderInsights();
});

for (let button of modeButtons) {
    button.addEventListener("click", (e) => {
        const newMode = e.currentTarget.dataset.mode;

        if (state.mode === newMode && modeButtonClicked) {
            return;
        } // if user clicks the already active mode button, do nothing (prevents unnecessary redraws and metric calculations)

        state.mode = newMode;
        modeButtonClicked = true;

        for (let button of modeButtons) {
            button.classList.remove("active");
        }
        e.currentTarget.classList.add("active");

        if (state.mode === "demand") {
            state.t = 0; // reset tax to 0 when switching to demand mode, as tax is not relevant in this mode
            taxSlider.value = state.t;
            taxInput.value = state.t;
            state.c = supplyDefaults.c;
            state.d = supplyDefaults.d;
            supplySliderC.value = state.c;
            supplyInputC.value = state.c;
            supplySliderD.value = state.d;
            supplyInputD.value = state.d;

            for (let element of supplyOnlyElements) {
                element.classList.remove("visible");
            }

            for (let element of demandOnlyElements) {
                element.classList.add("visible");
            }
        } else {
            state.c = supplyDefaults.c;
            state.d = supplyDefaults.d;
            supplySliderC.value = state.c;
            supplyInputC.value = state.c;
            supplySliderD.value = state.d;
            supplyInputD.value = state.d;
            for (let element of demandOnlyElements) {
                element.classList.remove("visible");
            }

            for (let element of supplyOnlyElements) {
                element.classList.add("visible");
            }
        }

        displayAndStoreMetricValues();
        drawCurves();
        drawRevenue();
        renderInsights();
    });
}

for (let input of manualInputs) {
    // apply value when clicking away (blur) as well
    input.addEventListener('blur', (e) => {
        const raw = e.target.value.trim();
        const value = Number(raw);
        if (raw === "" || isNaN(value)) return;
        for (let slider of sliders) {
            if (slider.id === e.target.id.replace("Value", "")) {
                slider.value = value;
                slider.dispatchEvent(new Event("input"));
                mainSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.target.blur(); // remove focus from input after pressing Enter
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
        drawRevenue();
        renderInsights();
    });

    // when user finishes adjusting (releases the slider), scroll to the graph
    slider.addEventListener('change', () => {
        mainSection.scrollIntoView({ behavior: 'smooth' });
    })
}

demandType.addEventListener("change", (e) => {
    // reset the parameters for the demand type being left
    if (previousDemandType === "linear") {
        state.a = demandDefaults.linear.a;
        state.b = demandDefaults.linear.b;
    }
    else if (previousDemandType === "income") {
        state.income = demandDefaults.income.income;
        state.k = demandDefaults.income.k;
    }
    else {
        state.aNonlinear = demandDefaults.nonlinear.aNonlinear;
        state.bNonlinear = demandDefaults.nonlinear.bNonlinear;
    }

    // sync manual inputs with the reset state values
    for (let input of manualInputs) {
        const key = input.id.replace("Value", "");

        if (key in state) {
            input.value = state[key];
        }
    }

    // sync sliders with the reset state values
    for (let slider of sliders) {
        if (slider.id in state) {
            slider.value = state[slider.id];
        }
    }

    // update active demand type
    state.demandType = e.target.value;

    // hide elements for previous demand type
    const previousDemandElements =
        document.querySelectorAll(".demand-" + previousDemandType);

    for (let element of previousDemandElements) {
        element.classList.remove("active");
    }

    // show elements for current demand type
    const currentDemandElements =
        document.querySelectorAll(".demand-" + state.demandType);

    for (let element of currentDemandElements) {
        element.classList.add("active");
    }

    previousDemandType = state.demandType;

    displayAndStoreMetricValues();
    drawCurves();
    drawRevenue();
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
        drawRevenue();
        renderInsights();
        mainSection.scrollIntoView({
            behavior: "smooth"
        });
    });
}

canvasMain.addEventListener("mousemove", (e) => {
    if (state.demandType !== 'income') {
        handleMouseMove(e);
    }
});
canvasMain.addEventListener("mouseleave", (e) => {
    if (state.demandType !== 'income') {
        handleMouseLeave();
    }
});

canvasRevenue.addEventListener("mousemove", handleRevenueMouseMove);
canvasRevenue.addEventListener("mouseleave", handleRevenueMouseLeave);

function handleMouseLeave() {

    drawCurves();
}

function handleRevenueMouseLeave() {
    drawRevenue(); // clears hover dot
}

modeButtons[0].click();

function getCanvasTheme() {

    const dark =
        document.body.classList.contains("dark-mode");

    return {
        background: dark ? "#020617" : "#ffffff",
        axis: dark ? "#f8fafc" : "#000000",
        text: dark ? "#f8fafc" : "#000000",
        guide: dark ? "#94a3b8" : "gray"
    };
}

function handleMouseMove(event) {

    const Q = getMouseQ(event); // convert mouse x-position into quantity value

    const P = getDemandPrice(Q); // calculate price on current demand curve

    if (P === null || P < 0 || P > maxP) { // reject invalid graph regions

        drawCurves(); // redraw clean graph without overlay

        return;
    }

    const PED = calculatePED(Q, P); // calculate elasticity at hover point

    drawHoverOverlay(Q, P, PED); // redraw graph and add temporary hover graphics
}



function handleRevenueMouseMove(event) {

    const Q = getMouseQRevenue(event); // convert mouse position into revenue-graph quantity

    const P = getDemandPrice(Q); // calculate demand price at quantity Q

    if (!P || P < 0 || P > maxP || state.demandType === 'income') { // reject invalid hover states

        drawRevenue(); // redraw clean revenue graph

        return;
    }

    const TR = P * Q; // calculate total revenue

    drawRevenue(); // redraw clean base revenue graph

    drawRevenueOverlay(Q, TR); // draw temporary hover overlay on top
}



function drawRevenueOverlay(Q, TR) {

    let points;

    if (state.demandType === 'linear') {

        points = generatePlotPointsRevenueLinear(state.a, state.b); // generate linear revenue points

    } else if (state.demandType === 'nonlinear') {

        points = generatePlotPointsRevenueNonlinear(
            state.aNonlinear,
            state.bNonlinear
        ); // generate nonlinear revenue points

    } else {

        points = generatePlotPointsRevenueIncome(
            state.k,
            state.income
        ); // generate income-demand revenue points
    }

    let scaleYRevenue;

    if (state.demandType === "income") {

        const maxRevenue = 1100; // fixed scale for income demand

        scaleYRevenue =
            (canvasRevenue.height - marginBottom)
            / maxRevenue;

    } else {

        let maxRevenue = 0;

        for (let point of points) { // scan all points to find largest revenue value

            if (point.y > maxRevenue) {

                maxRevenue = point.y;
            }
        }

        scaleYRevenue =
            (canvasRevenue.height - marginBottom)
            / (maxRevenue * 1.1); // build y-axis scaling factor
    }

    const x =
        revenueMarginX + Q * scaleX; // convert quantity into canvas x-position

    const y =
        (canvasRevenue.height - marginBottom)
        - TR * scaleYRevenue; // convert revenue into canvas y-position

    ctxRevenue.beginPath(); // start new drawing path

    ctxRevenue.arc(
        x,
        y,
        4,
        0,
        Math.PI * 2
    ); // define circular hover dot

    ctxRevenue.fillStyle = "red"; // set hover dot colour

    ctxRevenue.fill(); // render hover dot

    ctxRevenue.fillStyle = getCanvasTheme().text; // use theme-aware text colour

    ctxRevenue.font = "12px Arial"; // configure label font

    ctxRevenue.fillText(
        `TR: £${TR.toFixed(2)}`,
        x + 10,
        y - 10
    ); // display revenue label beside dot
}



function getMouseQ(event) {

    const rect =
        canvasMain.getBoundingClientRect(); // get canvas position on page

    const mouseX =
        event.clientX - rect.left; // calculate mouse x-position inside canvas

    const Q =
        (mouseX - marginX) / scaleX; // convert pixels into quantity units

    return Math.max(
        0,
        Math.min(Q, maxQ)
    ); // clamp quantity within graph bounds
}



function getMouseQRevenue(event) {

    const rect =
        canvasRevenue.getBoundingClientRect(); // get revenue canvas position

    const mouseX =
        event.clientX - rect.left; // calculate mouse position inside revenue canvas

    const Q =
        (mouseX - revenueMarginX) / scaleX; // convert pixels into quantity units

    return Math.max(
        0,
        Math.min(Q, maxQ)
    ); // clamp quantity within graph bounds
}



function getDemandPrice(Q) {

    if (Q <= 0) return null; // reject invalid quantities

    if (state.demandType === "linear") {

        return (state.a - Q) / state.b; // linear demand equation

    } else if (state.demandType === "nonlinear") {

        return -(1 / state.bNonlinear)
            * Math.log(Q / state.aNonlinear); // nonlinear logarithmic demand

    } else {

        return state.k * state.income / Q; // income-based demand equation
    }
}



function calculatePED(Q, P) {

    if (!P || Q <= 0) return null; // reject invalid values

    if (state.demandType === "linear") {

        return -state.b * (P / Q); // linear elasticity formula

    } else if (state.demandType === "nonlinear") {

        return -state.bNonlinear * P; // nonlinear elasticity formula

    } else {

        return -1; // income demand is unit elastic
    }
}



function drawHoverOverlay(Q, P, PED) {

    drawCurves(); // redraw clean base graph before overlaying hover graphics

    const { x, y } = toCanvas(Q, P); // convert economic coordinates into canvas coordinates

    ctxMain.beginPath(); // start hover-dot path

    ctxMain.arc(
        x,
        y,
        4,
        0,
        Math.PI * 2
    ); // define circular hover marker

    ctxMain.fillStyle =
        getCanvasTheme().text; // use theme-aware hover colour

    ctxMain.fill(); // render hover dot

    ctxMain.beginPath(); // start guide-line path

    ctxMain.moveTo(
        x,
        canvasHeight - marginBottom
    ); // begin guide line at x-axis

    ctxMain.lineTo(x, y); // connect guide line to hover point

    ctxMain.strokeStyle =
        getCanvasTheme().guide; // set guide-line colour

    ctxMain.stroke(); // render guide line

    ctxMain.fillStyle =
        getCanvasTheme().text; // set PED text colour

    ctxMain.font =
        "12px Arial"; // configure PED label font

    if (PED !== null) {

        ctxMain.fillText(
            `PED: ${PED.toFixed(2)}`,
            x + 10,
            y - 10
        ); // display elasticity label beside hover point
    }
}

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
            var welfareLoss = calculateWelfareLossNonlinear(state.aNonlinear, state.bNonlinear, state.c, state.d);
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
        P_noTax,
        welfareLoss,
        deadweightLoss,
        priceReceived
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

function formatValue(value, element) {
    if(element.classList.contains("price")) {
        return typeof value === "number" ? `£${value.toFixed(2)}` : value;
    }
    return typeof value === "number" ? `${value.toFixed(2)} units` : value;
}

function setMetric(element, value, condition) {
        element.textContent = condition ? formatValue(value, element) : "";
}

function drawAxes(ctx, axisMarginX = marginX) {

    const theme = getCanvasTheme();

    ctx.beginPath();
    ctx.strokeStyle = theme.axis;
    ctx.lineWidth = 1;
    ctx.fillStyle = theme.axis;

    // Y-axis
    ctx.moveTo(axisMarginX, 0);
    ctx.lineTo(axisMarginX, canvasHeight - marginBottom);

    // X-axis
    ctx.moveTo(axisMarginX, canvasHeight - marginBottom);
    ctx.lineTo(canvasWidth, canvasHeight - marginBottom);

    ctx.stroke();

    const arrowSize = 6;

    // Y arrow
    ctx.beginPath();
    ctx.moveTo(axisMarginX, 0);
    ctx.lineTo(axisMarginX - arrowSize, arrowSize);
    ctx.lineTo(axisMarginX + arrowSize, arrowSize);
    ctx.closePath();
    ctx.fill();

    // X arrow
    ctx.beginPath();
    ctx.moveTo(canvasWidth, canvasHeight - marginBottom);
    ctx.lineTo(canvasWidth - arrowSize, canvasHeight - marginBottom - arrowSize);
    ctx.lineTo(canvasWidth - arrowSize, canvasHeight - marginBottom + arrowSize);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = theme.text;
    ctx.fillText("0", axisMarginX - 10, canvasHeight - marginBottom + 15);
}

function drawPointGuides(Q, P, labelP, labelQ, color = "gray") {

    const { x, y } = toCanvas(Q, P);

    ctxMain.setLineDash([5, 5]);
    ctxMain.strokeStyle = color;

    // vertical line
    ctxMain.beginPath();
    ctxMain.moveTo(x, canvasHeight - marginBottom);
    ctxMain.lineTo(x, y);
    ctxMain.stroke();

    // horizontal line
    ctxMain.beginPath();
    ctxMain.moveTo(marginX, y);
    ctxMain.lineTo(x, y);
    ctxMain.stroke();

    ctxMain.setLineDash([]);

    ctxMain.fillStyle = getCanvasTheme().text;
    ctxMain.font = "12px Arial";

    // Q label
    ctxMain.fillText(labelQ, x - 10, canvasHeight - marginBottom + 20);

    // P label
    ctxMain.fillText(labelP, marginX - 25, y + 5);
}

function drawRevenueGuides(Q, TR, color = "blue") {

    let points;

    if (state.demandType === "linear") {
        points = generatePlotPointsRevenueLinear(state.a, state.b);
    }
    else if (state.demandType === "nonlinear") {
        points = generatePlotPointsRevenueNonlinear(state.aNonlinear, state.bNonlinear);
    }
    else {
        points = generatePlotPointsRevenueIncome(state.k, state.income);
    }

    let scaleYRevenue;

    if (state.demandType === "income") {
        const maxRevenue = 1100;
        scaleYRevenue = (canvasRevenue.height - marginBottom) / maxRevenue;
    }
    else {
        let maxRevenue = 0;

        for (let point of points) {
            if (point.y > maxRevenue) {
                maxRevenue = point.y;
            }
        }

        scaleYRevenue =
            (canvasRevenue.height - marginBottom) / (maxRevenue * 1.1);
    }

    const x = revenueMarginX + Q * scaleX;
    const y = (canvasRevenue.height - marginBottom) - TR * scaleYRevenue;

    ctxRevenue.setLineDash([5, 5]);
    ctxRevenue.strokeStyle = color;

    // vertical guide
    ctxRevenue.beginPath();
    ctxRevenue.moveTo(x, canvasRevenue.height - marginBottom);
    ctxRevenue.lineTo(x, y);
    ctxRevenue.stroke();

    // horizontal guide
    ctxRevenue.beginPath();
    ctxRevenue.moveTo(revenueMarginX, y);
    ctxRevenue.lineTo(x, y);
    ctxRevenue.stroke();

    ctxRevenue.setLineDash([]);

    ctxRevenue.fillStyle = getCanvasTheme().text;
    ctxRevenue.font = "12px Arial";

    ctxRevenue.fillText("Qᵣ", x - 10, canvasRevenue.height - marginBottom + 15);
    ctxRevenue.fillText("TRₘₐₓ", revenueMarginX - 45, y + 5);
}


function labelCurve(points, text, color, right, up) {
    const index = Math.floor(points.length * 0.7);
    const point = points[index];

    const x = marginX + point.x * scaleX;
    const y = (canvasHeight - marginBottom) - point.y * scaleY;

    ctxMain.fillStyle = color;
    ctxMain.font = "14px Arial";

    ctxMain.fillText(text, x + right, y - up);
}

function drawCurves() {

    ctxMain.clearRect(0, 0, canvasWidth, canvasHeight);

    const theme = getCanvasTheme();

    // background
    ctxMain.fillStyle = theme.background;
    ctxMain.fillRect(0, 0, canvasWidth, canvasHeight);


    drawAxes(ctxMain);

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
            const x = marginX + point.x * scaleX;
            const y = (canvasHeight - marginBottom) - point.y * scaleY;

            if (first) {
                ctxMain.moveTo(x, y);
                first = false;
            } else {
                ctxMain.lineTo(x, y);
            }
        }

        ctxMain.stroke();
        if (state.mode === "demand") {

            //SUPPLY (always linear)
            if (i === 0) {
                let offsetX = -10;
                let offsetY = 30;
                if (state.d < 1.2) {
                    offsetX = -20;
                }
                if (state.d < 0.9) {
                    offsetX = -45
                }
                if (state.d < 0.5) {
                    offsetX = -70
                }
                if (state.d < 0.3 && state.c < 15) {
                    offsetX = 20;
                }
                if (state.c > 64) {
                    offsetX = -70;
                }

                labelCurve(points, "Supply (S)", "green", offsetX, offsetY);
            }

            //DEMAND
            if (i === 1) {
                if (state.demandType === "linear") {

                    let offsetX, offsetY;
                    if (state.a < 5) {
                        offsetX = 5;
                        offsetY = 10;
                    }
                    else {
                        if (state.b < 0.6) {
                            // flat demand
                            offsetX = 20;
                            offsetY = -20;
                            if (state.a > 80 && state.b < 0.2) {
                                offsetX = -90
                            }
                        }

                        else if (state.b > 1) {
                            offsetX = 20
                            offsetY = 5
                            if (state.a > 90) {
                                offsetY = 0
                            }
                        }

                        else {
                            offsetX = 20;
                            offsetY = -10;
                        }
                    }
                    if (state.a < 5 && state.b < 0.1) {
                        offsetX = 10
                        offsetY = -15
                    }



                    labelCurve(points, "Demand (D)", "blue", offsetX, offsetY);

                } else {
                    // fallback for nonlinear/income
                    labelCurve(points, "Demand (D)", "blue", 25, 0);
                }
            }

        } else {

            //SUPPLY (no tax)
            if (i === 0) {
                let offsetX = -10;
                let offsetY = 30;
                if (state.d < 1.2) {
                    offsetX = -20;
                }
                if (state.d < 0.9) {
                    offsetX = -45
                }
                if (state.d < 0.5) {
                    offsetX = -70
                }
                if (state.d < 0.3 && state.c < 15) {
                    offsetX = 20;
                }
                if (state.c > 64) {
                    offsetX = -70;
                }

                labelCurve(points, "Supply (S)", "green", offsetX, offsetY);
            }

            //SUPPLY WITH TAX (same slope as supply)
            if (i === 1) {
                let offsetX = 10;   // start more to the right (text is longer)
                let offsetY = -10;

                // slope-based adjustments (same logic as before but shifted right)

                if (state.d < 1.2) {
                    offsetX = -5;
                }

                if (state.d < 0.9) {
                    offsetX = -20;
                }

                if (state.d < 0.5) {
                    offsetX = -10;
                }

                //extra correction for large tax (curve shifts left → push label right)
                if (state.t > 10) {
                    offsetX += 20;
                }



                //edge case: high c (far right → shift back left)
                if (state.c > 3) {
                    offsetX = -200;
                    if (state.d < 0.5) {
                        offsetX = -160
                    }
                }
                if (state.c < 30 && state.d < 0.7) {
                    offsetX = 10;
                }
                if (state.c > 92) {
                    offsetY = 15;
                }
                if (state.d > 1.1) {
                    offsetX = -200;
                    offsetY = 0;
                }
                if (state.c === 13 && state.t === 50 && state.d === 0.7) {
                    offsetX = -190;
                }

                if (state.d < 0.1 && state.c > 90) {
                    offsetY = -15;
                }

                //compensate for longer label text
                offsetX += 15;

                labelCurve(points, "Supply with Tax (S + t)", "red", offsetX, offsetY);

            }

            //DEMAND
            if (i === 2) {
                if (state.demandType === "linear") {

                    let offsetX, offsetY;
                    if (state.a < 5) {
                        offsetX = 5;
                        offsetY = 10;
                    }
                    else {
                        if (state.b < 0.6) {
                            // flat demand
                            offsetX = 20;
                            offsetY = -20;
                            if (state.a > 80 && state.b < 0.2) {
                                offsetX = -90
                            }
                        }

                        else if (state.b > 1) {
                            offsetX = 20
                            offsetY = 5
                            if (state.a > 90) {
                                offsetY = 0
                            }
                        }

                        else {
                            offsetX = 20;
                            offsetY = -10;
                        }
                    }
                    if (state.a < 5 && state.b < 0.1) {
                        offsetX = 10
                        offsetY = -15
                    }

                    labelCurve(points, "Demand (D)", "blue", offsetX, offsetY);

                } else {
                    labelCurve(points, "Demand (D)", "blue", 5, 5);
                }
            }
        }

    }

    const { P, Q } = currentMetrics;

    if (P !== null && Q !== null) {
        drawPointGuides(Q, P, "P*", "Q*");
    }

    const { P_max, Q_max } = currentMetrics;

    if (
        state.mode === "demand" &&
        typeof P_max === "number" &&
        typeof Q_max === "number"
    ) {
        drawPointGuides(Q_max, P_max, "Pᵣ", "Qᵣ", "red");
    }

    if (state.mode === "supply") {

        //with tax (already computed)
        drawPointGuides(
            currentMetrics.Q,
            currentMetrics.P,
            "Pₜ",
            "Qₜ",
            "red"
        );

        //one-off no-tax equilibrium ONLY for drawing
        let P0, Q0;

        if (state.demandType === "linear") {
            [P0, Q0] = calculateEquilibriumLinear(
                state.a, state.b, state.c, state.d, 0
            );
        }
        else if (state.demandType === "nonlinear") {
            [P0, Q0] = approximateEquilibriumNonlinear(
                state.aNonlinear,
                state.bNonlinear,
                state.c,
                state.d,
                0
            );
        }
        else {
            [P0, Q0] = calculateEquilibriumIncome(
                state.income,
                state.k,
                state.c,
                state.d,
                0
            );
        }

        //draw it
        if (P0 !== null && Q0 !== null) {
            drawPointGuides(Q0, P0, "P₀", "Q₀", "black");
        }
    }

    const priceReceived = currentMetrics;

    if (state.t > 0) {
        const priceReceived = currentMetrics.priceReceived;
        const taxQuantity = currentMetrics.Q;

        if (
            typeof priceReceived === "number" &&
            typeof taxQuantity === "number"
        ) {
            drawPointGuides(
                taxQuantity,
                priceReceived,
                "Pₚ",
                "",
                "red"
            );
        }
    }

    ctxMain.fillStyle = getCanvasTheme().text;
    ctxMain.font = "14px Arial";

    // Price axis
    ctxMain.fillText("Price (P)", marginX - 65, 15);

    // Quantity axis
    ctxMain.fillText("Quantity (Q)", canvasWidth - 80, canvasHeight - marginBottom + 25)

}

function drawRevenue() {

    const theme = getCanvasTheme(); // get current light/dark theme colours

    let points; // will store revenue-curve coordinates



    // ------------------------------------------------------
    // Generate revenue points based on active demand type
    // ------------------------------------------------------

    if (state.demandType === "linear") {

        points =
            generatePlotPointsRevenueLinear(
                state.a,
                state.b
            ); // generate linear revenue curve points

    }
    else if (state.demandType === "nonlinear") {

        points =
            generatePlotPointsRevenueNonlinear(
                state.aNonlinear,
                state.bNonlinear
            ); // generate nonlinear revenue curve points

    }
    else {

        points =
            generatePlotPointsRevenueIncome(
                state.k,
                state.income
            ); // generate income-demand revenue points
    }



    // ------------------------------------------------------
    // Clear previous graph frame
    // ------------------------------------------------------

    ctxRevenue.clearRect(
        0,
        0,
        canvasRevenue.width,
        canvasRevenue.height
    ); // erase old graph contents



    // ------------------------------------------------------
    // Paint graph background
    // ------------------------------------------------------

    ctxRevenue.fillStyle =
        theme.background; // use theme-aware background colour

    ctxRevenue.fillRect(
        0,
        0,
        canvasRevenue.width,
        canvasRevenue.height
    ); // redraw graph background



    // ------------------------------------------------------
    // Draw graph axes
    // ------------------------------------------------------

    drawAxes(
        ctxRevenue,
        revenueMarginX
    ); // draw x/y axes with revenue-specific left margin



    // ------------------------------------------------------
    // Build vertical revenue scaling system
    // ------------------------------------------------------

    let scaleYRevenue; // converts revenue values into pixel heights



    // Income-demand uses fixed revenue scaling
    //
    if (state.demandType === "income") {

        const maxRevenue = 1100; // fixed graph ceiling

        scaleYRevenue =
            (canvasRevenue.height - marginBottom)
            / maxRevenue;

    }
    else {

        let maxRevenue = 0; // track largest revenue value



        // --------------------------------------------------
        // Find maximum revenue value in point set
        // --------------------------------------------------

        for (let point of points) {

            if (point.y > maxRevenue) {

                maxRevenue = point.y;
            }
        }



        // --------------------------------------------------
        // Convert revenue values into pixel scale
        // --------------------------------------------------

        scaleYRevenue =
            (canvasRevenue.height - marginBottom)
            / (maxRevenue * 1.1); // extra 10% padding at top
    }



    // ------------------------------------------------------
    // Begin revenue-curve drawing path
    // ------------------------------------------------------

    ctxRevenue.beginPath(); // start new curve path

    ctxRevenue.strokeStyle =
        "#c084fc"; // set curve colour

    ctxRevenue.lineWidth =
        2; // make curve thicker



    let first = true; // tracks first point in curve



    // ------------------------------------------------------
    // Trace revenue curve point-by-point
    // ------------------------------------------------------

    for (let point of points) {

        const x =
            revenueMarginX + point.x * scaleX; // convert quantity into x-position

        const y =
            (canvasRevenue.height - marginBottom)
            - point.y * scaleYRevenue; // convert revenue into y-position



        // First point initializes path
        //
        if (first) {

            ctxRevenue.moveTo(x, y); // move pen without drawing

            first = false;

        } else {

            ctxRevenue.lineTo(x, y); // connect current point to previous point
        }
    }



    // ------------------------------------------------------
    // Render revenue curve
    // ------------------------------------------------------

    ctxRevenue.stroke(); // draw visible curve

    ctxRevenue.lineWidth = 1; // reset line width for later drawing



    let P_max, Q_max; // will store revenue-maximizing coordinates



    // ------------------------------------------------------
    // Calculate revenue-maximizing coordinates
    // ------------------------------------------------------

    if (state.demandType === "linear") {

        [P_max, Q_max] =
            calculateRevenueMaximizingCoordinatesLinear(
                state.a,
                state.b
            ); // calculate linear revenue maximum

    }
    else if (state.demandType === "nonlinear") {

        [P_max, Q_max] =
            calculateRevenueMaximizingCoordinatesNonlinear(
                state.aNonlinear,
                state.bNonlinear
            ); // calculate nonlinear revenue maximum
    }
    else {

        // --------------------------------------------------
        // Income demand handled separately
        // --------------------------------------------------

        const R =
            state.k * state.income; // calculate constant total revenue

        const y =
            (canvasRevenue.height - marginBottom)
            - R * scaleYRevenue; // convert revenue into canvas position



        ctxRevenue.fillStyle =
            theme.text; // use theme-aware text colour

        ctxRevenue.font =
            "13px Arial"; // configure text font



        ctxRevenue.fillText(
            `TR = £${R.toFixed(2)}`,
            revenueMarginX + 10,
            y - 10
        ); // display constant revenue label



        return; // stop because income demand has no unique maximum
    }



    // ------------------------------------------------------
    // Calculate maximum total revenue
    // ------------------------------------------------------

    const TR_max =
        P_max * Q_max; // economic revenue formula



    // ------------------------------------------------------
    // Convert max-revenue point into canvas coordinates
    // ------------------------------------------------------

    const xMax =
        revenueMarginX + Q_max * scaleX;

    const yMax =
        (canvasRevenue.height - marginBottom)
        - TR_max * scaleYRevenue;



    // ------------------------------------------------------
    // Draw maximum-revenue marker
    // ------------------------------------------------------

    ctxRevenue.beginPath(); // start marker shape

    ctxRevenue.arc(
        xMax,
        yMax,
        5,
        0,
        Math.PI * 2
    ); // create circular marker

    ctxRevenue.fillStyle =
        "#60a5fa"; // marker colour

    ctxRevenue.fill(); // render marker



    // ------------------------------------------------------
    // Draw maximum-revenue label
    // ------------------------------------------------------

    ctxRevenue.fillStyle =
        theme.text; // use theme-aware text colour

    ctxRevenue.font =
        "12px Arial"; // configure label font

    ctxRevenue.fillText(
        `Max TR = £${TR_max.toFixed(2)}`,
        xMax + 10,
        yMax - 10
    ); // display revenue maximum label



    // ------------------------------------------------------
    // Draw guide lines to axes
    // ------------------------------------------------------

    drawRevenueGuides(
        Q_max,
        TR_max
    ); // add visual guides from max point to axes



    // ------------------------------------------------------
    // Draw axis labels
    // ------------------------------------------------------

    ctxRevenue.fillStyle =
        theme.text; // axis-label colour

    ctxRevenue.font =
        "14px Arial"; // axis-label font



    ctxRevenue.fillText(
        "Total Revenue (TR)",
        revenueMarginX - 130,
        15
    ); // y-axis label



    ctxRevenue.fillText(
        "Quantity (Q)",
        canvasRevenue.width - 80,
        canvasRevenue.height - marginBottom + 25
    ); // x-axis label
}

function retrievePointsNeededForPlotting(mode, demandType) {
    let points
    let pointsList = [];
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
        x: marginX + Q * scaleX,
        y: (canvasHeight - marginBottom) - P * scaleY
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

    if (state.demandType === "linear") {
        const [, Q0] = calculateEquilibriumLinear(
            state.a,
            state.b,
            state.c,
            state.d,
            0
        );

        drawCSLinear(state.a, state.b, P, Q);
        drawPS(state.c, state.d, P_p, Q);
        drawTaxRevenue(P, P_p, Q);
        drawDWLLinearTax(Q0, Q, state.a, state.b, state.c, state.d);
    }

    else if (state.demandType === "nonlinear") {
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
    }

    else {
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
    }
}

function drawCSLinear(a, b, P_eq, Q_eq) {
    const ctx = ctxMain;

    const EPSILON = 0.00001;
    const isVerticalDemand = Math.abs(b) < EPSILON;

    // Vertical demand case
    if (isVerticalDemand) {
        const topLeft = toCanvas(0, maxP);
        const topRight = toCanvas(Q_eq, maxP);
        const bottomRight = toCanvas(Q_eq, P_eq);
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

    // Normal case, including vertical supply
    const top = toCanvas(0, a / b);
    const eq = toCanvas(Q_eq, P_eq);
    const left = toCanvas(0, P_eq);

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
            // switch to axis (THIS is the only fix you needed)
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
    const [, Q_eq] = calculateEquilibriumLinear(a, b, c, d, 0);
    const [, Q_max] = calculateRevenueMaximizingCoordinatesLinear(a, b);

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

    const P_p_clipped = Math.max(0, P_p); // FIX

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
            // SWITCH TO AXIS
            const pt = toCanvas(Q, 0);
            ctxMain.lineTo(pt.x, pt.y);
        } else {
            // NORMAL SUPPLY
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
            const pt = toCanvas(Q, 0); // axis switch
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

    function Pd(Q) {
        return -(1 / b) * Math.log(Q / a);
    }

    if (Math.abs(d) === 0) {
        const Q = c;
        const P = Math.max(0, Pd(Q));
        return [P, Q];
    }

    function Ps(Q) {
        return (Q - c) / d + t;
    }

    function f(Q) {
        return Pd(Q) - Ps(Q);
    }

    let Q_low = 1e-6;
    let Q_high = a;

    let f_low = f(Q_low);

    if (f_low * f(Q_high) > 0) {
        const Qd0 = a;
        const Qs0 = c - d * t;
        return [0, Math.min(Qd0, Qs0)];
    }

    let Q_mid;

    for (let i = 0; i < 100; i++) {
        Q_mid = 0.5 * (Q_low + Q_high);

        const f_mid = f(Q_mid);

        if (Math.abs(f_mid) < 1e-6) {
            break;
        }

        if (f_low * f_mid < 0) {
            Q_high = Q_mid;
        } else {
            Q_low = Q_mid;
            f_low = f_mid;
        }
    }

    const Q = Q_mid;
    const P = Math.max(0, Ps(Q));

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
    const [, Q_max] = calculateRevenueMaximizingCoordinatesLinear(a, b);

    const P_d_at_Qmax = (a - Q_max) / b;
    const P_s_at_Qmax = (Q_max - c) / d;

    const base = Q_eq - Q_max;
    const height = P_d_at_Qmax - P_s_at_Qmax;

    if (base <= 0 || height <= 0) return 0;

    return 0.5 * base * height;
}

function calculateWelfareLossNonlinear(a, b, c, d) {
    const [, Q_eq] = approximateEquilibriumNonlinear(a, b, c, d, 0);
    const [, Q_max] = calculateRevenueMaximizingCoordinatesNonlinear(a, b);

    // No welfare loss if revenue-maximising output is not below equilibrium output
    if (Q_max >= Q_eq) {
        return 0;
    }

    // Inverse nonlinear demand: P = (ln(a) - ln(Q)) / b
    function demandIntegral(Q) {
        return (1 / b) * (Q * Math.log(a) - Q * Math.log(Q) + Q);
    }

    // Supply / marginal cost: P = (Q - c) / d
    function supplyIntegral(Q) {
        return (1 / d) * ((Q * Q) / 2 - c * Q);
    }

    const demandArea =
        demandIntegral(Q_eq) - demandIntegral(Q_max);

    const supplyArea =
        supplyIntegral(Q_eq) - supplyIntegral(Q_max);

    const welfareLoss = demandArea - supplyArea;

    return Math.max(0, welfareLoss);
}


function calculatePriceReceived(P, t) {
    return Math.max(0, P - t);
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

    const points = [];

    //handle vertical supply (d ≈ 0)
    if (Math.abs(d) < 0.00001) {
        for (let P = 0; P <= maxP; P += 1) {
            points.push({ x: c, y: P });
        }
        return points;
    }

    //normal case
    for (let P = 0; P <= maxP; P += 0.5) {
        const Q = c + d * P;

        //clip to graph bounds
        if (Q >= 0 && Q <= maxQ) {
            points.push({ x: Q, y: P });
        }
    }

    return points;
}


function generatePlotPointsSupplyWithTax(c, d, t) {

    const points = [];

    //handle vertical supply (d ≈ 0)
    if (Math.abs(d) < 0.00001) {
        for (let P = 0; P <= maxP; P += 1) {
            points.push({ x: c, y: P });
        }
        return points;
    }

    //normal case
    for (let P = 0; P <= maxP; P += 0.5) {
        const Q = c + d * (P - t);

        //clip to visible graph area
        if (Q >= 0 && Q <= maxQ) {
            points.push({ x: Q, y: P });
        }
    }

    return points;
}



function generatePlotPointsDemandLinear(a, b) {

    //HANDLE VERTICAL DEMAND
    if (Math.abs(b) < 0.00001) {
        return [
            { x: a, y: 0 },
            { x: a, y: maxP }  // vertical line
        ];
    }
    if (a / b > maxP) {
        return [
            { x: a, y: 0 },
            { x: a - b * maxP, y: maxP }
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

    for (let Q = 0; Q <= maxQ; Q += 0.5) {
        const P = (a - Q) / b;
        if (P < 0) {
            break; //prevents revenue from going negative on plot
        }
        const R = P * Q;
        points.push({ x: Q, y: R });
    }

    return points;
}

function generatePlotPointsRevenueNonlinear(a, b) {
    const points = [];

    for (let Q = 0.1; Q <= maxQ; Q += 0.2) {
        const P = -(1 / b) * Math.log(Q / a);
        if (P < 0) {
            break;
        }
        const R = P * Q;
        points.push({ x: Q, y: R });
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
        Q_noTax, P_noTax, priceReceived,
        welfareLoss,
        deadweightLoss
    } = metrics;

    const EPSILON = 0.00001;
    const isVerticalSupply = Math.abs(state.d) < EPSILON;

    function addInsight(text) {
        if (text && !insights.includes(text)) {
            insights.push(text);
        }
    }

    function finishInsights() {
        const fallbackInsights = [
            `Equilibrium is currently P = £${P.toFixed(2)} and Q = ${Q.toFixed(2)} units.`,
            `The selected demand type is ${state.demandType}.`,
            `Supply parameter c = ${state.c.toFixed(2)} represents the horizontal intercept of the supply curve.`,
            `Supply parameter d = ${state.d.toFixed(2)} represents the slope of the supply curve and determines supply responsiveness.`,
            state.mode === "demand"
                ? "Demand-side mode focuses on pricing, revenue, and welfare."
                : "Supply-side mode focuses on tax incidence, revenue, and efficiency."
        ];

        for (let insight of fallbackInsights) {

            if (insights.length >= 5) break;

            addInsight(insight);
        }

        return insights;
    }

    if (state.mode === "demand") {
        if (state.demandType === "linear") {
            if (state.b < 0.5 && state.a > 70) {
                addInsight(`Strong and elastic demand (b = ${state.b.toFixed(2)}, a = ${state.a.toFixed(2)}) leads to high revenue potential but large sensitivity to price changes.`);
            }

            if (typeof P_max === "number" && P_max - P > 0) {
                addInsight(`Revenue maximisation occurs at a higher price (£${P_max.toFixed(2)}) and lower quantity (${Q_max.toFixed(2)} units) than equilibrium (P = £${P.toFixed(2)}, Q = ${Q.toFixed(2)} units).`);
            }

            if (typeof P_max === "number" && (Q - Q_max) > 10) {
                addInsight(`Revenue maximisation significantly reduces output from ${Q.toFixed(2)} units to ${Q_max.toFixed(2)} units, indicating underproduction.`);
            }

            if (welfareLoss > 100 && state.b < 0.7) {
                addInsight(`Inelastic demand amplifies welfare loss (£${welfareLoss.toFixed(2)}) as low price sensitivity means price increases lead to small quantity changes and high revenue gains.`);
            }

            if (welfareLoss < 50 && state.b > 2) {
                addInsight(`Elastic demand (b = ${state.b.toFixed(2)}) limits welfare loss (£${welfareLoss.toFixed(2)}) as consumers are more responsive to price increases, limiting revenue potential from price hikes.`);
            }
            if (welfareLoss > 100 && state.d > 3) {
                addInsight(`Producers can supply additional units at relatively low cost, resulting in a large competitive equilibrium quantity. Because the revenue-maximising quantity is substantially lower than the welfare-maximising quantity, output restriction creates a significant welfare loss (£${welfareLoss.toFixed(2)}).`);
            }
            if (P_max === P) {
                addInsight(`The revenue maximising price is equal to the market equilibrium price.`);
            }
        }

        else if (state.demandType === "nonlinear") {
            if (state.bNonlinear > 1.5 && typeof P_max === "number") {
                addInsight(`High price sensitivity causes demand to fall rapidly, making revenue highly sensitive.`);
            }

            if (state.bNonlinear < 0.5 && typeof P_max === "number") {
                addInsight(`Low price sensitivity allows higher prices without large quantity reductions.`);
            }

            if (typeof P_max === "number" && (Q - Q_max) > 10) {
                addInsight(`Revenue maximisation reduces quantity from ${Q.toFixed(2)} units to ${Q_max.toFixed(2)} units under non-linear demand.`);
            }

            if (welfareLoss > 5) {
                addInsight(`Nonlinear demand creates welfare loss of £${welfareLoss.toFixed(2)} when output is restricted.`);
            }
            if (state.aNonlinear >= 90 && state.bNonlinear <= 0.05) {
                addInsight(`Due to low price sensitivity (b = ${state.bNonlinear.toFixed(2)}) and strong underlying demand (a = ${state.aNonlinear.toFixed(2)}), a large number of consumers remain willing to buy across a wide range of prices, resulting in substantial gains from trade. Consumers continue to derive value from the product even as prices increase, leading to large consumer and producer surplus areas at competitive equilibrium.`);
                if (welfareLoss > 100) {
                    addInsight(`A significant welfare loss (£${welfareLoss.toFixed(2)}) is present because output is restricted substantially below the competitive equilibrium level. Consumers continue to value the product even at higher prices, while efficient production allows firms to supply large quantities at relatively low cost. As a result, the competitive equilibrium generates substantial gains from trade, many of which are lost when output is restricted.`);
                }
            }
            if (state.aNonlinear >= 95 && state.bNonlinear >= 0.1) {
                addInsight(
                    "Demand is strong when prices are low, resulting in a large potential market. However, consumers are highly sensitive to price changes, causing quantity demanded to fall rapidly as prices increase. This limits firms' ability to sustain sales at higher prices."
                );

                if (welfareLoss > 0) {
                    addInsight(
                        "A welfare loss is present because the supply curve intersects the horizontal axis, allowing the competitive equilibrium quantity to exceed the revenue-maximising quantity. Even though demand falls quickly as prices rise, efficient enough supply means that additional trades would still create value in a competitive market."
                    );
                }
            }
            if (state.aNonlinear <= 25 && state.bNonlinear <= 0.03) {
                addInsight(
                    `This market has a small potential customer base (a = ${state.aNonlinear.toFixed(2)}), but the consumers who remain are relatively insensitive to price changes (b = ${state.bNonlinear.toFixed(2)}). Demand is limited in scale, yet it declines slowly as prices rise, resembling a niche product with loyal or high-value buyers.`
                );

                if (welfareLoss > 0) {
                    addInsight(
                        `A welfare loss (£${welfareLoss.toFixed(2)}) is present because the revenue-maximising output is below the competitive equilibrium quantity due to the relatively inelastic demand. Even though the market is small, consumers remain willing to pay relatively high prices, so restricting output still prevents mutually beneficial trades from taking place.`
                    );
                }
            }
            if (state.c > 30) {
                addInsight(
                    `The supply curve is shifted rightward due to the high intercept (c = ${state.c.toFixed(2)}), allowing producers to supply more units at any given price. This increases the competitive equilibrium quantity and creates additional opportunities for mutually beneficial trade.`
                );

                if (welfareLoss > 0) {
                    addInsight(
                        `The higher level of supply causes the competitive equilibrium quantity to exceed the revenue-maximising quantity by a larger margin. As a result, restricting output prevents many mutually beneficial trades from taking place, generating a significant welfare loss (£${welfareLoss.toFixed(2)}).`
                    );
                }
            }
            if (state.d >= 4) {
                addInsight(
                    `Supply is highly responsive in this scenario (d = ${state.d.toFixed(2)}), meaning producers can supply additional units at relatively low cost. This increases the competitive equilibrium quantity and allows more mutually beneficial trades to take place.`
                );

                if (welfareLoss > 0) {
                    addInsight(
                        `Because supply is efficient, the competitive equilibrium quantity is higher than the revenue-maximising quantity. Restricting output therefore eliminates many trades that would have created value for both consumers and producers, resulting in a significant welfare loss (£${welfareLoss.toFixed(2)}).`
                    );
                }
            }

            addInsight(`Demand sensitivity varies across the non-linear demand curve.`);
        }

        else {
            if (state.income >= 700) {
                addInsight(
                    `High income (£${state.income.toFixed(2)}) gives consumers strong purchasing power. Demand is higher at each price level, increasing equilibrium output and the total gains from trade.`
                );
            }

            if (state.income <= 300) {
                addInsight(
                    `Low income (£${state.income.toFixed(2)}) limits consumers' purchasing power. Even if consumers value the good, their budget restricts the quantity they are able to buy.`
                );
            }

            if (state.k >= 0.7) {
                addInsight(
                    `Consumers allocate a large share of their income to this good (k = ${state.k.toFixed(2)}), suggesting it is highly prioritised or essential. This increases demand and supports higher trade, although lower income may still limit output in the market.`
                );
            }

            if (state.k <= 0.3) {
                addInsight(
                    `Consumers allocate only a small share of income to this good (k = ${state.k.toFixed(2)}), suggesting it is less essential or lower priority. Demand remains limited even when income is available.`
                );
            }

            addInsight(
                `Revenue is constant in this demand model because total revenue equals k × income. As a result, there is no unique revenue-maximising price or quantity.`
            );
            addInsight(`There is no welfare loss from pricing decisions as a revenue maximising price does not exist.`);
            addInsight(`Income and preference share jointly determine quantity demanded.`);
        }
    }

    else {
        if (isVerticalSupply) {
            addInsight(`Supply is vertical, so quantity is fixed at Q = ${formatValue(Q)} units.`);
            addInsight(`The tax does not reduce quantity when supply is perfectly inelastic.`);
            addInsight(`There is no deadweight loss from the tax because output does not fall.`);
            addInsight(`The tax burden falls on producers through a lower price received.`);
            addInsight(`Consumer price remains determined by demand at the fixed quantity.`);

            return finishInsights();
        }
        const consumerBurden = P - P_noTax;
        const producerBurden = P_noTax - priceReceived;
        if (consumerBurden > producerBurden) {
            addInsight(`Consumers bear a larger share of the tax burden (£${consumerBurden.toFixed(2)}) than producers (£${producerBurden.toFixed(2)}).`);
        }
        else if (producerBurden > consumerBurden) {
            addInsight(`Producers bear a larger share of the tax burden (£${producerBurden.toFixed(2)}) than consumers (£${consumerBurden.toFixed(2)}).`);
        }
        if (state.demandType === "linear") {
            if (state.t > 10 && state.b < 0.5) {
                addInsight(`High tax with elastic demand sharply reduces quantity.`);
            }
            if (deadweightLoss > 10 && state.b < 0.7) {
                addInsight(`Elastic demand amplifies deadweight loss (£${deadweightLoss.toFixed(2)}).`);
            }

            if ((Q_noTax - Q) > 10 && state.t > 5) {
                addInsight(`Tax reduces quantity from ${Q_noTax.toFixed(2)} units to ${Q.toFixed(2)} units.`);
            }
            if (state.t) {
                addInsight(`Tax creates a wedge between consumer and producer prices.`);
            }
            if (state.b < 0.9 && state.t && consumerBurden > producerBurden) {
                addInsight(`Because demand is relatively elastic (b = ${state.b.toFixed(2)}), consumers are less responsive to changes in price, meaning producers can pass more of the tax onto the consumer without losing as many sales. As a result, consumers bear a larger share of the tax burden through higher prices (£${consumerBurden.toFixed(2)}), while producers bear a smaller share through lower after-tax prices (£${producerBurden.toFixed(2)}).`);
            }
            if (state.b > 1.5 && state.t && producerBurden > consumerBurden) {
                addInsight(`Because demand is relatively inelastic (b = ${state.b.toFixed(2)}), consumers are more responsive to changes in price, meaning producers cannot pass much of the tax onto the consumer without losing a significant number of sales. As a result, producers bear a larger share of the tax burden through lower after-tax prices (£${producerBurden.toFixed(2)}), while consumers bear a smaller share through higher prices (£${consumerBurden.toFixed(2)}).`);
            }
            if (state.d < 0.8 && state.t && producerBurden > consumerBurden) {
                addInsight(`Because supply is relatively inelastic (d = ${state.d.toFixed(2)}), producers cannot easily reduce quantity supplied in response to the tax, meaning they bear a larger share of the tax burden through lower after-tax prices (£${producerBurden.toFixed(2)}). Consumers bear a smaller share through higher prices (£${consumerBurden.toFixed(2)}).`);
            }
            if (state.d > 2 && state.t && consumerBurden > producerBurden) {
                addInsight(`Because supply is relatively elastic (d = ${state.d.toFixed(2)}), producers can easily reduce quantity supplied in response to the tax, meaning consumers bear a larger share of the tax burden through higher prices (£${consumerBurden.toFixed(2)}). Producers bear a smaller share through lower after-tax prices (£${producerBurden.toFixed(2)}).`);
            }
        }

        else if (state.demandType === "nonlinear") {
            if (state.t > 10 && state.bNonlinear > 1.5) {
                addInsight(`High tax (t = £${state.t.toFixed(2)}) and strong sensitivity (b = ${state.bNonlinear.toFixed(2)}) cause a large drop in quantity.`);
            }

            if (state.t > 10 && state.bNonlinear < 0.5) {
                addInsight(`Low price sensitivity (b = ${state.bNonlinear.toFixed(2)}) reduces the quantity impact of tax.`);
            }

            if (deadweightLoss > 10) {
                addInsight(`Taxation creates deadweight loss of £${deadweightLoss.toFixed(2)}.`);
            }

            if ((Q_noTax - Q) > 10 && state.t > 5) {
                addInsight(`Tax reduces output from ${Q_noTax.toFixed(2)} units to ${Q.toFixed(2)} units under nonlinear demand.`);
            }

            if (state.bNonlinear >= 0.1 && state.t) {
                addInsight(
                    `Demand is high at low prices but falls rapidly as price increases. Because consumers are highly price-sensitive, firms cannot pass much of the tax onto buyers without losing sales. Consumers absorb £${consumerBurden.toFixed(2)} of the tax through a higher price, while producers absorb £${producerBurden.toFixed(2)} through a lower after-tax price.`
                );
            }

            if (state.bNonlinear <= 0.05 && state.t) {
                addInsight(
                    `Demand remains strong even when prices rise. Because consumers are less price-sensitive, firms can pass more of the tax onto buyers without causing as large a fall in quantity demanded. Consumers absorb £${consumerBurden.toFixed(2)} of the tax through a higher price, while producers absorb £${producerBurden.toFixed(2)} through a lower after-tax price.`
                );
            }

            addInsight(`Taxation effects vary across the non-linear demand curve.`);
        }

        else {
            if (state.t > 20 && state.income < 150 && state.k < 0.3) {
                addInsight(`Low income (£${state.income.toFixed(2)}) and high tax (t = £${state.t.toFixed(2)}) sharply reduce consumption.`);
            }

            if (state.k > 0.5 && state.income > 500 && state.t < 20) {
                addInsight(`Strong preference (k = ${state.k.toFixed(2)}) and high income (£${state.income.toFixed(2)}) maintains consumption despite taxation.`);
            }

            if ((Q_noTax - Q) > 10) {
                addInsight(`Consumption falls significantly from ${Q_noTax.toFixed(2)} units to ${Q.toFixed(2)} units.`);
            }
            
            if (
                state.income >= 900
            ) {
                addInsight(
                    `High income (£${state.income.toFixed(2)}) gives consumers strong purchasing power, allowing the market to support a large volume of trade even after taxation. Consumers absorb £${consumerBurden.toFixed(2)} of the tax through a higher price, while producers absorb £${producerBurden.toFixed(2)} through a lower after-tax price.`
                );
            }

            if (
                state.d >= 3 && state.t
            ) {
                addInsight(
                    `Supply is highly responsive (d = ${state.d.toFixed(2)}), meaning producers can supply additional units at relatively low cost. This raises the no-tax equilibrium quantity, so taxation can eliminate a larger number of mutually beneficial trades and increase deadweight loss.`
                );
            }

            if (state.c > 30) {
                addInsight(
                    `The supply curve is shifted rightward due to the high intercept (c = ${state.c.toFixed(2)}). This raises the no-tax equilibrium quantity, so taxation can eliminate a larger number of mutually beneficial trades and increase deadweight loss.`
                );
            }

            if (state.income <= 150) {
                addInsight(
                    `Low income (£${state.income.toFixed(2)}) means the market starts from a smaller quantity of trade. The tax reduces output by ${quantityReduction.toFixed(2)} units, further restricting an already budget-constrained market.`
                );
            }

            if (state.income >= 800) {
                addInsight(
                    `High income (£${state.income.toFixed(2)}) creates a larger tax base because more units are traded. Even after the tax, the market supports relatively strong demand and higher tax revenue.`
                );
            }

            if (state.k >= 0.8) {
                addInsight(
                    `Consumers place a high priority on this good (k = ${state.k.toFixed(2)}), so the market supports a larger volume of trade. The tax reduces quantity, but the high spending share means demand remains relatively strong.`
                );
            }

            if (state.k <= 0.25) {
                addInsight(
                    `Because consumers allocate only a small share of income (k = ${state.k.toFixed(2)}) to this good, the market is smaller before the tax is applied. This limits both quantity traded and potential tax revenue.`
                );
            }
        }
    }

    return finishInsights();
}

function renderInsights() {
    const insights = generateInsights(state, currentMetrics);
    if(insights.length > 5) {
        let hasNumericalInfo
        for(let i = 0; i < insights.length; i++) {
            hasNumericalInfo = insights[i].split("(").length > 1 || insights[i].split("=").length > 1
            if(!hasNumericalInfo) {
                insights.splice(i, 1);
                i--;
            }
            if(insights.length <= 5) {
                break;
        }
    }
} //ensures that insights with specific numerical values are prioritised for display, while more general insights are deprioritised if there are too many insights (more than 5) to show.
    insightsContainer.innerHTML = insights.map(insight => `<p>${insight}</p>`).join("");

    // build conditional key / legend showing shaded areas and short explanations
    if (!insightsKeyContainer) return;

    const items = [];

    // Consumer surplus (blue) - shown when demand shading is drawn
    items.push({
        color: 'rgba(0,0,255,0.8)',
        label: 'Consumer Surplus',
        desc: 'Net benefit received by buyers: area under demand and above price, interpreted as the aggregate difference over all units purchased between the maximum amount the consumer is willing to pay and the actual price paid, approximated through integration.'
    });

    const P = currentMetrics.P;

    // Producer surplus (green)
    if (P > 0) {
        items.push({
            color: 'rgba(0,255,0,0.8)',
            label: 'Producer Surplus',
            desc: 'Net benefit received by buyers: area above supply and below price, interpreted as the aggregate difference over all units sold between minimum amount the producer is willing to sell for and the actual price received, approximated through integration.'
        });
    }

    const lostSurplus = state.mode === 'demand' ? currentMetrics.welfareLoss : currentMetrics.deadweightLoss;

    // Welfare loss / deadweight loss (red) - shown when relevant
    const showSurplusLoss = typeof lostSurplus === 'number' && lostSurplus > 0.0001;
    if (showSurplusLoss) {
        items.push({
            color: 'rgba(255,0,0,0.8)',
            label: 'Welfare / Deadweight Loss',
            desc: 'Total economic surplus (CS + PS + any income claimed by the government in the case of a tax) lost as a result of reduced market activity (such as taxation or other output restrictions), eliminating mutually beneficial trades between buyers and sellers.'
        });
    }

    // Tax revenue (orange) - only relevant in supply mode and when tax > 0
    if (state.mode === 'supply' && state.t > 0) {
        items.push({
            color: 'rgba(255,165,0,0.9)',
            label: 'Tax Revenue',
            desc: 'Revenue collected by the government, which is given by the level of taxation per unit multiplied by the quantity traded.'
        });
    }

    insightsKeyContainer.innerHTML = `
        <h3 class="insights-key-title">Shaded Areas Key</h3>
    ` + items.map(it => `
        <div class="insight-key-item">
            <span class="swatch" style="background:${it.color}"></span>
            <div>
                <strong>${it.label}</strong>
                <div class="insight-desc">${it.desc}</div>
            </div>
        </div>
    `).join('');
}

function changeParametersPreset(preset) {

    state.c = 0;
    state.d = 1;
    state.t = 0;
    state.b = 1;
    state.a = 50;
    state.aNonlinear = 50;
    state.bNonlinear = 0.2;
    state.income = 100;
    state.k = 0.5;

    if (preset === "demandModeLinearOne") {
        state.a = 80;
        state.b = 0.3;
    }
    else if (preset === "demandModeLinearTwo") {
        state.a = 50;
        state.b = 3;
    }
    else if (preset === "demandModeLinearThree") {
        state.a = 70;
        state.d = 5;
    }
    else if (preset === "demandModeLinearFour") {
        state.a = 70;
        state.b = 1;
    }
    else if (preset === "demandModeNonlinearOne") {
        // Strong Initial Demand
        state.aNonlinear = 100;
        state.bNonlinear = 0.03;
        state.c = 0;
        state.d = 3;
    }
    else if (preset === "demandModeNonlinearTwo") {
        // Rapid Demand Decay
        state.aNonlinear = 100;
        state.bNonlinear = 0.15;
        state.c = 0;
        state.d = 1;
    }
    else if (preset === "demandModeNonlinearThree") {
        // Niche Premium Market
        state.aNonlinear = 15;
        state.bNonlinear = 0.02;
        state.c = 0;
        state.d = 1;
    }
    else if (preset === "demandModeNonlinearFour") {
        // Efficient Production / Large Welfare Loss
        state.aNonlinear = 80;
        state.bNonlinear = 0.05;
        state.c = 0;
        state.d = 5;
    }
    else if (preset === "demandModeIncomeOne") {
        state.income = 1000;
        state.k = 0.9;
    }
    else if (preset === "demandModeIncomeTwo") {
        state.income = 150;
        state.k = 0.1;
    }
    else if (preset === "demandModeIncomeThree") {
        state.income = 1000;
        state.k = 0.1;
    }
    else if (preset === "demandModeIncomeFour") {
        state.income = 150;
        state.k = 0.9;
    }
    else if (preset === "supplyModeLinearOne") {
        state.a = 60;
        state.b = 0.4;
        state.t = 15;
    }
    else if (preset === "supplyModeLinearTwo") {
        state.a = 100;
        state.b = 3;
        state.t = 15;
    }
    else if (preset === "supplyModeLinearThree") {
        state.a = 60;
        state.b = 1;
        state.d = 0.3;
        state.t = 15;
    }
    else if (preset === "supplyModeLinearFour") {
        state.a = 60;
        state.b = 1;
        state.d = 5;
        state.t = 15;
    }
    else if (preset === "supplyModeNonlinearOne") {
        // Price-Sensitive Demand: producers absorb more of the tax
        state.aNonlinear = 100;
        state.bNonlinear = 0.15;
        state.c = 30;
        state.d = 1;
        state.t = 15;
    }
    else if (preset === "supplyModeNonlinearTwo") {
        // Price-Insensitive Demand: consumers absorb more of the tax
        state.aNonlinear = 100;
        state.bNonlinear = 0.01;
        state.c = 0;
        state.d = 1;
        state.t = 15;
    }
    else if (preset === "supplyModeNonlinearThree") {
        // Elastic Supply: tax is passed more easily to consumers
        state.aNonlinear = 80;
        state.bNonlinear = 0.06;
        state.c = 0;
        state.d = 5;
        state.t = 15;
    }
    else if (preset === "supplyModeNonlinearFour") {
        // Inelastic Supply: producers absorb more of the tax
        state.aNonlinear = 80;
        state.bNonlinear = 0.06;
        state.c = 0;
        state.d = 0.3;
        state.t = 15;
    }
    else if (preset === "supplyModeIncomeOne") {
        // Low Income, High Tax
        state.income = 150;
        state.k = 0.5;
        state.c = 0;
        state.d = 1;
        state.t = 15;
    }
    else if (preset === "supplyModeIncomeTwo") {
        // High Income, High Tax
        state.income = 1000;
        state.k = 0.5;
        state.c = 0;
        state.d = 1;
        state.t = 15;
    }
    else if (preset === "supplyModeIncomeThree") {
        // Essential Good, High Tax
        state.income = 400;
        state.k = 0.95;
        state.c = 0;
        state.d = 1;
        state.t = 15;
    }
    else if (preset === "supplyModeIncomeFour") {
        // Efficient Supply, High Tax
        state.income = 400;
        state.k = 0.5;
        state.c = 0;
        state.d = 5;
        state.t = 15;
    }
}

const weatherLocationElement = document.getElementById("weatherLocation");
const weatherTempElement = document.getElementById("weatherTemp");
const weatherWindElement = document.getElementById("weatherWind");

async function fetchWeather(lat, lon) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");

    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);
    url.searchParams.set("current", "temperature_2m,wind_speed_10m,weather_code");
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Weather API request failed");
    }

    return response.json();
}

function loadWeather() {
    if (!navigator.geolocation) {
        weatherLocationElement.textContent = "Weather unavailable";
        weatherTempElement.textContent = "Geolocation not supported";
        weatherWindElement.textContent = "";
        return;
    }

    weatherLocationElement.textContent = "Getting location...";
    weatherTempElement.textContent = "";
    weatherWindElement.textContent = "";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const data = await fetchWeather(lat, lon);

                if (!data.current) {
                    throw new Error("No current weather returned");
                }

                weatherLocationElement.textContent = "Current weather";
                weatherTempElement.textContent =
                    `Temp: ${Math.round(data.current.temperature_2m)}°C`;
                weatherWindElement.textContent =
                    `Wind: ${Math.round(data.current.wind_speed_10m)} km/h`;

                // ensure weather box shows the fetched data
                const wb = document.getElementById('weatherBox');
                if (wb) wb.style.display = '';

            } catch (error) {
                console.error(error);
                weatherLocationElement.textContent = "Weather unavailable";
                weatherTempElement.textContent = "Could not load weather";
                weatherWindElement.textContent = "";
                // show a friendly fallback message instead of hiding the box
                weatherLocationElement.textContent = "Weather unavailable";
                weatherTempElement.textContent = "Could not load weather";
                weatherWindElement.textContent = "";
            }
        },
        (error) => {
            console.error(error);
            // show a compact fallback when location is blocked
            weatherLocationElement.textContent = "Location blocked";
            weatherTempElement.textContent = "Allow location access";
            weatherWindElement.textContent = "";
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 600000
        }
    );
}

loadWeather();


