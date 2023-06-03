(function() {

const w = 600;
const h = 500;
const padding = 5;

function parseDateString(dateString) {
    var split = dateString.split("/");
    var day = Number(split[0]);
    var month = Number(split[1]);
    var year = Number(split[2]);

    return new Date(year, month-1, day);
}

const tooltip = document.createElement("div");
tooltip.classList.add("tooltip");

document.body.appendChild(tooltip);

function moveToolTip(e) {
    var svg = d3.select("#funnelchart");
    var bars = svg.selectAll("rect");

    var distanceComparator = function(d) {
        return Math.abs(d3.select(d).node().getBoundingClientRect().top - e.clientY);
    };

    var closestIndex = d3.scan(bars.nodes(), distanceComparator);
    var closestElement = bars.nodes()[closestIndex];

    var data = d3.select(closestElement).data()[0];
    
    tooltip.innerText = `Date: ${data.date.toLocaleDateString()}\nMigrants: ${data.refugees.toLocaleString()}`;

    tooltip.style.left = e.pageX+"px";
    tooltip.style.top = (e.pageY-tooltip.clientHeight)+"px";
    tooltip.style.display = "block";
}

function hideToolTip() {
    tooltip.style.display = "none";
}

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
    console.log(dataset);

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

    var yScale = d3.scaleBand()
        .domain(d3.range(dataset.length))
        .rangeRound([0, h])
        .paddingInner(0.05);

    var svg = d3.select("#funnelchart")
        .append("svg")
        .attr("viewBox", `0 0 ${w} ${h}`);

    svg.on("mouseover", moveToolTip);
    svg.on("mousemove", moveToolTip);
    svg.on("mouseleave", hideToolTip);

    
    colourFunc = d3.scaleLinear()
        .domain(d3.extent(dataset, function(d) { return d.refugees; }))
        .range(["#D4FC0A", "#FC870A"])
        .interpolate(d3.interpolateHcl);

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
}

function barMouseOver() {
    d3.select(this).attr("fill", "black");
}

function barMouseLeave() {
    d3.select(this).attr("fill", function(d) {
        return colourFunc(d.refugees);
    });
}

})();