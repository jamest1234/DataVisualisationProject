const w = 600;
const h = 600;

function parseDateString(dateString) {
    var split = dateString.split("/");
    var day = Number(split[0]);
    var month = Number(split[1]);
    var year = Number(split[2]);

    return new Date(year, month-1, day);
}

d3.csv("migrationovertime.csv", processCSV)
    .then(createFunnelChart);

function processCSV(d) {
    return {
        date: parseDateString(d.RefugeesDate),
        refugees: parseInt(d.NoRefugees),
    };
}

function createFunnelChart(dataset) {
    console.log(dataset);

    // TODO: make funnel chart
}