var width_1 = 1000,
    height_1 = 1000,
    width_2 = 200,
    height_2 = 500;

var svg_map = d3.select("#chart-area").append("svg")
    .attr("width", width_1)
    .attr("height", height_1);

// CREATE World Map Variables
var projection = d3.geo.mercator()
    //.translate([(width_1/2 +400), (height_1/2 +500)])
    .center([0,50])
    .scale( width_1 /2/  Math.PI);

var path = d3.geo.path()
    .projection(projection);

var colorScale_country = d3.scale.category20();
var colorScale_ingredient = d3.scale.category10();


var label = svg_map.append("g")
    .style("display", "none");

var world_global, country_global, cuisine_global;

// CREATE Ingredient Bar Variables

// Set up svg for bar chart

//var svg_bar = svg.append("g");
var svg_bar = d3.select("#bar-area").append("svg")
    .attr("width", width_2)
    .attr("height", height_2)
    .append("g");


var x = d3.scale.ordinal().rangeRoundBands([0, height_2], 0);
var y = d3.scale.linear().domain([0, 1]).range([width_2,0]);


// LOAD Data and CALL Function
queue()
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.json, "data/country_cuisine.json")
    .defer(d3.json, "data/cuisine_ingredient.json")
    .await(createCuisineMap);


// DEFINE Function to Create World Map
function createCuisineMap(error, world, country, cuisine) {

    world_global = world;
    country_global = country;
    cuisine_global = cuisine;

    //
    // PART I: World Map
    //

    // SET UP LABEL FOR CHOROPLETH
    label.append("text")
        .attr("class", "label country")
        .style("font-size", 24)
        .attr("x", 0)
        .attr("y", 300);

    label.append("text")
        .attr("x", 0)
        .attr("y", 310)
        .attr("class", "label detail");
    label.select(".detail")
        .append("tspan")
        .attr("x", 0)
        .attr("dy", 20)
        .attr("class", "label detail Cuisine");
    label.select(".detail")
        .append("tspan")
        .attr("x", 0)
        .attr("dy", 20)
        .attr("class", "label detail Recipe_Count");
    //country.forEach()
    // MAP
    //console.log(world);
    //console.log(country);
    //console.log(cuisine);

    colorScale_country.domain(Object.keys(cuisine));

    var countries = topojson.feature(world, world.objects.countries).features;

    svg_map.selectAll("countries")
        .data(countries)
        .enter().insert("path", ".graticule")
        .attr("class", "countries")
        .attr("d", path)
        .attr("fill", function(d) {
            var country_key = d.id;
            if (country[country_key]==undefined || country[country_key].cuisine==undefined) {return "#eeeeee"}
            //else {return "red"}
            else {return colorScale_country(country[country_key].cuisine)}
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
    svg_map.insert("path", ".graticule")
        .datum(topojson.mesh(world, world.objects.countries, function (a, b) {
            return a !== b;
        }))
        .attr("class", "boundary")
        .attr("d", path);


}

function showInfo(d) {
    var country_data = country_global[d.id],
        cuisine_key = country_data.cuisine,
        cuisine_data = cuisine_global[cuisine_key];

    if (country_data != undefined && cuisine_key != undefined) {
        label.style("display", null);

        label.select("text.country")
            .text(cuisine_key);
        label.select("tspan.Cuisine")
            .text("Country: " +  country_data.name);
        label.select("tspan.Recipe_Count")
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

        x.domain(["salt", "olive oil", "garlic", "sugar", "butter", "pepper"]);
        colorScale_ingredient.domain(["salt", "olive oil", "garlic", "sugar", "butter", "pepper"]);

        //svg_bar.selectAll(".bar")
        //    .data(ingredient_data)
        //    .enter().append("rect")
        //    .attr("class", "bar")
        //    .attr("x", function(d) {return x(d.ingredient);})
        //    .attr("width_1", x.rangeBand())
        //    .attr("y", function(d) {return y(d.num/n_recipes/5)-250; })
        //    .attr("height_1", function(d) {return (height_1 - y(d.num/n_recipes))/5; });

        var bar_map = svg_bar.selectAll(".bar")
            .data(ingredient_data);

        bar_map
            .enter().append("rect")

        bar_map
            .attr("class", "bar")
            .attr("y", function(d) {return x(d.ingredient);})
            .attr("height", x.rangeBand())
            .attr("x", 0)
            .attr("width", function(d) {return (y(d.num/n_recipes)); })
            .attr("fill", function(d) {
                return colorScale_ingredient(d.ingredient);
            });


        svg_bar.selectAll("text.bar-label")
            .data(ingredient_data)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .text(function(d) {
                return d.ingredient;
            })
            .attr("y", function(d, i) {
                return 40+i*(height_2/6);
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
