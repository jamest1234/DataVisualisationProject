(function() {

const w = 900;
const h = 600;
const padding = 10;

// create and append the tooltip element to the document
const tooltip = document.createElement("div");
tooltip.classList.add("tooltip");

document.body.appendChild(tooltip);

// move the tooltip to the mouse using a mouseover or mousemove event
function moveToolTip(e) {
    var arc = d3.select(this);

    arc.attr("stroke", "black");
    arc.attr("stroke-width", 5);

    var data = arc.data()[0].data;

    tooltip.innerHTML = "";

    // create the tooltip text
    countryText = document.createElement("b");
    countryText.innerText = data.country + ": ";
    tooltip.appendChild(countryText);
    tooltip.appendChild(document.createTextNode(data.refugees.toLocaleString()));

    // set the tooltip location to the mouse position
    tooltip.style.left = e.pageX+"px";
    tooltip.style.top = (e.pageY-tooltip.clientHeight)+"px";
    tooltip.style.display = "block";
}

// hide the tooltip when the mouse leaves the visualisation
function hideToolTip() {
    var arc = d3.select(this);

    arc.attr("stroke", null);
    arc.attr("stroke-width", null);

    tooltip.style.display = "none";
}

// read in the csv data
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

    // sort the data
    dataset.sort(function(a, b) {
        return b.refugees - a.refugees;
    });

    var outerRadius = Math.min(w, h) / 2;
    var innerRadius = 0;

    // create a D3 arc object
    var arc = d3.arc()
        .outerRadius(outerRadius-padding)
        .innerRadius(innerRadius);

    // create the pie object
    var pie = d3.pie()
        .value(function(d) { return d.refugees; });

    // create the svg element
    var svg = d3.select("#piechart")
        .append("svg")
        .attr("viewBox", `0 0 ${w} ${h}`);

    // create the arcs of pie
    var arcs = svg.selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    arcs.append("path")
        .attr("fill", function(d, i) { // use the colour scheme
            return colourFunc(i);
        })
        .attr("d", function(d, i) { // set the shape of each arc
            return arc(d, i);
        })
        .on("mouseover", moveToolTip)
        .on("mousemove", moveToolTip)
        .on("mouseleave", hideToolTip);

    // create circles for the legend
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", h + 40)
        .attr("cy", function(d, i) {
            return (outerRadius/2) + i*40;
        })
        .attr("r", 10)
        .attr("fill", function(d, i) {
            return colourFunc(i);
        });

    // create legend text
    svg.selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .attr("x", h + 60)
        .attr("y", function(d, i) {
            return (outerRadius/2) + i*40 + 6;
        })
        .attr("class", "pielegend")
        .text(function(d, i) {
            return "#" + (i+1) + " - " + d.country;
        });
}

})();