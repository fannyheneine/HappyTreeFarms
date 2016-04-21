// SVG drawing area

var margin = {top: 60, right: 20, bottom: 100, left: 30};

var width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#bar-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom )
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg2;
var svg3;

// Ingredients and percentages
var data_i;
var data_p;
var data_viz2;

//Initialize variables
var yAxis;
var xAxis;
var yAxis2;
var xAxis2;
var selection = "American"
var text;
var ingredients = []
var ing_colors = []
var count = 0;
var clicks = 0;
var clicks2 = 0;


//Intiate scales
var xScale_ing = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1)

var xScale_percentages = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1)


var yScale = d3.scale.linear()
    .range([height,0]);

var yScale2;
var xScale_cuisines;
var xScale_percentages2;

// Use the Queue.js library to read two files
queue()
    .defer(d3.csv, "data/all_cuisines_percentages.csv")
    .defer(d3.csv, "data/all_cuisines_ing.csv")
    .await(function(error, data_percentages, data_ing) {


        data_percentages.forEach(function (d) {

            // Convert numeric values to 'numbers'
            d.American = +d.American;
            d.Canada = +d.Canada;
            d.Caribbeans = +d.Caribbeans;
            d.China = +d.China;
            d.East_African = +d.East_African;
            d.Eastern_European = +d.Eastern_European;
            d.France = +d.France;
            d.Great_Britain = +d.Great_Britain;
            d.India = +d.India;
            d.Italy = +d.Italy;
            d.Japan = +d.Japan;
            d.Korean = +d.Korean;
            d.Mediterranean = +d.Mediterranean;
            d.Mexican = +d.Mexican;
            d.Middle_East = +d.Middle_East;
            d.North_African = +d.North_African;
            d.Portuguese_Spanish = +d.Portuguese_Spanish;
            d.Scandinavia = +d.Scandinavia;
            d.South_African = +d.South_African;
            d.South_American = +d.South_American;
            d.South_Asian = +d.South_Asian;
            d.Southeast_Asian = +d.Southeast_Asian;
            d.West_African = +d.West_African;
            d.Western_Europeean = +d.Western_Europeean;

        });


        // Store csv data in global variable

        yScale.domain([0, d3.max(data_percentages, function (d) {
            return d[selection]
        })])

        varXdomain = data_ing.map(function (d) {
            return d[selection].replace("_", " ")
        });

        xScale_ing.domain(varXdomain);

        xScale_percentages.domain(d3.range(data_percentages.length));



        ing_colors = colors(varXdomain)


        svg.selectAll("rect")
            .data(data_percentages)
            .enter()
            .append("rect")
            .attr("y", function(d) {
                return yScale(d[selection]);
            })
            .attr("height", function(d) {
                return height - yScale(d[selection]);
            })
            .attr("width", 15)
            .attr("x", function(d,i){
                return (1.15*margin.left+xScale_percentages(i))
            })
            .attr("fill", function(d,i){
                return ing_colors[i]
            })
            .on("click", function(d,i) {
                if (clicks==0){
                    barchart2(varXdomain[i].replace(" ", "_"),ing_colors[i])
                    clicks = clicks + 1}
                else{
                    updateVisualization2(varXdomain[i].replace(" ", "_"), ing_colors[i]);
                }
            })
            .on("mouseover", function(){
                d3.select(this)
                    .style({"cursor": "pointer"})
            });


        xAxis = d3.svg.axis()
            .scale(xScale_ing)
            .orient("bottom");

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" +margin.left+"," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" +margin.left+",0)")
            .call(yAxis)
            .append("text")
            .attr("y", -20)
            .attr("dy", ".71em")
            .style("text-anchor", "left")
            .text("% of appearance in recipes");

        data_i = data_ing
        data_p = data_percentages

    });

