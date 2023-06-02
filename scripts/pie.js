(function() {

const w = 600;
const h = 600;
const padding = 10;

const tooltip = document.createElement("div");
tooltip.classList.add("tooltip");

document.body.appendChild(tooltip);

function moveToolTip(e) {
    var arc = d3.select(this);

    arc.attr("stroke", "black");
    arc.attr("stroke-width", 5);

    var data = arc.data()[0].data;
    
    tooltip.innerText = `${data.country}: ${data.refugees.toLocaleString()}`;

    tooltip.style.left = e.pageX+"px";
    tooltip.style.top = (e.pageY-tooltip.clientHeight)+"px";
    tooltip.style.display = "block";
}

function hideToolTip() {
    var arc = d3.select(this);

    arc.attr("stroke", null);
    arc.attr("stroke-width", null);

    tooltip.style.display = "none";
}

d3.csv("refugeecount.csv", processCSV)
    .then(createPieChart);

function processCSV(d) {
    return {
        country: d.Country,
        refugees: parseInt(d.Refugees),
    };
}

var colourFunc = d3.scaleOrdinal(d3.schemeCategory10);

function createPieChart(dataset) {
    var outerRadius = Math.min(w, h) / 2;
    var innerRadius = 0;

    var arc = d3.arc()
        .outerRadius(outerRadius-padding)
        .innerRadius(innerRadius);

    var pie = d3.pie()
        .value(function(d) { return d.refugees; });

    var svg = d3.select("#piechart")
        .append("svg")
        .attr("viewBox", `0 0 ${w} ${h}`);

    var arcs = svg.selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    arcs.append("path")
        .attr("fill", function(d, i) {
            return colourFunc(i);
        })
        .attr("d", function(d, i) {
            return arc(d, i);
        })
        .on("mouseover", moveToolTip)
        .on("mousemove", moveToolTip)
        .on("mouseleave", hideToolTip);
}

})();