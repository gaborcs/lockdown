const d3 = Object.assign(
    {},
    require("d3-axis"),
    require("d3-format"),
    require("d3-scale"),
    require("d3-selection"),
    require("d3-shape"));

const padding = 48;
const lockRectWidth = 28;
const lockRectHeight = 24;

const lines = [
    { id: "susceptible-line", stroke: "orange", getValue: s => 1 - s.infected - s.recovered - s.dead },
    { id: "infected-line", stroke: "blue", getValue: s => s.infected },
    { id: "recovered-line", stroke: "green", getValue: s => s.recovered },
    { id: "dead-line", stroke: "red", getValue: s => s.dead }
];

export function draw() {
    let svg = d3.select("svg");
    drawXAxis(svg);
    drawYAxis(svg);
    for (let { id, stroke } of lines) {
        drawLine(svg, id, stroke);
    }
    drawLockdownIndicator(svg, "lockdown-indicator-start");
    drawLockdownIndicator(svg, "lockdown-indicator-end");
}

export function update(simulatedStates, lockdownPeriod) {
    let lastDay = simulatedStates.length - 1;
    let svg = d3.select("svg");
    let boundingRect = svg.node().getBoundingClientRect();
    let svgWidth = boundingRect.width;
    let svgHeight = boundingRect.height;
    let scales = {
        x: d3.scaleLinear([0, lastDay], [padding, svgWidth - padding]),
        y: d3.scaleLinear([0, 1], [svgHeight - padding, padding])
    };
    updateXAxis(scales);
    updateYAxis(scales);
    updateLines(simulatedStates, scales);
    updateLockdownIndicator("lockdown-indicator-start", scales.x(lockdownPeriod.start), svgHeight);
    updateLockdownIndicator("lockdown-indicator-end", scales.x(lockdownPeriod.end), svgHeight);
}

function drawXAxis(svg) {
    svg.append("g")
        .attr("id", "x-axis");
}

function updateXAxis(scales) {
    let g = d3.select("#x-axis");
    let axis = d3.axisBottom(scales.x);
    g.attr("transform", `translate(0,${scales.y(0)})`).call(axis);
}

function drawYAxis(svg) {
    svg.append("g")
        .attr("id", "y-axis");
}

function updateYAxis(scales) {
    let g = d3.select("#y-axis");
    let axis = d3.axisLeft(scales.y).tickFormat(d3.format(".0%"));
    g.attr("transform", `translate(${scales.x(0)},0)`).call(axis);
}

function drawLine(svg, id, stroke) {
    svg.append("path")
        .attr("id", id)
        .style("fill", "none")
        .style("stroke", stroke);
}

function updateLines(simulatedStates, scales) {
    let line = d3.line()
        .x((v, i) => scales.x(i))
        .y(scales.y);
    for (let { id, getValue } of lines) {
        let values = simulatedStates.map(getValue);
        d3.select("#" + id).attr("d", line(values));
    }
}

function drawLockdownIndicator(svg, id) {
    let g = svg.append("g")
        .attr("id", id);
    drawLock(g);
    drawLockdownLine(g);
}

function updateLockdownIndicator(id, x, svgHeight) {
    let g = d3.select("#" + id);
    updateLock(g, x);
    updateLockdownLine(g, x, svgHeight);
}

function drawLock(container) {
    let g = container.append("g")
        .attr("class", "lock");
    let arc = d3.arc()
        .innerRadius(9)
        .outerRadius(12)
        .startAngle(-Math.PI/2)
        .endAngle(Math.PI/2);
    g.append("path")
        .attr("d", arc())
        .attr("fill", "gray")
    g.append("rect")
        .attr("x", -lockRectWidth/2)
        .attr("width", lockRectWidth)
        .attr("height", lockRectHeight)
        .style("fill", "goldenrod");
}

function updateLock(container, x) {
    container.select(".lock")
        .attr("transform", `translate(${x},${padding - lockRectHeight})`);
}

function drawLockdownLine(container) {
    container.append("line")
        .attr("class", "lockdown-line")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "3 3");
}

function updateLockdownLine(container, x, svgHeight) {
    container.select(".lockdown-line")
        .attr("x1", x).attr("y1", padding)
        .attr("x2", x).attr("y2", svgHeight - padding)
}
