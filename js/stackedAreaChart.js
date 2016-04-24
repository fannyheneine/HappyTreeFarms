
/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */
StackedAreaChart = function(_parentElement, _data) {

    // var stack = d3.layout.stack()
    //     			.values(function(d) { return d.values; })

    this.parentElement = _parentElement;
    // this.data = stack(_data);
    this.data = _data;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    console.log(this.data);



    this.initVis();
}



/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

StackedAreaChart.prototype.initVis = function() {
    var vis = this;
    // vis.area = d3.svg.area()
    // 	 .interpolate("cardinal")
    // 	 .x(function(d) { return vis.x(d.Year); })
    // 	 .y0(function(d) { return vis.y(d.y0); })
    // 	 .y1(function(d) { return vis.y(d.y0 + d.y); });


    vis.margin = {
        top: 40,
        right: 0,
        bottom: 60,
        left: 60
    };

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg_stacked = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // TO-DO: Overlay with path clipping
    vis.svg_stacked.append("defs").append("clipPath")
         .attr("id", "clip")
         .append("rect")
         .attr("width", vis.width)
         .attr("height", vis.height);


    // Scales and axes
    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain(d3.extent(vis.data, function(d) {
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
        .attr("class", "y-axis axis");

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


    var dataCategories = colorScale.domain();

    var transposedData = dataCategories.map(function(name) {
        return {
            name: name,
            values: vis.data.map(function(d) {
                return {
                    Year: d.Year,
                    y: d[name]
                };
            })
        };
    });

    var stack = d3.layout.stack()
        .values(function(d) {
            return d.values;
        });

    var stackedData = stack(transposedData);
    vis.stackedData = stackedData;

    console.log(stackedData);




    // TO-DO: Initialize stack layout



    // TO-DO: Stacked area layout
    // vis.area = d3.svg.area()
    //	...


    // TO-DO: Tooltip placeholder


    // TO-DO: (Filter, aggregate, modify data)
    vis.wrangleData();
}



/*
 * Data wrangling
 */

StackedAreaChart.prototype.wrangleData = function() {
    var vis = this;

    // In the first step no data wrangling/filtering needed
    vis.displayData = vis.stackedData;


    if (filtered == true) {
        var filterDomain = areachart.x.domain();
        for (i = 0; i < vis.stackedData.length; i++) {
            vis.stackedData[i].values.filter(function(d) {
                return ((d.Year >= filterDomain[0]) && (d.Year <= filterDomain[1]));
            })
        }
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