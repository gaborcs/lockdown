import {event as currentEvent} from 'd3-selection';

const d3 = Object.assign(
  {},
  require("d3-axis"),
  require("d3-drag"),
  require("d3-format"),
  require("d3-scale"),
  require("d3-selection"),
  require("d3-shape"));

const padding = 48;
const lockRectWidth = 28;
const lockRectHeight = 24;

const datasets = [
  { title: "Susceptible", color: "darkorange", getValue: s => 1 - s.infected - s.recovered - s.dead },
  { title: "Infected", color: "blue", getValue: s => s.infected },
  { title: "Recovered", color: "green", getValue: s => s.recovered },
  { title: "Dead", color: "red", getValue: s => s.dead }
];

let mousePos = [0, 0];

export function render(container, simulatedStates, lockdownPeriod, setLockdownPeriod) {
  let lastDay = simulatedStates.length - 1;
  let boundingRect = container.getBoundingClientRect();
  let width = boundingRect.width;
  let height = boundingRect.height;
  let scales = {
    x: d3.scaleLinear([0, lastDay], [padding, width - padding]).clamp(true),
    y: d3.scaleLinear([0, 1], [height - padding, padding])
  };
  let shouldRenderTooltip = padding <= mousePos[1] && mousePos[1] < height - padding;
  let highlightedDay = Math.round(scales.x.invert(mousePos[0]));
  let highlightedState = simulatedStates[highlightedDay];
  let containerSelection = d3.select(container);
  let svg = containerSelection.selectAll("svg")
    .data([null])
    .join("svg");
  svg
    .attr("width", "100%")
    .attr("height", "100%")
    .on("mousemove", () => {
      mousePos = d3.mouse(container);
      render(container, simulatedStates, lockdownPeriod, setLockdownPeriod);
    })
    .on("mouseleave", () => {
      mousePos = [0, 0];
      render(container, simulatedStates, lockdownPeriod, setLockdownPeriod);
    })
    .call(xAxis(scales))
    .call(yAxis(scales))
    .call(lines(simulatedStates, scales))
    .call(lockdownIndicators(lockdownPeriod, setLockdownPeriod, scales.x, height))
    .call(dayHighlighter(shouldRenderTooltip, scales.x(highlightedDay), height));
  containerSelection
    .call(tooltip(shouldRenderTooltip, highlightedDay, highlightedState, scales.x, mousePos[1]));
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
  let line = d3.line()
    .x((v, i) => scales.x(i))
    .y(scales.y);
  selection.selectAll(".line")
    .data(datasets)
    .join("path")
    .attr("class", "line")
    .style("fill", "none")
    .style("stroke", d => d.color)
    .attr("d", d => {
      let values = simulatedStates.map(d.getValue);
      return line(values);
    });
}

const lockdownIndicators = (lockdownPeriod, setLockdownPeriod, xScale, svgHeight) => selection => {
  function createXLink(key) {
    return {
      x: xScale(lockdownPeriod[key]),
      setX: newX => {
        let newLockdownPeriod = {
          ...lockdownPeriod,
          [key]: Math.round(xScale.invert(newX))
        };
        if (newLockdownPeriod.end < newLockdownPeriod.start) {
          newLockdownPeriod = {
            start: newLockdownPeriod.end,
            end: newLockdownPeriod.start
          };
        }
        setLockdownPeriod(newLockdownPeriod);
      }
    };
  }
  selection.selectAll(".lockdown-indicator")
    .data(["start", "end"])
    .join("g")
    .attr("class", "lockdown-indicator")
    .each(function (key) {
      d3.select(this).call(lockdownIndicator(createXLink(key), svgHeight));
    });
}

const lockdownIndicator = (xLink, svgHeight) => selection => {
  selection
    .call(lock(xLink))
    .call(lockdownLine(xLink.x, svgHeight));
}

const lock = xLink => selection => {
  let { x, setX } = xLink;
  selection.selectAll(".lock")
    .data([null])
    .join(
      enter => {
        let g = enter.append("g")
          .attr("class", "lock")
        let arc = d3.arc()
          .innerRadius(9)
          .outerRadius(12)
          .startAngle(-Math.PI / 2)
          .endAngle(Math.PI / 2);
        g.append("path")
          .attr("d", arc())
          .attr("fill", "gray")
        g.append("rect")
          .attr("x", -lockRectWidth / 2)
          .attr("width", lockRectWidth)
          .attr("height", lockRectHeight)
          .style("fill", "goldenrod");
        return g;
      }
    )
    .attr("transform", `translate(${x},${padding - lockRectHeight})`)
    .call(d3.drag().on("drag", () => {
      setX(currentEvent.x);
    }));
}

const lockdownLine = (x, svgHeight) => selection => {
  selection.selectAll("line")
    .data([null])
    .join("line")
    .attr("stroke", "black")
    .attr("stroke-dasharray", "3 3")
    .attr("x1", x).attr("y1", padding)
    .attr("x2", x).attr("y2", svgHeight - padding);
}

const dayHighlighter = (shouldRender, x, svgHeight) => selection => {
  selection.selectAll(".day-highlighter")
    .data(shouldRender ? [null] : [])
    .join("line")
    .attr("class", "day-highlighter")
    .attr("stroke", "lightgray")
    .attr("x1", x).attr("y1", padding)
    .attr("x2", x).attr("y2", svgHeight - padding);
}

const tooltip = (shouldRender, day, state, xScale, mouseY) => selection => {
  let tooltip = selection.selectAll(".tooltip")
    .data(shouldRender ? [null] : [])
    .join("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("top", mouseY + "px")
    .style("transform", "translateY(-50%)")
    .style("background", "white")
    .style("padding", "5px 10px")
    .style("border", "1px solid gray")
    .style("pointer-events", "none");
  if (day < xScale.domain()[1] / 2) {
    tooltip
      .style("left", `${xScale(day)}px`)
      .style("right", null)
  } else {
    tooltip
      .style("left", null)
      .style("right", `${padding + xScale.range()[1] - xScale(day)}px`)
  }
  let stats = datasets
    .map(({ title, color, getValue }) => ({ title, color, value: getValue(state) }))
    .sort((a, b) => b.value - a.value)
    .map(({ title, color, value }) => ({ text: `${title}: ${d3.format(".4%")(value)}`, color }));
  let lines = [{text: `Day ${day}`}].concat(stats);
  tooltip.selectAll("div")
    .data(lines)
    .join("div")
    .text(d => d.text)
    .style("color", d => d.color);
}
