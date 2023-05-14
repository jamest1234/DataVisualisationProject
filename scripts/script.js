const w = 600;
const h = 600;

d3.csv("refugeecount.csv", processCSV)
    .then(createPieChart);

function processCSV(d) {
    return {
        country: d.Country,
        refugees: parseInt(d.Refugees),
    };
}

function createPieChart(dataset) {
    var countries = [];
    var refugees = [];

    for (var i = 0; i < dataset.length; i++) {
        countries.push(dataset[i].country);
        refugees.push(dataset[i].refugees);
    }

    var outerRadius = w / 2;
    var innerRadius = 0;

    var arc = d3.arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius);

    var pie = d3.pie();

    var svg = d3.select("#visualisation")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var arcs = svg.selectAll("g.arc")
        .data(pie(refugees))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    var colour = d3.scaleOrdinal(d3.schemeCategory10);

    arcs.append("path")
        .attr("fill", function(d, i) {
            return colour(i);
        })
        .attr("d", function(d, i) {
            return arc(d, i);
        });

    arcs.append("title") // TODO: make this more fancy
        .text(function(d, i) {
            return countries[i] + ": " + d.value;
        })
}