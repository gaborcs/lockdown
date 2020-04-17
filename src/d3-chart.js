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

export function render(simulatedStates, lockdownPeriod) {
    let lastDay = simulatedStates.length - 1;
    let svg = d3.select("svg");
    let boundingRect = svg.node().getBoundingClientRect();
    let svgWidth = boundingRect.width;
    let svgHeight = boundingRect.height;
    let scales = {
        x: d3.scaleLinear([0, lastDay], [padding, svgWidth - padding]),
        y: d3.scaleLinear([0, 1], [svgHeight - padding, padding])
    };
    svg
        .call(xAxis(scales))
        .call(yAxis(scales))
        .call(lines(simulatedStates, scales))
        .call(lockdownIndicators(lockdownPeriod, scales.x, svgHeight));
}

const xAxis = scales => selection => {
    let axis = d3.axisBottom(scales.x);
    selection.selectAll(".x-axis")
        .data([null])
        .join("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${scales.y(0)})`).call(axis);
}

const yAxis = scales => selection => {
    let axis = d3.axisLeft(scales.y).tickFormat(d3.format(".0%"));
    selection.selectAll(".y-axis")
        .data([null])
        .join("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${scales.x(0)},0)`).call(axis);
}

const lines = (simulatedStates, scales) => selection => {
    const data = [
        { stroke: "orange", getValue: s => 1 - s.infected - s.recovered - s.dead },
        { stroke: "blue", getValue: s => s.infected },
        { stroke: "green", getValue: s => s.recovered },
        { stroke: "red", getValue: s => s.dead }
    ];
    let line = d3.line()
        .x((v, i) => scales.x(i))
        .y(scales.y);
    selection.selectAll(".line")
        .data(data)
        .join("path")
        .attr("class", "line")
        .style("fill", "none")
        .style("stroke", d => d.stroke)
        .attr("d", d => {
            let values = simulatedStates.map(d.getValue);
            return line(values);
        });
}

const lockdownIndicators = (lockdownPeriod, xScale, svgHeight) => selection => {
    selection.selectAll(".lockdown-indicator")
        .data([lockdownPeriod.start, lockdownPeriod.end].map(xScale))
        .join("g")
        .attr("class", "lockdown-indicator")
        .call(lockdownIndicator(svgHeight))
}

const lockdownIndicator = svgHeight => selection => {
    selection
        .call(lock)
        .call(lockdownLine(svgHeight));
}

const lock = selection => {
    selection.selectAll(".lock")
        .data(x => [x])
        .join(
            enter => {
                let g = enter.append("g")
                    .attr("class", "lock")
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
                return g;
            }
        )
        .attr("transform", x => `translate(${x},${padding - lockRectHeight})`);
}

const lockdownLine = svgHeight => selection => {
    selection.selectAll("line")
        .data(x => [x])
        .join("line")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "3 3")
        .attr("x1", x => x).attr("y1", padding)
        .attr("x2", x => x).attr("y2", svgHeight - padding);
}
