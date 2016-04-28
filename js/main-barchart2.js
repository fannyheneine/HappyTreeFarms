

BarChart = function(_parentElement, _data_percentages,_data_ing, _selection, _svgWidth){
    this.parentElement = _parentElement;
    this.data_p = _data_percentages;
    this.data_i = _data_ing;
    //this.data = _data;
    this.svgWidth=_svgWidth;
    this.selection = _selection;
    this.initVis(this.selection);
    console.log("acaaa111", this.selection)
};


BarChart.prototype.initVis = function(selection){

    console.log("acaaa222", selection)

    var vis = this;

    vis.margin = {top: 40, right: 0, bottom: 60, left: 10};


    //LEGEND WILL DISAPPEAR FOR VIS.WIDTH < 500 px

    vis.width = vis.svgWidth - vis.margin.left - vis.margin.right;
    vis.height = 0.6*vis.svgWidth - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");



    //Intiate scales
    vis.xScale_ing = d3.scale.ordinal()
        .rangeRoundBands([0, vis.width], .1)

    vis.xScale_percentages = d3.scale.ordinal()
        .rangeRoundBands([0, vis.width], .1)


    vis.yScale = d3.scale.linear()
        .range([vis.height,0]);



    vis.wrangleData(selection);
};


var ingredients = []
var ing_colors = []
var count = 0;
var clicks = 0;
var clicks2 = 0;

// Use the Queue.js library to read two files
BarChart.prototype.wrangleData = function(selection){

        console.log("acaaa3", selection)


        var vis = this;
        // Store csv data in global variable

        vis.yScale.domain([0, d3.max(vis.data_p, function (d) {
            return d[selection]
        })])

        vis.varXdomain = vis.data_i.map(function (d) {
            return d[selection].replace("_", " ")
        });

        vis.xScale_ing.domain(vis.varXdomain);

        vis.xScale_percentages.domain(d3.range(vis.data_p.length));


        vis.ing_colors = colors(vis.varXdomain)


        vis.svg.selectAll("rect")
            .data(vis.data_p)
            .enter()
            .append("rect")
            .attr("y", function(d) {
                return vis.yScale(d[selection]);
            })
            .attr("height", function(d) {
                return vis.height - vis.yScale(d[selection]);
            })
            .attr("width", 15)
            .attr("x", function(d,i){
                return (1.15*vis.margin.left+vis.xScale_percentages(i))
            })
            .attr("fill", function(d,i){
                return ing_colors[i]
            })
            //.on("click", function(d,i) {
            //    if (vis.clicks==0){
            //        //this.barchart2(vis.varXdomain[i].replace(" ", "_"),vis.ing_colors[i])
            //        vis.clicks = vis.clicks + 1}
            //    else{
            //        vis.updateVisualization2(vis.varXdomain[i].replace(" ", "_"), vis.ing_colors[i]);
            //    }
            //})
            //.on("mouseover", function(){
            //    d3.select(this)
            //        .style({"cursor": "pointer"})
            //});


        vis.xAxis = d3.svg.axis()
            .scale(vis.xScale_ing)
            .orient("bottom");

        vis.yAxis = d3.svg.axis()
            .scale(vis.yScale)
            .orient("left")

        vis.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" +vis.margin.left+"," + vis.height + ")")
            .call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );

        vis.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + vis.margin.left +",0)")
            .call(vis.yAxis)
            .append("text")
            .attr("y", -20)
            .attr("dy", ".71em")
            .style("text-anchor", "left")
            .text("% of appearance in recipes");


        //vis.imagechart(selection)

        vis.updateVisualization(selection);
    };

BarChart.prototype.updateVisualization = function(selection){

    console.log("acaaa4", selection)

    var vis = this;


    //We set the domain of the scales

    vis.varXdomain = vis.data_i.map(function(d) { return d[selection].replace("_", " ") });

    ing_colors = colors(vis.varXdomain)


    vis.yScale.domain([0, d3.max(vis.data_p, function(d) { return d[selection] })])
    vis.xScale_ing.domain(vis.varXdomain)

    vis.svg.selectAll(".x")
        .transition()
        .duration(800)
        .call(vis.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)" );

    vis.svg.selectAll(".y")
        .transition()
        .duration(800)
        .call(vis.yAxis);

    vis.rect = vis.svg.selectAll("rect")
        .data(vis.data_p)


    vis.rect.enter()
    	.append("rect")


    vis.rect
        .transition()
        .duration(800)
        .attr("y", function(d) {
            return vis.yScale(d[selection]);
        })
        .attr("height", function(d) {
            return vis.height - vis.yScale(d[selection]);
        })
        .attr("width", 15)
        .attr("x", function(d,i){
            return (1.15*vis.margin.left+vis.xScale_percentages(i))
        })
        .attr("fill", function(d,i){
            return ing_colors[i]
        })



    vis.rect.exit()
        .transition()
        .duration(800)
        .remove();

}



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

