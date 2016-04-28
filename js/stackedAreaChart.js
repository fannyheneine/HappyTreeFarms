
/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */
StackedAreaChart = function(_parentElement, _data, country_chosen_st, _svgWidth) {

    // var stack = d3.layout.stack()
    //     			.values(function(d) { return d.values; })

    this.parentElement = _parentElement;
    // this.data = stack(_data);
    this.data = _data;
    this.displayData = []; // see data wrangling
    this.svgWidth=_svgWidth;

    // DEBUG RAW DATA

    this.initVis(country_chosen_st);
}

// Set ordinal color scale
var colorScale = d3.scale.category20();
var dataCategories;

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

var data_chosen;
var data_all_stacked;
var stackedData;

StackedAreaChart.prototype.initVis = function(country_chosen_st) {
    var vis = this;
    // vis.area = d3.svg.area()
    // 	 .interpolate("cardinal")
    // 	 .x(function(d) { return vis.x(d.Year); })
    // 	 .y0(function(d) { return vis.y(d.y0); })
    // 	 .y1(function(d) { return vis.y(d.y0 + d.y); });

    //console.log(vis.data)
    data_all_stacked=vis.data;

    for (i = 0; i < vis.data.length; i++){
        if (vis.data[i].country == country_chosen_st) {
            data_chosen = vis.data[i];
        }
    }

    //console.log(data_chosen.years)
    // Better to do it in main_stacked using a for loop
    /*data2.layers.forEach(function (d) {
     for (var column in d) {
     if (d.hasOwnProperty(column) && column == "Year") {
     d[column] = parseDate(d[column].toString());
     }
     }
     });*/


// Update color scale (all column headers except "Year")
// We will use the color scale for the stacked area chart
    colorScale.domain(d3.keys(data_chosen.layers[0]).filter(function(d){ return d != "Year"; }))

    vis.margin = {
        top: 20,
        right: 0,
        bottom: 20,
        left: 40
    };

    //vis.width = 800 - vis.margin.left - vis.margin.right;
    //vis.height = 400 - vis.margin.top - vis.margin.bottom;
    //

    // SVG drawing area
    vis.width = vis.svgWidth - vis.margin.left - vis.margin.right;
    vis.height = 0.6*vis.svgWidth - vis.margin.top - vis.margin.bottom;

    console.log("aaaaa", vis.width)

    //vis.width = vis.svg_stacked[0][0].parentElement.previousElementSibling.firstElementChild.clientWidth - vis.margin.left - vis.margin.right;
    //vis.height = vis.svg_stacked[0][0].parentElement.previousElementSibling.firstElementChild.clientHeight - vis.margin.top - vis.margin.bottom;
    //

    //vis.svg_stacked.attr("width", vis.width + vis.margin.left + vis.margin.right)


    //vis.svg_stacked = d3.selectAll(".stacked-area-chart2")
    //    .append("div")
    //    .classed("svg-container", true)
    //    .append("svg")
    //    //.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    //    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    //    .attr("viewbox", "0 0 1000 500")
    //    .attr("preserveAspectRatio", "xMinYMin meet")
    //    .classed("svg-content-responsive", true)
    //    .append("g")

    vis.svg_stacked = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Overlay with path clipping
    vis.svg_stacked.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);


    // Scales and axes
    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain(d3.extent(data_chosen.layers, function(d) {
            return d.Year;
        }));

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.svg_stacked.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg_stacked.append("g")
        .attr("class", "y-axis axis")
        .append("text")
        .attr("y", -20)
        .attr("dy", ".71em")
        .style("text-anchor", "left")
        .text("Food Supply Quantity in gr/capita/day ");;

    vis.area_stacked = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) {
            return vis.x(d.Year);
        })
        .y0(function(d) {
            return vis.y(d.y0);
        })
        .y1(function(d) {
            return vis.y(d.y0 + d.y);
        });


    dataCategories = colorScale.domain();

    var transposedData = dataCategories.map(function(name) {
        return {
            name: name,
            values: data_chosen.layers.map(function(d) {
                return {
                    Year: d.Year,
                    y: d[name]
                };
            })
        };
    });

    stack = d3.layout.stack()
        .values(function(d) {
            return d.values;
        });

    stackedData = stack(transposedData);
    vis.stackedData = stackedData;

    //console.log(stackedData);


    vis.displayData = vis.stackedData;


    vis.updateVis();
}



/*
 * Data wrangling
 */
var next_country;

StackedAreaChart.prototype.wrangleData = function(next_country) {
    var vis = this;
    //console.log(next_country)

    if(next_country==country_chosen_st) {
        vis.displayData = stackedData
    }
    else {

        for (i = 0; i < data_all_stacked.length; i++) {
            if (data_all_stacked[i].country == next_country) {
                data_chosen = data_all_stacked[i];
            }
            else if (data_all_stacked[i].country != next_country) {
                //console.log("NO DATA!")
                vis.displayData = 0;
            }
        }
        //console.log(data_chosen.years)

// Better to do it in main_stacked using a for loop
        /* data_chosen.layers.forEach(function (d) {
         for (var column in d) {
         if (d.hasOwnProperty(column) && column == "Year") {
         d[column] = parseDate(d[column].toString());
         }
         }
         });*/


        colorScale.domain(d3.keys(data_chosen.layers[0]).filter(function (d) {
            return d != "Year";
        }))

        dataCategories = colorScale.domain();

        var transposedData = dataCategories.map(function (name) {
            return {
                name: name,
                values: data_chosen.layers.map(function (d) {
                    return {
                        Year: d.Year,
                        y: d[name]
                    };
                })
            };
        });

        stack = d3.layout.stack()
            .values(function (d) {
                return d.values;
            });

        stackedData = stack(transposedData);
        vis.stackedData = stackedData;

        vis.displayData = vis.stackedData;
        country_chosen_st=next_country;


        // In the first step no data wrangling/filtering needed
    }


    // Wrangle data *****
    // console.log(vis.displayData);

    // for(i=0; i < vis.displayData.length; i++){
    // 	console.log(vis.displayData[i]);

    // 	for (j=0; j < 40; j++) {
    // 		console.log(vis.displayData[i].values[j].Year)
    // 	};

    // };


    // x.domain(d3.extent(data.map(function(d) { return d.date; })));
    // y.domain([0, d3.max(data.map(function(d) { return d.price; }))]);

    // Update the visualization
    vis.updateVis();
}




/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

StackedAreaChart.prototype.updateVis = function() {
    var vis = this;

    if (filtered == true) {
        var filterDomain = areachart.x.domain();
        for (i = 0; i < vis.stackedData.length; i++) {
            vis.stackedData[i].values.filter(function(d) {
                return ((d.Year >= filterDomain[0]) && (d.Year <= filterDomain[1]));
            })
        }
    }


    // Update domain
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d3.max(d.values, function(e) {
            return e.y0 + e.y;
        });
    })]);

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Draw the layers
    var categories = vis.svg_stacked.selectAll(".area")
        .data(vis.displayData);

    categories.enter().append("path")
        .attr("class", "area");

    categories
        .style("fill", function(d) {
            return colorScale(d.name);
        })
        .attr("d", function(d) {
            return vis.area_stacked(d.values);
        })

        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.name)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // TO-DO: Update tooltip text

    categories.exit().remove();


    // Call axis functions with the new domain
    vis.svg_stacked.select(".x-axis").call(vis.xAxis);
    vis.svg_stacked.select(".y-axis").call(vis.yAxis);

}