function updateVisualization(data_ing, data_percentages, selection) {

    //We set the domain of the scales

    varXdomain = data_ing.map(function(d) { return d[selection].replace("_", " ") });

    ing_colors = colors(varXdomain)


    yScale.domain([0, d3.max(data_percentages, function(d) { return d[selection] })])
    xScale_ing.domain(varXdomain)

    svg.select(".x")
        .transition()
        .duration(800)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)" );
    //.attr("transform", "rotate(-65)" );

    svg.select(".y")
        .transition()
        .duration(800)
        .call(yAxis);

    var rect = svg.selectAll("rect")
        .data(data_percentages)
        .transition()
        .duration(800)
        .attr("fill", function(d,i){
            return ing_colors[i]
        })

    //rect.enter()
    //	.append("rect")


    rect
        .transition()
        .duration(800)
        .attr("y", function(d) {
            return yScale(d[selection]);
        })
        .attr("height", function(d) {
            return height - yScale(d[selection]);
        })
        .attr("width", 15)
        .attr("x", function(d,i){
            return (1.15*margin.left+xScale_percentages(i))
        })


    rect.exit()
        .transition()
        .duration(800)
        .remove();

}


//We set the function for the "chart-data"
d3.select("#ranking-type").on("change", function(){
    selection = d3.select("#ranking-type").property("value");

    if (clicks2<1){
        imagechart(data_i, data_p, selection)
        clicks2 = clicks2 + 1}
    else{
        update_imagechart(data_i, data_p, selection)
    }
    updateVisualization(data_i, data_p, selection);


});

function colors(varXdomain) {

    var ing_colors = []
    varXdomain.forEach(function (d) {
        if (ingredients.indexOf(d)===-1) {
            ingredients.push(d)
            ing_colors.push(colorbrewer.Set4[12][count])
            count = count + 1;


        } else {
            idx = ingredients.indexOf(d)
            ing_colors.push(colorbrewer.Set4[12][idx])
        }
    });
    return ing_colors
}

function barchart2(selected_ingredient,this_color) {

    svg2 = d3.select("#bar-chart2").append("svg")
        .attr("width", width + margin.left + 100 +  margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale_cuisines = d3.scale.ordinal()
        .rangeRoundBands([0, width], .01)

    xScale_percentages2 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .01)


    yScale2 = d3.scale.linear()
        .range([height, 0]);

    loadData()

    function loadData() {
        d3.csv("data/all_cuisines_all_ing.csv", function (error, data) {

            data_viz2 = data;

            d3.select("#show-ingredient")
                .text(selected_ingredient)

            d3.select("#ingredient-image")
                .attr("src", "./images/" + selected_ingredient.replace(" ","_") + ".jpg")
                .attr("width","100")
                .attr("vspace","100px")


            varXdomain2 = data.map(function (d) {
                return d.Country.replace("_", " ")
            });

            data2 = data.map(function(d) { return +d[selected_ingredient] });


            yScale2.domain([0, d3.max(data2, function (d) {
                return d
            })])


            xScale_cuisines.domain(varXdomain2);

            xScale_percentages2.domain(d3.range(varXdomain2.length));


            svg2.selectAll("rect")
                .data(data2)
                .enter()
                .append("rect")
                .attr("y", function(d){
                    return yScale2(d)
                })
                .attr("height", function(d) {
                    return height - yScale2(d);
                })
                .attr("width", 15)
                .attr("x", function(d,i){
                    return (1.15*margin.left+xScale_percentages2(i))
                })
                .attr("fill", this_color)
                .on("click", function(d,i) {
                    d3.select("#ranking-type")
                        .property({value: varXdomain2[i].replace(" ","_")})
                    if (clicks2>0){
                        update_imagechart(data_i, data_p, varXdomain2[i].replace(" ","_"))}
                    else{
                        imagechart(data_i, data_p, varXdomain2[i].replace(" ","_"))
                        clicks2 = clicks2 + 1
                    }
                    updateVisualization(data_i, data_p,varXdomain2[i].replace(" ","_"))

                })
                .on("mouseover", function(){
                    d3.select(this)
                        .style({"cursor": "pointer"})
                });


            xAxis2 = d3.svg.axis()
                .scale(xScale_cuisines)
                .orient("bottom");

            yAxis2 = d3.svg.axis()
                .scale(yScale2)
                .orient("left")

            svg2.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(" +margin.left+"," + height + ")")
                .call(xAxis2)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)" );

            svg2.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" +margin.left+",0)")
                .call(yAxis2)
                .append("text")
                .attr("y", -20)
                .attr("dy", ".71em")
                .style("text-anchor", "left")
                .text("% of appearance in recipes");

        })


    }
}

