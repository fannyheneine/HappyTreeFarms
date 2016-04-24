createMapVisualization();

function createMapVisualization() {
    var margin = { top: 10, right: 10, bottom: 10, left: 10 };
    var map_width = 900,
        map_height = 600,
        pie_width = 300,
        pie_height = 250,
        hbar_width = 400,
        hbar_height = 350;


    // INITIATE MAP
    //
    var svg_map = d3.select("#map-map").append("svg")
        .attr("width", map_width + margin.left + margin.right)
        .attr("height", map_height + margin.top + margin.bottom);

    var map_projection = d3.geo.mercator()
        .center([10, 40])
        .scale(map_width / 2 / Math.PI);

    var map_path = d3.geo.path()
        .projection(map_projection);

    var map_colorScale = d3.scale.category20();
    var pie_colorScale = d3.scale.category10();
    var hbar_colorScale = d3.scale.category10();

    var map_label = svg_map.append("g")
        .style("display", "none");

    var hover_yet = false;
    //


    //INITIATE PIE
    var radius = Math.min(pie_width, pie_height)/2;

    var pie_arc = d3.svg.arc()
        .outerRadius(radius - 20)
        .innerRadius(0);

    var pie_arc_big = d3.svg.arc()
        .outerRadius(radius)
        .innerRadius(0);

    var pie_label = d3.svg.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var pie_layout = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.percent; });

    var pie_key = function(d){ return d.category; };

    var svg_pie = d3.select("#map-bar").append("svg")
        .attr("width", pie_width + margin.left + margin.right)
        .attr("height", pie_height + margin.top + margin.bottom)
        .append("g");



    svg_pie.append('g')
        .attr("class", "slices")
    svg_pie.append("g")
        .attr("class", "labels");
    svg_pie.append("g")
        .attr("class", "lines");
    svg_pie
        .attr("transform", "translate(" + pie_width / 2 + "," + pie_height / 2 + ")");

    var curr_category;

    //INITIATE BARS
    //
    var svg_hbar = d3.select("#map-bar").append("svg")
        .attr("width", hbar_width + margin.left + margin.right)
        .attr("height", hbar_height + margin.top + margin.bottom)
        .append("g");

    var hbar_y = d3.scale.ordinal().rangeRoundBands([0, hbar_height], 0, 0);
    var hlabel_y = d3.scale.ordinal().rangeRoundBands([0, hbar_height], 1, 0.4);
    var himage_y = d3.scale.ordinal().rangeRoundBands([0, hbar_height], 0.25, 0.1);
    var hbar_x = d3.scale.linear().domain([0, 100]).range([100, hbar_width]);
    //


    // LOAD DATA and CALL createMap
    queue()
        .defer(d3.json, "data/world-110m.json")
        .defer(d3.json, "data/country_cuisine_map.json")
        .defer(d3.json, "data/cuisine_ingredient.json")
        .await(createMap);

    // DEFINE createMap
    function createMap(error, world_map, country_cuisine, cuisine_ingredient) {

        // PART I: World Map

        // SET UP LABEL
        map_label.append("text")
            .attr("class", "map-label cuisine")
            .style("font-size", 24)
            .attr("x", 0)
            .attr("y", 350);

        map_label.append("text")
            .attr("x", 0)
            .attr("y", 360)
            .attr("class", "detail");
        map_label.select(".detail")
            .append("tspan")
            .attr("x", 0)
            .attr("dy", 20)
            .attr("class", "map-label detail country");

        // DRAW MAP
        map_colorScale.domain(Object.keys(cuisine_ingredient));
        var map_countries = topojson.feature(world_map, world_map.objects.countries).features;

        svg_map.selectAll("countries")
            .data(map_countries)
            .enter().insert("path", ".graticule")
            .attr("class", "countries")
            .attr("d", map_path)
            .attr("fill", function (d) {
                var map_unavailable = (country_cuisine[d.id] == undefined || country_cuisine[d.id].cuisine == undefined)
                if (map_unavailable) {return "#eeeeee"}
                else {return map_colorScale(country_cuisine[d.id].cuisine)}
            })
            .on('mouseover', function (d, i) {
                var currentState = this;
                d3.select(this).style('fill-opacity', 0.6);
                var map_unavailable = (country_cuisine[d.id] == undefined || country_cuisine[d.id].cuisine == undefined)
                if (map_unavailable==false) {
                    showCuisine(d, world_map, country_cuisine, cuisine_ingredient);
                }

            })
            .on('mouseout', function (d, i) {
                d3.selectAll('path')
                    .style({
                        'fill-opacity': 1
                    });
            });

        svg_map.insert("path", ".graticule")
            .datum(topojson.mesh(world_map, world_map.objects.countries, function (a, b) {
                return a !== b;
            }))
            .attr("class", "boundary")
            .attr("d", map_path)


    }

    function showCuisine(country, world_map, country_cuisine, cuisine_ingredient) {

        var country_data = country_cuisine[country.id],
            cuisine_key = country_data.cuisine,
            cuisine_data = cuisine_ingredient[cuisine_key],
            category_data = cuisine_data.category_pct;

        //UPDATE CUISINE LABEL
        //
        map_label.style("display", null);

        map_label.select("text.cuisine")
            .text(underscore(cuisine_key))
            .attr("font-size", 24);
        map_label.select("tspan.country")
            .text("Country: " +  country_data.name)
            .attr("font-size", 20);
        //


        //UPDATE PIE
        //

        //var pie_path = pie_group.datum(category_data).selectAll("path")
        //    .data(pie_layout);
        //
        //pie_path
        //    .enter().append("path");
        //
        //
        if (hover_yet) {showIngredient(country, curr_category, cuisine_data);}
        //
        //pie_path
        //    .attr("class","pie")
        //    .attr("fill", function(d,i){ return pie_colorScale(i); })
        //    //.attr("fill", "transparent")
        //    //.attr("d", function(d) {
        //    //    if (d.data.category == curr_category) {return pie_arc_big}
        //    //    else {return pie_arc}
        //    //})
        //    .attr("d", pie_arc)
        //    .on('mouseover', function (d, i) {
        //        //console.log(d.data.category)
        //        //console.log(curr_category)
        //        d3.selectAll(".pie")
        //            .attr("d", pie_arc);
        //        d3.select(this)
        //            .attr("d", pie_arc_big);
        //        showIngredient(d, d.data.category, cuisine_data);
        //        });


        console.log(category_data)
        //pie_path.exit().remove();

        var pie_slice = svg_pie.select(".slices").selectAll("path.slice")
            .data(pie_layout(category_data));

        pie_slice.enter()
            .insert("path")
            .style("fill", function(d,i) {return pie_colorScale(i); })
            .attr("class", "slice");

        pie_slice
            .transition().duration(1000)
            .attrTween("d", function(d) {
                //console.log(d)
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    if (d.data.category == curr_category) {return pie_arc_big(interpolate(t));}
                    else {return pie_arc(interpolate(t));}
                };
            })

        pie_slice
            .on('mouseover', function (d, i) {
                //console.log(d.data.category)
                //console.log(curr_category)
                d3.selectAll(".pie")
                    .attr("d", pie_arc);
                d3.select(this)
                    .attr("d", pie_arc_big);
                showIngredient(d, d.data.category, cuisine_data);
            });

        pie_slice.exit()
            .remove();

    }


    function showIngredient(data, category, cuisine_data) {
        //console.log(cuisine_data);
        curr_category = category;
        var ingredient_data = cuisine_data[curr_category],
            ingredient_keys = Object.keys(ingredient_data);
        //console.log(ingredient_data);


        hbar_y.domain(ingredient_keys);
        hlabel_y.domain(ingredient_keys);
        himage_y.domain(ingredient_keys);

        hbar_colorScale.domain(ingredient_keys);

        var hbar = svg_hbar.selectAll("rect.hbar")
            .data(ingredient_data);
        hbar
            .enter().append("rect");
        hbar
            .transition()
            .duration(800)
            .attr("class", "hbar")
            .attr("fill", function(d, i) {return hbar_colorScale(i);})
            .attr("y", function(d, i) {return hbar_y(i);})
            .attr("height", hbar_y.rangeBand())
            .attr("x", 105)
            .attr("width", function(d) {return (hbar_x(d.num)); })


        var hbar_label = svg_hbar.selectAll("text.hbar-label")
            .data(ingredient_data);
        hbar_label
            .enter().append("text");
        hbar_label
            .transition()
            .duration(800)
            .attr("class", "hbar-label")
            .text(function(d) {
                return underscore(d.ingredient);
            })
            .attr("y", function(d, i) {return hlabel_y(i);})
            .attr("x", 100)
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "middle")
            .style("font-size", 16);


        var hbar_img = svg_hbar.selectAll("image.hbar-image")
            .data(ingredient_data);
        hbar_img
            .enter().append("image");
        hbar_img
            .transition()
            .duration(800)
            .attr("class", "hbar-image")
            .attr("xlink:href", function(d) {return "images/"+ d.ingredient +".png";})
            .attr("y", function(d, i) {return himage_y(i);})
            .attr("x", function(d) {return hbar_x(d.num)+55;})
            //.attr("align", "xMinYMid")
            .attr("width", 45)
            .attr("height", 45);

        //d3.select("#ingredient-image")
        //    .attr("src", "./images/" + selected_ingredient.replace(" ","_") + ".png")
        //    .attr("width","100")
        //    .attr("vspace","100px")


        hbar.exit().remove();
        hbar_label.exit().remove();
        hbar_img.exit().remove();

        hover_yet = true;
}

}

function commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function underscore(x) {
    return x.toString().replace(/_/g, " ");
}
