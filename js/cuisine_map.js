createMapVisualization()

function createMapVisualization() {
    var map_map_width_1 = 800,
        map_map_height_1 = 500,
        map_bar_width_1 = 400,
        map_bar_height_1 = 150,
        map_bar_width_2 = 400,
        map_bar_height_2 = 350;

    var svg_map_map = d3.select("#map-map").append("svg")
        .attr("width", map_map_width_1)
        .attr("height", map_map_height_1);

// INITIATE MAP
    var map_projection = d3.geo.mercator()
        .center([10,25])
        .scale( map_map_width_1 /2/ Math.PI);

    var map_path = d3.geo.path()
        .projection(map_projection);

    var map_colorScale_country = d3.scale.category20();
    var map_colorScale_ingredient = d3.scale.category10();


    var map_label = svg_map_map.append("g")
        .style("display", "none");

    var map_world_global, map_country_global, map_cuisine_global;


//INITIATE BARS

    var svg_map_bar1 = d3.select("#map-bar").append("svg")
        .attr("width", map_bar_width_1)
        .attr("height", map_bar_height_1)
        .append("g");

    var svg_map_bar2 = d3.select("#map-bar").append("svg")
        .attr("width", map_bar_width_2)
        .attr("height", map_bar_height_2)
        .append("g");


    var map_bar1_x = d3.scale.ordinal().rangeRoundBands([0, map_bar_width_1], 0);
    var map_bar1_y = d3.scale.linear().domain([0, 1]).range([map_bar_height_1,0]);
    var map_bar2_x = d3.scale.linear().domain([0, 1]).range([map_bar_width_2,0]);
    var map_bar2_y = d3.scale.ordinal().rangeRoundBands([0, map_bar_height_2], 0);

// LOAD Data and CALL Function
    queue()
        .defer(d3.json, "data/world-110m.json")
        .defer(d3.json, "data/country_cuisine_map.json")
        .defer(d3.json, "data/cuisine_ingredient.json")
        .await(createMap);


// DEFINE Function to Create World Map
    function createMap(error, world, country, cuisine) {

        map_world_global = world;
        map_country_global = country;
        map_cuisine_global = cuisine;

        //
        // PART I: World Map
        //

        // SET UP LABEL FOR CHOROPLETH
        map_label.append("text")
            .attr("class", "label country")
            .style("font-size", 24)
            .attr("x", 0)
            .attr("y", 300);

        map_label.append("text")
            .attr("x", 0)
            .attr("y", 310)
            .attr("class", "label detail");
        map_label.select(".detail")
            .append("tspan")
            .attr("x", 0)
            .attr("dy", 20)
            .attr("class", "label detail Cuisine");
        map_label.select(".detail")
            .append("tspan")
            .attr("x", 0)
            .attr("dy", 20)
            .attr("class", "label detail Recipe_Count");

        map_colorScale_country.domain(Object.keys(map_cuisine_global));

        var map_countries = topojson.feature(map_world_global, map_world_global.objects.countries).features;

        svg_map_map.selectAll("countries")
            .data(map_countries)
            .enter().insert("path", ".graticule")
            .attr("class", "countries")
            .attr("d", map_path)
            .attr("fill", function(d) {
                var map_country_key = d.id;
                if (map_country_global[map_country_key]==undefined || map_country_global[map_country_key].cuisine==undefined) {return "#eeeeee"}
                else {return map_colorScale_country(map_country_global[map_country_key].cuisine)}
            })
            .on('mouseover', function(d, i) {
                var currentState = this;
                d3.select(this).style('fill-opacity', 0.4);
                showInfo(d);
            })
            .on('mouseout', function(d, i) {
                d3.selectAll('path')
                    .style({
                        'fill-opacity':1
                    });
            });
        svg_map_map.insert("path", ".graticule")
            .datum(topojson.mesh(map_world_global, map_world_global.objects.countries, function (a, b) {
                return a !== b;
            }))
            .attr("class", "boundary")
            .attr("d", map_path);


    }

    function showInfo(d) {
        var country_data = map_country_global[d.id],
            cuisine_key = country_data.cuisine,
            cuisine_data = map_cuisine_global[cuisine_key];

        if (country_data != undefined && cuisine_key != undefined) {
            map_label.style("display", null);

            map_label.select("text.country")
                .text(cuisine_key);
            map_label.select("tspan.Cuisine")
                .text("Country: " +  country_data.name);
            map_label.select("tspan.Recipe_Count")
                .text("Available Recipes: " + commas(cuisine_data.n_recipes));

            //
            //PART II: Bars at the bottom
            //

            var group = "condiment";
            var ingredient_data = cuisine_data[group];
            var n_recipes = cuisine_data.n_recipes;
            //console.log(ingredient_data);

            console.log(cuisine_data);
            console.log(ingredient_data);

            map_bar2_y.domain(["salt", "olive oil", "garlic", "sugar", "butter", "pepper"]);
            map_colorScale_ingredient.domain(["salt", "olive oil", "garlic", "sugar", "butter", "pepper"]);

            var bar_map = svg_map_bar2.selectAll(".bar")
                .data(ingredient_data);

            bar_map
                .enter().append("rect")

            bar_map
                .attr("class", "bar")
                .attr("y", function(d) {return map_bar2_y(d.ingredient);})
                .attr("height", map_bar2_y.rangeBand())
                .attr("x", 0)
                .attr("width", function(d) {return (map_bar2_x(d.num/n_recipes)); })
                .attr("fill", function(d) {
                    return map_colorScale_ingredient(d.ingredient);
                });


            svg_map_bar2.selectAll("text.bar-label")
                .data(ingredient_data)
                .enter()
                .append("text")
                .attr("class", "bar-label")
                .text(function(d) {
                    return d.ingredient;
                })
                .attr("y", function(d, i) {
                    return 40+i*(map_bar_height_2/6);
                })
                .attr("x", 0)
                .attr("text-anchor", "start")
                .style("font-size", 16)

            bar_map.exit().remove();
        }
    }


    function commas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

}

