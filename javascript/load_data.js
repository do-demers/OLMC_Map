
// d3.json("canada_long.json", function(error, data) {
//     debugger;
//     console.log(data); // this is your data
// // });


// d3.queue()
//     .defer(d3.json, "canada_long.json")
//      .awaitAll(makeMap); // when data arrives call makeMap function

function init() {
    loading();

    d3.queue()
        .defer(d3.csv, 'data/csd_breakdown.csv')
        .defer(d3.csv, 'data/prov_breakdown.csv')
        .defer(d3.json, 'data/census_div.json')
        .defer(d3.json, 'data/provincial.json')
        .await(makeMap);//only function name is needed
}
