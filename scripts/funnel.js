(function() {

const w = 600;
const h = 500;
const padding = 130;

// converts a string such as 29/01/2023 to a Date object
function parseDateString(dateString) {
    var split = dateString.split("/");
    var day = Number(split[0]);
    var month = Number(split[1]);
    var year = Number(split[2]);

    return new Date(year, month-1, day);
}

// create and append the tooltip element to the document
const tooltip = document.createElement("div");
tooltip.classList.add("tooltip");

document.body.appendChild(tooltip);

// move the tooltip to the mouse using a mouseover or mousemove event
function moveToolTip(e) {
    var svg = d3.select("#funnelchart");
    var bars = svg.selectAll("rect");

    // find the closest rect to the mouse
    var closestIndex = d3.scan(bars.nodes(), function(d) {
        return Math.abs(d3.select(d).node().getBoundingClientRect().top - e.clientY);
    });
    var closestElement = bars.nodes()[closestIndex];

    var data = d3.select(closestElement).data()[0];

    tooltip.innerHTML = "";

    var dateText = document.createElement("b");
    dateText.innerText = "Date: ";

    var migrantsText = document.createElement("b");
    migrantsText.innerText = "Migrants: ";


    // create the tooltip text
    tooltip.appendChild(dateText);
    tooltip.appendChild(document.createTextNode(data.date.toLocaleDateString()));
    tooltip.appendChild(document.createElement("br"));
    tooltip.appendChild(migrantsText);
    tooltip.appendChild(document.createTextNode(data.refugees.toLocaleString()));

    // set the tooltip location to the mouse position
    tooltip.style.left = e.pageX+"px";
    tooltip.style.top = (e.pageY-tooltip.clientHeight)+"px";
    tooltip.style.display = "block";
}

// hide the tooltip when the mouse leaves the visualisation
function hideToolTip() {
    tooltip.style.display = "none";
}

// read in the csv data
d3.csv("migrationovertime.csv", processCSV)
    .then(createFunnelChart);

function processCSV(d, i) {
    if (Math.round(i*2)/2 % 4 == 0) { // skip some data so bars are bigger
        return {
            date: parseDateString(d.RefugeesDate),
            refugees: parseInt(d.NoRefugees),
        };
    }
}

var colourFunc;

function createFunnelChart(dataset) {

    // create xScale object
    var xScale = d3.scaleLinear()
        .domain([
            d3.min(dataset, function(d) {
                return d.refugees;
            }),
            d3.max(dataset, function(d) {
                return d.refugees;
            }),
        ])
        .range([padding, w-padding]);

    // create yScale object
    var yScale = d3.scaleBand()
        .domain(d3.range(dataset.length))
        .rangeRound([0, h])
        .paddingInner(0.05);

    // create the svg element
    var svg = d3.select("#funnelchart")
        .append("svg")
        .attr("viewBox", `0 0 ${w} ${h}`);

    // bind mouse events to tooltip functions
    svg.on("mouseover", moveToolTip);
    svg.on("mousemove", moveToolTip);
    svg.on("mouseleave", hideToolTip);

    // scale the data's colour from green to orange linearly
    colourFunc = d3.scaleLinear()
        .domain(d3.extent(dataset, function(d) { return d.refugees; }))
        .range(["#D4FC0A", "#FC870A"])
        .interpolate(d3.interpolateHcl);

    
    // create the rectangles in the funnel chart
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            return Math.round((w-xScale(d.refugees))/2);
        })
        .attr("y", function(d, i) {
            return Math.round(yScale(i));
        })
        .attr("width", function(d) {
            return Math.round(xScale(d.refugees));
        })
        .attr("height", Math.round(yScale.bandwidth()/1.7))
        .attr("fill", function(d) {
            return colourFunc(d.refugees);
        })
        .on("mouseover", barMouseOver)
        .on("mousemove", barMouseOver)
        .on("mouseleave", barMouseLeave);

    // create text for showing the dates
    svg.selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", function(d, i) {
            return Math.round(yScale(i)+6);
        })
        .attr("class", "funneldate")
        .text(function(d) {
            return d.date.toLocaleDateString();
        })
        .filter(function(d, i) {
            return i % 4 != 0;
        })
        .attr("class", "hidden");

    const markerLabelY = Math.round(yScale(dataset.length-1)+20);

    function createMarker(position, text) {
        svg.append("line")
            .attr("x1", position)
            .attr("y1", 0)
            .attr("x2", position)
            .attr("y2", h)
            .attr("stroke", "black")
            .attr("stroke-dasharray", "10");

        svg.append("text")
            .attr("x", position+5)
            .attr("y", markerLabelY)
            .attr("class", "funnelmarkerlabel")
            .text(text);
    }

    const center = Math.round(w/2);
    const pos100k = Math.round((w+xScale(1e5))/2);
    const neg100k = Math.round((w-xScale(1e5))/2);
    const pos3mil = Math.round((w+xScale(1e6*3))/2);
    const neg3mil = Math.round((w-xScale(1e6*3))/2);
    const pos7mil = Math.round((w+xScale(1e6*7))/2);
    const neg7mil = Math.round((w-xScale(1e6*7))/2);

    // markers
    svg.append("line")
        .attr("x1", center)
        .attr("y1", 0)
        .attr("x2", center)
        .attr("y2", h)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "5");

    svg.append("text")
        .attr("x", center+5)
        .attr("y", markerLabelY)
        .attr("class", "funnelmarkerlabel")
        .text("0");
    
    createMarker(pos100k, "100k");
    createMarker(neg100k, "100k");
    createMarker(pos3mil, "3m");
    createMarker(neg3mil, "3m");
    createMarker(pos7mil, "7m");
    createMarker(neg7mil, "7m");
}

// fill the bar black when hovered over
function barMouseOver() {
    d3.select(this).attr("fill", "black");
}

// reset the bar colour when the mouse leaves
function barMouseLeave() {
    d3.select(this).attr("fill", function(d) {
        return colourFunc(d.refugees);
    });
}

})();