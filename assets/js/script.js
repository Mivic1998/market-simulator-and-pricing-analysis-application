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

document.body.classList.remove("dark-mode");
localStorage.setItem("theme", "light");

darkModeToggle.textContent = "Dark Mode";

darkModeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const isDark =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );

    darkModeToggle.textContent =
        isDark ? "Light Mode" : "Dark Mode";

    displayAndStoreMetricValues();
    drawCurves();
    drawRevenue();
    renderInsights();
});

//e.target.innerText.split("-")[0].toLowerCase()
for (let button of modeButtons) {
    button.addEventListener("click", (e) => {
        const newMode = e.currentTarget.dataset.mode;
        if (state.mode === newMode && modeButtonClicked) {
            return;
        } else {
            state.mode = newMode;
            modeButtonClicked = true;

            // update active class so CSS shows which button is active
            for (let b of modeButtons) {
                b.classList.remove('active');
            }
            e.currentTarget.classList.add('active');

            displayAndStoreMetricValues();
            drawCurves();
            renderInsights();
        }

        if (state.mode === "demand") {
            state.t = 0;
            taxSlider.value = state.t;
            taxInput.value = state.t;
            drawRevenue()
            for (let element of supplyOnlyElements) {
                element.classList.remove("visible");
            }
            for (let element of demandOnlyElements) {
                element.classList.add("visible");
            }
        } else {
            for (let element of demandOnlyElements) {
                element.classList.remove("visible");
            }
            for (let element of supplyOnlyElements) {
                element.classList.add("visible");
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

    // respond to quick adjustments (arrow keys / spinner clicks) - update live without scrolling
    input.addEventListener('input', (e) => {
        const raw = e.target.value.trim();
        const value = Number(raw);
        if (raw === "" || isNaN(value)) return;
        for (let slider of sliders) {
            if (slider.id === e.target.id.replace("Value", "")) {
                slider.value = value;
                slider.dispatchEvent(new Event('input'));
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
        drawRevenue();
        renderInsights();
    });

    // when user finishes adjusting (releases the slider), scroll to the graph
   /* slider.addEventListener('change', () => {
        mainSection.scrollIntoView({ behavior: 'smooth' });
    })*/;
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

canvasMain.addEventListener("mousemove", handleMouseMove);
canvasMain.addEventListener("mouseleave", handleMouseLeave);

canvasRevenue.addEventListener("mousemove", handleRevenueMouseMove);
canvasRevenue.addEventListener("mouseleave", handleRevenueMouseLeave);

function handleMouseLeave() {

    drawCurves();
}

function handleRevenueMouseLeave() {
    drawRevenue(); // clears hover dot
}



displayAndStoreMetricValues();
modeButtons[0].click();
drawCurves();
drawRevenue();
renderInsights();

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
    const Q = getMouseQ(event);
    const P = getDemandPrice(Q);

    if (P === null || P < 0 || P > maxP) {
        drawCurves();
        return;
    }

    const PED = calculatePED(Q, P);

    drawHoverOverlay(Q, P, PED);
}

function handleRevenueMouseMove(event) {

    const Q = getMouseQRevenue(event);
    const P = getDemandPrice(Q);

    if (!P || P < 0 || P > maxP || state.demandType === 'income') {
        drawRevenue();
        return;
    }

    const TR = P * Q;

    // redraw base graph
    drawRevenue();

    // draw hover point on top
    drawRevenueOverlay(Q, TR);
}

function drawRevenueOverlay(Q, TR) {

    let points;

    if (state.demandType === 'linear') {
        points = generatePlotPointsRevenueLinear(state.a, state.b);
    } else if (state.demandType === 'nonlinear') {
        points = generatePlotPointsRevenueNonlinear(state.aNonlinear, state.bNonlinear);
    } else {
        points = generatePlotPointsRevenueIncome(state.k, state.income);
    }

    let scaleYRevenue;

    if (state.demandType === "income") {
        const maxRevenue = 1100;
        scaleYRevenue = (canvasRevenue.height - marginBottom) / maxRevenue;
    } else {
        let maxRevenue = 0;

        for (let point of points) {
            if (point.y > maxRevenue) {
                maxRevenue = point.y;
            }
        }

        scaleYRevenue = (canvasRevenue.height - marginBottom) / (maxRevenue * 1.1);
    }

    const x = revenueMarginX + Q * scaleX;
    const y = (canvasRevenue.height - marginBottom) - TR * scaleYRevenue;

    // red dot
    ctxRevenue.beginPath();
    ctxRevenue.arc(x, y, 4, 0, Math.PI * 2);
    ctxRevenue.fillStyle = "red";
    ctxRevenue.fill();

    // label
    ctxRevenue.fillStyle = getCanvasTheme().text;
    ctxRevenue.font = "12px Arial";
    ctxRevenue.fillText(`TR: ${TR.toFixed(2)}`, x + 10, y - 10);
}

function getMouseQ(event) {
    const rect = canvasMain.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;

    const Q = (mouseX - marginX) / scaleX;

    return Math.max(0, Math.min(Q, maxQ));
}

function getMouseQRevenue(event) {
    const rect = canvasRevenue.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;

    const Q = (mouseX - revenueMarginX) / scaleX;

    return Math.max(0, Math.min(Q, maxQ));
}

function getDemandPrice(Q) {
    if (Q <= 0) return null;

    if (state.demandType === "linear") {
        return (state.a - Q) / state.b;
    } else if (state.demandType === "nonlinear") {
        return -(1 / state.bNonlinear) * Math.log(Q / state.aNonlinear);
    } else {
        return state.k * state.income / Q;
    }
}

function calculatePED(Q, P) {
    if (!P || Q <= 0) return null;

    if (state.demandType === "linear") {
        return -state.b * (P / Q);
    } else if (state.demandType === "nonlinear") {
        return -state.bNonlinear * P;
    } else {
        return -1;
    }
}

function drawHoverOverlay(Q, P, PED) {
    drawCurves(); // redraw base graph first

    const { x, y } = toCanvas(Q, P);

    // dot
    ctxMain.beginPath();
    ctxMain.arc(x, y, 4, 0, Math.PI * 2);
    ctxMain.fillStyle = getCanvasTheme().text;
    ctxMain.fill();

    // vertical guide
    ctxMain.beginPath();
    ctxMain.moveTo(x, canvasHeight - marginBottom);
    ctxMain.lineTo(x, y);
    ctxMain.strokeStyle = getCanvasTheme().guide;
    ctxMain.stroke();

    // PED text
    ctxMain.fillStyle = getCanvasTheme().text;
    ctxMain.font = "12px Arial";

    if (PED !== null) {
        ctxMain.fillText(`PED: ${PED.toFixed(2)}`, x + 10, y - 10);
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

            // ✅ SUPPLY (always linear)
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

            // ✅ DEMAND
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

            // ✅ SUPPLY (no tax)
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

            // ✅ SUPPLY WITH TAX (same slope as supply)
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

                // ✅ extra correction for large tax (curve shifts left → push label right)
                if (state.t > 10) {
                    offsetX += 20;
                }



                // ✅ edge case: high c (far right → shift back left)
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

                // ✅ compensate for longer label text
                offsetX += 15;

                labelCurve(points, "Supply with Tax (S + t)", "red", offsetX, offsetY);

            }

            // ✅ DEMAND
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

        // ✅ with tax (already computed)
        drawPointGuides(
            currentMetrics.Q,
            currentMetrics.P,
            "Pₜ",
            "Qₜ",
            "red"
        );

        // ✅ one-off no-tax equilibrium ONLY for drawing
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

    ctxMain.fillStyle = getCanvasTheme().text;
    ctxMain.font = "14px Arial";

    // Price axis
    ctxMain.fillText("Price (P)", marginX - 65, 15);

    // Quantity axis
    ctxMain.fillText("Quantity (Q)", canvasWidth - 80, canvasHeight - marginBottom + 25)

}

function drawRevenue() {

    const theme = getCanvasTheme();

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

    ctxRevenue.clearRect(0, 0, canvasRevenue.width, canvasRevenue.height);

    ctxRevenue.fillStyle = theme.background;
    ctxRevenue.fillRect(0, 0, canvasRevenue.width, canvasRevenue.height);

    drawAxes(ctxRevenue, revenueMarginX);

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

    ctxRevenue.beginPath();
    ctxRevenue.strokeStyle = "#c084fc";
    ctxRevenue.lineWidth = 2;

    let first = true;

    for (let point of points) {
        const x = revenueMarginX + point.x * scaleX;
        const y = (canvasRevenue.height - marginBottom) - point.y * scaleYRevenue;

        if (first) {
            ctxRevenue.moveTo(x, y);
            first = false;
        } else {
            ctxRevenue.lineTo(x, y);
        }
    }

    ctxRevenue.stroke();
    ctxRevenue.lineWidth = 1;

    let P_max, Q_max;

    if (state.demandType === "linear") {
        [P_max, Q_max] = calculateRevenueMaximizingCoordinatesLinear(state.a, state.b);
    }
    else if (state.demandType === "nonlinear") {
        [P_max, Q_max] = calculateRevenueMaximizingCoordinatesNonlinear(
            state.aNonlinear,
            state.bNonlinear
        );
    }
    else {
        const R = state.k * state.income;
        const y = (canvasRevenue.height - marginBottom) - R * scaleYRevenue;

        ctxRevenue.fillStyle = theme.text;
        ctxRevenue.font = "13px Arial";
        ctxRevenue.fillText(`TR = ${R.toFixed(2)}`, revenueMarginX + 10, y - 10);

        return;
    }

    const TR_max = P_max * Q_max;

    const xMax = revenueMarginX + Q_max * scaleX;
    const yMax = (canvasRevenue.height - marginBottom) - TR_max * scaleYRevenue;

    ctxRevenue.beginPath();
    ctxRevenue.arc(xMax, yMax, 5, 0, Math.PI * 2);
    ctxRevenue.fillStyle = "#60a5fa";
    ctxRevenue.fill();

    ctxRevenue.fillStyle = theme.text;
    ctxRevenue.font = "12px Arial";
    ctxRevenue.fillText(`Max TR = ${TR_max.toFixed(2)}`, xMax + 10, yMax - 10);

    drawRevenueGuides(Q_max, TR_max);

    ctxRevenue.fillStyle = theme.text;
    ctxRevenue.font = "14px Arial";

    ctxRevenue.fillText("Total Revenue (TR)", revenueMarginX - 130, 15);

    ctxRevenue.fillText(
        "Quantity (Q)",
        canvasRevenue.width - 80,
        canvasRevenue.height - marginBottom + 25
    );
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

    const Pd_eq = a - b * P_eq === Q_eq ? P_eq : (a - Q_eq) / b;
    const MC_eq = (Q_eq - c) / d;

    return 0.5 * (Q_max - Q_eq) * (Pd_eq - MC_eq);
}

function calculateWelfareLossNonlinearRevenueMax(a, b, c, d) {

    const [, Q_eq] = approximateEquilibriumNonlinear(a, b, c, d, 0);

    const [, Q_max] = calculateRevenueMaximizingCoordinatesNonlinear(a, b);

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

    const points = [];

    // ✅ handle vertical supply (d ≈ 0)
    if (Math.abs(d) < 0.00001) {
        for (let P = 0; P <= maxP; P += 1) {
            points.push({ x: c, y: P });
        }
        return points;
    }

    // ✅ normal case
    for (let P = 0; P <= maxP; P += 0.5) {
        const Q = c + d * P;

        // ✅ clip to graph bounds
        if (Q >= 0 && Q <= maxQ) {
            points.push({ x: Q, y: P });
        }
    }

    return points;
}


function generatePlotPointsSupplyWithTax(c, d, t) {

    const points = [];

    // ✅ handle vertical supply (d ≈ 0)
    if (Math.abs(d) < 0.00001) {
        for (let P = 0; P <= maxP; P += 1) {
            points.push({ x: c, y: P });
        }
        return points;
    }

    // ✅ normal case
    for (let P = 0; P <= maxP; P += 0.5) {
        const Q = c + d * (P - t);

        // ✅ clip to visible graph area
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
        Q_noTax,
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
            `Equilibrium is currently P = ${formatValue(P)} and Q = ${formatValue(Q)}.`,
            `The selected demand type is ${state.demandType}.`,
            `Supply parameter c = ${formatValue(state.c)} affects the supply curve position.`,
            `Supply parameter d = ${formatValue(state.d)} affects supply responsiveness.`,
            state.mode === "demand"
                ? "Demand-side mode focuses on pricing, revenue, and welfare."
                : "Supply-side mode focuses on tax incidence, revenue, and efficiency."
        ];

        for (let insight of fallbackInsights) {
            addInsight(insight);
            if (insights.length >= 5) break;
        }

        return insights.slice(0, 5);
    }

    if (state.mode === "demand") {
        if (state.demandType === "linear") {
            if (state.b < 0.5 && state.a > 70) {
                addInsight(`Strong and elastic demand (b = ${state.b.toFixed(2)}, a = ${state.a.toFixed(2)}) leads to high revenue potential but large sensitivity to price changes.`);
            }

            if (state.b > 2 && state.a < 40) {
                addInsight(`Weak and inelastic demand (b = ${state.b.toFixed(2)}, a = ${state.a.toFixed(2)}) results in low quantity and limited response to pricing.`);
            }

            if (typeof P_max === "number") {
                addInsight(`Revenue maximisation occurs at a higher price (${P_max.toFixed(2)}) and lower quantity (${Q_max.toFixed(2)}) than equilibrium (P = ${P.toFixed(2)}, Q = ${Q.toFixed(2)}).`);
            }

            if (typeof P_max === "number" && (Q - Q_max) > 10) {
                addInsight(`Revenue maximisation significantly reduces output from ${Q.toFixed(2)} to ${Q_max.toFixed(2)}, indicating underproduction.`);
            }

            if (welfareLoss > 5 && state.b < 0.7) {
                addInsight(`Elastic demand amplifies welfare loss (${welfareLoss.toFixed(2)}) from restricting output.`);
            }

            if (welfareLoss < 2 && state.b > 2) {
                addInsight(`Inelastic demand limits welfare loss (${welfareLoss.toFixed(2)}).`);
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
                addInsight(`Revenue maximisation reduces quantity from ${Q.toFixed(2)} to ${Q_max.toFixed(2)} under nonlinear demand.`);
            }

            if (welfareLoss > 5) {
                addInsight(`Nonlinear demand creates welfare loss of ${welfareLoss.toFixed(2)} when output is restricted.`);
            }

            addInsight(`Demand sensitivity varies across the nonlinear demand curve.`);
        }

        else {
            addInsight(`Revenue is constant across prices due to fixed expenditure share.`);
            addInsight(`No unique revenue-maximising price exists under this demand structure.`);
            addInsight(`There is no welfare loss from pricing decisions.`);
            addInsight(`Income and preference share jointly determine quantity demanded.`);
        }
    }

    else {
        if (isVerticalSupply) {
            addInsight(`Supply is vertical, so quantity is fixed at Q = ${formatValue(Q)}.`);
            addInsight(`The tax does not reduce quantity when supply is perfectly inelastic.`);
            addInsight(`There is no deadweight loss from the tax because output does not fall.`);
            addInsight(`The tax burden falls on producers through a lower price received.`);
            addInsight(`Consumer price remains determined by demand at the fixed quantity.`);

            return finishInsights();
        }

        if (state.demandType === "linear") {
            if (state.t > 10 && state.b < 0.5) {
                addInsight(`High tax with elastic demand sharply reduces quantity.`);
            }

            if (state.t > 10 && state.b > 2) {
                addInsight(`With inelastic demand, a high tax causes a smaller quantity reduction.`);
            }

            if (deadweightLoss > 10 && state.b < 0.7) {
                addInsight(`Elastic demand amplifies deadweight loss (${deadweightLoss.toFixed(2)}).`);
            }

            if ((Q_noTax - Q) > 10 && state.t > 5) {
                addInsight(`Tax reduces quantity from ${Q_noTax.toFixed(2)} to ${Q.toFixed(2)}.`);
            }

            addInsight(`Tax creates a wedge between consumer and producer prices.`);
        }

        else if (state.demandType === "nonlinear") {
            if (state.t > 10 && state.bNonlinear > 1.5) {
                addInsight(`High tax and strong sensitivity cause a large drop in quantity.`);
            }

            if (state.t > 10 && state.bNonlinear < 0.5) {
                addInsight(`Low sensitivity reduces the quantity impact of tax.`);
            }

            if (deadweightLoss > 10) {
                addInsight(`Taxation creates deadweight loss of ${deadweightLoss.toFixed(2)}.`);
            }

            if ((Q_noTax - Q) > 10 && state.t > 5) {
                addInsight(`Tax reduces output from ${Q_noTax.toFixed(2)} to ${Q.toFixed(2)} under nonlinear demand.`);
            }

            addInsight(`Taxation effects vary across the nonlinear demand curve.`);
        }

        else {
            if (state.t > 10 && state.income < 50) {
                addInsight(`Low income and high tax sharply reduce consumption.`);
            }

            if (state.t > 10 && state.income > 100) {
                addInsight(`High income cushions the effect of tax.`);
            }

            if (state.k > 0.5 && state.t > 10) {
                addInsight(`Strong preference maintains consumption despite taxation.`);
            }

            if ((Q_noTax - Q) > 10) {
                addInsight(`Consumption falls significantly from ${Q_noTax.toFixed(2)} to ${Q.toFixed(2)}.`);
            }

            addInsight(`Demand depends on income, so tax affects purchasing power.`);
        }
    }

    return finishInsights();
}

function renderInsights() {
    const insights = generateInsights(state, currentMetrics);
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

    // Producer surplus (green)
    items.push({
        color: 'rgba(0,255,0,0.8)',
        label: 'Producer Surplus',
        desc: 'Net benefit received by buyers: area above supply and below price, interpreted as the aggregate difference over all units sold between minimum amount the producer is willing to sell for and the actual price received, approximated through integration.'
    });

    // Welfare loss / deadweight loss (red) - shown when relevant
    const showWelfare = (typeof currentMetrics.welfareLoss === 'number' && currentMetrics.welfareLoss > 0.0001) || state.mode === 'demand' || state.mode === 'supply';
    if (showWelfare) {
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


