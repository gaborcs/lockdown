const d3 = Object.assign(
    {},
    require("d3-axis"),
    require("d3-format"),
    require("d3-scale"),
    require("d3-selection"),
    require("d3-shape"));

const padding = 48;

export function draw(simulatedStates, lockdownPeriod) {
    let lastDay = simulatedStates.length - 1;
    let svg = d3.select("svg");
    let boundingRect = svg.node().getBoundingClientRect();
    let svgWidth = boundingRect.width;
    let svgHeight = boundingRect.height;
    let xScale = d3.scaleLinear([0, lastDay], [padding, svgWidth - padding]);
    let yScale = d3.scaleLinear([0, 1], [svgHeight - padding, padding]);
    drawXAxis(svg, xScale);
    drawYAxis(svg, yScale);
    let line = d3.line()
        .x((v, i) => xScale(i))
        .y(yScale);
    let dl = (getValue, color) => {
        let values = simulatedStates.map(getValue);
        drawLine(svg, line(values), color);
    };
    dl(s => 1 - s.infected - s.recovered - s.dead, "orange");
    dl(s => s.infected, "blue");
    dl(s => s.recovered, "green");
    dl(s => s.dead, "red");
    drawLockdownIndicator(svg, xScale(lockdownPeriod.start));
    drawLockdownIndicator(svg, xScale(lockdownPeriod.end));
}

function drawXAxis(svg, xScale) {
    let svgHeight = svg.node().getBoundingClientRect().height;
    const xAxis = d3.axisBottom().scale(xScale);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${svgHeight - padding})`)
        .call(xAxis);
}

function drawYAxis(svg, yScale) {
    const yAxis = d3.axisLeft().scale(yScale).tickFormat(d3.format(".0%"));
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${padding},0)`)
        .call(yAxis);
}

function drawLine(svg, line, stroke) {
    svg.append("path")
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", stroke);
}

function drawLockdownIndicator(svg, x) {
    let svgHeight = svg.node().getBoundingClientRect().height;
    let g = svg.append("g");
    drawLock(g, x);
    drawLockdownLine(g, x, svgHeight);
}

function drawLock(container, x) {
    let rectWidth = 28;
    let rectHeight = 24;
    let g = container.append("g")
        .attr("transform", `translate(${x},${padding - rectHeight})`);
    let arc = d3.arc()
        .innerRadius(9)
        .outerRadius(12)
        .startAngle(-Math.PI/2)
        .endAngle(Math.PI/2);
    g.append("path")
        .attr("d", arc())
        .attr("fill", "gray")
    g.append("rect")
        .attr("x", -rectWidth/2)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .style("fill", "goldenrod");
}

function drawLockdownLine(container, x, svgHeight) {
    container.append("line")
        .attr("x1", x).attr("y1", padding)
        .attr("x2", x).attr("y2", svgHeight - padding)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "3 3");
}
