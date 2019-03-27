
// function makeChart(error, OLMC_data) {//first param is error and not data
//     console.log(OLMC_data);
//     console.log("everything ran");
//     debugger
// };

var wait;


function makeMap(error, csd_data, prov_data, csd_map, prov_map) {

    var temp = d3.select('input[name="breakdown"]:checked').property("value")
    var temp_map_data, temp_pop_data, prov_bool;

    if (temp === "provincial") {
        prov_bool = 1;
        temp_map_data = prov_map;
        temp_pop_data = prov_data;
    }else{
        temp_map_data = csd_map;
        temp_pop_data = csd_data;
        prov_bool = 0;
    }

    if (error) {
        console.log("*** ERROR LOADING FILES: " + error + " ***");
    }

    loading();
    wait = setTimeout(function () {
        renderMap(temp_map_data, temp_pop_data, prov_bool);
    }, 1);

    function renderMap(map_data, pop_data, prov_bool) {

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var width = 1100,
        height = 750,
        active = d3.select(null)
        ;

    var projection = d3.geoConicConformal()
            .parallels([33, 45])
            .rotate([96, -39])
            .fitSize([width, height], map_data);


        var zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);


    var path = d3.geoPath()
        .projection(projection);

    d3.selectAll("svg").remove()

    var svg = d3.select("#map_div")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "#f9f9f9")
                .on("click", stopped, true);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", reset);

    var g = svg.append("g");

    svg.call(zoom)

    g.append("g")
        .attr("class", "states")
        .style("stroke", "black")
        .style("stroke-width", "0.5px")
        .selectAll("path")
        .data(map_data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", function (d) {

            _.isUndefined(d.properties.CDUID) ? console.log(d.properties.PRNAME) : console.log(d.properties.CDNAME);

            return _.isUndefined(d.properties.CDUID) ? d.properties.PRNAME : d.properties.CDNAME;
        })
        .style("fill", function (d) {

            var temp2 = _.filter(pop_data, function (row, i) {
                return ((prov_bool === 1) ? row.pruid === d.properties.PRUID : row.cduid === d.properties.CDUID);
            });
            return (_.isEmpty(temp2) || temp2[0].OLMC_en === "N/A" || prov_bool === 1)? "#f9f9f9" : color(temp2[0].OLMC_en);

        })
        // .attr("tabindex", function (d,i) { return i;  })
        .on("focus", clicked);


        d3.select(self.frameElement).style("height", height + "px");

        loaded();

        function clicked(d) {

            if (active.node() === this) return reset();

            active.attr("class", "");
            active = d3.select(this).attr("class", "active");

            d3.selectAll("path")
                .style("stroke-width", "0.5px");

            d3.select(this)
                .style("stroke-width", "1.5px");


            var bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
                translate = [width / 2 - scale * x, height / 2 - scale * y];

            svg.transition()
                .duration(750)
                .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4

            var text = _.filter(pop_data, function (row, i) {
                return prov_bool === 1 ? row.pruid === d.properties.PRUID : row.cduid === d.properties.CDUID;
            })[0];


            var formatDecimalComma = d3.format(",.0f")

            if(prov_bool){
                d3.select("#csd_th_1").text("Province")
                //1st table, 2nd row
                d3.select("#name_csd").text("N/A")
                d3.select("#name_o_p").text(text["prov_name_en"])

                //1st table, 3rd row
                d3.select("#FOL_pop_csd").text("N/A")
                d3.select("#FOL_pop_o_p").text(formatDecimalComma(+text["FOL_prov_census_pop"]) + " (" + text["sh_FOL_prov_census_pop"] + ")")
                d3.select("#FOL_pop_can").text(formatDecimalComma(+text["FOL_can_census_pop"])+ " (" + text["sh_FOL_can_census_pop"] + ")")
                //1st table, 4th row
                d3.select("#name_csd").text("N/A")
                d3.select("#FOL_ps_pop_csd").text("N/A")
                d3.select("#FOL_ps_pop_o_p").text(formatDecimalComma(+text["FOL_prov_ps_pop"]) + " (" + text["sh_FOL_prov_ps_pop"] + ")")
                d3.select("#FOL_ps_pop_can").text(formatDecimalComma(+text["FOL_can_ps_pop"])+ " (" + text["sh_FOL_can_ps_pop"] + ")")
                //1st table, 5th row
                d3.select("#FOL_appl_csd").text("N/A")
                d3.select("#FOL_appl_o_p").text(formatDecimalComma(+text["FOL_prov_appl"]) + " (" + text["sh_FOL_prov_appl"] + ")")
                d3.select("#FOL_appl_can").text(formatDecimalComma(+text["FOL_can_appl"])+ " (" + text["sh_FOL_can_appl"] + ")")

                //2nd table, 2nd row
                d3.select("#k_name_csd").text("N/A")
                d3.select("#k_name_o_p").text(text["prov_name_en"])

                d3.select("#csd_th_2").text("Province")
                d3.select("#name_csd").text("N/A")
                d3.select("#name_o_p").text(text["prov_name_en"])
                //2nd table, 3rd row
                d3.select("#k_pop_csd").text("N/A")
                d3.select("#k_pop_o_p").text(formatDecimalComma(+text["prov_census_pop"])  + " (" + text["sh_prov_census_pop"] + ")")
                d3.select("#k_pop_can").text(formatDecimalComma(+text["can_census_pop"])+ " (" + text["sh_can_census_pop"] + ")")
                //2nd table, 4th row
                d3.select("#k_ps_pop_csd").text("N/A")
                d3.select("#k_ps_pop_o_p").text(formatDecimalComma(+text["prov_ps_pop"]) + " (" + text["sh_prov_ps_pop"] + ")")
                d3.select("#k_ps_pop_can").text(formatDecimalComma(+text["can_ps_pop"])+ " (" + text["sh_can_ps_pop"] + ")")
                //2nd table, 5th row
                d3.select("#k_appl_csd").text("N/A")
                d3.select("#k_appl_o_p").text(formatDecimalComma(+text["prov_appl"]) + " (" + text["sh_prov_appl"] + ")")
                d3.select("#k_appl_can").text(formatDecimalComma(+text["can_appl"])+ " (" + text["sh_can_appl"] + ")")

            }else{
                //1st table, 2nd row

                d3.select("#name_csd").text(text["cdname"])
                d3.select("#name_o_p").text(text["OLMC_en"])

                d3.select("#FOL_pop_csd").text(formatDecimalComma(+text["FOL_csd_census_pop"])+ " (" + text["sh_FOL_csd_census_pop"] + ")")
                d3.select("#FOL_pop_o_p").text(text["OLMC_en"] === "N/A" ? "N/A" : formatDecimalComma(+text["FOL_OLMC_census_pop"])+ " (" + text["sh_FOL_OLMC_census_pop"] + ")")
                d3.select("#FOL_pop_can").text(formatDecimalComma(+text["FOL_CAN_census_pop"])+ " (" + text["sh_FOL_CAN_census_pop"] + ")")
                //1st table, 2nd row
                d3.select("#csd_th_1").text("Official Language Minority Community")
                d3.select("#FOL_ps_pop_csd").text(formatDecimalComma(+text["FOL_csd_ps_pop"])+ " (" + text["sh_FOL_csd_ps_pop"] + ")")
                d3.select("#FOL_ps_pop_o_p").text(text["OLMC_en"] === "N/A" ? "N/A" : formatDecimalComma(+text["FOL_OLMC_ps_pop"]) + " (" + text["sh_FOL_OLMC_ps_pop"] + ")")
                d3.select("#FOL_ps_pop_can").text(formatDecimalComma(+text["FOL_CAN_ps_pop"])+ " (" + text["sh_FOL_CAN_ps_pop"] + ")")
                //1st table, 3rd row
                d3.select("#FOL_appl_csd").text(formatDecimalComma(+text["FOL_csd_appl"]) + " (" + text["sh_FOL_csd_appl"] + ")")
                d3.select("#FOL_appl_o_p").text(text["OLMC_en"] === "N/A" ? "N/A" : formatDecimalComma(+text["FOL_OLMC_appl"]) + " (" + text["sh_FOL_OLMC_appl"] + ")")
                d3.select("#FOL_appl_can").text(formatDecimalComma(+text["FOL_CAN_appl"])+ " (" + text["sh_FOL_CAN_appl"] + ")")

                //2nd table, 1st col
                d3.select("#k_name_csd").text(text["cdname"])
                d3.select("#k_name_o_p").text(text["OLMC_en"])

                d3.select("#k_pop_csd").text(formatDecimalComma(+text["csd_census_pop"])+ " (" + text["sh_csd_census_pop"] + ")")
                d3.select("#k_pop_o_p").text(text["OLMC_en"] === "N/A" ? "N/A" : formatDecimalComma(+text["OLMC_census_pop"])+ " (" + text["sh_OLMC_census_pop"] + ")")
                d3.select("#k_pop_can").text(formatDecimalComma(+text["CAN_census_pop"])+ " (" + text["sh_CAN_census_pop"] + ")")
                //2nd table, 2nd col
                d3.select("#csd_th_2").text("Official Language Minority Community")
                d3.select("#k_ps_pop_csd").text(formatDecimalComma(+text["csd_ps_pop"])+ " (" + text["sh_csd_ps_pop"] + ")")
                d3.select("#k_ps_pop_o_p").text(text["OLMC_en"] === "N/A" ? "N/A" : formatDecimalComma(+text["OLMC_ps_pop"])+ " (" + text["sh_OLMC_ps_pop"] + ")")
                d3.select("#k_ps_pop_can").text(formatDecimalComma(+text["CAN_ps_pop"])+ " (" + text["sh_CAN_ps_pop"] + ")")
                //2nd table, 3rd col
                d3.select("#k_appl_csd").text(formatDecimalComma(+text["csd_appl"])+ " (" + text["sh_csd_appl"] + ")")
                d3.select("#k_appl_o_p").text(text["OLMC_en"] === "N/A" ? "N/A" : formatDecimalComma(+text["OLMC_appl"])+ " (" + text["sh_OLMC_appl"] + ")")
                d3.select("#k_appl_can").text(formatDecimalComma(+text["CAN_appl"])+ " (" + text["sh_CAN_appl"] + ")")

            }
        }

        function reset() {


            d3.select(active).node()
                .style("stroke-width", "1px");

            active.classed("active", false);
            active = d3.select(null);

            svg.transition()
                .duration(750)
                .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4

        }

        function zoomed() {
            g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
            g.attr("transform", d3.event.transform); // updated for d3 v4
        }

        // If the drag behavior prevents the default click,
        // also stop propagation so we don?t click-to-zoom.
        function stopped() {
            if (d3.event.defaultPrevented) d3.event.stopPropagation();
        }

        d3.selectAll("input").on("change", function(){

            var temp = this.value;

            var new_map_data, new_pop_data, new_prov_bool;
            if (temp === "provincial") {
                new_prov_bool = 1;
                new_map_data = prov_map;
                new_pop_data = prov_data;

            }else{
                new_map_data = csd_map;
                new_pop_data = csd_data;
                new_prov_bool = 0;
                d3.select("#csd_th_1").text("Official Language Minority Community")
                d3.select("#csd_th_2").text("Official Language Minority Community")

            }

            d3.select("#name_csd").text("")
            d3.select("#name_o_p").text("")
            d3.select("#k_name_csd").text("")
            d3.select("#k_name_o_p").text("")

            d3.select("#FOL_pop_csd").text("")
            d3.select("#FOL_pop_o_p").text("")
            //1st table, 2nd row
            d3.select("#FOL_ps_pop_csd").text("")
            d3.select("#FOL_ps_pop_o_p").text("")
            //1st table, 3rd row
            d3.select("#FOL_appl_csd").text("")
            d3.select("#FOL_appl_o_p").text("")

            //2nd table, 1st col
            d3.select("#k_pop_csd").text("")
            d3.select("#k_pop_o_p").text("")
               //2nd table, 2nd col
            d3.select("#k_ps_pop_csd").text("")
            d3.select("#k_ps_pop_o_p").text("")
            //2nd table, 3rd col
            d3.select("#k_appl_csd").text("")
            d3.select("#k_appl_o_p").text("")


            loading();
            wait = setTimeout(function () {
                renderMap(new_map_data, new_pop_data, new_prov_bool);
            }, 1);

    });


    }
}

function loading() {
    d3.select("#loader").style("display", "");
}

function loaded() {
    d3.select("#loader").style("display", "none");
}