function updateVisualization2(selected_ingredient,this_color) {

    //We set the domain of the scales
    d3.select("#show-ingredient")
        .text(selected_ingredient)

    d3.select("#ingredient-image")
        .attr("src", "./images/" + selected_ingredient.replace(" ","_") + ".jpg")
        .attr("width","100")
        .attr("top","150px")


    //.data(dataset.map(function(d) { return +d; }))
    varXdomain2 = data_viz2.map(function (d) {
        return d.Country.replace("_", " ")
    });

    data2 = data_viz2.map(function(d) { return +d[selected_ingredient] });

    yScale2.domain([0, d3.max(data2, function (d) {
        return d
    })])


    xScale_cuisines.domain(varXdomain2);


    svg2.select(".x")
        .transition()
        .duration(800)
        .call(xAxis2)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)" );
    //.attr("transform", "rotate(-65)" );

    svg2.select(".y")
        .transition()
        .duration(800)
        .call(yAxis2);

    var rect = svg2.selectAll("rect")
        .data(data2)
        .attr("fill", this_color)

    rect.enter()
        .append("rect")




    rect
        .transition()
        .duration(800)
        .attr("y", function(d) {
            return yScale2(d);
        })
        .attr("height", function(d) {
            return height - yScale2(d);
        })
        .attr("width", 15)
        .attr("x", function(d,i){
            return (1.15*margin.left+xScale_percentages2(i))
        })


    rect.exit()
        .transition()
        .duration(800)
        .remove();

}



function imagechart(data_i, data_p, selection) {

    svg3 = d3.select("#image-chart").append("svg")
        .attr("width", width + 700 + margin.left + margin.right)
        .attr("height", height + 500 + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    Xdomain = data_i.map(function (d) {
        return d[selection]
    });

    //var g2 = svg3.append("g");

    var imgs = svg3.selectAll("image").data(data_i);

    imgs.enter()
        .append("svg:image")
        .attr("xlink:href", function (d, i) {
            return "./images/" + Xdomain[i] + ".jpg"
        })
        .attr("width", function (d, i) {
            return 5 * (data_p[i][selection])
        })
        .attr("height", function (d, i) {
            return 3 * (data_p[i][selection])
        })
        .attr("x", function (d, i) {
            if (i < 5) {
                return i * 250
            }
            else if (i > 4 & i < 11) {
                return (i - 4) * 160
            }
            else {
                return (i - 10) * 90
            }
        })
        .attr("y", function (d, i) {
            if (i < 5) {
                return 40
            }
            else if (i > 4 & i < 11) {
                return 300
            }
            else {
                return 500
            }
        })
        .on("click", function(d,i) {
            updateVisualization2(Xdomain[i].replace(" ", "_"), ing_colors[i]);
        })
        .on("mouseover", function(){
            d3.select(this)
                .style({"cursor": "pointer"})
        });

}

function update_imagechart(data_i, data_p, selection) {

    console.log("hereee")

    Xdomain = data_i.map(function (d) {
        return d[selection]
    });


    var imgs = svg3.selectAll("image")
        .data(data_i)

    imgs.enter()
        .append("svg:image")

    imgs
        .transition()
        .duration(800)
        .attr("xlink:href", function (d, i) {
            return "./images/" + Xdomain[i] + ".jpg"
        })
        .attr("width", function (d, i) {
            return 4 * (data_p[i][selection])
        })
        .attr("height", function (d, i) {
            return 3 * (data_p[i][selection])
        })


    imgs.exit()
        .transition()
        .duration(800)
        .remove();
}