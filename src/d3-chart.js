import "./grabbable.css";
import {event as currentEvent} from 'd3-selection';

const d3 = Object.assign(
  {},
  require("d3-axis"),
  require("d3-format"),
  require("d3-scale"),
  require("d3-selection"),
  require("d3-shape"));

const paddingTop = 64;
const paddingLeft = 48;
const paddingRight = 48;
const paddingBottom = 48;
const lockRectWidth = 28;
const lockRectHeight = 24;
const lockdownArrowHeight = 16;

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
    x: d3.scaleLinear([0, lastDay], [paddingLeft, width - paddingRight]).clamp(true),
    y: d3.scaleLinear([0, 1], [height - paddingBottom, paddingTop])
  };
  let shouldRenderTooltip = paddingTop <= mousePos[1] && mousePos[1] < height - paddingBottom;
  let highlightedDay = Math.round(scales.x.invert(mousePos[0]));
  let highlightedState = simulatedStates[highlightedDay];
  let containerSelection = d3.select(container);
  let svg = containerSelection.selectAll("svg")
    .data([null])
    .join("svg");
  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
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
    .call(lockdownArrow(scales.x(lockdownPeriod.start), scales.x(lockdownPeriod.end)))
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
        let day = Math.round(xScale.invert(newX));
        let newLockdownPeriod = {
          ...lockdownPeriod,
          [key]: day
        };
        if (newLockdownPeriod.end < newLockdownPeriod.start) {
          newLockdownPeriod = {
            start: day,
            end: day
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
  let g = selection.selectAll(".lock")
    .data([null])
    .join(
      enter => {
        let g = enter.append("g")
          .attr("class", "lock grabbable")
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
          .style("fill", "goldenrod")
          .style("stroke", "gray");
        g.call(dragHandle);
        g.append("rect")
          .attr("class", "touch-target")
          .attr("x", "-24px")
          .attr("y", "-16px")
          .attr("width", "48px")
          .attr("height", "48px")
          .attr("opacity", 0)
        return g;
      }
    )
    .attr("transform", `translate(${x},${paddingTop - lockdownArrowHeight - lockRectHeight})`)
    .on("contextmenu", () => {
      currentEvent.preventDefault();
    })
    .on("touchstart", () => {
      g.classed("dragging", true);
      document.body.style.userSelect = "none";
      setX(currentEvent.touches[0].clientX);
    })
    .on("mousedown", () => {
      g.classed("dragging", true);
      document.body.style.userSelect = "none";
      setX(currentEvent.clientX);
    });
  updateTouchMoveListener(g.node(), event => {
    if (g.classed("dragging")) {
      setX(event.touches[0].clientX);
    }
  });
  updateMouseMoveListener(g.node(), event => {
    if (g.classed("dragging")) {
      setX(event.clientX);
    }
  });
  let stopDragging = () => {
    g.classed("dragging", false);
    document.body.style.userSelect = "auto";
  };
  updateTouchEndListener(g.node(), stopDragging);
  updateMouseUpListener(g.node(), stopDragging);
};

function updateTouchMoveListener(node, newListener) {
  window.removeEventListener("touchmove", node.touchMoveListener);
  node.touchMoveListener = newListener;
  window.addEventListener("touchmove", newListener);
}

function updateTouchEndListener(node, newListener) {
  window.removeEventListener("touchend", node.touchEndListener);
  node.touchEndListener = newListener;
  window.addEventListener("touchend", newListener);
}

function updateMouseMoveListener(node, newListener) {
  window.removeEventListener("mousemove", node.mouseMoveListener);
  node.mouseMoveListener = newListener;
  window.addEventListener("mousemove", newListener);
}

function updateMouseUpListener(node, newListener) {
  window.removeEventListener("mouseup", node.mouseUpListener);
  node.mouseUpListener = newListener;
  window.addEventListener("mouseup", newListener);
}

const dragHandle = selection => {
  let g = selection.append("g")
    .attr("transform", `translate(0,${lockRectHeight / 2})`)
    .attr("fill", "gray");
  g.append("line")
    .attr("y1", -7)
    .attr("y2", 7)
    .attr("stroke", "gray")
    .attr("stroke-width", 2);
  g.append("polygon")
    .attr("transform", "translate(-5,0)")
    .attr("points", "0,-4 -4,0 0,4");
  g.append("polygon")
    .attr("transform", "translate(5,0)")
    .attr("points", "0,-4 4,0 0,4");
}

const lockdownLine = (x, svgHeight) => selection => {
  selection.selectAll(".lockdown-line")
    .data([null])
    .join("line")
    .attr("class", "lockdown-line")
    .attr("stroke", "black")
    .attr("stroke-dasharray", "3 3")
    .attr("x1", x).attr("y1", paddingTop - lockdownArrowHeight)
    .attr("x2", x).attr("y2", svgHeight - paddingBottom);
}

const lockdownArrow = (x1, x2) => selection => {
  let size = 6;
  let g = selection.selectAll(".lockdown-arrow")
    .data([null])
    .join("g")
    .attr("class", "lockdown-arrow")
    .attr("transform", `translate(0,${paddingTop - lockdownArrowHeight / 2})`)
    .attr("stroke", "red");
  g.selectAll("line")
    .data([null])
    .join("line")
    .attr("x1", x1)
    .attr("x2", x2)
  let leftHead = [[x1 + size, -size], [x1, 0], [x1 + size, size]];
  let rightHead = [[x2 - size, -size], [x2, 0], [x2 - size, size]];
  g.selectAll("path")
    .data([leftHead, rightHead])
    .join("path")
    .attr("d", d3.line())
    .attr("fill", "none")
    .attr("stroke-width", "2px");
}

const dayHighlighter = (shouldRender, x, svgHeight) => selection => {
  selection.selectAll(".day-highlighter")
    .data(shouldRender ? [null] : [])
    .join("line")
    .attr("class", "day-highlighter")
    .attr("stroke", "lightgray")
    .attr("x1", x).attr("y1", paddingTop)
    .attr("x2", x).attr("y2", svgHeight - paddingBottom);
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
      .style("right", `${paddingRight + xScale.range()[1] - xScale(day)}px`)
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