//BarChart.prototype.barchart2 = function(selected_ingredient,this_color) {
//
//    vis.svg2 = d3.select("#bar-chart2").append("svg")
//        .attr("width", width + margin.left + 100 +  margin.right)
//        .attr("height", height + margin.top + margin.bottom)
//        .append("g")
//        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//    xScale_cuisines = d3.scale.ordinal()
//        .rangeRoundBands([0, width], .01)
//
//    xScale_percentages2 = d3.scale.ordinal()
//        .rangeRoundBands([0, width], .01)
//
//
//    yScale2 = d3.scale.linear()
//        .range([height, 0]);
//
//    loadData()
//
//
//    function loadData() {
//        d3.csv("data/all_cuisines_all_ing.csv", function (error, data) {
//
//            data_viz2 = data;
//
//            d3.select("#show-ingredient")
//                .text(selected_ingredient)
//
//            d3.select("#ingredient-image")
//                .attr("src", "./images/" + selected_ingredient.replace(" ","_") + ".png")
//                .attr("width","100")
//                .attr("vspace","100px")
//
//
//            varXdomain2 = data.map(function (d) {
//                return d.Country.replace("_", " ")
//            });
//
//            data2 = data.map(function(d) { return +d[selected_ingredient] });
//
//
//            yScale2.domain([0, d3.max(data2, function (d) {
//                return d
//            })])
//
//
//            xScale_cuisines.domain(varXdomain2);
//
//            xScale_percentages2.domain(d3.range(varXdomain2.length));
//
//
//            svg2.selectAll("rect")
//                .data(data2)
//                .enter()
//                .append("rect")
//                .attr("y", function(d){
//                    return yScale2(d)
//                })
//                .attr("height", function(d) {
//                    return height - yScale2(d);
//                })
//                .attr("width", 15)
//                .attr("x", function(d,i){
//                    return (1.15*margin.left+xScale_percentages2(i))
//                })
//                .attr("fill", this_color)
//                .on("click", function(d,i) {
//
//                    d3.select("#ranking-type")
//                        .property({value: varXdomain2[i].replace(" ","_")})
//                    if (clicks2>0){
//                        update_imagechart(data_i, data_p, varXdomain2[i].replace(" ","_"))}
//                    else{
//                        imagechart(data_i, data_p, varXdomain2[i].replace(" ","_"))
//                        clicks2 = clicks2 + 1
//                    }
//                    updateVisualization(data_i, data_p,varXdomain2[i].replace(" ","_"))
//
//                })
//                .on("mouseover", function(){
//                    d3.select(this)
//                        .style({"cursor": "pointer"})
//                });
//
//
//            xAxis2 = d3.svg.axis()
//                .scale(xScale_cuisines)
//                .orient("bottom");
//
//            yAxis2 = d3.svg.axis()
//                .scale(yScale2)
//                .orient("left")
//
//            svg2.append("g")
//                .attr("class", "x axis")
//                .attr("transform", "translate(" +margin.left+"," + height + ")")
//                .call(xAxis2)
//                .selectAll("text")
//                .style("text-anchor", "end")
//                .attr("dx", "-.8em")
//                .attr("dy", ".15em")
//                .attr("transform", "rotate(-65)" );
//
//            svg2.append("g")
//                .attr("class", "y axis")
//                .attr("transform", "translate(" +margin.left+",0)")
//                .call(yAxis2)
//                .append("text")
//                .attr("y", -20)
//                .attr("dy", ".71em")
//                .style("text-anchor", "left")
//                .text("% of appearance in recipes");
//
//
//
//
//        })
//
//
//    }
//}
//
//function updateVisualization2(selected_ingredient,this_color) {
//
//    //We set the domain of the scales
//    d3.select("#show-ingredient")
//        .text(selected_ingredient)
//
//    d3.select("#ingredient-image")
//        .attr("src", "./images/" + selected_ingredient.replace(" ","_") + ".png")
//        .attr("width","100")
//        .attr("top","150px")
//
//
//    //.data(dataset.map(function(d) { return +d; }))
//    varXdomain2 = data_viz2.map(function (d) {
//        return d.Country.replace("_", " ")
//    });
//
//    data2 = data_viz2.map(function(d) { return +d[selected_ingredient] });
//
//    yScale2.domain([0, d3.max(data2, function (d) {
//        return d
//    })])
//
//
//    xScale_cuisines.domain(varXdomain2);
//
//
//    svg2.select(".x")
//        .transition()
//        .duration(800)
//        .call(xAxis2)
//        .selectAll("text")
//        .style("text-anchor", "end")
//        .attr("dx", "-.8em")
//        .attr("dy", ".15em")
//        .attr("transform", "rotate(-65)" );
//    //.attr("transform", "rotate(-65)" );
//
//    svg2.select(".y")
//        .transition()
//        .duration(800)
//        .call(yAxis2);
//
//    var rect = svg2.selectAll("rect")
//        .data(data2)
//        .attr("fill", this_color)
//
//    rect.enter()
//        .append("rect")
//
//
//
//
//    rect
//        .transition()
//        .duration(800)
//        .attr("y", function(d) {
//            return yScale2(d);
//        })
//        .attr("height", function(d) {
//            return height - yScale2(d);
//        })
//        .attr("width", 15)
//        .attr("x", function(d,i){
//            return (1.15*margin.left+xScale_percentages2(i))
//        })
//
//
//    rect.exit()
//        .transition()
//        .duration(800)
//        .remove();
//
//}
//
//
//
//function imagechart(data_i, data_p, selection) {
//
//    svg3 = d3.select("#image-chart").append("svg")
//        .attr("width", width + 700 + margin.left + margin.right)
//        .attr("height", height + 500 + margin.top + margin.bottom)
//        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//    Xdomain = data_i.map(function (d) {
//        return d[selection]
//    });
//
//    //var g2 = svg3.append("g");
//
//    var imgs = svg3.selectAll("image").data(data_i);
//
//    imgs.enter()
//        .append("svg:image")
//        .attr("xlink:href", function (d, i) {
//            return "./images/" + Xdomain[i] + ".png"
//        })
//        .attr("width", function (d, i) {
//            return 5 * (data_p[i][selection])
//        })
//        .attr("height", function (d, i) {
//            return 3 * (data_p[i][selection])
//        })
//        .attr("x", function (d, i) {
//            if (i < 5) {
//                return i * 210
//            }
//            else if (i > 4 & i < 11) {
//                return (i - 4) * 160
//            }
//            else {
//                return (i - 10) * 90
//            }
//        })
//        .attr("y", function (d, i) {
//            if (i < 5) {
//                return 40
//            }
//            else if (i > 4 & i < 11) {
//                return 300
//            }
//            else {
//                return 500
//            }
//        })
//        .on("click", function(d,i) {
//            if (clicks>0){
//                updateVisualization2(Xdomain[i].replace(" ", "_"), ing_colors[i]);}
//            else{
//                barchart2(Xdomain[i].replace(" ", "_"), ing_colors[i]);
//                clicks = clicks + 1;
//            }
//        })
//        .on("mouseover", function(d,i){
//            d3.select(this)
//                .style({"cursor": "pointer"})
//                .attr("data-we", this.getAttribute("width"))
//                .attr("data-hi", this.getAttribute("height"))
//                .attr("data-x", this.getAttribute("x"))
//                .attr("data-y", this.getAttribute("y"))
//                .attr("width", 300)
//                .attr("height", 300)
//                .attr("x", function(){
//                    if (i < 5) {
//                        return this.getAttribute("x")-20
//                    }
//                    else {
//                        return this.getAttribute("x")-100
//                    }
//
//                } )
//                .attr("y", function(){
//                    if (i < 5) {
//                        return this.getAttribute("y")
//                    }
//                    else if (i > 4 & i < 11) {
//                        return this.getAttribute("y") - 90
//                    }
//                    else {
//                        return this.getAttribute("y") - 120
//                    }
//
//                } )
//        })
//
//
//
//        .on("mouseout", function(){
//            d3.select(this)
//                .attr("width",this.getAttribute("data-we"))
//                .attr("height",this.getAttribute("data-hi"))
//                .attr("x",this.getAttribute("data-x"))
//                .attr("y",this.getAttribute("data-y"))
//
//
//        })
//}
//
//function update_imagechart(data_i, data_p, selection) {
//
//
//    Xdomain = data_i.map(function (d) {
//        return d[selection]
//    });
//
//
//    var imgs = svg3.selectAll("image")
//        .data(data_i)
//
//    imgs.enter()
//        .append("svg:image")
//
//    imgs
//        .transition()
//        .duration(800)
//        .attr("xlink:href", function (d, i) {
//            return "./images/" + Xdomain[i] + ".png"
//        })
//        .attr("width", function (d, i) {
//            return 4 * (data_p[i][selection])
//        })
//        .attr("height", function (d, i) {
//            return 3 * (data_p[i][selection])
//        })
//
//
//    imgs.exit()
//        .transition()
//        .duration(800)
//        .remove();
//}